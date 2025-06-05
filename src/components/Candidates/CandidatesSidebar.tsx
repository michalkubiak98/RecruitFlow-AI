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
      <div className="h-full flex flex-col bg-dark-100">
        <div className="p-4 border-b border-dark-300">
          <h2 className="text-heading-3">{settings.entityName}</h2>
          <p className="text-caption-subtle">Loading...</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted">Loading {settings.entityName.toLowerCase()}...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-dark-100">
      {/* Header */}
      <div className="p-4 border-b border-dark-300">
        <h2 className="text-heading-3">{settings.entityName}</h2>
        <p className="text-caption-subtle">{candidates.length} total</p>
      </div>

      {/* Candidates List */}
      <div className="flex-1 overflow-y-auto">
        {candidates.length === 0 ? (
          <div className="text-center mt-8 p-4">
            <div className="text-3xl mb-3">👥</div>
            <p className="text-body text-muted">No {settings.entityName.toLowerCase()} yet</p>
            <p className="text-caption-subtle mt-1">
              Add {settings.entityName.toLowerCase()} via AI chat
            </p>
          </div>
        ) : (
          <div className="p-3">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => handleCandidateClick(candidate)}
                className="relative p-3 mb-3 bg-dark-200 border border-dark-300 rounded-lg 
                         hover:border-primary-500 hover:bg-dark-200/80 cursor-pointer transition-colors"
              >
                {/* Name & Icons Row */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-body-lg text-primary hover:text-primary-500 
                                 truncate flex-1 pr-2 transition-colors">
                    {candidate.name}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {candidate.notes && (
                      <StickyNote className="w-3 h-3 text-warning-500" />
                    )}
                  </div>
                </div>

                {/* Dynamic Fields Display */}
                <div className="space-y-2">
                  {settings.fields.slice(0, 3).map((fieldConfig) => {
                    const value = candidate.fields[fieldConfig.id];
                    if (!value && fieldConfig.type !== 'boolean') return null;
                    
                    return (
                      <div key={fieldConfig.id} className="flex items-center gap-2 text-caption">
                        <span className="text-muted min-w-0 truncate font-medium">
                          {fieldConfig.label}:
                        </span>
                        <span className="truncate text-primary">
                          {renderFieldValue(fieldConfig.id, value)}
                        </span>
                      </div>
                    );
                  })}
                  
                  {/* Show count if more fields exist */}
                  {settings.fields.length > 3 && (
                    <div className="text-caption-subtle">
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
