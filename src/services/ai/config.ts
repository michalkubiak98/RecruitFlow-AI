// src/services/ai/config.ts
import OpenAI from 'openai'
import { AppSettings } from '../../types/settings'

export const createOpenAIClient = (apiKey: string) => {
  return new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
    maxRetries: 2, // Limit retries to control costs
  })
}

// Compact tool definitions to reduce tokens
export const generateAITools = (settings: AppSettings) => {
  // Build dynamic field properties efficiently
  const fieldProps = settings.fields.reduce(
    (acc, field) => {
      acc[field.id] = {
        type: field.type === 'boolean' ? 'boolean' : 'string',
        ...(field.type === 'dropdown' && field.options
          ? { enum: field.options }
          : {}),
      }
      return acc
    },
    {} as Record<string, any>
  )

  return [
    {
      type: 'function' as const,
      function: {
        name: 'manage_candidate',
        description: `CRUD operations for ${settings.entityName.toLowerCase()}`,
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'update', 'delete', 'bulk_create'],
            },
            candidate: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                fields: { type: 'object', properties: fieldProps },
                notes: { type: 'string' },
              },
            },
            candidates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  fields: { type: 'object', properties: fieldProps },
                  notes: { type: 'string' },
                },
              },
            },
          },
          required: ['action'],
        },
      },
    },
    {
      type: 'function' as const,
      function: {
        name: 'search_candidates',
        description: `Search ${settings.entityName.toLowerCase()}`,
        parameters: {
          type: 'object',
          properties: {
            searchType: {
              type: 'string',
              enum: ['specific', 'filter'],
            },
            name: { type: 'string' },
            criteria: {
              type: 'object',
              properties: fieldProps,
            },
          },
          required: ['searchType'],
        },
      },
    },
  ]
}

// Optimized, concise system prompt
export const generateSystemPrompt = (settings: AppSettings) => {
  // Build field descriptions concisely
  const fieldDescriptions = settings.fields
    .map((f) => {
      const type =
        f.type === 'dropdown' && f.options
          ? `[${f.options.join('/')}]`
          : f.type === 'boolean'
            ? '[Y/N]'
            : '[text]'
      return `${f.id}:${type}${f.required ? '*' : ''}`
    })
    .join(', ')

  return `You are a ${settings.entityName.toLowerCase()} assistant. Manage data efficiently.

FIELDS: ${fieldDescriptions}

ACTIONS:
- CREATE: add/new/hire/create/register → use manage_candidate with action:"create"
- UPDATE: update/change/set/modify/edit → use manage_candidate with action:"update"  
- DELETE: remove/delete/fire/terminate → use manage_candidate with action:"delete"
- SEARCH: show/find/who/list/get/filter → use search_candidates

RULES:
- Name matching: be flexible with typos and partial matches
- Multiple values: parse "and", "or", commas as multiple criteria
- Boolean fields: "yes/no", "true/false", "can/cannot" all work
- Notes: only include if explicitly provided, never generate placeholder text
- Required fields: ${settings.fields
    .filter((f) => f.required)
    .map((f) => f.id)
    .join(', ')}
- Always extract ALL field values mentioned in the query`
}

// Cost tracking utility
export class CostTracker {
  private static instance: CostTracker
  private dailyCosts: Map<string, number> = new Map()
  private modelUsage: Map<string, number> = new Map()
  private queryCache: Map<string, { result: any; timestamp: number }> =
    new Map()

  // Updated pricing as of 2025
  private readonly COST_PER_1K_TOKENS = {
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4-0125-preview': { input: 0.01, output: 0.03 },
  }

  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): CostTracker {
    if (!CostTracker.instance) {
      CostTracker.instance = new CostTracker()
    }
    return CostTracker.instance
  }

  addUsage(model: string, inputTokens: number, outputTokens: number) {
    const today = new Date().toDateString()
    const modelCosts =
      this.COST_PER_1K_TOKENS[model as keyof typeof this.COST_PER_1K_TOKENS]

    if (modelCosts) {
      const cost =
        (inputTokens / 1000) * modelCosts.input +
        (outputTokens / 1000) * modelCosts.output

      const currentCost = this.dailyCosts.get(today) || 0
      this.dailyCosts.set(today, currentCost + cost)

      // Track model usage
      const currentUsage = this.modelUsage.get(`${today}-${model}`) || 0
      this.modelUsage.set(`${today}-${model}`, currentUsage + 1)

      // Increment query count
      const queryCountKey = `ai-query-count-${today}`
      const currentCount = parseInt(localStorage.getItem(queryCountKey) || '0')
      localStorage.setItem(queryCountKey, String(currentCount + 1))

      console.log(
        `💰 API Cost: $${cost.toFixed(4)} (Total today: $${(currentCost + cost).toFixed(2)})`
      )

      // Warn if approaching daily limit
      if (currentCost + cost > 1.5) {
        console.warn('⚠️ Approaching daily cost limit of $2')
      }
    }
  }

  getDailyCost(): number {
    const today = new Date().toDateString()
    return this.dailyCosts.get(today) || 0
  }

  getModelBreakdown(): Record<string, number> {
    const today = new Date().toDateString()
    const models = [
      'gpt-3.5-turbo',
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-4-turbo',
    ] as const
    const usage: Record<string, number> = {}

    let total = 0
    models.forEach((model) => {
      const count = this.modelUsage.get(`${today}-${model}`) || 0
      usage[model] = count
      total += count
    })

    // Convert to percentages
    if (total > 0) {
      models.forEach((model) => {
        usage[model] = Math.round((usage[model] / total) * 100)
      })
    }

    return usage
  }

  getCachedResult(key: string): any | null {
    const cached = this.queryCache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('💾 Cache hit! Saving API call')
      return cached.result
    }
    return null
  }

  setCachedResult(key: string, result: any) {
    this.queryCache.set(key, { result, timestamp: Date.now() })

    // Clean old cache entries
    if (this.queryCache.size > 100) {
      const oldestKey = Array.from(this.queryCache.keys())[0]
      this.queryCache.delete(oldestKey)
    }
  }

  resetDailyCost() {
    const today = new Date().toDateString()
    this.dailyCosts.set(today, 0)
    this.modelUsage.clear()
    localStorage.setItem(`ai-query-count-${today}`, '0')
  }
}

// Smart retry with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) throw error

      const delay = baseDelay * Math.pow(2, i)
      console.log(`Retry ${i + 1}/${retries} after ${delay}ms`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error('Max retries reached')
}

// Prompt optimization utilities
export const optimizePrompt = (prompt: string): string => {
  return prompt
    .replace(/\s+/g, ' ') // Remove extra whitespace
    .replace(/\n+/g, '\n') // Remove extra newlines
    .trim()
}

// Field value normalizer for consistent parsing
export const normalizeFieldValue = (value: any, fieldType: string): any => {
  if (fieldType === 'boolean') {
    if (typeof value === 'string') {
      const lower = value.toLowerCase()
      return (
        lower === 'yes' ||
        lower === 'true' ||
        lower === 'y' ||
        lower === '1' ||
        lower === 'can' ||
        lower === 'does'
      )
    }
    return Boolean(value)
  }

  if (fieldType === 'text' && typeof value === 'string') {
    // Normalize common variations
    return value.trim().replace(/\s+/g, ' ').replace(/['']s/g, "'s") // Fix smart quotes
  }

  return value
}

// Smart field extractor for local preprocessing
export const extractFieldsFromText = (
  text: string,
  settings: AppSettings
): Record<string, any> => {
  const extracted: Record<string, any> = {}
  const lower = text.toLowerCase()

  settings.fields.forEach((field) => {
    // Try to extract field values using patterns
    if (field.type === 'text') {
      // Look for patterns like "location dublin" or "from dublin"
      const patterns = [
        new RegExp(`${field.id}\\s+([\\w\\s]+?)(?:\\s+\\w+:|,|$)`, 'i'),
        new RegExp(`${field.label}\\s+([\\w\\s]+?)(?:\\s+\\w+:|,|$)`, 'i'),
      ]

      // Field-specific patterns
      if (field.id === 'location') {
        patterns.push(
          /(?:from|in|at|location|based in|located in)\s+([\w\s]+?)(?:\s+\w+:|,|$)/i,
          /\b(dublin|cork|galway|limerick|waterford|remote|wfh|office)\b/i
        )
      } else if (field.id === 'salary') {
        patterns.push(
          /\b(\d+k|\d+,?\d*k|\d{4,6})\b/i,
          /(?:salary|earns?|makes?|€|£|\$)\s*(\d+k?)/i
        )
      } else if (field.id === 'role' || field.id === 'position') {
        patterns.push(
          /(?:role|position|job|title|as|is a|works as)\s+([\w\s]+?)(?:\s+\w+:|,|$)/i
        )
      }

      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match) {
          extracted[field.id] = match[1].trim()
          break
        }
      }
    } else if (field.type === 'dropdown' && field.options) {
      // Look for dropdown values
      const foundOption = field.options.find((opt) =>
        lower.includes(opt.toLowerCase())
      )
      if (foundOption) {
        extracted[field.id] = foundOption
      }
    } else if (field.type === 'boolean') {
      // Look for boolean indicators
      const positivePatterns = [
        new RegExp(`${field.id}s?\\b`, 'i'),
        new RegExp(`can\\s+${field.id}`, 'i'),
        new RegExp(`does\\s+${field.id}`, 'i'),
        new RegExp(`has\\s+${field.id}`, 'i'),
      ]

      const negativePatterns = [
        new RegExp(`no\\s+${field.id}`, 'i'),
        new RegExp(`cannot\\s+${field.id}`, 'i'),
        new RegExp(`can't\\s+${field.id}`, 'i'),
        new RegExp(`doesn't\\s+${field.id}`, 'i'),
      ]

      // Check field-specific patterns
      if (field.id === 'can_drive' || field.id === 'drives') {
        if (
          /\b(can drive|drives|driver|driving license|has car)\b/i.test(text)
        ) {
          extracted[field.id] = true
        } else if (
          /\b(cannot drive|can't drive|no driving|no car)\b/i.test(text)
        ) {
          extracted[field.id] = false
        }
      } else {
        // Generic boolean extraction
        for (const pattern of positivePatterns) {
          if (pattern.test(text)) {
            extracted[field.id] = true
            break
          }
        }
        if (!(field.id in extracted)) {
          for (const pattern of negativePatterns) {
            if (pattern.test(text)) {
              extracted[field.id] = false
              break
            }
          }
        }
      }
    }
  })

  return extracted
}
