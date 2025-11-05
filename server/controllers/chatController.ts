import { Request, Response } from 'express'
import { streamChatCompletion, ChatMessage } from '../services/aiService.js'

// POST /api/chat/stream
export async function streamChat(req: Request, res: Response) {
  try {
    const { messages } = req.body

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    // Validate message format
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return res.status(400).json({ error: 'Each message must have role and content' })
      }
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        return res.status(400).json({ error: 'Invalid message role' })
      }
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no') // Disable buffering for nginx

    // Stream the response
    try {
      for await (const chunk of streamChatCompletion(messages as ChatMessage[])) {
        // Send each chunk as a Server-Sent Event
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
      }

      // Send done signal
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
      res.end()
    } catch (streamError) {
      console.error('Streaming error:', streamError)
      res.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`)
      res.end()
    }
  } catch (error) {
    console.error('Error in streamChat:', error)
    
    // If headers haven't been sent yet, send error response
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat request' })
    } else {
      // If streaming already started, send error event
      res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`)
      res.end()
    }
  }
}
