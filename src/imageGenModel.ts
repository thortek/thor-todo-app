/**
 * TypeScript interfaces for image generation feature
 */

export interface ImageGenerationRequest {
  prompt: string
  model?: string
  width?: number
  height?: number
  numOutputs?: number
  numInferenceSteps?: number
  guidanceScale?: number
  seed?: number
}

export interface ImageGenerationResponse {
  success: boolean
  images: string[]
  prompt: string
}

export interface ImageGenerationError {
  error: string
  details?: string
}
