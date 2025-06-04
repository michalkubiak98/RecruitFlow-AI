import { useState, useEffect, useCallback } from 'react'
import { ChatMessage } from '../types'

const CHAT_STORAGE_KEY = 'rolodex-chat-persistent'

// Global state to maintain persistence across component mounts
let globalMessages: ChatMessage[] = []
let isInitialized = false

// Simple storage functions
const saveToStorage = (messages: ChatMessage[]) => {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
    console.log('💾 Saved', messages.length, 'chat messages to storage')
  } catch (error) {
    console.error('Failed to save chat messages:', error)
  }
}

const loadFromStorage = (): ChatMessage[] => {
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
    }
  } catch (error) {
    console.error('Failed to load chat messages:', error)
  }
  return []
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Initialize messages on first mount
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 Initializing chat messages...')
      const savedMessages = loadFromStorage()
      globalMessages = savedMessages
      isInitialized = true
      console.log('✅ Loaded', savedMessages.length, 'messages from storage')
    }

    // Always sync with global state
    setMessages([...globalMessages])
    setIsLoading(false)
  }, [])

  // Update both local and global state, then save
  const updateGlobalMessages = useCallback((newMessages: ChatMessage[]) => {
    globalMessages = newMessages
    setMessages([...newMessages]) // Force re-render with new array
    saveToStorage(newMessages)
  }, [])

  const addMessage = useCallback(
    (message: ChatMessage) => {
      console.log(
        '📝 Adding message:',
        message.content.substring(0, 50) + '...'
      )
      const updatedMessages = [...globalMessages, message]
      updateGlobalMessages(updatedMessages)
    },
    [updateGlobalMessages]
  )

  const clearChat = useCallback(() => {
    console.log('🗑️ Clearing all chat messages')
    updateGlobalMessages([])
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }, [updateGlobalMessages])

  return {
    messages,
    addMessage,
    clearChat,
    isLoading,
  }
}
