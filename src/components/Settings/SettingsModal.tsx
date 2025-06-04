import { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Plus, Trash2, Settings, Users, Tag, AlertCircle, Check, AlertTriangle } from 'lucide-react';
import { AppSettings, FieldConfig } from '../../types/settings';
import { FieldEditor } from './FieldEditor';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onReset: () => void;
}

export function SettingsModal({ isOpen, onClose, currentSettings, onSave, onReset }: SettingsModalProps) {
  const [formData, setFormData] = useState<AppSettings>(currentSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'fields'>('general');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(currentSettings);
    setErrors({});
    setWarnings({});
  }, [currentSettings]);

  const detectOverlaps = () => {
    const newWarnings: Record<string, string> = {};
    const dropdownFields = formData.fields.filter(f => f.type === 'dropdown' && f.options);
    
    // Check for overlapping options between dropdown fields
    for (let i = 0; i < dropdownFields.length; i++) {
      for (let j = i + 1; j < dropdownFields.length; j++) {
        const field1 = dropdownFields[i];
        const field2 = dropdownFields[j];
        
        const options1 = (field1.options || []).map(opt => opt.toLowerCase().trim());
        const options2 = (field2.options || []).map(opt => opt.toLowerCase().trim());
        
        const overlaps = options1.filter(opt => options2.includes(opt));
        
        if (overlaps.length > 0) {
          const overlapText = overlaps.map(opt => `"${opt}"`).join(', ');
          newWarnings[`overlap-${field1.id}-${field2.id}`] = 
            `⚠️ "${field1.label}" and "${field2.label}" both have: ${overlapText}. This may confuse the AI!`;
        }
      }
    }
    
    setWarnings(newWarnings);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // General validation
    if (!formData.appName.trim()) {
      newErrors.appName = 'App name is required';
    }
    if (!formData.entityName.trim()) {
      newErrors.entityName = 'Entity name (plural) is required';
    }
    if (!formData.entityNameSingular.trim()) {
      newErrors.entityNameSingular = 'Entity name (singular) is required';
    }

    // Field validation
    formData.fields.forEach((field, index) => {
      if (!field.id.trim()) {
        newErrors[`field-${index}-id`] = 'Field ID is required';
      } else if (!/^[a-z0-9_]+$/.test(field.id)) {
        newErrors[`field-${index}-id`] = 'Field ID must contain only lowercase letters, numbers, and underscores';
      }
      
      if (!field.label.trim()) {
        newErrors[`field-${index}-label`] = 'Field label is required';
      }

      if (field.type === 'dropdown' && (!field.options || field.options.length === 0)) {
        newErrors[`field-${index}-options`] = 'Dropdown fields must have at least one option';
      }
    });

    // Check for duplicate field IDs
    const fieldIds = formData.fields.map(f => f.id);
    const duplicates = fieldIds.filter((id, index) => fieldIds.indexOf(id) !== index);
    duplicates.forEach(id => {
      const index = fieldIds.indexOf(id);
      newErrors[`field-${index}-id`] = 'Field ID must be unique';
    });

    setErrors(newErrors);
    
    // Check for overlaps (warnings, not errors)
    detectOverlaps();
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const addField = () => {
    const newField: FieldConfig = {
      id: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
      placeholder: ''
    };
    
    setFormData({
      ...formData,
      fields: [...formData.fields, newField]
    });
    setActiveTab('fields');
  };

  const updateField = (index: number, field: FieldConfig) => {
    const newFields = [...formData.fields];
    newFields[index] = field;
    setFormData({
      ...formData,
      fields: newFields
    });
    
    // Clear related errors
    const newErrors = { ...errors };
    delete newErrors[`field-${index}-id`];
    delete newErrors[`field-${index}-label`];
    delete newErrors[`field-${index}-options`];
    setErrors(newErrors);
    
    // Re-check overlaps when fields change
    setTimeout(detectOverlaps, 100);
  };

  const removeField = (index: number) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      fields: newFields
    });
    // Re-check overlaps after removal
    setTimeout(detectOverlaps, 100);
  };

  if (!isOpen) return null;

  const overlapWarnings = Object.values(warnings);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-200 rounded-xl border border-dark-300 w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-300 bg-dark-200 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Application Settings</h2>
              <p className="text-gray-400 text-sm">Configure your app and custom fields</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overlap Warnings */}
        {overlapWarnings.length > 0 && (
          <div className="p-4 bg-yellow-900/20 border-b border-yellow-500/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-yellow-300 font-medium mb-2">Field Overlap Detected</h4>
                <div className="space-y-1">
                  {overlapWarnings.map((warning, index) => (
                    <p key={index} className="text-yellow-200 text-sm">{warning}</p>
                  ))}
                </div>
                <p className="text-yellow-300 text-xs mt-2">
                  💡 Tip: Use distinct options like "Frontend Developer" vs "Engineering Dept" to help AI understand the difference.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-dark-300 bg-dark-200">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'general'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-dark-100'
                : 'text-gray-400 hover:text-white hover:bg-dark-300'
            }`}
          >
            <Users className="w-4 h-4" />
            General
          </button>
          <button
            onClick={() => setActiveTab('fields')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'fields'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-dark-100'
                : 'text-gray-400 hover:text-white hover:bg-dark-300'
            }`}
          >
            <Tag className="w-4 h-4" />
            Custom Fields ({formData.fields.length})
            {overlapWarnings.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 p-6 space-y-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="bg-dark-100 rounded-lg p-4 border border-dark-300">
                    <h3 className="text-lg font-semibold text-white mb-4">App Identity</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          App Name
                        </label>
                        <input
                          type="text"
                          value={formData.appName}
                          onChange={(e) => setFormData({...formData, appName: e.target.value})}
                          className={`w-full px-3 py-2 bg-dark-200 text-white rounded-lg border ${
                            errors.appName ? 'border-red-500' : 'border-dark-300'
                          } focus:border-blue-500 focus:outline-none transition-colors`}
                          placeholder="e.g., Rolodex.ai"
                        />
                        {errors.appName && (
                          <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.appName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category Label
                        </label>
                        <input
                          type="text"
                          value={formData.industryLabel}
                          onChange={(e) => setFormData({...formData, industryLabel: e.target.value})}
                          placeholder="e.g., Industry, Department, Category"
                          className="w-full px-3 py-2 bg-dark-200 text-white rounded-lg border border-dark-300 
                                   focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-dark-100 rounded-lg p-4 border border-dark-300">
                    <h3 className="text-lg font-semibold text-white mb-4">Entity Names</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Entity Name (Plural)
                        </label>
                        <input
                          type="text"
                          value={formData.entityName}
                          onChange={(e) => setFormData({...formData, entityName: e.target.value})}
                          className={`w-full px-3 py-2 bg-dark-200 text-white rounded-lg border ${
                            errors.entityName ? 'border-red-500' : 'border-dark-300'
                          } focus:border-blue-500 focus:outline-none transition-colors`}
                          placeholder="e.g., Candidates, Contacts, People"
                        />
                        {errors.entityName && (
                          <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.entityName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Entity Name (Singular)
                        </label>
                        <input
                          type="text"
                          value={formData.entityNameSingular}
                          onChange={(e) => setFormData({...formData, entityNameSingular: e.target.value})}
                          className={`w-full px-3 py-2 bg-dark-200 text-white rounded-lg border ${
                            errors.entityNameSingular ? 'border-red-500' : 'border-dark-300'
                          } focus:border-blue-500 focus:outline-none transition-colors`}
                          placeholder="e.g., Candidate, Contact, Person"
                        />
                        {errors.entityNameSingular && (
                          <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.entityNameSingular}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-blue-600 rounded-full mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h4 className="text-blue-300 font-medium mb-1">Preview</h4>
                        <p className="text-blue-200 text-sm">
                          Your app will be called "<strong>{formData.appName}</strong>" and will manage 
                          <strong> {formData.entityName.toLowerCase()}</strong>. 
                          The AI will understand commands like "Add a new {formData.entityNameSingular.toLowerCase()}" 
                          and "Show me all {formData.entityName.toLowerCase()}".
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'fields' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Custom Fields</h3>
                      <p className="text-gray-400 text-sm">Define the data fields for your {formData.entityName.toLowerCase()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={addField}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                               hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Field
                    </button>
                  </div>

                  {formData.fields.length === 0 ? (
                    <div className="text-center py-12 bg-dark-100 rounded-lg border border-dark-300">
                      <Tag className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <h4 className="text-gray-300 font-medium mb-2">No custom fields yet</h4>
                      <p className="text-gray-400 text-sm mb-4">Add fields to customize your data structure</p>
                      <button
                        type="button"
                        onClick={addField}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Your First Field
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.fields.map((field, index) => (
                        <div key={field.id} className="bg-dark-100 rounded-lg border border-dark-300 overflow-hidden">
                          <div className="flex items-center justify-between p-4 bg-dark-200 border-b border-dark-300">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="text-white font-medium">{field.label || 'Untitled Field'}</h4>
                                <p className="text-gray-400 text-sm capitalize">{field.type} field</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeField(index)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-4">
                            <FieldEditor
                              field={field}
                              onChange={(updatedField) => updateField(index, updatedField)}
                              errors={{
                                id: errors[`field-${index}-id`],
                                label: errors[`field-${index}-label`],
                                options: errors[`field-${index}-options`]
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-dark-300 bg-dark-200">
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 border border-dark-300 rounded-lg 
                         hover:bg-dark-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Default
              </button>
              <div className="flex-1"></div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-300 border border-dark-300 rounded-lg 
                         hover:bg-dark-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg 
                         hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Settings
                {overlapWarnings.length > 0 && <AlertTriangle className="w-4 h-4 text-yellow-300" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
