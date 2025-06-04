import OpenAI from 'openai';
import { AppSettings } from '../../types/settings';

if (!import.meta.env.VITE_OPENAI_API_KEY) {
  throw new Error('VITE_OPENAI_API_KEY is required');
}

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateAITools = (settings: AppSettings) => [
  {
    type: "function" as const,
    function: {
      name: "manage_candidate",
      description: `Create, update, or delete ${settings.entityName.toLowerCase()}. Handle all the configured fields dynamically.`,
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["create", "update", "delete", "bulk_create"],
            description: "The action to perform"
          },
          candidate: {
            type: "object",
            properties: {
              name: { type: "string", description: "Person's name" },
              fields: {
                type: "object",
                description: "Dynamic fields based on current configuration",
                properties: settings.fields.reduce((acc, field) => {
                  acc[field.id] = {
                    type: field.type === 'boolean' ? 'boolean' : 'string',
                    description: field.description || field.label,
                    ...(field.type === 'dropdown' && field.options ? { enum: field.options } : {})
                  };
                  return acc;
                }, {} as Record<string, any>)
              },
              notes: { 
                type: "string", 
                description: "Additional notes. ONLY include if user provides meaningful notes. NEVER set to 'no notes', 'none', or similar - leave empty instead." 
              }
            }
          },
          candidates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                fields: {
                  type: "object",
                  properties: settings.fields.reduce((acc, field) => {
                    acc[field.id] = {
                      type: field.type === 'boolean' ? 'boolean' : 'string',
                      description: field.description || field.label
                    };
                    return acc;
                  }, {} as Record<string, any>)
                },
                notes: { 
                  type: "string", 
                  description: "Additional notes. ONLY include if meaningful notes provided." 
                }
              }
            },
            description: `Array of ${settings.entityName.toLowerCase()} for bulk operations`
          }
        },
        required: ["action"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "search_candidates",
      description: `Search and filter ${settings.entityName.toLowerCase()} based on natural language queries.`,
      parameters: {
        type: "object",
        properties: {
          searchType: {
            type: "string",
            enum: ["specific", "filter"],
            description: "Whether searching for a specific person or filtering by criteria"
          },
          name: {
            type: "string",
            description: "Specific person name to find"
          },
          criteria: {
            type: "object",
            properties: settings.fields.reduce((acc, field) => {
              if (field.type === 'text') {
                acc[field.id] = { 
                  type: "string", 
                  description: `Filter by ${field.label}. For multiple values use "value1 and value2" format.` 
                };
              } else if (field.type === 'boolean') {
                acc[field.id] = { type: "boolean", description: `Filter by ${field.label}` };
              } else if (field.type === 'dropdown' && field.options) {
                acc[field.id] = { 
                  type: "string", 
                  enum: field.options, 
                  description: `Filter by ${field.label}. For multiple values use "value1 and value2" format.` 
                };
              }
              return acc;
            }, {} as Record<string, any>),
            description: `Search criteria for filtering ${settings.entityName.toLowerCase()}`
          }
        },
        required: ["searchType"]
      }
    }
  }
];

export const generateSystemPrompt = (settings: AppSettings) => `
You are a ${settings.entityName.toLowerCase()} management assistant for ${settings.appName}.

FIELD CONFIGURATION:
${settings.fields.map(field => {
  let typeDesc: string = field.type;
  if (field.type === 'dropdown' && field.options) {
    typeDesc = `dropdown with options: ${field.options.join(', ')}`;
  }
  return `- ${field.label} (${field.id}): ${typeDesc}${field.required ? ' [REQUIRED]' : ''}${field.description ? ` - ${field.description}` : ''}`;
}).join('\n')}

ACTIONS:
- CREATE: "add", "create", "new ${settings.entityNameSingular.toLowerCase()}", "hire"
- UPDATE: "update", "change", "modify", "set", "edit"  
- DELETE: "remove", "delete", "fire", "eliminate"
- SEARCH: "show me", "find", "search", "who is", "${settings.entityName.toLowerCase()} from", "looking for"

NOTES HANDLING RULES:
- ONLY add notes if the user provides meaningful, specific information
- NEVER set notes to "no notes", "none", "n/a", or similar placeholder text
- If user says "no notes" or "skip notes", do NOT include the notes field at all
- Empty notes field is better than placeholder text
- Examples of meaningful notes: "Excellent Python skills", "Available immediately", "Relocating from US"
- Examples to IGNORE: "no notes", "none", "nothing to add", "skip", "n/a"

MULTIPLE VALUE SEARCH RULES:
- For location searches like "from Cork and Dublin", use: location: "cork and dublin"
- For dropdown searches like "life science and food science", use: industry: "life science and food science"  
- For text fields with multiple values, use "value1 and value2" format
- Examples:
  * "Show people from Cork and Dublin" → criteria: {location: "cork and dublin"}
  * "Find life science and food science candidates" → criteria: {industry: "life science and food science"}

NAME MATCHING RULES:
- For deletion, be VERY specific about names
- If user says "Remove John" and there's both "John" and "John Smith", ask for clarification
- Match the EXACT name preference when specified

SEARCH EXAMPLES:
- "Show me John Smith" → searchType: "specific", name: "John Smith"
- "Find ${settings.entityName.toLowerCase()} from Dublin" → searchType: "filter", criteria: {location: "Dublin"}
- "Show people from Cork and Dublin" → searchType: "filter", criteria: {location: "cork and dublin"}

FIELD PARSING:
${settings.fields.map(field => {
  if (field.type === 'dropdown' && field.options) {
    return `- ${field.label}: Must be one of: ${field.options.join(', ')} OR multiple values like "value1 and value2"`;
  } else if (field.type === 'boolean') {
    return `- ${field.label}: Parse from words like "yes/no", "true/false", "can/cannot"`;
  }
  return `- ${field.label}: Extract text value OR multiple values like "value1 and value2"`;
}).join('\n')}

For SEARCH queries, use search_candidates function.
For management (add/update/delete), use manage_candidate function.
`;
