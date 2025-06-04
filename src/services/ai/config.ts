import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const AI_FUNCTIONS = [
  {
    name: "update_candidate",
    description: "Update or create a candidate record from natural language",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Candidate's name" },
        location: { type: "string", description: "Candidate's location" },
        salary: { type: "string", description: "Salary expectation" },
        roles: { type: "string", description: "Roles they're interested in" },
        drives: { type: "boolean", description: "Whether they can drive" },
        stage: { type: "string", description: "Interview stage if mentioned" },
        notes: { type: "string", description: "Any additional notes" },
        status: { 
          type: "string", 
          enum: ["active", "blacklisted", "never_use_again"],
          description: "Candidate status"
        }
      },
      required: ["name"]
    }
  },
  {
    name: "update_spec_tracking",
    description: "Track job spec sent to candidate",
    parameters: {
      type: "object",
      properties: {
        candidate_name: { type: "string", description: "Candidate's name" },
        company: { type: "string", description: "Company name" },
        role: { type: "string", description: "Job role" },
        status: { 
          type: "string", 
          enum: ["reviewing", "wants_to_apply", "cv_sent", "interview_scheduled"],
          description: "Current status"
        },
        interview_date: { type: "string", description: "Interview date if scheduled" },
        interview_notes: { type: "string", description: "Interview notes" }
      },
      required: ["candidate_name", "company", "role"]
    }
  },
  {
    name: "set_reminder",
    description: "Set a reminder for follow-up",
    parameters: {
      type: "object",
      properties: {
        candidate_name: { type: "string", description: "Candidate's name" },
        message: { type: "string", description: "Reminder message" },
        days_from_now: { type: "number", description: "Days until reminder" }
      },
      required: ["candidate_name", "days_from_now"]
    }
  },
  {
    name: "add_note",
    description: "Add a note to a candidate",
    parameters: {
      type: "object",
      properties: {
        candidate_name: { type: "string", description: "Candidate's name" },
        note_content: { type: "string", description: "Content of the note" }
      },
      required: ["candidate_name", "note_content"]
    }
  }
];
