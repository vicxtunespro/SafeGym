import { db } from '@/firebase/firebase';
import { Session } from '@/types/session';
import { addDoc, collection, deleteDoc, doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';

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
        participants: []
      };

      const docRef = await addDoc(collection(db, this.collectionName), sessionWithMeta);
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
  async getSession(sessionId: string): Promise<Session | null> {
    try {
      const docSnap = await getDoc(doc(db, this.collectionName, sessionId));
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Session;
      }
      return null;
    } catch (error) {
      console.error('Error getting session:', error);
      throw new Error('Failed to get session');
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

  // Approve session (admin only)
  async approveSession(sessionId: string): Promise<void> {
    try {
      await this.updateSession(sessionId, { status: 'approved' });
    } catch (error) {
      console.error('Error approving session:', error);
      throw new Error('Failed to approve session');
    }
  }

  // Reject session (admin only)
  async rejectSession(sessionId: string, reason: string): Promise<void> {
    try {
      await this.updateSession(sessionId, { 
        status: 'rejected',
        rejectionReason: reason
      });
    } catch (error) {
      console.error('Error rejecting session:', error);
      throw new Error('Failed to reject session');
    }
  }
}

export const sessionService = new SessionService();