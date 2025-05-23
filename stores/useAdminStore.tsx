import { auth, db, storage } from '@/firebase/firebase'; // Import Firebase Storage and Firestore
import { addDoc, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { create } from 'zustand';

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  password: string;
  isApproved: boolean;
}

interface Session {
  id: string;
  type: 'group' | 'individual';
  title: string;
  description: string;
  trainerId: string;
  dateTime: string;
  duration: number; // in minutes
  maxParticipants?: number; // for group sessions
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string; // trainer ID
}

interface Review {
  id: string;
  sessionId: string;
  clientId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

type AdminStore = {
  trainers: Trainer[];
  sessions: Session[];
  reviews: Review[];
  fetchTrainers: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  fetchReviews: () => Promise<void>;
  addTrainer: (trainer: Omit<Trainer, 'id' | 'isApproved' | 'profilePhoto'> & { profilePhoto?: string }) => Promise<void>;
  updateTrainer: (id: string, updates: Partial<Trainer> & { profilePhoto?: string }) => Promise<void>;
  deleteTrainer: (id: string) => Promise<void>;
  approveSession: (sessionId: string) => Promise<void>;
  rejectSession: (sessionId: string) => Promise<void>;
  getSessionMetrics: () => {
    totalSessions: number;
    approvedSessions: number;
    averageRating: number;
    upcomingSessions: number;
  };
};

export const useAdminStore = create<AdminStore>((set, get) => ({
  trainers: [],
  sessions: [],
  reviews: [],

  // Fetch methods would call your API in a real app
  fetchTrainers: async () => {
    try {
      const trainersRef = collection(db, 'trainers');
      const snapshot = await getDocs(trainersRef);
      const trainersData = snapshot.docs.map(doc => ({
        id: doc.id,
        firstName: doc.data().firstName || '',
        lastName: doc.data().lastName || '',
        email: doc.data().email || '',
        phone: doc.data().phone || '',
        profilePhoto: doc.data().profilePhoto,
        password: doc.data().password || '',
        isApproved: doc.data().isApproved || false
      })) as Trainer[];
      set({ trainers: trainersData });
    } catch (error) {
      console.error('Error fetching trainers:', error);
      throw error;
    }
  },

  fetchSessions: async () => {
    try {
      const sessionsRef = collection(db, 'sessions');
      const snapshot = await getDocs(sessionsRef);
      const sessionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type || 'individual',
          title: data.title || '',
          description: data.description || '',
          trainerId: data.trainerId || '',
          dateTime: data.dateTime?.toDate?.() || new Date().toISOString(),
          duration: data.duration || 60,
          maxParticipants: data.maxParticipants,
          status: data.status || 'pending',
          createdBy: data.createdBy || ''
        } as Session;
      });
      set({ sessions: sessionsData });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  fetchReviews: async () => {
    // API call would go here
    // For now, using mock data
    set({ reviews: mockReviews });
  },

  addTrainer: async (trainer) => {
    try {
      let profilePhotoUrl: string | undefined = undefined;
      let filename = `${Date.now()}`;
      if(auth.currentUser){
        filename = `${Date.now()}-${auth.currentUser.uid}.jpg`;
      }

      if (trainer.profilePhoto) {
        // 1. Upload the image to Firebase Storage
        const storageRef = ref(storage, `trainers/${filename}`);
        const response = await fetch(trainer.profilePhoto);
        const blob = await response.blob();
        const uploadTask = uploadBytesResumable(storageRef, blob);

        // Wait for the upload to complete and get the download URL
        await uploadTask;
        profilePhotoUrl = await getDownloadURL(storageRef);
      }

      // 2. Save the trainer data (including the download URL) to Firestore
      const newTrainer = {
        ...trainer,
        id: Date.now().toString(), // You might want to generate this ID on the server
        isApproved: false,
        profilePhoto: profilePhotoUrl, // Store the download URL
      };
      await addDoc(collection(db, 'trainers'), newTrainer);
      set((state) => ({ trainers: [...state.trainers, newTrainer] }));
    } catch (error) {
      console.error('Error adding trainer: ', error);
      throw error;
    }
  },

  updateTrainer: async (id, updates) => {
    try {
      let profilePhotoUrl: string | undefined = updates.profilePhoto;
      let filename = `${Date.now()}`;
      if(auth.currentUser){
        filename = `${Date.now()}-${auth.currentUser.uid}.jpg`;
      }
      if (updates.profilePhoto && !updates.profilePhoto.startsWith('https://')) {
        // If it's a new local URI (not an existing Firebase URL)
        const storageRef = ref(storage, `trainers/${filename}`);
        const response = await fetch(updates.profilePhoto);
        const blob = await response.blob();
        const uploadTask = uploadBytesResumable(storageRef, blob);
        await uploadTask;
        profilePhotoUrl = await getDownloadURL(storageRef);
      }

      // Update the trainer data in Firestore
      const trainerDocRef = doc(db, 'trainers', id);
      const updatedTrainerData = {
        ...updates,
        ...(profilePhotoUrl !== undefined ? { profilePhoto: profilePhotoUrl } : {}), // Only update profilePhoto if it changed
      };
      await updateDoc(trainerDocRef, updatedTrainerData);

      set((state) => ({
        trainers: state.trainers.map((trainer) =>
          trainer.id === id ? { ...trainer, ...updatedTrainerData } : trainer
        ),
      }));
    } catch (error) {
      console.error('Error updating trainer: ', error);
      throw error;
    }
  },

  deleteTrainer: async (id) => {
    set((state) => ({
      trainers: state.trainers.filter((trainer) => trainer.id !== id),
    }));
  },

  approveSession: async (sessionId) => {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, { status: 'approved' });
      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === sessionId ? { ...session, status: 'approved' } : session
        ),
      }));
    } catch (error) {
      console.error('Error approving session:', error);
      throw error;
    }
  },

  rejectSession: async (sessionId) => {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, { status: 'rejected' });
      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === sessionId ? { ...session, status: 'rejected' } : session
        ),
      }));
    } catch (error) {
      console.error('Error rejecting session:', error);
      throw error;
    }
  },

  getSessionMetrics: () => {
    const { sessions, reviews } = get();
    const totalSessions = sessions.length;
    const approvedSessions = sessions.filter((s) => s.status === 'approved').length;

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    const upcomingSessions = sessions.filter(
      (s) => new Date(s.dateTime) > new Date() && s.status === 'approved'
    ).length;

    return {
      totalSessions,
      approvedSessions,
      averageRating: parseFloat(averageRating.toFixed(1)),
      upcomingSessions,
    };
  },
}));

// Mock data for testing (replace with actual API calls)
const mockTrainers: Trainer[] = [];
const mockSessions: Session[] = [];
const mockReviews: Review[] = [];