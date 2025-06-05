import { useState, useEffect } from 'react';
import { X, Save, User, ChevronDown } from 'lucide-react';
import { Candidate } from '../../types';
import { useSettings } from '../../hooks/useSettings';

interface CandidateModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (candidate: Partial<Candidate>) => void;
}

export function CandidateModal({ candidate, isOpen, onClose, onSave }: CandidateModalProps) {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    fields: {} as Record<string, any>,
    notes: ''
  });

  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name,
        fields: candidate.fields || {},
        notes: candidate.notes || ''
      });
    }
  }, [candidate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (fieldId: string, value: any) => {
    setFormData({
      ...formData,
      fields: {
        ...formData.fields,
        [fieldId]: value
      }
    });
  };

  const renderField = (fieldConfig: any) => {
    const value = formData.fields[fieldConfig.id] || '';

    switch (fieldConfig.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateField(fieldConfig.id, e.target.value)}
            placeholder={fieldConfig.placeholder}
            className="input-primary"
            required={fieldConfig.required}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-3 p-4 bg-dark-200 border border-dark-400 rounded-lg">
            <input
              type="checkbox"
              id={fieldConfig.id}
              checked={Boolean(value)}
              onChange={(e) => updateField(fieldConfig.id, e.target.checked)}
              className="w-4 h-4 text-primary-500 bg-dark-100 border-dark-300 rounded 
                       focus:ring-primary-500 focus:ring-2"
            />
            <label htmlFor={fieldConfig.id} className="text-body text-primary">
              {fieldConfig.label}
            </label>
          </div>
        );

      case 'dropdown':
        return (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => updateField(fieldConfig.id, e.target.value)}
              className="input-primary appearance-none cursor-pointer pr-10"
              required={fieldConfig.required}
            >
              <option value="">Select {fieldConfig.label}</option>
              {(fieldConfig.options || []).map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4 pointer-events-none" />
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-100 border border-dark-300 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-dark-300">
          <h2 className="text-heading-2">
            {candidate?.id === 0 ? `Add ${settings.entityNameSingular}` : `Edit ${settings.entityNameSingular}`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-primary hover:bg-dark-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-body text-primary mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-primary"
              required
            />
          </div>

          {/* Dynamic Fields */}
          {settings.fields.map((fieldConfig) => (
            <div key={fieldConfig.id}>
              {fieldConfig.type !== 'boolean' && (
                <label className="block text-body text-primary mb-2">
                  {fieldConfig.label}
                  {fieldConfig.required && <span className="text-error-500 ml-1">*</span>}
                </label>
              )}
              {renderField(fieldConfig)}
            </div>
          ))}

          {/* Notes */}
          <div>
            <label className="block text-body text-primary mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={`Add any notes about this ${settings.entityNameSingular.toLowerCase()}...`}
              rows={3}
              className="input-primary resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="button-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary flex-1 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
