import { useState } from 'react';
import { Edit, Trash2, MapPin, DollarSign, Briefcase, Calendar, StickyNote, Car } from 'lucide-react';
import { Candidate } from '../../types';
import { useSettings } from '../../hooks/useSettings';

interface CandidateCardProps {
  candidate: Candidate;
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: number) => void;
}

export function CandidateCard({ candidate, onEdit, onDelete }: CandidateCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const { settings } = useSettings();

  const getFieldColor = (fieldId: string, value: any) => {
    const fieldConfig = settings.fields.find(f => f.id === fieldId);
    
    if (fieldConfig?.type === 'dropdown') {
      switch (value) {
        case 'life science': return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
        case 'food science': return 'bg-green-600/20 text-green-300 border-green-500/30';
        default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
      }
    }
    return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
  };

  const getFieldIcon = (fieldId: string) => {
    switch (fieldId) {
      case 'location': return <MapPin className="w-3 h-3 flex-shrink-0" />;
      case 'salary': return <DollarSign className="w-3 h-3 flex-shrink-0" />;
      case 'roles': return <Briefcase className="w-3 h-3 flex-shrink-0" />;
      case 'drives': return <Car className="w-3 h-3 flex-shrink-0" />;
      default: return <Briefcase className="w-3 h-3 flex-shrink-0" />;
    }
  };

  const renderFieldValue = (fieldConfig: any, value: any) => {
    if (fieldConfig.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value || '');
  };

  return (
    <div className="bg-dark-200 rounded-lg border border-dark-300 p-6 hover:border-blue-500/50 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-white mb-1 truncate">{candidate.name}</h3>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>Added {new Date(candidate.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
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

      {/* Content - Dynamic Fields with Responsive Chips */}
      <div className="space-y-3">
        {/* Primary Fields - Responsive Flex Chips */}
        <div className="flex flex-wrap gap-2">
          {settings.fields.map((fieldConfig) => {
            const value = candidate.fields[fieldConfig.id];
            if (!value && fieldConfig.type !== 'boolean') return null;
            
            if (fieldConfig.type === 'dropdown' || fieldConfig.id === 'roles') {
              return (
                <div 
                  key={fieldConfig.id} 
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border max-w-full ${getFieldColor(fieldConfig.id, value)}`}
                >
                  {getFieldIcon(fieldConfig.id)}
                  <span className="truncate">{renderFieldValue(fieldConfig, value)}</span>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Secondary Fields - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {settings.fields.map((fieldConfig) => {
            const value = candidate.fields[fieldConfig.id];
            if (!value && fieldConfig.type !== 'boolean') return null;
            if (fieldConfig.type === 'dropdown' || fieldConfig.id === 'roles') return null;
            
            return (
              <div key={fieldConfig.id} className="flex items-center gap-2 min-w-0">
                {getFieldIcon(fieldConfig.id)}
                <span className="text-gray-400 flex-shrink-0">{fieldConfig.label}:</span>
                <span className={`truncate ${fieldConfig.type === 'boolean' && value ? 'text-green-400' : 'text-gray-300'}`}>
                  {renderFieldValue(fieldConfig, value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
