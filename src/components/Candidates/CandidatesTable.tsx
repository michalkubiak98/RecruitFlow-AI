import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCandidates } from '../../hooks/useCandidates';
import { useSettings } from '../../hooks/useSettings';
import { CandidateCard } from './CandidateCard';
import { CandidateModal } from './CandidateModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { SearchAndFilter } from '../Search/SearchAndFilter';
import { Candidate, FilterState } from '../../types';
import { exportToExcel, filterAndSortCandidates } from '../../utils/export';
import toast from 'react-hot-toast';

export function CandidatesTable() {
  const { candidates, createCandidate, updateCandidate, deleteCandidate } = useCandidates();
  const { settings } = useSettings();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    fieldFilters: {},
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Apply filters and sorting
  const filteredCandidates = filterAndSortCandidates(candidates, filters, settings);

  const handleEdit = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleCardClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (candidate: Candidate, event: React.MouseEvent) => {
    // Prevent event bubbling to avoid opening the card modal
    event.stopPropagation();
    setCandidateToDelete(candidate);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!candidateToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteCandidate(candidateToDelete.id);
      if (result.success) {
        toast.success(`${settings.entityNameSingular} deleted successfully!`);
        setIsDeleteModalOpen(false);
        setCandidateToDelete(null);
      } else {
        toast.error(result.message || `Failed to delete ${settings.entityNameSingular.toLowerCase()}`);
      }
    } catch (error) {
      toast.error(`Failed to delete ${settings.entityNameSingular.toLowerCase()}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (updatedData: Partial<Candidate>) => {
    if (!selectedCandidate) return;

    try {
      if (selectedCandidate.id === 0) {
        await createCandidate(updatedData as Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>);
        toast.success(`${settings.entityNameSingular} created successfully!`);
      } else {
        await updateCandidate(selectedCandidate.id, updatedData);
        toast.success(`${settings.entityNameSingular} updated successfully!`);
      }
      setIsModalOpen(false);
      setSelectedCandidate(null);
    } catch (error) {
      toast.error(`Failed to save ${settings.entityNameSingular.toLowerCase()}`);
    }
  };

  const handleExport = () => {
    try {
      exportToExcel(filteredCandidates, settings);
      toast.success(`Downloaded ${filteredCandidates.length} ${settings.entityName.toLowerCase()} to your Downloads folder!`);
    } catch (error) {
      toast.error(`Failed to export ${settings.entityName.toLowerCase()}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-100">
      {/* Header */}
      <div className="p-6 border-b border-dark-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{settings.entityName} Table</h1>
            <p className="text-gray-400">
              {filteredCandidates.length} {filteredCandidates.length !== 1 ? settings.entityName.toLowerCase() : settings.entityNameSingular.toLowerCase()}
              {filters.search || Object.keys(filters.fieldFilters).length > 0 ? 
                ` found (${candidates.length} total)` : ''
              }
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCandidate({
                id: 0,
                name: '',
                fields: {},
                notes: '',
                createdAt: new Date(),
                updatedAt: new Date()
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add {settings.entityNameSingular}
          </button>
        </div>

        {/* Search and Filter */}
        <SearchAndFilter
          filters={filters}
          onFiltersChange={setFilters}
          onExport={handleExport}
          candidateCount={filteredCandidates.length}
        />
      </div>

      {/* Candidate Cards - Full Width with Padding */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {filteredCandidates.length === 0 ? (
          <div className="text-center mt-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-white mb-4">
                {candidates.length === 0 ? `👥 No ${settings.entityName.toLowerCase()} yet` : '🔍 No matches found'}
              </h3>
              <p className="text-gray-400 mb-6">
                {candidates.length === 0 
                  ? `Add your first ${settings.entityNameSingular.toLowerCase()} to get started!`
                  : 'Try adjusting your search or filters.'
                }
              </p>
              {candidates.length === 0 && (
                <button
                  onClick={() => {
                    setSelectedCandidate({
                      id: 0,
                      name: '',
                      fields: {},
                      notes: '',
                      createdAt: new Date(),
                      updatedAt: new Date()
                    });
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white 
                           rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First {settings.entityNameSingular}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* Single column on mobile, 2 columns on tablet, 3 on desktop, but wider cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate) => (
                <div key={candidate.id} onClick={() => handleCardClick(candidate)} className="cursor-pointer">
                  <CandidateCard
                    candidate={candidate}
                    onEdit={handleEdit}
                    onDelete={(id, event) => {
                      const candidate = filteredCandidates.find(c => c.id === id);
                      if (candidate) {
                        handleDeleteClick(candidate, event);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <CandidateModal
        candidate={selectedCandidate}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCandidate(null);
        }}
        onSave={handleSave}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        candidate={candidateToDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCandidateToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
