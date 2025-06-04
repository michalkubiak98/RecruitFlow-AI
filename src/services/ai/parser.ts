import { openai, AI_FUNCTIONS } from './config';
import { candidateService, specService, noteService, reminderService } from '../database';
import { AIFunctionCall } from '../../types';

export async function parseNaturalLanguage(input: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant for a recruitment tracking system. 
          Parse natural language inputs about candidates and extract structured data.
          Always try to understand the intent and extract relevant information.
          For stage updates, use the notes field unless it's about spec tracking.
          If someone is marked as "never use again" or similar, set status to "blacklisted".`
        },
        {
          role: "user",
          content: input
        }
      ],
      functions: AI_FUNCTIONS,
      function_call: "auto"
    });

    const message = completion.choices[0].message;
    
    if (message.function_call) {
      const functionCall: AIFunctionCall = {
        function: message.function_call.name,
        arguments: JSON.parse(message.function_call.arguments)
      };

      return await executeFunctionCall(functionCall);
    }

    return {
      success: false,
      message: "No action could be determined from your input."
    };
  } catch (error) {
    console.error('AI Parser Error:', error);
    return {
      success: false,
      message: "Failed to process your request. Please try again."
    };
  }
}

async function executeFunctionCall(call: AIFunctionCall): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    switch (call.function) {
      case 'update_candidate': {
        const { name, ...updateData } = call.arguments;
        
        // Check if candidate exists
        let candidate = await candidateService.findByName(name);
        
        if (candidate) {
          // Update existing candidate
          const updated = await candidateService.update(candidate.id, updateData);
          
          // Add note if stage was mentioned
          if (call.arguments.stage) {
            await noteService.create(
              updated.id, 
              `Stage updated to: ${call.arguments.stage}`
            );
          }
          
          // Add any additional notes
          if (call.arguments.notes) {
            await noteService.create(updated.id, call.arguments.notes);
          }
          
          return {
            success: true,
            message: `Updated ${name}'s information`,
            data: updated
          };
        } else {
          // Create new candidate
          const created = await candidateService.create({ name, ...updateData });
          
          // Add initial note if provided
          if (call.arguments.notes || call.arguments.stage) {
            const noteContent = call.arguments.notes || 
              `Initial stage: ${call.arguments.stage}`;
            await noteService.create(created.id, noteContent);
          }
          
          return {
            success: true,
            message: `Added ${name} to candidates`,
            data: created
          };
        }
      }

      case 'update_spec_tracking': {
        const { candidate_name, company, role, ...specData } = call.arguments;
        
        const candidate = await candidateService.findByName(candidate_name);
        if (!candidate) {
          return {
            success: false,
            message: `Candidate ${candidate_name} not found`
          };
        }

        const spec = await specService.create({
          candidateId: candidate.id,
          company,
          role,
          ...specData
        });

        // Auto-create reminder for follow-up
        await reminderService.create({
          candidateId: candidate.id,
          specTrackingId: spec.id,
          message: `Follow up on ${role} at ${company}`,
          daysFromNow: 2
        });

        return {
          success: true,
          message: `Tracked ${role} at ${company} for ${candidate_name}`,
          data: spec
        };
      }

      case 'set_reminder': {
        const { candidate_name, message, days_from_now } = call.arguments;
        
        const candidate = await candidateService.findByName(candidate_name);
        if (!candidate) {
          return {
            success: false,
            message: `Candidate ${candidate_name} not found`
          };
        }

        const reminder = await reminderService.create({
          candidateId: candidate.id,
          message,
          daysFromNow: days_from_now
        });

        return {
          success: true,
          message: `Reminder set for ${days_from_now} days from now`,
          data: reminder
        };
      }

      case 'add_note': {
        const { candidate_name, note_content } = call.arguments;
        
        const candidate = await candidateService.findByName(candidate_name);
        if (!candidate) {
          return {
            success: false,
            message: `Candidate ${candidate_name} not found`
          };
        }

        const note = await noteService.create(candidate.id, note_content);

        return {
          success: true,
          message: `Note added for ${candidate_name}`,
          data: note
        };
      }

      default:
        return {
          success: false,
          message: "Unknown function call"
        };
    }
  } catch (error) {
    console.error('Function execution error:', error);
    return {
      success: false,
      message: "Failed to execute the action"
    };
  }
}
