import { useState } from 'react';
import { Edit, Trash2, Calendar, StickyNote } from 'lucide-react';
import { Candidate } from '../../types';
import { useSettings } from '../../hooks/useSettings';

interface CandidateCardProps {
  candidate: Candidate;
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: number, event: React.MouseEvent) => void;
  compact?: boolean;
}

export function CandidateCard({ candidate, onEdit, onDelete, compact = false }: CandidateCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const { settings } = useSettings();

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit(candidate);
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(candidate.id, event);
  };

  const renderFieldValue = (fieldConfig: any, value: any) => {
    if (fieldConfig.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value || '');
  };

  const cardClasses = compact 
    ? "card-primary hover:border-primary-500 group transition-all flex items-center gap-4"
    : "card-primary hover:border-primary-500 group transition-all";

  return (
    <div className={cardClasses}>
      {compact ? (
        // List View (Compact)
        <>
          {/* Left: Name and primary info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-body-lg text-primary truncate">{candidate.name}</h3>
              <div className="flex items-center gap-1 ml-4">
                {candidate.notes && (
                  <StickyNote className="w-3 h-3 text-warning-500" />
                )}
              </div>
            </div>
            
            {/* Primary fields as inline text */}
            <div className="flex flex-wrap gap-4 text-body text-muted">
              {settings.fields.slice(0, 3).map((fieldConfig) => {
                const value = candidate.fields[fieldConfig.id];
                if (!value && fieldConfig.type !== 'boolean') return null;
                
                return (
                  <span key={fieldConfig.id} className="whitespace-nowrap">
                    {fieldConfig.label}: <span className="text-primary">{renderFieldValue(fieldConfig, value)}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEditClick}
              className="p-2 text-muted hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 text-muted hover:text-error-500 hover:bg-error-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        // Grid View (Full Card)
        <>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-heading-3 mb-2 truncate">{candidate.name}</h3>
              <div className="flex items-center gap-2 text-caption-subtle">
                <Calendar className="w-3 h-3" />
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
                    className="p-1.5 text-warning-500 hover:bg-warning-500/10 rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StickyNote className="w-4 h-4" />
                  </button>
                  
                  {showNotes && (
                    <div className="absolute right-0 top-8 w-64 p-3 bg-dark-200 border border-dark-300 
                                   rounded-lg shadow-lg z-10">
                      <p className="text-body text-primary">{candidate.notes}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              <button
                onClick={handleEditClick}
                className="p-2 text-muted hover:text-primary-500 hover:bg-primary-500/10 
                         rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 text-muted hover:text-error-500 hover:bg-error-500/10 
                         rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content - Dynamic Fields */}
          <div className="space-y-4">
            {/* Primary Fields as Chips */}
            <div className="flex flex-wrap gap-2">
              {settings.fields.map((fieldConfig) => {
                const value = candidate.fields[fieldConfig.id];
                if (!value && fieldConfig.type !== 'boolean') return null;
                
                if (fieldConfig.type === 'dropdown' || fieldConfig.id === 'role') {
                  return (
                    <span key={fieldConfig.id} className="badge badge-primary">
                      {renderFieldValue(fieldConfig, value)}
                    </span>
                  );
                }
                return null;
              })}
            </div>

            {/* Secondary Fields in Grid */}
            <div className="grid grid-cols-1 gap-2 text-body">
              {settings.fields.map((fieldConfig) => {
                const value = candidate.fields[fieldConfig.id];
                if (!value && fieldConfig.type !== 'boolean') return null;
                if (fieldConfig.type === 'dropdown' || fieldConfig.id === 'role') return null;
                
                return (
                  <div key={fieldConfig.id} className="flex items-center gap-2 min-w-0">
                    <span className="text-muted flex-shrink-0 font-medium">{fieldConfig.label}:</span>
                    <span className={`truncate ${fieldConfig.type === 'boolean' && value ? 'text-success-500' : 'text-primary'}`}>
                      {renderFieldValue(fieldConfig, value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
