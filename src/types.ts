export interface Candidate {
  id: number;
  name: string;
  // Dynamic fields stored as key-value pairs
  fields: Record<string, any>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'system';
  content: string;
  timestamp: Date;
}

export interface FilterState {
  search: string;
  fieldFilters: Record<string, any>; // Dynamic field filters
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
