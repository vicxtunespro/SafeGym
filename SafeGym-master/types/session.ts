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
  type: SessionType;
  
  // Timing
  dateTime: Timestamp | Date;
  duration: number; // in minutes
  endTime?: Timestamp | Date; // can be calculated
  
  // Participants
  trainerId: string;
  trainerName: string;
  maxParticipants?: number; // required for group/class
  bookedParticipants?: number;
  participants?: string[]; // array of user IDs
  
  // Status
  status: SessionStatus;
  rejectionReason?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  
  // Session Details
  difficulty?: DifficultyLevel;
  
  // Recurring Sessions
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
  recurrenceEndDate?: Timestamp | Date;
  
  // System Fields
  lastUpdatedBy?: string;
}