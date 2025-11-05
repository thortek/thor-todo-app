// Chat message interface
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}

// Response from streaming endpoint
export interface StreamChunk {
  content?: string
  done?: boolean
  error?: string
}
