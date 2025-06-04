import { useState } from 'react';
import { Plus, MapPin, DollarSign, Briefcase, Building, StickyNote } from 'lucide-react';
import { useCandidates } from '../../hooks/useCandidates';
import { CandidateModal } from './CandidateModal';
import { Candidate } from '../../types';
import toast from 'react-hot-toast';

export function CandidateList() {
  const { candidates, updateCandidate } = useCandidates();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedData: Partial<Candidate>) => {
    if (!selectedCandidate) return;

    try {
      await updateCandidate(selectedCandidate.id, updatedData);
      setIsModalOpen(false);
      setSelectedCandidate(null);
      toast.success('Candidate updated successfully!');
    } catch (error) {
      toast.error('Failed to update candidate');
    }
  };

  const getIndustryColor = (industry: string) => {
    switch (industry) {
      case 'life science': return 'text-blue-400';
      case 'food science': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-100">
      {/* Simple Header */}
      <div className="p-6 border-b border-dark-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Candidates</h1>
            <p className="text-gray-400 text-sm">{candidates.length} total</p>
          </div>
          <button
            onClick={() => {
              setSelectedCandidate({
                id: 0,
                name: '',
                location: '',
                salary: '',
                roles: '',
                industry: '',
                drives: false,
                notes: '',
                createdAt: new Date(),
                updatedAt: new Date()
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Simple List */}
      <div className="flex-1 overflow-y-auto">
        {candidates.length === 0 ? (
          <div className="text-center mt-12 px-6">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-white mb-2">No candidates yet</h3>
            <p className="text-gray-400 text-sm mb-4">
              Add your first candidate to get started!
            </p>
            <button
              onClick={() => {
                setSelectedCandidate({
                  id: 0,
                  name: '',
                  location: '',
                  salary: '',
                  roles: '',
                  industry: '',
                  drives: false,
                  notes: '',
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white 
                       rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Candidate
            </button>
          </div>
        ) : (
          <div className="p-3">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => handleCandidateClick(candidate)}
                className="p-4 mb-3 bg-dark-200 rounded-lg border border-dark-300 
                         hover:border-blue-500/50 hover:bg-dark-200/80 cursor-pointer"
              >
                {/* Name & Notes Icon */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white text-sm hover:text-blue-300">
                    {candidate.name}
                  </h3>
                  {candidate.notes && (
                    <StickyNote className="w-3 h-3 text-yellow-400 opacity-70" />
                  )}
                </div>

                {/* Role & Industry */}
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-300">{candidate.roles}</span>
                  {candidate.industry && (
                    <>
                      <span className="text-gray-500">•</span>
                      <Building className="w-3 h-3 text-gray-500" />
                      <span className={`text-xs ${getIndustryColor(candidate.industry)}`}>
                        {candidate.industry}
                      </span>
                    </>
                  )}
                </div>

                {/* Location & Salary */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{candidate.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span className="font-medium">{candidate.salary}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <CandidateModal
        candidate={selectedCandidate}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCandidate(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
