import type { ImageGenerationRequest, ImageGenerationResponse, ImageGenerationError } from './imageGenModel'

const API_BASE_URL = 'http://localhost:3100/api'

/**
 * Generate an image using the Flux-Schnell model
 * @param request - Image generation parameters
 * @returns Promise with generated image URLs or error
 */
export async function generateImageAPI(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/image-gen/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData: ImageGenerationError = await response.json()
      throw new Error(errorData.error || 'Failed to generate image')
    }

    const data: ImageGenerationResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error generating image:', error)
    throw error
  }
}
