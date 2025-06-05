import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [localField, setLocalField] = useState<FieldConfig>(field);
  const idInputRef = useRef<HTMLInputElement>(null);

  // Sync with prop changes but preserve focus and cursor position
  useEffect(() => {
    const currentElement = document.activeElement;
    const wasFocused = currentElement === idInputRef.current;
    const cursorPosition = wasFocused ? (currentElement as HTMLInputElement)?.selectionStart : null;
    
    setLocalField(field);
    
    // Restore focus and cursor position if needed
    if (wasFocused && idInputRef.current && cursorPosition !== null) {
      requestAnimationFrame(() => {
        idInputRef.current?.focus();
        idInputRef.current?.setSelectionRange(cursorPosition, cursorPosition);
      });
    }
  }, [field.label, field.type, field.required, field.options, field.description, field.placeholder]);

  // Debounced onChange to prevent excessive calls
  const debouncedOnChange = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (updatedField: FieldConfig) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onChange(updatedField);
        }, 150); // Reduced debounce time for better responsiveness
      };
    })(),
    [onChange]
  );

  const updateField = (updates: Partial<FieldConfig>) => {
    const updatedField = { ...localField, ...updates };
    setLocalField(updatedField);
    debouncedOnChange(updatedField);
  };

  const handleIdChange = (value: string) => {
    const cleanId = value.toLowerCase().replace(/[^a-z0-9_\s]/g, '').replace(/\s+/g, '_');
    updateField({ id: cleanId });
  };

  const updateOptions = (optionsText: string) => {
    const options = optionsText.split(',').map(opt => opt.trim()).filter(opt => opt);
    updateField({ options });
  };

  const getFieldTypeDescription = (type: string) => {
    switch (type) {
      case 'text': return 'Free text input field';
      case 'boolean': return 'Yes/No checkbox field - AI will understand "yes/no", "can/cannot", etc.';
      case 'dropdown': return 'Select from predefined options - AI will match values intelligently';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Field ID */}
        <div>
          <label className="block text-body text-primary mb-2">
            Field ID <span className="text-error-500">*</span>
          </label>
          <input
            ref={idInputRef}
            type="text"
            value={localField.id}
            onChange={(e) => handleIdChange(e.target.value)}
            className={`input-primary font-mono text-sm ${errors.id ? 'border-error-500' : ''}`}
            placeholder="e.g., location, salary, department"
          />
          {errors.id && (
            <p className="text-error-500 text-caption mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.id}
            </p>
          )}
          <p className="text-caption-subtle mt-1">Used internally - lowercase, no spaces</p>
        </div>

        {/* Field Label */}
        <div>
          <label className="block text-body text-primary mb-2">
            Display Label <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            value={localField.label}
            onChange={(e) => updateField({ label: e.target.value })}
            className={`input-primary ${errors.label ? 'border-error-500' : ''}`}
            placeholder="e.g., Location, Salary, Department"
          />
          {errors.label && (
            <p className="text-error-500 text-caption mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.label}
            </p>
          )}
          <p className="text-caption-subtle mt-1">Shown to users in forms and tables</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Field Type */}
        <div>
          <label className="block text-body text-primary mb-2">
            Field Type <span className="text-error-500">*</span>
          </label>
          <div className="relative">
            <select
              value={localField.type}
              onChange={(e) => updateField({ type: e.target.value as FieldConfig['type'] })}
              className="input-primary appearance-none cursor-pointer pr-10"
            >
              <option value="text">📝 Text</option>
              <option value="boolean">☑️ Yes/No</option>
              <option value="dropdown">📋 Dropdown</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4 pointer-events-none" />
          </div>
          <p className="text-caption-subtle mt-1">{getFieldTypeDescription(localField.type)}</p>
        </div>

        {/* Required Toggle */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 p-4 bg-dark-200 border border-dark-400 rounded-lg">
            <input
              type="checkbox"
              id={`required-${localField.id}`}
              checked={localField.required}
              onChange={(e) => updateField({ required: e.target.checked })}
              className="w-4 h-4 text-primary-500 bg-dark-100 border-dark-300 rounded 
                       focus:ring-primary-500 focus:ring-2"
            />
            <label htmlFor={`required-${localField.id}`} className="text-body text-primary flex-1">
              Required field
            </label>
          </div>
          <p className="text-caption-subtle mt-1">AI will ask for missing required fields</p>
        </div>
      </div>

      {/* Placeholder */}
      <div>
        <label className="block text-body text-primary mb-2">
          Placeholder Text
        </label>
        <input
          type="text"
          value={localField.placeholder || ''}
          onChange={(e) => updateField({ placeholder: e.target.value })}
          className="input-primary"
          placeholder="e.g., Enter location, Select department, etc."
        />
        <p className="text-caption-subtle mt-1">Help text shown in empty form fields</p>
      </div>

      {/* Options for dropdown */}
      {localField.type === 'dropdown' && (
        <div>
          <label className="block text-body text-primary mb-2">
            Dropdown Options <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            value={localField.options?.join(', ') || ''}
            onChange={(e) => updateOptions(e.target.value)}
            className={`input-primary ${errors.options ? 'border-error-500' : ''}`}
            placeholder="life science, food science, technology, healthcare"
          />
          {errors.options && (
            <p className="text-error-500 text-caption mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.options}
            </p>
          )}
          <p className="text-caption-subtle mt-1">Separate options with commas. AI will match intelligently.</p>
          
          {localField.options && localField.options.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {localField.options.map((option, index) => (
                <span
                  key={index}
                  className="badge badge-primary"
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
        <label className="block text-body text-primary mb-2">
          AI Description
        </label>
        <input
          type="text"
          value={localField.description || ''}
          onChange={(e) => updateField({ description: e.target.value })}
          className="input-primary"
          placeholder="Help the AI understand this field better"
        />
        <p className="text-caption-subtle mt-1">Optional: Additional context for AI processing</p>
      </div>
    </div>
  );
}
