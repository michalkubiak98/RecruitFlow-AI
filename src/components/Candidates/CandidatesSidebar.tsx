import { useState } from 'react'
import { StickyNote } from 'lucide-react'
import { useCandidates } from '../../hooks/useCandidates'
import { useSettings } from '../../hooks/useSettings'
import { CandidateModal } from './CandidateModal'
import { Candidate } from '../../types'
import toast from 'react-hot-toast'

export function CandidatesSidebar() {
  const { candidates, updateCandidate, isLoading } = useCandidates()
  const { settings } = useSettings()
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  console.log('🎯 CandidatesSidebar render:', {
    candidatesCount: candidates.length,
    isLoading,
    candidates: candidates.map((c) => ({ id: c.id, name: c.name })),
  })

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsModalOpen(true)
  }

  const handleSave = async (updatedData: Partial<Candidate>) => {
    if (!selectedCandidate) return

    try {
      await updateCandidate(selectedCandidate.id, updatedData)
      setIsModalOpen(false)
      setSelectedCandidate(null)
      toast.success(`${settings.entityNameSingular} updated successfully!`)
    } catch (error) {
      toast.error(`Failed to update ${settings.entityNameSingular.toLowerCase()}`)
    }
  }

  const getFieldColor = (fieldId: string, value: any) => {
    const fieldConfig = settings.fields.find(f => f.id === fieldId);
    
    if (fieldConfig?.type === 'dropdown') {
      // Different colors for different dropdown values
      switch (value) {
        case 'life science': return 'text-blue-400';
        case 'food science': return 'text-green-400';
        default: return 'text-gray-400';
      }
    }
    
    return 'text-gray-400';
  }

  const renderFieldValue = (fieldId: string, value: any) => {
    const fieldConfig = settings.fields.find(f => f.id === fieldId);
    
    if (!fieldConfig) return null;
    
    if (fieldConfig.type === 'boolean') {
      return value ? '✓' : '✗';
    }
    
    return String(value || '');
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-dark-200">
        <div className="p-4 border-b border-dark-300">
          <h2 className="text-lg font-semibold text-white">{settings.entityName}</h2>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading {settings.entityName.toLowerCase()}...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-dark-200">
      {/* Header */}
      <div className="p-4 border-b border-dark-300">
        <h2 className="text-lg font-semibold text-white">{settings.entityName}</h2>
        <p className="text-sm text-gray-400">{candidates.length} total</p>
      </div>

      {/* Candidates List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {candidates.length === 0 ? (
          <div className="text-center mt-8 p-4">
            <div className="text-3xl mb-3">👥</div>
            <p className="text-sm text-gray-400">No {settings.entityName.toLowerCase()} yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Add {settings.entityName.toLowerCase()} via AI chat
            </p>
          </div>
        ) : (
          <div className="p-3">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => handleCandidateClick(candidate)}
                className="relative p-3 mb-3 bg-dark-100 rounded-lg border border-dark-300 
                         hover:border-blue-500/50 hover:bg-dark-100/80 cursor-pointer"
              >
                {/* Name & Icons Row */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white text-sm hover:text-blue-300 
                                 truncate flex-1 pr-2">
                    {candidate.name}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {candidate.notes && (
                      <StickyNote className="w-3 h-3 text-yellow-400" />
                    )}
                  </div>
                </div>

                {/* Dynamic Fields Display */}
                <div className="space-y-1">
                  {settings.fields.slice(0, 3).map((fieldConfig) => {
                    const value = candidate.fields[fieldConfig.id];
                    if (!value && fieldConfig.type !== 'boolean') return null;
                    
                    return (
                      <div key={fieldConfig.id} className="flex items-center gap-1 text-xs">
                        <span className="text-gray-500 min-w-0 truncate">
                          {fieldConfig.label}:
                        </span>
                        <span className={`truncate ${getFieldColor(fieldConfig.id, value)}`}>
                          {renderFieldValue(fieldConfig.id, value)}
                        </span>
                      </div>
                    );
                  })}
                  
                  {/* Show count if more fields exist */}
                  {settings.fields.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{settings.fields.length - 3} more fields
                    </div>
                  )}
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
          setIsModalOpen(false)
          setSelectedCandidate(null)
        }}
        onSave={handleSave}
      />
    </div>
  )
}
