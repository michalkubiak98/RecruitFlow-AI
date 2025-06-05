export interface FieldConfig {
  id: string;
  label: string;
  type: 'text' | 'boolean' | 'dropdown';
  required: boolean;
  options?: string[]; // For dropdown fields
  description?: string;
  placeholder?: string;
}

export interface AppSettings {
  fields: FieldConfig[];
  appName: string;
  entityName: string; // "Candidates", "Contacts", "People"
  entityNameSingular: string; // "Candidate", "Contact", "Person"
  openaiApiKey: string; // User's own API key
  hasCompletedOnboarding: boolean; // Track if user has seen tutorial
}

export const DEFAULT_RECRUITMENT_TEMPLATE: AppSettings = {
  appName: "Rolodex.ai",
  entityName: "Candidates", 
  entityNameSingular: "Candidate",
  openaiApiKey: "",
  hasCompletedOnboarding: false,
  fields: [
    {
      id: 'location',
      label: 'Location',
      type: 'text',
      required: true,
      placeholder: 'e.g., Dublin, Cork, Remote'
    },
    {
      id: 'salary',
      label: 'Salary Expectation', 
      type: 'text',
      required: false,
      placeholder: 'e.g., 50k, 60-70k'
    },
    {
      id: 'role',
      label: 'Role/Position',
      type: 'text', 
      required: true,
      placeholder: 'e.g., Developer, QA Specialist'
    },
    {
      id: 'industry',
      label: 'Industry',
      type: 'dropdown',
      required: false,
      options: ['life science', 'food science', 'technology', 'healthcare']
    },
    {
      id: 'can_drive',
      label: 'Can Drive',
      type: 'boolean',
      required: false
    }
  ]
};
