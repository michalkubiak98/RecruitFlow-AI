import { ChevronDown, AlertCircle } from 'lucide-react';
import { FieldConfig } from '../../types/settings';

interface FieldEditorProps {
  field: FieldConfig;
  onChange: (field: FieldConfig) => void;
  errors?: {
    id?: string;
    label?: string;
    options?: string;
  };
}

export function FieldEditor({ field, onChange, errors = {} }: FieldEditorProps) {
  const updateField = (updates: Partial<FieldConfig>) => {
    onChange({ ...field, ...updates });
  };

  const handleIdChange = (value: string) => {
    // Don't transform while typing, just store the raw value
    const cleanId = value.toLowerCase().replace(/[^a-z0-9_\s]/g, '').replace(/\s+/g, '_');
    updateField({ id: cleanId });
  };

  const updateOptions = (optionsText: string) => {
    const options = optionsText.split(',').map(opt => opt.trim()).filter(opt => opt);
    updateField({ options });
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'boolean': return '☑️';
      case 'dropdown': return '📋';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Field ID */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Field ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={field.id}
            onChange={(e) => handleIdChange(e.target.value)}
            className={`w-full px-3 py-2 bg-dark-200 text-white rounded-lg border ${
              errors.id ? 'border-red-500' : 'border-dark-300'
            } focus:border-blue-500 focus:outline-none transition-colors font-mono text-sm`}
            placeholder="e.g., location, salary, department"
          />
          {errors.id && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.id}
            </p>
          )}
          <p className="text-gray-500 text-xs mt-1">Used internally - lowercase, no spaces</p>
        </div>

        {/* Field Label */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Display Label <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => updateField({ label: e.target.value })}
            className={`w-full px-3 py-2 bg-dark-200 text-white rounded-lg border ${
              errors.label ? 'border-red-500' : 'border-dark-300'
            } focus:border-blue-500 focus:outline-none transition-colors`}
            placeholder="e.g., Location, Salary, Department"
          />
          {errors.label && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.label}
            </p>
          )}
          <p className="text-gray-500 text-xs mt-1">Shown to users in forms and tables</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Field Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Field Type <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <select
              value={field.type}
              onChange={(e) => updateField({ type: e.target.value as FieldConfig['type'] })}
              className="w-full px-3 py-2 pr-10 bg-dark-200 text-white rounded-lg border border-dark-300 
                       focus:border-blue-500 focus:outline-none appearance-none cursor-pointer transition-colors"
            >
              <option value="text">{getFieldTypeIcon('text')} Text</option>
              <option value="boolean">{getFieldTypeIcon('boolean')} Yes/No</option>
              <option value="dropdown">{getFieldTypeIcon('dropdown')} Dropdown</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
          <p className="text-gray-500 text-xs mt-1">
            {field.type === 'text' && 'Free text input'}
            {field.type === 'boolean' && 'Checkbox (true/false)'}
            {field.type === 'dropdown' && 'Select from predefined options'}
          </p>
        </div>

        {/* Required Checkbox */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 p-3 bg-dark-200 rounded-lg border border-dark-300">
            <input
              type="checkbox"
              id={`required-${field.id}`}
              checked={field.required}
              onChange={(e) => updateField({ required: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-dark-100 border-dark-300 rounded 
                       focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor={`required-${field.id}`} className="text-sm text-gray-300 flex-1">
              Required field
            </label>
          </div>
        </div>
      </div>

      {/* Placeholder */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Placeholder Text
        </label>
        <input
          type="text"
          value={field.placeholder || ''}
          onChange={(e) => updateField({ placeholder: e.target.value })}
          className="w-full px-3 py-2 bg-dark-200 text-white rounded-lg border border-dark-300 
                   focus:border-blue-500 focus:outline-none transition-colors"
          placeholder="e.g., Enter location, Select department, etc."
        />
        <p className="text-gray-500 text-xs mt-1">Help text shown in empty form fields</p>
      </div>

      {/* Options for dropdown */}
      {field.type === 'dropdown' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Dropdown Options <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={field.options?.join(', ') || ''}
            onChange={(e) => updateOptions(e.target.value)}
            className={`w-full px-3 py-2 bg-dark-200 text-white rounded-lg border ${
              errors.options ? 'border-red-500' : 'border-dark-300'
            } focus:border-blue-500 focus:outline-none transition-colors`}
            placeholder="life science, food science, technology, healthcare"
          />
          {errors.options && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.options}
            </p>
          )}
          <p className="text-gray-500 text-xs mt-1">Separate options with commas</p>
          
          {field.options && field.options.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {field.options.map((option, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs border border-blue-500/30"
                >
                  {option}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Description for AI */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          AI Description
        </label>
        <input
          type="text"
          value={field.description || ''}
          onChange={(e) => updateField({ description: e.target.value })}
          className="w-full px-3 py-2 bg-dark-200 text-white rounded-lg border border-dark-300 
                   focus:border-blue-500 focus:outline-none transition-colors"
          placeholder="Help the AI understand this field better"
        />
        <p className="text-gray-500 text-xs mt-1">Optional: Additional context for AI processing</p>
      </div>
    </div>
  );
}
