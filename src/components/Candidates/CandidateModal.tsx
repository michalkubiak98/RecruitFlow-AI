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
            className="w-full px-3 py-2 bg-dark-100 text-white rounded-lg border border-dark-300 
                     focus:border-blue-500 focus:outline-none placeholder-gray-500"
            required={fieldConfig.required}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={fieldConfig.id}
              checked={Boolean(value)}
              onChange={(e) => updateField(fieldConfig.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-dark-100 border-dark-300 rounded 
                       focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor={fieldConfig.id} className="text-sm text-gray-300">
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
              className="w-full px-3 py-2 pr-10 bg-dark-100 text-white rounded-lg border border-dark-300 
                       focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
              required={fieldConfig.required}
            >
              <option value="">Select {fieldConfig.label}</option>
              {(fieldConfig.options || []).map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-200 rounded-lg border border-dark-300 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-dark-300">
          <h2 className="text-xl font-semibold text-white">
            {candidate?.id === 0 ? `Add ${settings.entityNameSingular}` : `Edit ${settings.entityNameSingular}`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-dark-100 text-white rounded-lg border border-dark-300 
                       focus:border-blue-500 focus:outline-none placeholder-gray-500"
              required
            />
          </div>

          {/* Dynamic Fields */}
          {settings.fields.map((fieldConfig) => (
            <div key={fieldConfig.id}>
              {fieldConfig.type !== 'boolean' && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {fieldConfig.label}
                  {fieldConfig.required && <span className="text-red-400 ml-1">*</span>}
                </label>
              )}
              {renderField(fieldConfig)}
            </div>
          ))}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={`Add any notes about this ${settings.entityNameSingular.toLowerCase()}...`}
              rows={3}
              className="w-full px-3 py-2 bg-dark-100 text-white rounded-lg border border-dark-300 
                       focus:border-blue-500 focus:outline-none resize-none placeholder-gray-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-300 border border-dark-300 rounded-lg 
                       hover:bg-dark-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       flex items-center justify-center gap-2"
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
