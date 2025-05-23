// types/session.ts
import { Timestamp } from 'firebase/firestore';

export type SessionStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type SessionType = 'individual' | 'group' | 'class';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type RecurrencePattern = 'weekly' | 'biweekly' | 'monthly';

export interface Session {
  // Core Fields
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'group';
  
  // Timing
  dateTime: Timestamp;
  duration: number; // in minutes
  endTime?: Timestamp | Date; // can be calculated
  
  // Participants
  trainerId: string;
  trainerName: string;
  maxParticipants: number;
  participants?: string[];
  bookedParticipants: number;
  
  // Status
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Session Details
  difficulty?: DifficultyLevel;
  
  // Recurring Sessions
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: Timestamp | Date;
  
  // System Fields
  lastUpdatedBy?: string;

  // Media
  coverPhoto?: string;
  coverPhotoUrl?: string;
}