import { generateImageAPI } from './imageGenApiService'
import type { ImageGenerationRequest } from './imageGenModel'

/**
 * Image generation viewer component
 * Provides UI for generating images with Flux-Schnell model
 */
export class ImageGenViewer {
  private container: HTMLElement
  private promptInput!: HTMLTextAreaElement
  private generateBtn!: HTMLButtonElement
  private modelSelect!: HTMLSelectElement
  private aspectRatioSelect!: HTMLSelectElement
  private stepsInput!: HTMLInputElement
  private guidanceInput!: HTMLInputElement
  private seedInput!: HTMLInputElement
  private imageDisplay!: HTMLDivElement
  private statusDiv!: HTMLDivElement
  private isGenerating: boolean = false

  constructor(containerId: string) {
    const container = document.getElementById(containerId)
    if (!container) {
      throw new Error(`Container with id "${containerId}" not found`)
    }
    this.container = container
    this.render()
    this.attachEventListeners()
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="image-gen-container">
        <div class="image-gen-header">
          <h2 class="text-2xl font-bold mb-4">🎨 AI Image Generation</h2>
          <p class="text-gray-600 mb-6">Generate images using Flux-Schnell model</p>
        </div>

        <div class="image-gen-controls">
          <!-- Prompt Input -->
          <div class="form-group mb-4">
            <label for="prompt-input" class="block text-sm font-medium text-gray-700 mb-2">
              Prompt
            </label>
            <textarea
              id="prompt-input"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the image you want to generate..."
            ></textarea>
          </div>

          <!-- Model Selection -->
          <div class="form-group mb-4">
            <label for="model-select" class="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <select id="model-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="flux-schnell" selected>Flux Schnell (Fastest - 1-4 steps, free)</option>
              <option value="flux-dev">Flux Dev (Balanced - Higher quality, more steps)</option>
              <option value="flux-1.1-pro">Flux 1.1 Pro (Best Quality - Slowest, premium)</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              💡 Schnell: Quick iterations • Dev: Production ready • Pro: Maximum detail
            </p>
          </div>

          <!-- Settings Grid -->
          <div class="settings-grid grid grid-cols-2 gap-4 mb-4">
            <!-- Aspect Ratio -->
            <div class="form-group">
              <label for="aspect-ratio-select" class="block text-sm font-medium text-gray-700 mb-2">
                Aspect Ratio
              </label>
              <select id="aspect-ratio-select" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="1:1" selected>1:1 (Square)</option>
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="21:9">21:9 (Ultrawide)</option>
                <option value="9:21">9:21 (Tall)</option>
                <option value="4:3">4:3 (Classic)</option>
                <option value="3:4">3:4 (Classic Portrait)</option>
                <option value="3:2">3:2 (Photo)</option>
                <option value="2:3">2:3 (Photo Portrait)</option>
                <option value="5:4">5:4 (Medium)</option>
                <option value="4:5">4:5 (Medium Portrait)</option>
              </select>
            </div>

            <!-- Inference Steps -->
            <div class="form-group">
              <label for="steps-input" class="block text-sm font-medium text-gray-700 mb-2">
                Inference Steps (1-50)
              </label>
              <input
                type="number"
                id="steps-input"
                min="1"
                max="50"
                value="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <!-- Guidance Scale -->
            <div class="form-group">
              <label for="guidance-input" class="block text-sm font-medium text-gray-700 mb-2">
                Guidance Scale (0-20)
              </label>
              <input
                type="number"
                id="guidance-input"
                min="0"
                max="20"
                step="0.1"
                value="3.5"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <!-- Seed (optional) -->
          <div class="form-group mb-4">
            <label for="seed-input" class="block text-sm font-medium text-gray-700 mb-2">
              Seed (optional, leave empty for random)
            </label>
            <input
              type="number"
              id="seed-input"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Random"
            />
          </div>

          <!-- Generate Button -->
          <button
            id="generate-btn"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🎨 Generate Image
          </button>

          <!-- Status -->
          <div id="status-div" class="mt-4 text-center text-sm"></div>
        </div>

        <!-- Image Display -->
        <div id="image-display" class="image-display mt-6"></div>
      </div>
    `

    // Cache DOM elements
    this.promptInput = this.container.querySelector('#prompt-input')!
    this.generateBtn = this.container.querySelector('#generate-btn')!
    this.modelSelect = this.container.querySelector('#model-select')!
    this.aspectRatioSelect = this.container.querySelector('#aspect-ratio-select')!
    this.stepsInput = this.container.querySelector('#steps-input')!
    this.guidanceInput = this.container.querySelector('#guidance-input')!
    this.seedInput = this.container.querySelector('#seed-input')!
    this.imageDisplay = this.container.querySelector('#image-display')!
    this.statusDiv = this.container.querySelector('#status-div')!
  }

  private attachEventListeners(): void {
    this.generateBtn.addEventListener('click', () => this.handleGenerate())
    
    // Allow Enter+Shift to generate (Enter alone for new line)
    this.promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.shiftKey && !this.isGenerating) {
        e.preventDefault()
        this.handleGenerate()
      }
    })
  }

  private async handleGenerate(): Promise<void> {
    const prompt = this.promptInput.value.trim()
    
    if (!prompt) {
      this.showStatus('Please enter a prompt', 'error')
      return
    }

    if (this.isGenerating) {
      return
    }

    const selectedModel = this.modelSelect.value
    const modelNames: { [key: string]: string } = {
      'flux-schnell': 'Flux Schnell',
      'flux-dev': 'Flux Dev',
      'flux-1.1-pro': 'Flux 1.1 Pro'
    }
    const modelName = modelNames[selectedModel] || 'Flux'

    this.isGenerating = true
    this.generateBtn.disabled = true
    this.generateBtn.textContent = '⏳ Generating...'
    this.showStatus(`Generating with ${modelName}... This may take 30-90 seconds.`, 'info')
    this.imageDisplay.innerHTML = ''

    try {
      // Parse aspect ratio to get width and height
      const aspectRatio = this.aspectRatioSelect.value
      const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number)
      
      // Base size calculation - use 1024 as base for 1:1
      const baseSize = 1024
      let width: number
      let height: number
      
      if (widthRatio > heightRatio) {
        // Landscape
        width = baseSize
        height = Math.round(baseSize * (heightRatio / widthRatio))
      } else if (heightRatio > widthRatio) {
        // Portrait
        height = baseSize
        width = Math.round(baseSize * (widthRatio / heightRatio))
      } else {
        // Square
        width = baseSize
        height = baseSize
      }

      const request: ImageGenerationRequest = {
        prompt,
        model: this.modelSelect.value,
        width,
        height,
        numInferenceSteps: parseInt(this.stepsInput.value),
        guidanceScale: parseFloat(this.guidanceInput.value),
      }

      // Add seed if provided
      const seedValue = this.seedInput.value.trim()
      if (seedValue) {
        request.seed = parseInt(seedValue)
      }

      const response = await generateImageAPI(request)

      if (response.success && response.images.length > 0) {
        this.displayImages(response.images, response.prompt)
        this.showStatus('Image generated successfully!', 'success')
      } else {
        throw new Error('No images returned')
      }
    } catch (error) {
      console.error('Generation error:', error)
      this.showStatus(
        `Error: ${error instanceof Error ? error.message : 'Failed to generate image'}`,
        'error'
      )
    } finally {
      this.isGenerating = false
      this.generateBtn.disabled = false
      this.generateBtn.textContent = '🎨 Generate Image'
    }
  }

  private displayImages(imageUrls: string[], prompt: string): void {
    this.imageDisplay.innerHTML = `
      <div class="generated-images">
        <h3 class="text-lg font-semibold mb-3">Generated Image</h3>
        <p class="text-sm text-gray-600 mb-4"><strong>Prompt:</strong> ${this.escapeHtml(prompt)}</p>
        ${imageUrls.map(url => `
          <div class="image-wrapper mb-4">
            <img src="${url}" alt="Generated image" class="generated-image rounded-lg shadow-lg" />
            <div class="image-actions mt-2">
              <a href="${url}" target="_blank" class="text-blue-600 hover:underline text-sm">
                Open in new tab
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  private showStatus(message: string, type: 'info' | 'success' | 'error'): void {
    const colors = {
      info: 'text-blue-600',
      success: 'text-green-600',
      error: 'text-red-600'
    }
    this.statusDiv.className = `mt-4 text-center text-sm ${colors[type]}`
    this.statusDiv.textContent = message
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  public destroy(): void {
    this.container.innerHTML = ''
  }
}
