import OpenAI from 'openai'
import Replicate from 'replicate'
import dotenv from 'dotenv'

dotenv.config()

// Initialize OpenAI client to connect to Ollama
const openai = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
  apiKey: 'ollama', // Ollama doesn't require a real API key
})

// Initialize Replicate client for image generation
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface VisionMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | Array<{type: 'text', text: string} | {type: 'image_url', image_url: {url: string}}>
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

/**
 * Analyze an image with vision model
 * @param imageBase64 - Base64 encoded image data (with data:image prefix)
 * @param prompt - Optional prompt for analysis
 * @returns Analysis result
 */
export async function analyzeImage(
  imageBase64: string,
  prompt: string = 'Describe this image in detail.'
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OLLAMA_VISION_MODEL || 'llava',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        }
      ] as any,
      stream: false,
      temperature: 0.7,
      max_tokens: 1000,
    })

    return response.choices[0]?.message?.content || 'No analysis available'
  } catch (error) {
    console.error('Error in analyzeImage:', error)
    throw new Error('Failed to analyze image')
  }
}

/**
 * Analyze an image with streaming enabled
 * @param imageBase64 - Base64 encoded image data (with data:image prefix)
 * @param prompt - Optional prompt for analysis
 * @returns Async generator that yields streaming response chunks
 */
export async function* analyzeImageStream(
  imageBase64: string,
  prompt: string = 'Describe this image in detail.'
): AsyncGenerator<string, void, unknown> {
  try {
    const stream = await openai.chat.completions.create({
      model: process.env.OLLAMA_VISION_MODEL || 'llava',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        }
      ] as any,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  } catch (error) {
    console.error('Error in analyzeImageStream:', error)
    throw new Error('Failed to stream image analysis')
  }
}

export interface ImageGenerationOptions {
  prompt: string
  model?: string
  width?: number
  height?: number
  numOutputs?: number
  numInferenceSteps?: number
  guidanceScale?: number
  seed?: number
}

/**
 * Generate an image using Flux-Schnell model via Replicate
 * @param options - Image generation parameters
 * @returns URL of the generated image
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<string[]> {
  try {
    const {
      prompt,
      model = 'flux-schnell',
      width = 1024,
      height = 1024,
      numOutputs = 1,
      numInferenceSteps = 4,
      guidanceScale = 3.5,
      seed
    } = options

    const allowMultipleOutputs = model === 'flux-schnell'
    const outputsToRequest = allowMultipleOutputs
      ? Math.min(Math.max(numOutputs ?? 1, 1), 4)
      : 1

    // Map model names to Replicate model identifiers
    const modelMap: { [key: string]: string } = {
      'flux-schnell': 'black-forest-labs/flux-schnell',
      'flux-dev': 'black-forest-labs/flux-dev',
      'flux-1.1-pro': 'black-forest-labs/flux-1.1-pro',
      'flux-2-pro': 'black-forest-labs/flux-2-pro'
    }

    const replicateModel = modelMap[model] || modelMap['flux-schnell']

    // Calculate aspect ratio from width and height
    // Flux-Schnell supports: 1:1, 16:9, 21:9, 3:2, 2:3, 4:5, 5:4, 3:4, 4:3, 9:16, 9:21
    let aspectRatio = '1:1'
    if (width && height) {
      const ratio = width / height
      if (Math.abs(ratio - 1) < 0.1) aspectRatio = '1:1'
      else if (Math.abs(ratio - 16/9) < 0.1) aspectRatio = '16:9'
      else if (Math.abs(ratio - 21/9) < 0.1) aspectRatio = '21:9'
      else if (Math.abs(ratio - 3/2) < 0.1) aspectRatio = '3:2'
      else if (Math.abs(ratio - 2/3) < 0.1) aspectRatio = '2:3'
      else if (Math.abs(ratio - 4/5) < 0.1) aspectRatio = '4:5'
      else if (Math.abs(ratio - 5/4) < 0.1) aspectRatio = '5:4'
      else if (Math.abs(ratio - 3/4) < 0.1) aspectRatio = '3:4'
      else if (Math.abs(ratio - 4/3) < 0.1) aspectRatio = '4:3'
      else if (Math.abs(ratio - 9/16) < 0.1) aspectRatio = '9:16'
      else if (Math.abs(ratio - 9/21) < 0.1) aspectRatio = '9:21'
    }

    // Flux 2 Pro has different parameters than other Flux models
    let input: any
    if (model === 'flux-2-pro') {
      input = {
        prompt,
        aspect_ratio: aspectRatio,
        output_format: 'png',
        safety_tolerance: 2
      }
      if (seed !== undefined) {
        input.seed = seed
      }
    } else {
      input = {
        prompt,
        aspect_ratio: aspectRatio,
        num_outputs: outputsToRequest,
        num_inference_steps: numInferenceSteps,
        go_fast: model === 'flux-schnell',
        guidance: guidanceScale,
        output_format: 'png',
        output_quality: 80,
        disable_safety_checker: false
      }
      if (seed !== undefined) {
        input.seed = seed
      }
    }

  console.log(`Generating image with model: ${replicateModel}`)
  console.log(`Input params:`, JSON.stringify(input, null, 2))

    const output = await replicate.run(
      replicateModel as `${string}/${string}`,
      { input }
    )

    // Replicate returns an array of FileOutput objects or strings
    // Ensure we return an array of URL strings
    if (Array.isArray(output)) {
      return output.map(item => 
        typeof item === 'string' ? item : item.toString()
      )
    } else if (output) {
      // Single output case
      return [typeof output === 'string' ? output : output.toString()]
    }
    
    throw new Error('No output received from Replicate')
  } catch (error) {
    console.error('Error in generateImage:', error)
    throw new Error('Failed to generate image')
  }
}
