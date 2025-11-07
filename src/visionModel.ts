// Vision analysis request
export interface VisionAnalysisRequest {
  imageData: string // Base64 encoded image with data:image prefix
  prompt?: string
}

// Vision analysis response chunk (streaming)
export interface VisionStreamChunk {
  content?: string
  done?: boolean
  error?: string
}

// Pre-defined analysis prompts
export const ANALYSIS_PROMPTS = {
  describe: 'Describe this image in detail.',
  objects: 'List all the objects you can identify in this image.',
  text: 'Extract and read any text visible in this image.',
  colors: 'Describe the color palette and mood of this image.',
  technical: 'Provide a technical analysis of this image, including composition, lighting, and quality.',
  creative: 'Write a creative, imaginative story or caption for this image.',
  accessibility: 'Describe this image in a way that would be helpful for someone who cannot see it.',
}
