import { X, Trash2 } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-100 border border-dark-300 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-300">
          <h2 className="text-heading-3 text-primary">Delete {settings.entityNameSingular}?</h2>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-muted hover:text-primary hover:bg-dark-200 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-body-muted mb-4">
            Are you sure you want to delete <strong className="text-primary">{candidate.name}</strong>? 
            This action cannot be undone.
          </p>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="button-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-error-500 hover:bg-error-600 text-white rounded-lg px-4 py-3 
                       font-medium transition-colors flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
