import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

// Initialize OpenAI client to connect to Ollama
const openai = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
  apiKey: 'ollama', // Ollama doesn't require a real API key
})

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Send a chat completion request with streaming enabled
 * @param messages - Array of chat messages
 * @returns Async generator that yields streaming response chunks
 */
export async function* streamChatCompletion(
  messages: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
  try {
    const stream = await openai.chat.completions.create({
      model: process.env.OLLAMA_MODEL || 'gpt-oss',
      messages: messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  } catch (error) {
    console.error('Error in streamChatCompletion:', error)
    throw new Error('Failed to stream chat completion')
  }
}

/**
 * Send a non-streaming chat completion request
 * @param messages - Array of chat messages
 * @returns The complete response content
 */
export async function getChatCompletion(
  messages: ChatMessage[]
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OLLAMA_MODEL || 'gpt-oss',
      messages: messages,
      stream: false,
      temperature: 0.7,
      max_tokens: 2000,
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error in getChatCompletion:', error)
    throw new Error('Failed to get chat completion')
  }
}
