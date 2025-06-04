import { User, MapPin, DollarSign, Briefcase, Car, Calendar } from 'lucide-react';
import { Candidate } from '../../types';

interface CandidateTableProps {
  candidates: Candidate[];
  isLoading: boolean;
  onCandidateSelect: (candidate: Candidate) => void;
}

export function CandidateTable({ candidates, isLoading, onCandidateSelect }: CandidateTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No candidates yet</h3>
        <p className="text-gray-400">Start by adding a candidate using the chat!</p>
        <div className="mt-4 p-4 bg-dark-200 rounded-lg text-left max-w-md mx-auto">
          <p className="text-sm text-gray-300 mb-2">Try these examples:</p>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• "Add Sarah from Cork wants 60k for developer roles"</li>
            <li>• "Create candidate Mike in Galway for marketing 45k"</li>
            <li>• "New candidate Lisa from Dublin, QA tester, 55k, can drive"</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">All Candidates ({candidates.length})</h2>
      </div>

      <div className="grid gap-4">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            onClick={() => onCandidateSelect(candidate)}
            className="bg-dark-200 border border-dark-300 rounded-lg p-6 hover:border-blue-500/30 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{candidate.name}</h3>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {candidate.location && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">{candidate.location}</span>
                    </div>
                  )}
                  
                  {candidate.salary && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-sm">{candidate.salary}</span>
                    </div>
                  )}
                  
                  {candidate.roles && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">{candidate.roles}</span>
                    </div>
                  )}
                  
                  {candidate.drives && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Car className="w-4 h-4 text-orange-400" />
                      <span className="text-sm">Can drive</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Added {new Date(candidate.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
