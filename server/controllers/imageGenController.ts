import { Request, Response } from 'express'
import { generateImage } from '../services/aiService.js'

/**
 * Controller for handling image generation requests
 */
export async function generateImageHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { 
      prompt, 
      model,
      width, 
      height, 
      numOutputs, 
      numInferenceSteps, 
      guidanceScale, 
      seed 
    } = req.body

    if (!prompt) {
      res.status(400).json({ 
        error: 'Prompt is required' 
      })
      return
    }

    // Set headers for JSON response
    res.setHeader('Content-Type', 'application/json')
    
    // Generate the image(s)
    const imageUrls = await generateImage({
      prompt,
      model,
      width,
      height,
      numOutputs,
      numInferenceSteps,
      guidanceScale,
      seed
    })

    // Send the image URLs back to the client
    res.json({
      success: true,
      images: imageUrls,
      prompt
    })
  } catch (error) {
    console.error('Error in generateImageHandler:', error)
    res.status(500).json({
      error: 'Failed to generate image',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
