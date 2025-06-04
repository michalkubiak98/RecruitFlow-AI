import { Candidate } from '../../types';

const CANDIDATES_STORAGE_KEY = 'rolodex-candidates-persistent';

// Load initial data from storage  
const loadCandidatesFromStorage = (): Candidate[] => {
  try {
    const saved = localStorage.getItem(CANDIDATES_STORAGE_KEY);
    if (saved) {
      const candidates = JSON.parse(saved);
      return candidates.map((c: any) => ({
        ...c,
        // Migrate old format to new dynamic format
        fields: c.fields || {
          location: c.location || '',
          salary: c.salary || '',
          roles: c.roles || '',
          industry: c.industry || '',
          drives: c.drives || false
        },
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      }));
    }
  } catch (error) {
    console.error('Failed to load candidates from storage:', error);
  }
  
  // Default data in new dynamic format
  return [
    {
      id: 1,
      name: "Jane Doe",
      fields: {
        location: "Cork",
        salary: "85k",
        roles: "developer",
        industry: "life science",
        drives: true
      },
      notes: "Strong technical background, excellent Python skills",
      createdAt: new Date('2025-06-01'),
      updatedAt: new Date('2025-06-04')
    }
  ];
};

// Save candidates to storage
const saveCandidatesToStorage = (candidates: Candidate[]) => {
  try {
    localStorage.setItem(CANDIDATES_STORAGE_KEY, JSON.stringify(candidates));
    console.log('💾 Saved candidates to persistent storage');
  } catch (error) {
    console.error('Failed to save candidates:', error);
  }
};

// Initialize with persistent data
let mockCandidates: Candidate[] = loadCandidatesFromStorage();
let nextId = Math.max(...mockCandidates.map(c => c.id), 0) + 1;

function findCandidateByName(name: string): Candidate | undefined {
  return mockCandidates.find(c => 
    c.name.toLowerCase().includes(name.toLowerCase()) || 
    name.toLowerCase().includes(c.name.toLowerCase())
  );
}

export const tauriCandidateService = {
  async getAll(): Promise<Candidate[]> {
    console.log('📋 Mock service: returning', mockCandidates.length, 'candidates');
    return [...mockCandidates];
  },

  async create(data: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string }> {
    console.log('👤 Mock service: creating candidate:', data);
    
    const newCandidate: Candidate = {
      ...data,
      id: nextId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockCandidates.push(newCandidate);
    saveCandidatesToStorage(mockCandidates);
    console.log('✅ Mock service: candidate created, total:', mockCandidates.length);
    
    return { success: true, message: `Created candidate: ${data.name}` };
  },

  async update(id: number, data: Partial<Omit<Candidate, 'id' | 'createdAt'>>): Promise<{ success: boolean; message: string }> {
    console.log('✏️ Mock service: updating candidate', id, 'with:', data);
    
    const index = mockCandidates.findIndex(c => c.id === id);
    if (index === -1) {
      return { success: false, message: 'Candidate not found' };
    }
    
    mockCandidates[index] = {
      ...mockCandidates[index],
      ...data,
      updatedAt: new Date()
    };
    
    saveCandidatesToStorage(mockCandidates);
    console.log('✅ Mock service: candidate updated');
    return { success: true, message: `Updated candidate: ${mockCandidates[index].name}` };
  },

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    console.log('🗑️ Mock service: deleting candidate', id);
    
    const index = mockCandidates.findIndex(c => c.id === id);
    if (index === -1) {
      return { success: false, message: 'Candidate not found' };
    }
    
    const deletedCandidate = mockCandidates[index];
    mockCandidates.splice(index, 1);
    saveCandidatesToStorage(mockCandidates);
    
    console.log('✅ Mock service: candidate deleted, remaining:', mockCandidates.length);
    return { success: true, message: `Deleted candidate: ${deletedCandidate.name}` };
  },

  async findByName(name: string): Promise<Candidate | null> {
    const candidate = findCandidateByName(name);
    return candidate || null;
  }
};
