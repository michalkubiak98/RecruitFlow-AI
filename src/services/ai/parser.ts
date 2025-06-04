import { openai, generateAITools, generateSystemPrompt } from './config'
import { tauriCandidateService } from '../database/tauri-commands'

export async function parseNaturalLanguage(input: string, settings: any) {
  try {
    console.log('🔍 Parsing input:', input)
    console.log('⚙️ Using settings:', settings)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-0125-preview',
      messages: [
        {
          role: 'system',
          content: generateSystemPrompt(settings),
        },
        { role: 'user', content: input },
      ],
      tools: generateAITools(settings),
      tool_choice: 'auto',
    })

    console.log('🤖 OpenAI Response:', completion)

    const message = completion.choices[0]?.message
    if (!message?.tool_calls?.[0]) {
      return {
        success: false,
        message: 'Could not understand the request. Please try rephrasing.',
      }
    }

    const toolCall = message.tool_calls[0]
    console.log('🛠️ Function call:', toolCall)

    const functionName = toolCall.function.name
    const args = JSON.parse(toolCall.function.arguments)

    if (functionName === 'search_candidates') {
      return await executeSearch(args, settings)
    } else if (functionName === 'manage_candidate') {
      return await executeManagement(args, settings)
    }

    return { success: false, message: 'Unknown function called.' }
  } catch (error) {
    console.error('💥 Parse error:', error)
    return {
      success: false,
      message: `Failed to parse: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

async function executeSearch(args: any, settings: any) {
  console.log('🔍 Executing search with args:', args)

  const { searchType, name, criteria } = args
  const allCandidates = await tauriCandidateService.getAll()

  if (searchType === 'specific') {
    const found = allCandidates.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(candidate.name.toLowerCase())
    )

    if (found.length === 0) {
      return {
        success: false,
        message: `No ${settings.entityNameSingular.toLowerCase()} found with name "${name}"`,
      }
    }

    return {
      success: true,
      message: `Found ${found.length} ${found.length === 1 ? settings.entityNameSingular.toLowerCase() : settings.entityName.toLowerCase()} matching "${name}"`,
      searchResults: found,
      searchType: 'specific',
    }
  } else {
    let filtered = [...allCandidates]

    // Apply dynamic field filters with improved logic
    Object.entries(criteria || {}).forEach(([fieldId, value]) => {
      const fieldConfig = settings.fields.find((f: any) => f.id === fieldId)
      if (!fieldConfig) return

      console.log(`🔍 Filtering by ${fieldId}:`, value)

      if (fieldConfig.type === 'text') {
        const searchValue = String(value).toLowerCase()

        // Handle multiple locations (e.g., "cork and dublin", "cork, dublin")
        if (
          fieldId === 'location' &&
          (searchValue.includes(' and ') || searchValue.includes(', '))
        ) {
          const locations = searchValue
            .split(/\s+and\s+|,\s*/)
            .map((loc) => loc.trim())
            .filter((loc) => loc.length > 0)

          console.log('🌍 Multiple locations detected:', locations)

          filtered = filtered.filter((c) => {
            const fieldValue = c.fields[fieldId]
            if (!fieldValue) return false

            const candidateLocation = String(fieldValue).toLowerCase()
            return locations.some(
              (location) =>
                candidateLocation.includes(location) ||
                location.includes(candidateLocation)
            )
          })
        } else {
          // Single value search
          filtered = filtered.filter((c) => {
            const fieldValue = c.fields[fieldId]
            return (
              fieldValue &&
              String(fieldValue).toLowerCase().includes(searchValue)
            )
          })
        }
      } else if (fieldConfig.type === 'boolean') {
        filtered = filtered.filter((c) => c.fields[fieldId] === value)
      } else if (fieldConfig.type === 'dropdown') {
        // Handle multiple dropdown values (e.g., "life science and food science")
        const searchValue = String(value).toLowerCase()
        if (searchValue.includes(' and ') || searchValue.includes(', ')) {
          const values = searchValue
            .split(/\s+and\s+|,\s*/)
            .map((val) => val.trim())
            .filter((val) => val.length > 0)

          console.log('📋 Multiple dropdown values detected:', values)

          filtered = filtered.filter((c) => {
            const fieldValue = c.fields[fieldId]
            if (!fieldValue) return false

            const candidateValue = String(fieldValue).toLowerCase()
            return values.some((val) => candidateValue.includes(val))
          })
        } else {
          filtered = filtered.filter((c) => c.fields[fieldId] === value)
        }
      }
    })

    const criteriaText = Object.entries(criteria || {})
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => {
        const field = settings.fields.find((f: any) => f.id === key)
        return `${field?.label || key}: ${value}`
      })
      .join(', ')

    console.log(`✅ Search complete: ${filtered.length} results found`)

    return {
      success: true,
      message: `Found ${filtered.length} ${filtered.length === 1 ? settings.entityNameSingular.toLowerCase() : settings.entityName.toLowerCase()}${criteriaText ? ` matching: ${criteriaText}` : ''}`,
      searchResults: filtered,
      searchType: 'filter',
      criteria: criteriaText,
    }
  }
}

// Helper function to check if notes should be ignored
const shouldIgnoreNotes = (notes: string | undefined): boolean => {
  if (!notes) return true;
  
  const normalizedNotes = notes.toLowerCase().trim();
  const ignorePatterns = [
    'no notes',
    'no note',
    'none',
    'n/a',
    'na',
    'no comments',
    'no additional notes',
    'no additional comments',
    'nothing',
    'no info',
    'no information',
    'skip notes',
    'skip',
    'empty',
    ''
  ];
  
  return ignorePatterns.some(pattern => 
    normalizedNotes === pattern || 
    normalizedNotes === pattern + '.' ||
    normalizedNotes === pattern + 's'
  );
};

async function executeManagement(args: any, settings: any) {
  const { action, candidate, candidates } = args

  switch (action) {
    case 'create':
      if (!candidate?.name) {
        return {
          success: false,
          message: `${settings.entityNameSingular} name is required for creation`,
        }
      }
      console.log('👤 Creating candidate:', candidate.name)
      
      // Clean up notes - don't save if user said "no notes" or similar
      const cleanNotes = shouldIgnoreNotes(candidate.notes) ? '' : candidate.notes;
      
      return await tauriCandidateService.create({
        ...candidate,
        fields: candidate.fields || {},
        notes: cleanNotes,
      })

    case 'bulk_create':
      if (!candidates || !Array.isArray(candidates)) {
        return {
          success: false,
          message: `${settings.entityName} array is required for bulk creation`,
        }
      }
      console.log(
        '👥 Bulk creating',
        candidates.length,
        settings.entityName.toLowerCase()
      )

      const results = []
      for (const cand of candidates) {
        if (cand.name) {
          // Clean up notes for each candidate
          const cleanNotes = shouldIgnoreNotes(cand.notes) ? '' : cand.notes;
          
          const result = await tauriCandidateService.create({
            ...cand,
            fields: cand.fields || {},
            notes: cleanNotes,
          })
          results.push(result)
        }
      }

      const successful = results.filter((r) => r.success).length
      return {
        success: true,
        message: `Created ${successful} of ${candidates.length} ${settings.entityName.toLowerCase()}: ${candidates.map((c: any) => c.name).join(', ')}`,
      }

    case 'update':
      if (!candidate?.name) {
        return {
          success: false,
          message: `${settings.entityNameSingular} name is required for updates`,
        }
      }

      console.log('🔍 Looking for existing candidate:', candidate.name)
      const existingCandidate = await tauriCandidateService.findByName(
        candidate.name
      )

      if (!existingCandidate) {
        return {
          success: false,
          message: `${settings.entityNameSingular} "${candidate.name}" not found. Did you mean to create a new ${settings.entityNameSingular.toLowerCase()}?`,
        }
      }

      console.log('✏️ Updating existing candidate:', existingCandidate.id)
      const updateData: any = {}
      if (candidate.fields)
        updateData.fields = { ...existingCandidate.fields, ...candidate.fields }
      
      // Handle notes updates - only update if notes are meaningful
      if (candidate.notes !== undefined) {
        if (shouldIgnoreNotes(candidate.notes)) {
          // Don't change existing notes if user said "no notes"
          updateData.notes = existingCandidate.notes;
        } else {
          updateData.notes = candidate.notes;
        }
      }

      return await tauriCandidateService.update(
        existingCandidate.id,
        updateData
      )

    case 'delete':
      if (!candidate?.name) {
        return {
          success: false,
          message: `${settings.entityNameSingular} name is required for deletion`,
        }
      }

      console.log('🔍 Looking for candidate to delete:', candidate.name)

      const allCandidates = await tauriCandidateService.getAll()
      let candidateToDelete = allCandidates.find(
        (c) => c.name.toLowerCase() === candidate.name.toLowerCase()
      )

      if (!candidateToDelete) {
        const partialMatches = allCandidates.filter(
          (c) =>
            c.name.toLowerCase().includes(candidate.name.toLowerCase()) ||
            candidate.name.toLowerCase().includes(c.name.toLowerCase())
        )

        if (partialMatches.length === 0) {
          return {
            success: false,
            message: `${settings.entityNameSingular} "${candidate.name}" not found.`,
          }
        } else if (partialMatches.length > 1) {
          const names = partialMatches.map((c) => c.name).join(', ')
          return {
            success: false,
            message: `Multiple ${settings.entityName.toLowerCase()} found: ${names}. Please be more specific.`,
          }
        } else {
          candidateToDelete = partialMatches[0]
        }
      }

      return {
        success: false,
        message: `⚠️ Are you sure you want to delete "${candidateToDelete.name}"? Reply "YES DELETE" to confirm.`,
        requiresConfirmation: true,
        candidateId: candidateToDelete.id,
      }

    default:
      return {
        success: false,
        message: 'Unknown action. Please specify create, update, or delete.',
      }
  }
}

export async function handleDeleteConfirmation(candidateId: number) {
  console.log('🗑️ Confirmed deletion for candidate:', candidateId)
  return await tauriCandidateService.delete(candidateId)
}
