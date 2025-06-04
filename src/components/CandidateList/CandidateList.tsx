import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MapPin, DollarSign, Briefcase, Car } from 'lucide-react';
import { Candidate } from '../../types';
import { CandidateDetails } from './CandidateDetails';
import { clsx } from 'clsx';

interface CandidateListProps {
  candidates: Candidate[];
  onUpdate: () => void;
}

export function CandidateList({ candidates, onUpdate }: CandidateListProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'blacklisted'>('all');

  const filteredCandidates = candidates.filter(candidate => {
    if (filter === 'all') return true;
    if (filter === 'active') return candidate.status === 'active';
    if (filter === 'blacklisted') return candidate.status === 'blacklisted';
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-dark-200">
      {/* Header */}
      <div className="p-4 border-b border-dark-300">
        <h2 className="text-lg font-semibold mb-3">Candidates</h2>
        
        {/* Filter buttons */}
        <div className="flex space-x-2">
          {(['all', 'active', 'blacklisted'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={clsx(
                'px-3 py-1 text-sm rounded-md transition-colors',
                filter === filterOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-dark-300 text-gray-400 hover:text-white'
              )}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate list */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredCandidates.map((candidate) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={clsx(
                'p-4 border-b border-dark-300 cursor-pointer hover:bg-dark-300 transition-colors',
                selectedCandidate?.id === candidate.id && 'bg-dark-300',
                candidate.status === 'blacklisted' && 'opacity-60'
              )}
              onClick={() => setSelectedCandidate(
                selectedCandidate?.id === candidate.id ? null : candidate
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-white">
                    {candidate.name}
                    {candidate.status === 'blacklisted' && (
                      <span className="ml-2 text-xs text-red-500">(Never use)</span>
                    )}
                  </h3>
                  
                  <div className="mt-1 space-y-1">
                    {candidate.location && (
                      <div className="flex items-center text-xs text-gray-400">
                        <MapPin className="w-3 h-3 mr-1" />
                        {candidate.location}
                      </div>
                    )}
                    
                    {candidate.salary && (
                      <div className="flex items-center text-xs text-gray-400">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {candidate.salary}
                      </div>
                    )}
                    
                    {candidate.roles && (
                      <div className="flex items-center text-xs text-gray-400">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {candidate.roles}
                      </div>
                    )}
                    
                    {candidate.drives && (
                      <div className="flex items-center text-xs text-gray-400">
                        <Car className="w-3 h-3 mr-1" />
                        Can drive
                      </div>
                    )}
                  </div>
                </div>
                
                <ChevronRight
                  className={clsx(
                    'w-5 h-5 text-gray-400 transition-transform',
                    selectedCandidate?.id === candidate.id && 'rotate-90'
                  )}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Details panel */}
      <AnimatePresence>
        {selectedCandidate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 z-50 bg-dark-100"
          >
            <CandidateDetails
              candidate={selectedCandidate}
              onClose={() => setSelectedCandidate(null)}
              onUpdate={onUpdate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
