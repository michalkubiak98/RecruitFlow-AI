import { useState } from 'react';
import { Edit, Trash2, MapPin, DollarSign, Briefcase, Calendar, StickyNote, Car } from 'lucide-react';
import { Candidate } from '../../types';

interface CandidateCardProps {
  candidate: Candidate;
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: number) => void;
}

export function CandidateCard({ candidate, onEdit, onDelete }: CandidateCardProps) {
  const [showNotes, setShowNotes] = useState(false);

  const getIndustryColor = (industry: string) => {
    switch (industry) {
      case 'life science': return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
      case 'food science': return 'bg-green-600/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="bg-dark-200 rounded-lg border border-dark-300 p-6 hover:border-blue-500/50 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-1">{candidate.name}</h3>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Calendar className="w-3 h-3" />
            Added {new Date(candidate.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Notes Icon */}
          {candidate.notes && (
            <div className="relative">
              <button
                onMouseEnter={() => setShowNotes(true)}
                onMouseLeave={() => setShowNotes(false)}
                className="p-1.5 text-yellow-400 hover:bg-yellow-400/20 rounded"
              >
                <StickyNote className="w-4 h-4" />
              </button>
              
              {showNotes && (
                <div className="absolute right-0 top-8 w-64 p-3 bg-dark-100 border border-dark-300 
                               rounded-lg shadow-lg z-10">
                  <p className="text-sm text-gray-300">{candidate.notes}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <button
            onClick={() => onEdit(candidate)}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/20 
                     rounded opacity-0 group-hover:opacity-100"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(candidate.id)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/20 
                     rounded opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
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
              {candidate.industry}
            </div>
          )}
        </div>

        {/* Location & Salary */}
        <div className="flex items-center justify-between text-gray-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{candidate.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="font-semibold">{candidate.salary}</span>
          </div>
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
  );
}
