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

    const userMessage = {
      id: uuidv4(),
      type: 'user' as const,
      content: input,
      timestamp: new Date(),
    }

    // Add message immediately for real-time display
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

      // Regular AI processing
      console.log('🚀 Starting AI parsing...')
      const result = await parseNaturalLanguage(currentInput)
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
          `Found ${(result as any).searchResults.length} candidates`
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
      <div className="h-full flex items-center justify-center bg-dark-100">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading chat history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-dark-100">
      {/* Header */}
      <div className="p-6 border-b border-dark-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-500" />
            <h2 className="text-2xl font-bold text-white">AI Assistant</h2>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg 
                     hover:bg-red-700 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </button>
        </div>

        <p className="text-gray-400 mb-4">
          Add, update, delete, or search candidates using natural language
        </p>

        {/* Chat Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search chat history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-200 text-white rounded-lg border border-dark-300 
                     focus:border-blue-500 focus:outline-none placeholder-gray-500 text-sm transition-colors"
          />
        </div>

        {pendingDeletion && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm">
              Deletion pending - type "YES DELETE" to confirm or "no" to cancel
            </span>
          </div>
        )}

        {searchQuery && (
          <div className="mt-3 p-2 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <span className="text-blue-300 text-sm">
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
            <h3 className="text-lg font-semibold text-white mb-2">
              No messages found
            </h3>
            <p className="text-gray-400">Try a different search term.</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center mt-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-white mb-4">
                👋 Welcome to Rolodex.ai AI!
              </h3>
              <p className="text-gray-400 mb-6">
                Manage and search candidates using natural language
              </p>
              <div className="bg-dark-200 rounded-lg p-4 text-left">
                <p className="text-sm text-gray-300 mb-3">
                  Try these examples:
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="bg-dark-300 rounded p-2">
                    <Search className="w-3 h-3 inline mr-2" />
                    "Show me Sarah Fowler"
                  </div>
                  <div className="bg-dark-300 rounded p-2">
                    <Search className="w-3 h-3 inline mr-2" />
                    "Find everyone from Dublin below 50k"
                  </div>
                  <div className="bg-dark-300 rounded p-2">
                    <Search className="w-3 h-3 inline mr-2" />
                    "Show developers in food science"
                  </div>
                  <div className="bg-dark-300 rounded p-2">
                    "Add Mike QA specialist life science Dublin 55k"
                  </div>
                  <div className="bg-dark-300 rounded p-2">
                    "Update Sarah's salary to 70k"
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
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
                      ? 'bg-blue-600 text-white'
                      : message.content.includes('⚠️')
                        ? 'bg-red-900/20 border border-red-500/30 text-red-100'
                        : message.content.includes('Found') &&
                            message.content.includes('candidate')
                          ? 'bg-green-900/20 border border-green-500/30 text-green-100'
                          : 'bg-dark-200 text-gray-100 border border-dark-300'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-2">
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
                  : 'Try: "Show me developers from Cork" or "Add John developer life science Dublin 50k"'
              }
              className="flex-1 px-4 py-3 bg-dark-200 text-white rounded-lg 
                       border border-dark-300 focus:border-blue-500 focus:outline-none
                       placeholder-gray-500 transition-colors"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className={`px-6 py-3 text-white rounded-lg transition-all duration-200 flex items-center gap-2
                       ${
                         pendingDeletion
                           ? 'bg-red-600 hover:bg-red-700'
                           : 'bg-blue-600 hover:bg-blue-700'
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
