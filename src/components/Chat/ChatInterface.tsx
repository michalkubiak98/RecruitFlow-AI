import React, { useState, useRef, useEffect } from 'react'
import {
  Send,
  Loader,
  MessageSquare,
  AlertTriangle,
  Search,
  Trash2,
} from 'lucide-react'
import {
  parseNaturalLanguage,
  handleDeleteConfirmation,
} from '../../services/ai'
import { SearchResultsModal } from '../Search/SearchResultsModal'
import { useChat } from '../../hooks/useChat'
import { useSettings } from '../../hooks/useSettings'
import { Candidate } from '../../types'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'

interface ChatInterfaceProps {
  onUpdate: () => void
}

export function ChatInterface({ onUpdate }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [pendingDeletion, setPendingDeletion] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastQuery, setLastQuery] = useState('')

  // Search results state
  const [searchResults, setSearchResults] = useState<Candidate[]>([])
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [searchType, setSearchType] = useState<'specific' | 'filter'>('filter')
  const [searchCriteria, setSearchCriteria] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, addMessage, clearChat, isLoading } = useChat()
  const { settings } = useSettings()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Filter messages based on search
  const filteredMessages = messages.filter((message) =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    // Check if API key is configured
    if (!settings.openaiApiKey) {
      toast.error('Please configure your OpenAI API key in Settings first')
      return
    }

    const userMessage = {
      id: uuidv4(),
      type: 'user' as const,
      content: input,
      timestamp: new Date(),
    }

    addMessage(userMessage)
    console.log('💬 User message:', input)

    const currentInput = input
    setLastQuery(currentInput)
    setInput('')
    setIsProcessing(true)

    try {
      // Check if this is a delete confirmation
      if (pendingDeletion && currentInput.toUpperCase() === 'YES DELETE') {
        console.log('🗑️ Processing delete confirmation...')
        const result = await handleDeleteConfirmation(pendingDeletion)

        const systemMessage = {
          id: uuidv4(),
          type: 'system' as const,
          content: result.message,
          timestamp: new Date(),
        }

        addMessage(systemMessage)
        setPendingDeletion(null)

        if (result.success) {
          toast.success(result.message)
          onUpdate()
        } else {
          toast.error(result.message)
        }

        setIsProcessing(false)
        return
      }

      // Check if user wants to cancel deletion
      if (
        pendingDeletion &&
        (currentInput.toLowerCase().includes('no') ||
          currentInput.toLowerCase().includes('cancel') ||
          currentInput.toLowerCase().includes('stop'))
      ) {
        console.log('❌ User cancelled deletion')
        setPendingDeletion(null)

        const systemMessage = {
          id: uuidv4(),
          type: 'system' as const,
          content: 'Deletion cancelled. How can I help you?',
          timestamp: new Date(),
        }

        addMessage(systemMessage)
        toast('Deletion cancelled', { icon: '❌' })
        setIsProcessing(false)
        return
      }

      // Regular AI processing with settings and message history
      console.log('🚀 Starting AI parsing with settings:', settings)
      const result = await parseNaturalLanguage(currentInput, settings, messages)
      console.log('📤 AI Result:', result)

      const systemMessage = {
        id: uuidv4(),
        type: 'system' as const,
        content: result.message,
        timestamp: new Date(),
      }

      addMessage(systemMessage)

      // Handle search results
      if ((result as any).searchResults) {
        console.log('🔍 Search results found:', (result as any).searchResults)
        setSearchResults((result as any).searchResults)
        setSearchType((result as any).searchType)
        setSearchCriteria((result as any).criteria || '')
        setIsSearchModalOpen(true)
        toast.success(
          `Found ${(result as any).searchResults.length} ${settings.entityName.toLowerCase()}`
        )
      }
      // Handle delete confirmation
      else if ((result as any).requiresConfirmation) {
        setPendingDeletion((result as any).candidateId)
        toast.error('Deletion requires confirmation')
      }
      // Handle success
      else if (result.success) {
        toast.success(result.message)
        console.log('✅ Success, refreshing data...')
        onUpdate()
      }
      // Handle error
      else {
        toast.error(result.message)
        console.log('❌ Failed:', result.message)
      }
    } catch (error) {
      console.error('💥 Chat error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed: ${errorMessage}`)

      const errorSystemMessage = {
        id: uuidv4(),
        type: 'system' as const,
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      }

      addMessage(errorSystemMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-50">
        <div className="text-center">
          <Loader className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading chat history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-dark-50">
      {/* Header */}
      <div className="p-6 border-b border-dark-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary-500" />
            <div>
              <h2 className="text-heading-2">AI Assistant</h2>
              <p className="text-body-muted">
                Add, update, delete, or search {settings.entityName.toLowerCase()} using natural language
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-3 py-2 bg-error-500 text-white rounded-lg 
                     hover:bg-error-600 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </button>
        </div>

        {/* Chat Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search chat history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-100 text-primary rounded-lg border border-dark-400 
                     focus:border-primary-500 focus:outline-none placeholder-subtle text-sm transition-colors"
          />
        </div>

        {pendingDeletion && (
          <div className="p-4 bg-error-500/10 border border-error-500/30 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-error-500" />
            <span className="text-error-500 text-body">
              Deletion pending - type "YES DELETE" to confirm or "no" to cancel
            </span>
          </div>
        )}

        {searchQuery && (
          <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
            <span className="text-primary-500 text-body">
              Searching for: "{searchQuery}" ({filteredMessages.length} results)
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredMessages.length === 0 && searchQuery ? (
          <div className="text-center mt-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-heading-3 mb-2">No messages found</h3>
            <p className="text-body-muted">Try a different search term.</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center mt-12">
            <div className="max-w-lg mx-auto">
              <h3 className="text-heading-2 mb-4">
                Welcome to {settings.appName}
              </h3>
              <p className="text-body-lg text-muted mb-8">
                Manage and search {settings.entityName.toLowerCase()} using natural language
              </p>
              <div className="card-primary text-left">
                <p className="text-body text-primary mb-4">Try these examples:</p>
                <div className="space-y-3">
                  <div className="bg-dark-200 rounded-lg p-3 text-body text-muted">
                    "Show me Jane Doe"
                  </div>
                  <div className="bg-dark-200 rounded-lg p-3 text-body text-muted">
                    "Find everyone from Dublin"
                  </div>
                  <div className="bg-dark-200 rounded-lg p-3 text-body text-muted">
                    "Add Mike developer Dublin 55k"
                  </div>
                  <div className="bg-dark-200 rounded-lg p-3 text-body text-muted">
                    "Update Jane's salary to 70k"
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-lg px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary-500 text-white'
                      : message.content.includes('⚠️')
                        ? 'bg-error-500/10 border border-error-500/30 text-error-500'
                        : message.content.includes('Found') &&
                            message.content.includes(settings.entityNameSingular.toLowerCase())
                          ? 'bg-success-500/10 border border-success-500/30 text-success-500'
                          : 'bg-dark-100 text-primary border border-dark-300'
                  }`}
                >
                  <p className="text-body">{message.content}</p>
                  <p className={`text-caption mt-2 ${
                    message.type === 'user' ? 'text-user-time' : 'text-caption-subtle opacity-70'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-dark-300">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                pendingDeletion
                  ? 'Type "YES DELETE" to confirm or "no" to cancel...'
                  : `Try: "Show me developers from Cork" or "Add John developer Dublin 50k"`
              }
              className="flex-1 px-4 py-3 bg-dark-100 text-primary rounded-lg border border-dark-400 
                       focus:border-primary-500 focus:outline-none placeholder-subtle transition-colors"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className={`px-6 py-3 text-white rounded-lg transition-colors flex items-center gap-2 font-medium ${
                pendingDeletion
                  ? 'bg-error-500 hover:bg-error-600'
                  : 'bg-primary-500 hover:bg-primary-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isProcessing ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : pendingDeletion ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {isProcessing
                ? 'Processing...'
                : pendingDeletion
                  ? 'Confirm'
                  : 'Send'}
            </button>
          </div>
        </form>
      </div>

      {/* Search Results Modal */}
      <SearchResultsModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        results={searchResults}
        searchType={searchType}
        query={lastQuery}
        criteria={searchCriteria}
      />
    </div>
  )
}
