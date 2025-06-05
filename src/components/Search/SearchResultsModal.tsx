import { X, User, Calendar, StickyNote } from 'lucide-react';
import { Candidate } from '../../types';
import { useSettings } from '../../hooks/useSettings';

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
  const { settings } = useSettings();

  if (!isOpen) return null;

  const renderFieldValue = (fieldConfig: any, value: any) => {
    if (fieldConfig.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value || '');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-100 border border-dark-300 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-300">
          <div>
            <h2 className="text-heading-2 mb-1">
              Search Results
            </h2>
            <p className="text-body-muted">
              {searchType === 'specific' 
                ? `Searching for: "${query}"`
                : `Filter: ${criteria || query}`
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-primary hover:bg-dark-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-heading-3 mb-2">No {settings.entityName.toLowerCase()} found</h3>
              <p className="text-body-muted">
                Try adjusting your search criteria or check the spelling.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-primary">
                Found <span className="font-semibold text-primary-500">{results.length}</span> {results.length !== 1 ? settings.entityName.toLowerCase() : settings.entityNameSingular.toLowerCase()}
              </div>
              
              <div className="grid gap-4">
                {results.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="card-primary hover:border-primary-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-heading-3 mb-1 flex items-center gap-2">
                          <User className="w-4 h-4 text-muted" />
                          {candidate.name}
                        </h3>
                        <div className="flex items-center gap-4 text-caption-subtle">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Added {new Date(candidate.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {candidate.notes && (
                        <div className="group relative">
                          <StickyNote className="w-4 h-4 text-warning-500" />
                          <div className="absolute right-0 top-6 w-64 p-3 bg-dark-200 border border-dark-300 
                                         rounded-lg shadow-lg opacity-0 group-hover:opacity-100 z-10 transition-opacity">
                            <p className="text-body text-primary">{candidate.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dynamic Fields Display */}
                    <div className="space-y-4">
                      {/* Primary chips */}
                      <div className="flex flex-wrap items-center gap-2">
                        {settings.fields.map((fieldConfig) => {
                          const value = candidate.fields[fieldConfig.id];
                          if (!value && fieldConfig.type !== 'boolean') return null;
                          
                          if (fieldConfig.type === 'dropdown' || fieldConfig.id === 'role') {
                            return (
                              <span key={fieldConfig.id} className="badge badge-primary">
                                {fieldConfig.label}: {renderFieldValue(fieldConfig, value)}
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      {/* Other fields in grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {settings.fields.map((fieldConfig) => {
                          const value = candidate.fields[fieldConfig.id];
                          if (!value && fieldConfig.type !== 'boolean') return null;
                          if (fieldConfig.type === 'dropdown' || fieldConfig.id === 'role') return null;
                          
                          return (
                            <div key={fieldConfig.id} className="flex items-center gap-2 text-body">
                              <span className="text-muted font-medium">{fieldConfig.label}:</span>
                              <span className={fieldConfig.type === 'boolean' && value ? 'text-success-500' : 'text-primary'}>
                                {renderFieldValue(fieldConfig, value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notes */}
                    {candidate.notes && (
                      <div className="mt-4 pt-4 border-t border-dark-300">
                        <div className="flex items-start gap-2">
                          <StickyNote className="w-4 h-4 text-warning-500 mt-0.5" />
                          <p className="text-body text-primary">{candidate.notes}</p>
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
