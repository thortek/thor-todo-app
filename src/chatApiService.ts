import type { ChatMessage, StreamChunk } from './chatModel'

const API_BASE_URL = 'http://localhost:3100/api'

/**
 * Stream chat completion from the API
 * @param messages - Array of chat messages
 * @param onChunk - Callback for each content chunk received
 * @param onError - Callback for errors
 * @param onComplete - Callback when streaming is complete
 */
export async function streamChatAPI(
  messages: ChatMessage[],
  onChunk: (content: string) => void,
  onError: (error: string) => void,
  onComplete: () => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('Response body is null')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      // Decode the chunk
      const chunk = decoder.decode(value, { stream: true })
      
      // Parse Server-Sent Events
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6) // Remove 'data: ' prefix
          
          try {
            const parsed: StreamChunk = JSON.parse(data)
            
            if (parsed.error) {
              onError(parsed.error)
              return
            }
            
            if (parsed.done) {
              onComplete()
              return
            }
            
            if (parsed.content) {
              onChunk(parsed.content)
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in streamChatAPI:', error)
    onError(error instanceof Error ? error.message : 'Failed to stream chat')
  }
}
