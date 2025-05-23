import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Session } from '../types/session';

class SessionService {
  private sessionsCollection = collection(db, 'sessions');

  async getSessions(): Promise<Session[]> {
    try {
      console.log('[SessionService] Starting to get all sessions...');
      const q = query(this.sessionsCollection, orderBy('dateTime', 'asc'));
      console.log('[SessionService] Query created, fetching documents...');
      const querySnapshot = await getDocs(q);
      console.log('[SessionService] Got query snapshot, size:', querySnapshot.size);
      
      const sessions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('[SessionService] Document data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data
        };
      }) as Session[];
      
      console.log('[SessionService] Total sessions found:', sessions.length);
      return sessions;
    } catch (error) {
      console.error('[SessionService] Error getting sessions:', error);
      throw error;
    }
  }

  async getSessionsByParticipant(userId: string): Promise<Session[]> {
    try {
      console.log('[SessionService] Getting sessions for participant:', userId);
      
      // Get all sessions
      const allSessions = await this.getSessions();
      console.log('[SessionService] All sessions retrieved:', allSessions.length);
      
      // Filter sessions where user is either a participant or has booked
      const userSessions = allSessions.filter(session => {
        const isParticipant = session.participants?.includes(userId);
        const hasBooked = session.bookedParticipants && session.bookedParticipants > 0;
        console.log('[SessionService] Session check:', {
          id: session.id,
          title: session.title,
          isParticipant,
          hasBooked,
          participants: session.participants,
          bookedParticipants: session.bookedParticipants
        });
        return isParticipant || hasBooked;
      });
      
      console.log('[SessionService] Found sessions for user:', userSessions.length);
      return userSessions;
    } catch (error) {
      console.error('[SessionService] Error getting sessions by participant:', error);
      throw error;
    }
  }

  // ... existing code ...
}

export const sessionService = new SessionService(); 