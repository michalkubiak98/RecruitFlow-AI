export interface Candidate {
  id: number;
  name: string;
  location: string;
  salary: string;
  roles: string;
  industry: 'life science' | 'food science' | '';
  drives: boolean;
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
  industry: 'all' | 'life science' | 'food science';
  sortBy: 'name' | 'salary' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}
