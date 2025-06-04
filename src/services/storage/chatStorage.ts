import { ChatMessage } from '../../types';

// Simulate Tauri's filesystem API (in real Tauri, you'd use @tauri-apps/api/fs)
export const chatStorage = {
  async loadMessages(): Promise<ChatMessage[]> {
    try {
      const saved = localStorage.getItem('rolodex-chat-persistent');
      if (saved) {
        const messages = JSON.parse(saved);
        return messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      return [];
    }
  },

  async saveMessages(messages: ChatMessage[]): Promise<void> {
    try {
      localStorage.setItem('rolodex-chat-persistent', JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat messages:', error);
    }
  },

  async clearMessages(): Promise<void> {
    try {
      localStorage.removeItem('rolodex-chat-persistent');
    } catch (error) {
      console.error('Failed to clear chat messages:', error);
    }
  }
};
