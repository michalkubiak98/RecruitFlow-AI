// src/services/ai/parser.ts
import {
  createOpenAIClient,
  generateAITools,
  generateSystemPrompt,
  CostTracker,
  extractFieldsFromText,
} from './config'
import { tauriCandidateService } from '../database/tauri-commands'
import { encodingForModel } from 'js-tiktoken'

// Token counting utility
const countTokens = (text: string): number => {
  try {
    const encoder = encodingForModel('gpt-3.5-turbo')
    const tokens = encoder.encode(text)
    return tokens.length
  } catch (error) {
    // Fallback to rough estimation if encoding fails
    return Math.ceil(text.length / 4)
  }
}

// Truncate messages to fit within token budget
const truncateMessages = (messages: any[], maxTokens: number = 2000): any[] => {
  let totalTokens = 0
  const truncated = []

  // Start from most recent messages
  for (let i = messages.length - 1; i >= 0; i--) {
    const msgTokens = countTokens(messages[i].content)
    if (totalTokens + msgTokens > maxTokens) break
    truncated.unshift(messages[i])
    totalTokens += msgTokens
  }

  return truncated
}

// Cache for system prompts and tools to avoid regeneration
const promptCache = new Map<string, { prompt: string; tools: any[] }>()

const getCachedPromptAndTools = (settings: any) => {
  const cacheKey = JSON.stringify(
    settings.fields.map((f: any) => ({
      id: f.id,
      type: f.type,
      options: f.options,
    }))
  )

  if (!promptCache.has(cacheKey)) {
    promptCache.set(cacheKey, {
      prompt: generateSystemPrompt(settings),
      tools: generateAITools(settings),
    })
  }

  return promptCache.get(cacheKey)!
}

// Pre-process input to extract obvious intents locally
const preprocessInput = (input: string) => {
  const lower = input.toLowerCase().trim()

  // Detect clear intents with improved patterns
  const intents = {
    isCreation: /^(add|create|new|hire|register|onboard)\s/i.test(lower),
    isDeletion: /^(delete|remove|fire|eliminate|terminate)\s/i.test(lower),
    isUpdate: /^(update|change|modify|set|edit|correct|fix)\s/i.test(lower),
    isSearch: /^(show|find|search|who|list|get|looking for|display|filter)\s/i.test(lower),
    isBulk: /\b(all|everyone|multiple|bulk|batch|several)\b/i.test(lower),
    hasConfirmation: lower === 'yes delete' || lower.includes('confirm'),
  }

  // Extract potential names with improved patterns
  const namePatterns = [
    // Commands with names
    /(?:add|create|update|delete|remove|show|find|hire|fire|edit|change)\s+(?:me\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    // Just names at the start
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    // Names after "called" or "named"
    /(?:called|named)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
  ]

  let potentialName = null
  for (const pattern of namePatterns) {
    const match = input.match(pattern)
    if (match) {
      potentialName = match[1]
      break
    }
  }

  return { intents, potentialName, processedInput: input }
}

// Smart model selection based on query complexity
const selectModel = (input: string, intents: any): string => {
  // Use cheaper model for simple operations
  if (intents.hasConfirmation || intents.isDeletion) {
    return 'gpt-3.5-turbo' // Much cheaper for simple confirmations
  }

  // Complex queries with multiple criteria
  if (input.includes(' and ') || input.includes(', ')) {
    return 'gpt-4o-mini' // Better at handling complex queries
  }

  // Use GPT-3.5 for most operations
  if (intents.isCreation || intents.isUpdate || intents.isSearch) {
    return 'gpt-3.5-turbo' // Good enough for most operations
  }

  // Use GPT-4 mini as fallback
  return 'gpt-4o-mini'
}

export async function parseNaturalLanguage(
  input: string,
  settings: any,
  messageHistory: any[] = []
) {
  try {
    console.log('🔍 Parsing input:', input)

    // Check API key
    if (!settings.openaiApiKey) {
      return {
        success: false,
        message:
          'OpenAI API key not configured. Please add your API key in Settings.',
      }
    }

    // Pre-process the input
    const { intents, potentialName, processedInput } = preprocessInput(input)
    console.log('📊 Preprocessed:', { intents, potentialName })

    // Handle simple confirmations locally
    if (intents.hasConfirmation && input.toLowerCase() === 'yes delete') {
      // This should be handled by the calling function
      return {
        success: false,
        message: 'Delete confirmation should be handled externally',
      }
    }

    // Extract fields from text for better parsing
    const extractedFields = extractFieldsFromText(input, settings)
    console.log('🎯 Extracted fields:', extractedFields)

    // Check cache
    const cacheKey = `${input}-${JSON.stringify(settings.fields.map((f: any) => f.id))}`
    const cachedResult = CostTracker.getInstance().getCachedResult(cacheKey)
    if (cachedResult) {
      console.log('💾 Using cached result')
      return cachedResult
    }

    const openai = createOpenAIClient(settings.openaiApiKey)

    // Get cached prompt and tools
    const { prompt, tools } = getCachedPromptAndTools(settings)

    // Smart context selection - only include relevant messages
    const relevantMessages = messageHistory.filter((msg, idx) => {
      // Always include last 2 messages
      if (idx >= messageHistory.length - 2) return true

      // Include messages that mention the same name
      if (
        potentialName &&
        msg.content.toLowerCase().includes(potentialName.toLowerCase())
      ) {
        return true
      }

      // Include messages with similar intent
      const msgIntents = preprocessInput(msg.content).intents
      return Object.keys(intents).some((key: string) => {
        const intentKey = key as keyof typeof intents
        return intents[intentKey] && msgIntents[intentKey]
      })
    })

    // Truncate messages to fit token budget
    const truncatedMessages = truncateMessages(relevantMessages, 1500) // Leave room for response

    // Enhance the current message with extracted fields
    let enhancedInput = processedInput
    if (Object.keys(extractedFields).length > 0) {
      const fieldInfo = Object.entries(extractedFields)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
      enhancedInput = `${processedInput} [Extracted: ${fieldInfo}]`
    }

    // Build context messages efficiently
    const contextMessages = [
      {
        role: 'system' as const,
        content: prompt,
      },
      // Add truncated context
      ...truncatedMessages.map((msg) => ({
        role:
          msg.type === 'user' ? 'user' : ('assistant' as 'user' | 'assistant'),
        content: msg.content,
      })),
      { role: 'user' as const, content: enhancedInput },
    ]

    // Select appropriate model
    const model = selectModel(processedInput, intents)
    console.log('🤖 Using model:', model)

    // Estimate input tokens
    const estimatedTokens = contextMessages.reduce(
      (sum, msg) => sum + countTokens(msg.content),
      0
    )
    console.log('📊 Estimated input tokens:', estimatedTokens)

    const completion = await openai.chat.completions.create({
      model,
      messages: contextMessages,
      tools,
      tool_choice: 'auto',
      max_tokens: 500, // Reduced for cost savings
      temperature: 0.1, // Keep low for consistency
    })

    console.log('🤖 OpenAI Response:', {
      model: completion.model,
      usage: completion.usage, // Log token usage for monitoring
    })

    // Track usage
    if (completion.usage) {
      CostTracker.getInstance().addUsage(
        model,
        completion.usage.prompt_tokens || 0,
        completion.usage.completion_tokens || 0
      )
    }

    const message = completion.choices[0]?.message
    if (!message?.tool_calls?.[0]) {
      // If no tool call, try to infer from preprocessed data
      if (intents.isSearch && potentialName) {
        return await executeSearch(
          { searchType: 'specific', name: potentialName },
          settings
        )
      }

      // Try to create based on extracted fields
      if (intents.isCreation && potentialName) {
        return await executeManagement(
          {
            action: 'create',
            candidate: {
              name: potentialName,
              fields: extractedFields,
            },
          },
          settings
        )
      }

      return {
        success: false,
        message: 'Could not understand the request. Please try rephrasing.',
      }
    }

    const toolCall = message.tool_calls[0]
    console.log('🛠️ Function call:', toolCall)

    const functionName = toolCall.function.name
    const args = JSON.parse(toolCall.function.arguments)

    // Merge extracted fields with AI-parsed fields
    if (args.candidate && extractedFields) {
      args.candidate.fields = {
        ...extractedFields,
        ...(args.candidate.fields || {}),
      }
    }

    let result: any
    if (functionName === 'search_candidates') {
      result = await executeSearch(args, settings)
    } else if (functionName === 'manage_candidate') {
      result = await executeManagement(args, settings)
    } else {
      result = { success: false, message: 'Unknown function called.' }
    }

    // Cache successful results
    if (result.success) {
      CostTracker.getInstance().setCachedResult(cacheKey, result)
    }

    return result
  } catch (error) {
    console.error('💥 Parse error:', error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Incorrect API key')) {
        return {
          success: false,
          message:
            'Invalid OpenAI API key. Please check your API key in Settings.',
        }
      } else if (error.message.includes('exceeded your current quota')) {
        return {
          success: false,
          message: 'OpenAI API quota exceeded. Please check your billing.',
        }
      } else if (error.message.includes('Rate limit')) {
        // Implement simple retry with backoff
        console.log('⏳ Rate limited, waiting 2 seconds...')
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return parseNaturalLanguage(input, settings, messageHistory)
      }
    }

    return {
      success: false,
      message: `Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

// Optimized search with better fuzzy matching
async function executeSearch(args: any, settings: any) {
  console.log('🔍 Executing search with args:', args)

  const { searchType, name, criteria } = args
  const allCandidates = await tauriCandidateService.getAll()

  if (searchType === 'specific') {
    // Implement better fuzzy search
    const searchTerms = name.toLowerCase().split(/\s+/)
    const scored = allCandidates.map((candidate) => {
      const candidateName = candidate.name.toLowerCase()
      const candidateTerms = candidateName.split(/\s+/)

      // Calculate match score
      let score = 0
      searchTerms.forEach((term: string) => {
        if (candidateName.includes(term)) score += 2
        candidateTerms.forEach((candTerm: string) => {
          if (candTerm.startsWith(term)) score += 1
          if (term.length > 3 && candTerm.includes(term)) score += 0.5
        })
      })

      return { candidate, score }
    })

    const found = scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.candidate)

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
    // Filter implementation with improved logic
    let filtered = [...allCandidates]

    // Apply filters efficiently
    Object.entries(criteria || {}).forEach(([fieldId, value]) => {
      const fieldConfig = settings.fields.find((f: any) => f.id === fieldId)
      if (!fieldConfig || !value) return

      const searchValue = String(value).toLowerCase()

      // Optimize filtering based on field type
      if (fieldConfig.type === 'boolean') {
        // Handle various boolean representations
        const boolValue = 
          searchValue === 'true' || 
          searchValue === 'yes' || 
          searchValue === 'y' || 
          searchValue === '1' ||
          searchValue === 'can' || // For "can drive"
          searchValue === 'does' // For "does drive"
        filtered = filtered.filter((c) => 
          c.fields[fieldId] === boolValue
        )
      } else if (fieldConfig.type === 'dropdown') {
        // Handle multiple values efficiently
        if (searchValue.includes(' and ') || searchValue.includes(', ')) {
          const values = new Set(
            searchValue
              .split(/\s+and\s+|,\s*/)
              .map((v) => v.trim())
              .filter((v) => v.length > 0)
          )
          filtered = filtered.filter((c) => {
            const fieldValue = String(c.fields[fieldId] || '').toLowerCase()
            return Array.from(values).some((val) => fieldValue.includes(val))
          })
        } else {
          // Try both exact match and contains for flexibility
          filtered = filtered.filter((c) => {
            const fieldValue = String(c.fields[fieldId] || '').toLowerCase()
            return fieldValue === searchValue || fieldValue.includes(searchValue)
          })
        }
      } else {
        // Text field filtering with optimization
        filtered = filtered.filter((c) => {
          const fieldValue = String(c.fields[fieldId] || '').toLowerCase()

          // Handle multiple values
          if (searchValue.includes(' and ') || searchValue.includes(', ')) {
            const values = searchValue
              .split(/\s+and\s+|,\s*/)
              .map((v) => v.trim())
              .filter((v) => v.length > 0)
            return values.some((val) => fieldValue.includes(val))
          }

          // Handle salary ranges like "50-60k"
          if (fieldId === 'salary' && searchValue.includes('-')) {
            const [min, max] = searchValue.split('-').map(s => 
              parseInt(s.replace(/[^0-9]/g, ''))
            )
            const candidateSalary = parseInt(
              fieldValue.replace(/[^0-9]/g, '')
            )
            if (!isNaN(min) && !isNaN(max) && !isNaN(candidateSalary)) {
              return candidateSalary >= min && candidateSalary <= max
            }
          }

          return fieldValue.includes(searchValue)
        })
      }
    })

    const criteriaText = Object.entries(criteria || {})
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => {
        const field = settings.fields.find((f: any) => f.id === key)
        return `${field?.label || key}: ${value}`
      })
      .join(', ')

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
  if (!notes) return true

  const normalizedNotes = notes.toLowerCase().trim()
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
    '',
  ]

  return ignorePatterns.some(
    (pattern) =>
      normalizedNotes === pattern ||
      normalizedNotes === pattern + '.' ||
      normalizedNotes === pattern + 's'
  )
}

// Helper function for typo-tolerant name matching
const fuzzyMatchName = (inputName: string, candidateName: string): boolean => {
  const input = inputName.toLowerCase().trim()
  const candidate = candidateName.toLowerCase().trim()

  // Direct match
  if (candidate.includes(input) || input.includes(candidate)) return true

  // Split names and check parts
  const inputParts = input.split(/\s+/)
  const candidateParts = candidate.split(/\s+/)

  // Check if all input parts match some candidate parts
  return inputParts.every((inputPart) =>
    candidateParts.some(
      (candidatePart) =>
        candidatePart.includes(inputPart) || 
        inputPart.includes(candidatePart) ||
        // Check for typos (1 character difference)
        (inputPart.length > 3 && levenshteinDistance(inputPart, candidatePart) <= 1)
    )
  )
}

// Simple Levenshtein distance for typo tolerance
function levenshteinDistance(a: string, b: string): number {
  const matrix = []
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

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
      const cleanNotes = shouldIgnoreNotes(candidate.notes)
        ? ''
        : candidate.notes

      // Validate required fields
      const missingRequired = settings.fields
        .filter((f: any) => f.required && !candidate.fields?.[f.id])
        .map((f: any) => f.label)

      if (missingRequired.length > 0) {
        return {
          success: false,
          message: `Missing required fields: ${missingRequired.join(', ')}`,
        }
      }

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
          const cleanNotes = shouldIgnoreNotes(cand.notes) ? '' : cand.notes

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

      console.log(
        '🔍 Looking for existing candidate with fuzzy matching:',
        candidate.name
      )
      const allCandidates = await tauriCandidateService.getAll()

      // Use fuzzy matching to find candidate
      let existingCandidate = allCandidates.find((c) =>
        fuzzyMatchName(candidate.name, c.name)
      )

      if (!existingCandidate) {
        return {
          success: false,
          message: `${settings.entityNameSingular} "${candidate.name}" not found. Did you mean to create a new ${settings.entityNameSingular.toLowerCase()}?`,
        }
      }

      console.log(
        '✏️ Updating existing candidate:',
        existingCandidate.id,
        existingCandidate.name
      )
      const updateData: any = {}

      // CRITICAL FIX: Update name if provided and different
      if (
        candidate.name &&
        candidate.name.toLowerCase() !== existingCandidate.name.toLowerCase()
      ) {
        updateData.name = candidate.name
        console.log(
          '📝 Updating name from',
          existingCandidate.name,
          'to',
          candidate.name
        )
      }

      // Merge fields intelligently
      if (candidate.fields) {
        updateData.fields = { ...existingCandidate.fields }

        // Update each field
        Object.entries(candidate.fields).forEach(([fieldId, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            // Normalize field values based on type
            const fieldConfig = settings.fields.find(
              (f: any) => f.id === fieldId
            )
            if (fieldConfig) {
              if (fieldConfig.type === 'boolean') {
                updateData.fields[fieldId] = Boolean(value)
              } else {
                updateData.fields[fieldId] = value
              }
            }
            console.log(`📝 Updating field ${fieldId}:`, value)
          }
        })
      }

      // Handle notes updates - only update if notes are meaningful
      if (candidate.notes !== undefined) {
        if (shouldIgnoreNotes(candidate.notes)) {
          // Don't change existing notes if user said "no notes"
          updateData.notes = existingCandidate.notes
        } else {
          updateData.notes = candidate.notes
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

      const allCandidatesForDeletion = await tauriCandidateService.getAll()
      let candidateToDelete = allCandidatesForDeletion.find(
        (c) => c.name.toLowerCase() === candidate.name.toLowerCase()
      )

      if (!candidateToDelete) {
        const partialMatches = allCandidatesForDeletion.filter((c) =>
          fuzzyMatchName(candidate.name, c.name)
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