import { useState } from 'react'
import {
  MapPin,
  DollarSign,
  Briefcase,
  Building,
  StickyNote,
  Car,
} from 'lucide-react'
import { useCandidates } from '../../hooks/useCandidates'
import { CandidateModal } from './CandidateModal'
import { Candidate } from '../../types'
import toast from 'react-hot-toast'

export function CandidatesSidebar() {
  const { candidates, updateCandidate, isLoading } = useCandidates()
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  )
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
      toast.success('Candidate updated successfully!')
    } catch (error) {
      toast.error('Failed to update candidate')
    }
  }

  const getIndustryColor = (industry: string) => {
    switch (industry) {
      case 'life science':
        return 'text-blue-400'
      case 'food science':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-dark-200">
        <div className="p-4 border-b border-dark-300">
          <h2 className="text-lg font-semibold text-white">Candidates</h2>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading candidates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-dark-200">
      {/* Header */}
      <div className="p-4 border-b border-dark-300">
        <h2 className="text-lg font-semibold text-white">Candidates</h2>
        <p className="text-sm text-gray-400">{candidates.length} total</p>
      </div>

      {/* Candidates List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {candidates.length === 0 ? (
          <div className="text-center mt-8 p-4">
            <div className="text-3xl mb-3">👥</div>
            <p className="text-sm text-gray-400">No candidates yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Add candidates via AI chat
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
                  <h3
                    className="font-medium text-white text-sm hover:text-blue-300 
                                 truncate flex-1 pr-2"
                  >
                    {candidate.name}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {candidate.drives && (
                      <Car className="w-3 h-3 text-green-400" />
                    )}
                    {candidate.notes && (
                      <StickyNote className="w-3 h-3 text-yellow-400" />
                    )}
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-center gap-1 mb-2">
                  <Briefcase className="w-3 h-3 text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-300 truncate">
                    {candidate.roles}
                  </span>
                </div>

                {/* Industry */}
                {candidate.industry && (
                  <div className="flex items-center gap-1 mb-2">
                    <Building className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    <span
                      className={`text-xs ${getIndustryColor(candidate.industry)} truncate`}
                    >
                      {candidate.industry}
                    </span>
                  </div>
                )}

                {/* Location & Salary */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-400 truncate">
                      {candidate.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-300 font-medium">
                      {candidate.salary}
                    </span>
                  </div>
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
