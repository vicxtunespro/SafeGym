import { addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, increment, orderBy, query, Query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';

interface Session {
  id: string;
  type: 'group' | 'individual';
  title: string;
  description: string;
  trainerId: string;
  dateTime: string;
  duration: number;
  maxParticipants?: number;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  participants?: string[];
}

class SessionService {
  private readonly collectionName = 'sessions';

  // Create a new session (by trainer)
  async createSession(sessionData: Omit<Session, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const sessionWithMeta = {
        ...sessionData,
        status: 'pending', // Needs admin approval
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        bookedParticipants: 0,
        participants: [], // Initialize empty array
        maxParticipants: sessionData?.maxParticipants || 1, // Default to 1 if not specified
      };

      console.log('Creating session with data:', sessionWithMeta);
      const docRef = await addDoc(collection(db, this.collectionName), sessionWithMeta);
      console.log('Session created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  // Update session (by trainer or admin)
  async updateSession(sessionId: string, updates: Partial<Session>): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, sessionId), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update session');
    }
  }

  // Get session by ID
  async getSession(sessionId: string): Promise<Session> {
    try {
      const sessionRef = doc(db, this.collectionName, sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (!sessionDoc.exists()) {
        throw new Error('Session not found');
      }

      const data = sessionDoc.data();
      return {
        id: sessionDoc.id,
        type: data.type || 'individual',
        title: data.title || '',
        description: data.description || '',
        trainerId: data.trainerId || '',
        dateTime: data.dateTime?.toDate?.() || new Date().toISOString(),
        duration: data.duration || 60,
        maxParticipants: data.maxParticipants,
        status: data.status || 'pending',
        createdBy: data.createdBy || '',
        participants: data.participants || []
      };
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  // Delete session (admin only)
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Failed to delete session');
    }
  }

  // Get all sessions or filter by status
  async getSessions(filters?: { status?: string }): Promise<Session[]> {
    try {
      const sessionsRef = collection(db, this.collectionName);
      let q: Query = sessionsRef;
      
      // Apply filters if provided
      if (filters?.status) {
        q = query(sessionsRef, where('status', '==', filters.status));
      }
      
      // Order by date
      q = query(q, orderBy('dateTime', 'desc'));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Session[];
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw new Error('Failed to get sessions');
    }
  }

  // Book a session
  async bookSession(sessionId: string, userId: string): Promise<void> {
    try {
      const sessionRef = doc(db, this.collectionName, sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (!sessionDoc.exists()) {
        throw new Error('Session not found');
      }
      console.log('pass')

      const sessionData = sessionDoc.data();
      
      // Check if session is approved
      if (sessionData?.status !== 'approved') {
        throw new Error('Session is not available for booking');
      }
      console.log('pass')

      // Check if session is full
      const currentParticipants = sessionData?.participants || [];
      const maxParticipants = sessionData?.maxParticipants || 1;

      if (currentParticipants.length >= maxParticipants) {
        throw new Error('Session is full');
      }
      console.log('pass2')

      // Check if user is already booked
      if (currentParticipants.includes(userId)) {
        throw new Error('You are already booked for this session');
      }
      console.log(userId)

      // Update session with new participant
      await updateDoc(sessionRef, {
        participants: arrayUnion(userId),
        bookedParticipants: increment(1),
        updatedAt: Timestamp.now()
      });
      console.log('pass4')
    } catch (error) {
      console.error('Error booking session:', error);
      throw error;
    }
  }

  async getSessionsByParticipant(userId: string): Promise<Session[]> {
    try {
      const sessionsRef = collection(db, this.collectionName);
      const q = query(sessionsRef, where('participants', 'array-contains', userId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
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
          createdBy: data.createdBy || '',
          participants: data.participants || []
        };
      });
    } catch (error) {
      console.error('Error getting sessions by participant:', error);
      throw error;
    }
  }
}

export const sessionService = new SessionService();
