import { useState, useEffect, useCallback } from 'react'
import { Candidate } from '../types'
import { tauriCandidateService } from '../services/database/tauri-commands'

// Global state to maintain consistency across components
let globalCandidates: Candidate[] = []
let isInitialized = false

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load candidates on first mount
  const loadCandidates = useCallback(async () => {
    if (!isInitialized) {
      console.log('🚀 Loading candidates...')
      try {
        const data = await tauriCandidateService.getAll()
        globalCandidates = data
        isInitialized = true
        console.log('✅ Loaded', data.length, 'candidates')
      } catch (error) {
        console.error('Failed to load candidates:', error)
        globalCandidates = []
      }
    }

    // Always sync with global state
    setCandidates([...globalCandidates])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadCandidates()
  }, [loadCandidates])

  // Refresh candidates from service
  const refreshCandidates = useCallback(async () => {
    console.log('🔄 Refreshing candidates...')
    try {
      const data = await tauriCandidateService.getAll()
      globalCandidates = data
      setCandidates([...data]) // Force re-render with new array
      console.log('✅ Refreshed, now have', data.length, 'candidates')
    } catch (error) {
      console.error('Failed to refresh candidates:', error)
    }
  }, [])

  // Create candidate
  const createCandidate = useCallback(
    async (
      candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      console.log('👤 Creating candidate:', candidateData.name)
      try {
        const result = await tauriCandidateService.create(candidateData)
        if (result.success) {
          await refreshCandidates() // Refresh to get updated list
        }
        return result
      } catch (error) {
        console.error('Failed to create candidate:', error)
        return { success: false, message: 'Failed to create candidate' }
      }
    },
    [refreshCandidates]
  )

  // Update candidate
  const updateCandidate = useCallback(
    async (id: number, updates: Partial<Candidate>) => {
      console.log('✏️ Updating candidate:', id)
      try {
        const result = await tauriCandidateService.update(id, updates)
        if (result.success) {
          await refreshCandidates() // Refresh to get updated list
        }
        return result
      } catch (error) {
        console.error('Failed to update candidate:', error)
        return { success: false, message: 'Failed to update candidate' }
      }
    },
    [refreshCandidates]
  )

  // Delete candidate
  const deleteCandidate = useCallback(
    async (id: number) => {
      console.log('🗑️ Deleting candidate:', id)
      try {
        const result = await tauriCandidateService.delete(id)
        if (result.success) {
          await refreshCandidates() // Refresh to get updated list
        }
        return result
      } catch (error) {
        console.error('Failed to delete candidate:', error)
        return { success: false, message: 'Failed to delete candidate' }
      }
    },
    [refreshCandidates]
  )

  return {
    candidates,
    isLoading,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    refreshCandidates,
  }
}
