import OpenAI from 'openai';

if (!import.meta.env.VITE_OPENAI_API_KEY) {
  throw new Error('VITE_OPENAI_API_KEY is required');
}

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const AI_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "manage_candidate",
      description: "Create, update, or delete candidates. IMPORTANT: Distinguish between ROLE (job position they want) and INDUSTRY (sector: life science OR food science).",
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
              name: { type: "string", description: "Candidate name" },
              location: { type: "string", description: "Location/city" },
              salary: { type: "string", description: "Salary expectation" },
              roles: { type: "string", description: "Job position/role they want (e.g., developer, QA, marketing)" },
              industry: { 
                type: "string", 
                enum: ["life science", "food science", ""],
                description: "Industry sector they work in - ONLY 'life science' or 'food science'" 
              },
              drives: { type: "boolean", description: "Can drive a car" },
              notes: { type: "string", description: "Additional notes about the candidate" }
            }
          },
          candidates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                location: { type: "string" },
                salary: { type: "string" },
                roles: { type: "string" },
                industry: { type: "string", enum: ["life science", "food science", ""] },
                drives: { type: "boolean" },
                notes: { type: "string" }
              }
            },
            description: "Array of candidates for bulk operations"
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
      description: "Search and filter candidates based on natural language queries. Can find specific candidates by name or filter by criteria.",
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
            description: "Specific candidate name to find"
          },
          criteria: {
            type: "object",
            properties: {
              location: { type: "string", description: "Location to filter by (can be partial, e.g., 'Dublin area')" },
              salaryMin: { type: "number", description: "Minimum salary in thousands" },
              salaryMax: { type: "number", description: "Maximum salary in thousands" },
              industry: { type: "string", enum: ["life science", "food science"], description: "Industry to filter by" },
              role: { type: "string", description: "Role/position to filter by" },
              drives: { type: "boolean", description: "Whether candidate can drive" },
              notes: { type: "string", description: "Search in notes field" }
            },
            description: "Search criteria for filtering candidates"
          }
        },
        required: ["searchType"]
      }
    }
  }
];
