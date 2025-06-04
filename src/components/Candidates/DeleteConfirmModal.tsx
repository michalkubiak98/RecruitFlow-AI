import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { Candidate } from '../../types';
import { useSettings } from '../../hooks/useSettings';

interface DeleteConfirmModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({ 
  candidate, 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting = false 
}: DeleteConfirmModalProps) {
  const { settings } = useSettings();

  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-200 rounded-lg border border-red-500/30 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Confirm Deletion</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this {settings.entityNameSingular.toLowerCase()}?
            </p>
            
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {candidate.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white">{candidate.name}</h3>
                  <div className="text-sm text-gray-400">
                    {candidate.fields.location && `${candidate.fields.location} • `}
                    {candidate.fields.roles}
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-red-300 text-sm mt-4 font-medium">
              ⚠️ This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 text-gray-300 border border-dark-300 rounded-lg 
                       hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete {settings.entityNameSingular}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
