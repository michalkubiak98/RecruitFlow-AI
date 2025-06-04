export interface Candidate {
  id: number;
  name: string;
  location?: string | null;
  salary?: string | null;
  roles?: string | null;
  drives: boolean;
  cvPath?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: Note[];
  specs?: SpecTracking[];
}

export interface SpecTracking {
  id: number;
  candidateId: number;
  company: string;
  role: string;
  specSentDate: Date;
  status: 'reviewing' | 'wants_to_apply' | 'cv_sent' | 'interview_scheduled';
  interviewDate?: Date | null;
  interviewNotes?: string | null;
  createdAt: Date;
  candidate?: Candidate;
}

export interface Note {
  id: number;
  candidateId: number;
  content: string;
  createdAt: Date;
  candidate?: Candidate;
}

export interface Reminder {
  id: number;
  candidateId: number;
  specTrackingId?: number | null;
  message: string;
  dueDate: Date;
  completed: boolean;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'system';
  content: string;
  timestamp: Date;
}

export interface AIFunctionCall {
  function: string;
  arguments: Record<string, any>;
}
