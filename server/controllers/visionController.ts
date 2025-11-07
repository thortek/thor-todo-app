import { Request, Response } from 'express'
import { analyzeImageStream } from '../services/aiService.js'

// POST /api/vision/analyze
export async function analyzeImageHandler(req: Request, res: Response) {
  try {
    const { imageData, prompt } = req.body

    // Validate request
    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' })
    }

    // Validate that it's a base64 image
    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format. Must be base64 encoded image.' })
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    // Stream the analysis response
    try {
      for await (const chunk of analyzeImageStream(imageData, prompt)) {
        // Send each chunk as a Server-Sent Event
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
      }

      // Send done signal
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
      res.end()
    } catch (streamError) {
      console.error('Streaming error:', streamError)
      res.write(`data: ${JSON.stringify({ error: 'Analysis failed' })}\n\n`)
      res.end()
    }
  } catch (error) {
    console.error('Error in analyzeImageHandler:', error)
    
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process image analysis request' })
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`)
      res.end()
    }
  }
}
