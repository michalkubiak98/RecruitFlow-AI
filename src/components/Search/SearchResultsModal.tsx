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

  const renderFieldValue = (fieldConfig: any, value: any) => {
    if (fieldConfig.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value || '');
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
              <h3 className="text-xl font-semibold text-white mb-2">No {settings.entityName.toLowerCase()} found</h3>
              <p className="text-gray-400">
                Try adjusting your search criteria or check the spelling.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-white mb-4">
                Found <span className="font-semibold text-blue-400">{results.length}</span> {results.length !== 1 ? settings.entityName.toLowerCase() : settings.entityNameSingular.toLowerCase()}
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

                    {/* Dynamic Fields Display */}
                    <div className="space-y-3">
                      {/* Primary tags (dropdowns and key fields) */}
                      <div className="flex flex-wrap items-center gap-2">
                        {settings.fields.map((fieldConfig) => {
                          const value = candidate.fields[fieldConfig.id];
                          if (!value && fieldConfig.type !== 'boolean') return null;
                          
                          if (fieldConfig.type === 'dropdown' || fieldConfig.id === 'roles') {
                            return (
                              <div key={fieldConfig.id} className={`px-3 py-1 rounded-full text-sm border ${getFieldColor(fieldConfig.id, value)}`}>
                                {fieldConfig.label}: {renderFieldValue(fieldConfig, value)}
                              </div>
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
                          if (fieldConfig.type === 'dropdown' || fieldConfig.id === 'roles') return null;
                          
                          return (
                            <div key={fieldConfig.id} className="flex items-center gap-2 text-gray-300 text-sm">
                              <span className="text-gray-400 font-medium">{fieldConfig.label}:</span>
                              <span className={fieldConfig.type === 'boolean' && value ? 'text-green-400' : ''}>
                                {renderFieldValue(fieldConfig, value)}
                              </span>
                            </div>
                          );
                        })}
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
