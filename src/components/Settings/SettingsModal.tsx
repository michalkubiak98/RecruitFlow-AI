import { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Plus, Trash2, Settings, Users, Tag, AlertCircle, Key, BookOpen, Palette } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'general' | 'fields' | 'api' | 'theme'>('general');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(currentSettings);
    setErrors({});
  }, [currentSettings]);

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

    // API key validation
    if (!formData.openaiApiKey.trim()) {
      newErrors.openaiApiKey = 'OpenAI API key is required for AI features';
    } else if (!formData.openaiApiKey.startsWith('sk-')) {
      newErrors.openaiApiKey = 'API key should start with "sk-"';
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
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose(); // Close modal after successful save
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
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
  };

  const removeField = (index: number) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      fields: newFields
    });
  };

  const resetOnboarding = () => {
    setFormData({
      ...formData,
      hasCompletedOnboarding: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-100 border border-dark-300 rounded-lg w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-heading-2">Settings</h2>
              <p className="text-caption-subtle">Configure your application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 text-muted hover:text-primary hover:bg-dark-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-dark-300">
          {[
            { id: 'general', icon: Users, label: 'General' },
            { id: 'fields', icon: Tag, label: `Fields (${formData.fields.length})` },
            { id: 'api', icon: Key, label: 'API Setup' },
            { id: 'theme', icon: Palette, label: 'Theme' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              disabled={isSaving}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors disabled:opacity-50 ${
                activeTab === id
                  ? 'text-primary-500 border-b-2 border-primary-500 bg-dark-200'
                  : 'text-muted hover:text-primary hover:bg-dark-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 p-6 space-y-8">
              {activeTab === 'general' && (
                <div className="space-y-8">
                  {/* App Identity */}
                  <div className="space-y-6">
                    <h3 className="text-heading-3">App Identity</h3>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-body text-primary mb-2">
                          Application Name
                        </label>
                        <input
                          type="text"
                          value={formData.appName}
                          onChange={(e) => setFormData({...formData, appName: e.target.value})}
                          className={`input-primary ${errors.appName ? 'border-error-500' : ''}`}
                          placeholder="e.g., Rolodex.ai, ContactPro, TeamHub"
                          disabled={isSaving}
                        />
                        {errors.appName && (
                          <p className="text-error-500 text-caption mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.appName}
                          </p>
                        )}
                        <p className="text-caption-subtle mt-1">The name displayed in your app header and window title</p>
                      </div>
                    </div>
                  </div>

                  {/* Entity Configuration */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-heading-3">What Are You Managing?</h3>
                      <p className="text-body-muted mt-1">Define what type of records you'll be working with</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-body text-primary mb-2">
                          Multiple Records (Plural)
                        </label>
                        <input
                          type="text"
                          value={formData.entityName}
                          onChange={(e) => setFormData({...formData, entityName: e.target.value})}
                          className={`input-primary ${errors.entityName ? 'border-error-500' : ''}`}
                          placeholder="e.g., Candidates, Contacts, Clients"
                          disabled={isSaving}
                        />
                        {errors.entityName && (
                          <p className="text-error-500 text-caption mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.entityName}
                          </p>
                        )}
                        <p className="text-caption-subtle mt-1">Used for table headers, "All Candidates"</p>
                      </div>

                      <div>
                        <label className="block text-body text-primary mb-2">
                          Single Record (Singular)
                        </label>
                        <input
                          type="text"
                          value={formData.entityNameSingular}
                          onChange={(e) => setFormData({...formData, entityNameSingular: e.target.value})}
                          className={`input-primary ${errors.entityNameSingular ? 'border-error-500' : ''}`}
                          placeholder="e.g., Candidate, Contact, Client"
                          disabled={isSaving}
                        />
                        {errors.entityNameSingular && (
                          <p className="text-error-500 text-caption mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.entityNameSingular}
                          </p>
                        )}
                        <p className="text-caption-subtle mt-1">Used for buttons, "Add Candidate"</p>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-6">
                    <h4 className="text-body-lg text-primary-500 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      Preview
                    </h4>
                    <div className="space-y-2 text-body text-primary">
                      <p>"<strong>{formData.appName || 'Your App'}</strong>" will manage <strong>{formData.entityName.toLowerCase() || 'your records'}</strong></p>
                      <p>AI will understand: "Add a new {formData.entityNameSingular.toLowerCase() || 'record'}"</p>
                      <p>AI will understand: "Show me all {formData.entityName.toLowerCase() || 'records'} from Dublin"</p>
                      <p>Table header will show: "All {formData.entityName || 'Records'}"</p>
                    </div>
                  </div>

                  {/* Onboarding Reset */}
                  <div className="space-y-6">
                    <h3 className="text-heading-3">Tutorial & Help</h3>
                    <button
                      type="button"
                      onClick={resetOnboarding}
                      disabled={isSaving}
                      className="flex items-center gap-2 button-secondary disabled:opacity-50"
                    >
                      <BookOpen className="w-4 h-4" />
                      Reset Tutorial (Show Onboarding Again)
                    </button>
                    <p className="text-caption-subtle">This will show the full AI chat tutorial next time you open the app</p>
                  </div>
                </div>
              )}

              {activeTab === 'fields' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-heading-3">Custom Fields</h3>
                      <p className="text-body-muted mt-1">Define the data structure for your {formData.entityName.toLowerCase()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={addField}
                      disabled={isSaving}
                      className="button-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      Add Field
                    </button>
                  </div>

                  {formData.fields.length === 0 ? (
                    <div className="text-center py-12 card-primary">
                      <Tag className="w-12 h-12 text-muted mx-auto mb-4" />
                      <h4 className="text-body-lg text-primary mb-2">No custom fields yet</h4>
                      <p className="text-body-muted mb-6">Add fields to customize your data structure</p>
                      <button
                        type="button"
                        onClick={addField}
                        disabled={isSaving}
                        className="button-primary disabled:opacity-50"
                      >
                        Add Your First Field
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {formData.fields.map((field, index) => (
                        <div key={`${field.id}-${index}`} className="card-primary">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary-500 rounded-lg text-white text-sm font-medium flex items-center justify-center">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="text-body-lg text-primary">{field.label || 'Untitled Field'}</h4>
                                <p className="text-caption-subtle capitalize">{field.type} field</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeField(index)}
                              disabled={isSaving}
                              className="p-2 text-error-500 hover:text-error-400 hover:bg-error-500/10 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'api' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-heading-3">OpenAI API Configuration</h3>
                    <p className="text-body-muted mt-1">Your API key is stored locally and never shared</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-body text-primary mb-2">
                        OpenAI API Key
                      </label>
                      <input
                        type="password"
                        value={formData.openaiApiKey}
                        onChange={(e) => setFormData({...formData, openaiApiKey: e.target.value})}
                        className={`input-primary ${errors.openaiApiKey ? 'border-error-500' : ''}`}
                        placeholder="sk-..."
                        disabled={isSaving}
                      />
                      {errors.openaiApiKey && (
                        <p className="text-error-500 text-caption mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.openaiApiKey}
                        </p>
                      )}
                      <p className="text-caption-subtle mt-1">Required for AI chat functionality</p>
                    </div>

                    <div className="bg-warning-500/10 border border-warning-500/20 rounded-lg p-4">
                      <h4 className="text-body-lg text-warning-500 mb-2">Getting Your API Key</h4>
                      <ol className="text-body text-primary space-y-1 list-decimal list-inside">
                        <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">platform.openai.com/api-keys</a></li>
                        <li>Click "Create new secret key"</li>
                        <li>Copy the key (starts with "sk-")</li>
                        <li>Paste it above</li>
                        <li>Add billing information to your OpenAI account</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'theme' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-heading-3">App Theme</h3>
                    <p className="text-body-muted mt-1">Choose your preferred color scheme</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dark Corporate Theme */}
                    <div className="card-primary border-primary-500 cursor-pointer">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-body-lg text-primary">Dark Corporate</h4>
                        <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <div className="w-4 h-4 bg-dark-50 rounded border border-dark-300"></div>
                        <div className="w-4 h-4 bg-dark-200 rounded"></div>
                        <div className="w-4 h-4 bg-primary-500 rounded"></div>
                        <div className="w-4 h-4 bg-success-500 rounded"></div>
                      </div>
                      <p className="text-caption-subtle">Professional dark theme with blue accents</p>
                    </div>

                    {/* Coming Soon */}
                    <div className="card-primary opacity-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-body-lg text-primary">More Themes</h4>
                        <div className="badge badge-primary">Coming Soon</div>
                      </div>
                      <p className="text-caption-subtle">Additional themes will be added in future updates</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-dark-300">
              <button
                type="button"
                onClick={onReset}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-muted border border-dark-400 rounded-lg 
                         hover:bg-dark-300 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Default
              </button>
              <div className="flex-1"></div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="button-secondary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="button-primary flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
