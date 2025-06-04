import { X, User, MapPin, DollarSign, Briefcase, Building, StickyNote, Car, Calendar } from 'lucide-react';
import { Candidate } from '../../types';

interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: Candidate[];
  searchType: 'specific' | 'filter';
  query: string;
  criteria?: string;
}

export function SearchResultsModal({ 
  isOpen, 
  onClose, 
  results, 
  searchType, 
  query, 
  criteria 
}: SearchResultsModalProps) {
  if (!isOpen) return null;

  const getIndustryColor = (industry: string) => {
    switch (industry) {
      case 'life science': return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
      case 'food science': return 'bg-green-600/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-200 rounded-lg border border-dark-300 w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-300">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">
              🔍 Search Results
            </h2>
            <p className="text-gray-400 text-sm">
              {searchType === 'specific' 
                ? `Searching for: "${query}"`
                : `Filter: ${criteria || query}`
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No candidates found</h3>
              <p className="text-gray-400">
                Try adjusting your search criteria or check the spelling.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-white mb-4">
                Found <span className="font-semibold text-blue-400">{results.length}</span> candidate{results.length !== 1 ? 's' : ''}
              </div>
              
              <div className="grid gap-4">
                {results.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="bg-dark-100 rounded-lg border border-dark-300 p-4 hover:border-blue-500/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {candidate.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Added {new Date(candidate.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {candidate.notes && (
                        <div className="group relative">
                          <StickyNote className="w-4 h-4 text-yellow-400" />
                          <div className="absolute right-0 top-6 w-64 p-3 bg-dark-200 border border-dark-300 
                                         rounded-lg shadow-lg opacity-0 group-hover:opacity-100 z-10">
                            <p className="text-sm text-gray-300">{candidate.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Column */}
                      <div className="space-y-3">
                        {/* Role & Industry */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-2 px-3 py-1 bg-purple-600/20 text-purple-300 
                                         rounded-full text-sm border border-purple-500/30">
                            <Briefcase className="w-3 h-3" />
                            {candidate.roles}
                          </div>
                          
                          {candidate.industry && (
                            <div className={`px-3 py-1 rounded-full text-sm border ${getIndustryColor(candidate.industry)}`}>
                              <Building className="w-3 h-3 inline mr-1" />
                              {candidate.industry}
                            </div>
                          )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{candidate.location}</span>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-3">
                        {/* Salary */}
                        <div className="flex items-center gap-2 text-gray-300">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold">{candidate.salary}</span>
                        </div>

                        {/* Driving */}
                        {candidate.drives && (
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <Car className="w-4 h-4" />
                            <span>Can drive</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {candidate.notes && (
                      <div className="mt-3 pt-3 border-t border-dark-300">
                        <div className="flex items-start gap-2">
                          <StickyNote className="w-4 h-4 text-yellow-400 mt-0.5" />
                          <p className="text-sm text-gray-300">{candidate.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
