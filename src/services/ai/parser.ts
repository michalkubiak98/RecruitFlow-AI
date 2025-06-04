import { openai, AI_TOOLS } from "./config";
import { tauriCandidateService } from "../database/tauri-commands";

export async function parseNaturalLanguage(input: string) {
  try {
    console.log('🔍 Parsing input:', input);
    console.log('🔑 API Key exists:', !!import.meta.env.VITE_OPENAI_API_KEY);

    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system", 
          content: `You are a candidate management assistant for life science and food science industries.

CRITICAL DISTINCTIONS:
- ROLE/POSITION: What job they want (developer, QA, marketing, scientist, manager, etc.)
- INDUSTRY: What sector they work in (ONLY "life science" OR "food science")

ACTIONS:
- CREATE: "add", "create", "new candidate", "hire"
- UPDATE: "update", "change", "modify", "set", "edit"  
- DELETE: "remove", "delete", "fire", "eliminate"
- SEARCH: "show me", "find", "search", "who is", "candidates from", "looking for"

NAME MATCHING RULES:
- For deletion, be VERY specific about names
- If user says "Remove Sarah" and there's both "Sarah" and "Sarah Fowler", ask for clarification
- If user says "Remove Sarah not Sarah Fowler", target only "Sarah"
- Match the EXACT name preference when specified

SEARCH EXAMPLES:
- "Show me John Smith" → searchType: "specific", name: "John Smith"
- "Find candidates from Dublin" → searchType: "filter", criteria: {location: "Dublin"}
- "Show everyone below 40k in food science" → searchType: "filter", criteria: {salaryMax: 40, industry: "food science"}

SALARY PARSING:
- "below 40k" → salaryMax: 40
- "above 50k" → salaryMin: 50
- "between 40-60k" → salaryMin: 40, salaryMax: 60

For SEARCH queries, use search_candidates function.
For management (add/update/delete), use manage_candidate function.`
        },
        { role: "user", content: input }
      ],
      tools: AI_TOOLS,
      tool_choice: "auto"
    });

    console.log('🤖 OpenAI Response:', completion);

    const message = completion.choices[0]?.message;
    if (!message?.tool_calls?.[0]) {
      return { success: false, message: "Could not understand the request. Please try rephrasing." };
    }

    const toolCall = message.tool_calls[0];
    console.log('🛠️ Function call:', toolCall);

    const functionName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);

    if (functionName === 'search_candidates') {
      return await executeSearch(args);
    } else if (functionName === 'manage_candidate') {
      return await executeManagement(args);
    }

    return { success: false, message: "Unknown function called." };

  } catch (error) {
    console.error('💥 Parse error:', error);
    return { 
      success: false, 
      message: `Failed to parse: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

async function executeSearch(args: any) {
  console.log('🔍 Executing search with args:', args);
  
  const { searchType, name, criteria } = args;
  const allCandidates = await tauriCandidateService.getAll();

  if (searchType === 'specific') {
    const found = allCandidates.filter(candidate => 
      candidate.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(candidate.name.toLowerCase())
    );

    if (found.length === 0) {
      return { success: false, message: `No candidate found with name "${name}"` };
    }

    return {
      success: true,
      message: `Found ${found.length} candidate${found.length !== 1 ? 's' : ''} matching "${name}"`,
      searchResults: found,
      searchType: 'specific'
    };
  } else {
    let filtered = [...allCandidates];

    if (criteria.location) {
      const locationLower = criteria.location.toLowerCase();
      filtered = filtered.filter(c => 
        c.location.toLowerCase().includes(locationLower) ||
        locationLower.includes(c.location.toLowerCase())
      );
    }

    if (criteria.industry) {
      filtered = filtered.filter(c => c.industry === criteria.industry);
    }

    if (criteria.role) {
      const roleLower = criteria.role.toLowerCase();
      filtered = filtered.filter(c => 
        c.roles.toLowerCase().includes(roleLower) ||
        roleLower.includes(c.roles.toLowerCase())
      );
    }

    if (criteria.salaryMin || criteria.salaryMax) {
      filtered = filtered.filter(c => {
        const salary = parseInt(c.salary.replace(/[^\d]/g, '')) || 0;
        if (criteria.salaryMin && salary < criteria.salaryMin) return false;
        if (criteria.salaryMax && salary > criteria.salaryMax) return false;
        return true;
      });
    }

    if (criteria.drives !== undefined) {
      filtered = filtered.filter(c => c.drives === criteria.drives);
    }

    if (criteria.notes) {
      const notesLower = criteria.notes.toLowerCase();
      filtered = filtered.filter(c => 
        c.notes && c.notes.toLowerCase().includes(notesLower)
      );
    }

    const criteriaText = Object.entries(criteria)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => {
        if (key === 'salaryMin') return `salary above ${value}k`;
        if (key === 'salaryMax') return `salary below ${value}k`;
        return `${key}: ${value}`;
      })
      .join(', ');

    return {
      success: true,
      message: `Found ${filtered.length} candidate${filtered.length !== 1 ? 's' : ''} matching criteria: ${criteriaText}`,
      searchResults: filtered,
      searchType: 'filter',
      criteria: criteriaText
    };
  }
}

async function executeManagement(args: any) {
  const { action, candidate, candidates } = args;

  switch (action) {
    case 'create':
      if (!candidate?.name) {
        return { success: false, message: "Candidate name is required for creation" };
      }
      console.log('👤 Creating candidate:', candidate.name);
      return await tauriCandidateService.create({
        ...candidate,
        drives: candidate.drives || false,
        industry: candidate.industry || '',
        notes: candidate.notes || ''
      });

    case 'bulk_create':
      if (!candidates || !Array.isArray(candidates)) {
        return { success: false, message: "Candidates array is required for bulk creation" };
      }
      console.log('👥 Bulk creating', candidates.length, 'candidates');
      
      const results = [];
      for (const cand of candidates) {
        if (cand.name) {
          const result = await tauriCandidateService.create({
            ...cand,
            drives: cand.drives || false,
            industry: cand.industry || '',
            notes: cand.notes || ''
          });
          results.push(result);
        }
      }
      
      const successful = results.filter(r => r.success).length;
      return { 
        success: true, 
        message: `Created ${successful} of ${candidates.length} candidates: ${candidates.map(c => c.name).join(', ')}` 
      };

    case 'update':
      if (!candidate?.name) {
        return { success: false, message: "Candidate name is required for updates" };
      }
      
      console.log('🔍 Looking for existing candidate:', candidate.name);
      const existingCandidate = await tauriCandidateService.findByName(candidate.name);
      
      if (!existingCandidate) {
        return { success: false, message: `Candidate "${candidate.name}" not found. Did you mean to create a new candidate?` };
      }

      console.log('✏️ Updating existing candidate:', existingCandidate.id);
      const updateData: any = {};
      if (candidate.location !== undefined) updateData.location = candidate.location;
      if (candidate.salary !== undefined) updateData.salary = candidate.salary;
      if (candidate.roles !== undefined) updateData.roles = candidate.roles;
      if (candidate.industry !== undefined) updateData.industry = candidate.industry;
      if (candidate.drives !== undefined) updateData.drives = candidate.drives;
      if (candidate.notes !== undefined) updateData.notes = candidate.notes;
      
      return await tauriCandidateService.update(existingCandidate.id, updateData);

    case 'delete':
      if (!candidate?.name) {
        return { success: false, message: "Candidate name is required for deletion" };
      }
      
      console.log('🔍 Looking for candidate to delete:', candidate.name);
      
      // Try to find exact match first
      const allCandidates = await tauriCandidateService.getAll();
      let candidateToDelete = allCandidates.find(c => 
        c.name.toLowerCase() === candidate.name.toLowerCase()
      );
      
      // If no exact match, find partial matches
      if (!candidateToDelete) {
        const partialMatches = allCandidates.filter(c => 
          c.name.toLowerCase().includes(candidate.name.toLowerCase()) ||
          candidate.name.toLowerCase().includes(c.name.toLowerCase())
        );
        
        if (partialMatches.length === 0) {
          return { success: false, message: `Candidate "${candidate.name}" not found.` };
        } else if (partialMatches.length > 1) {
          const names = partialMatches.map(c => c.name).join(', ');
          return { 
            success: false, 
            message: `Multiple candidates found: ${names}. Please be more specific.` 
          };
        } else {
          candidateToDelete = partialMatches[0];
        }
      }

      return { 
        success: false, 
        message: `⚠️ Are you sure you want to delete "${candidateToDelete.name}"? Reply "YES DELETE" to confirm.`,
        requiresConfirmation: true,
        candidateId: candidateToDelete.id
      };

    default:
      return { success: false, message: "Unknown action. Please specify create, update, or delete." };
  }
}

export async function handleDeleteConfirmation(candidateId: number) {
  console.log('🗑️ Confirmed deletion for candidate:', candidateId);
  return await tauriCandidateService.delete(candidateId);
}
