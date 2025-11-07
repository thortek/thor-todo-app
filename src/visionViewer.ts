import { analyzeImageAPI } from './visionApiService'
import { ANALYSIS_PROMPTS } from './visionModel'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'

let currentImage: string | null = null
let isAnalyzing = false
let analysisResult = ''

// Configure marked for vision results (same as chat)
const renderer = new marked.Renderer()
renderer.code = function(this: any, token: any) {
  const code = token.text
  const lang = token.lang
  
  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(code, { language: lang }).value
      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`
    } catch (err) {
      console.error('Highlight error:', err)
    }
  }
  
  const highlighted = hljs.highlightAuto(code).value
  return `<pre><code class="hljs">${highlighted}</code></pre>`
}
marked.use({ renderer })

/**
 * Initialize the vision viewer
 */
export function initVisionViewer(): void {
  renderVisionInterface()
  setupVisionEventListeners()
}

/**
 * Render the vision interface HTML
 */
function renderVisionInterface(): void {
  const visionContainer = document.querySelector<HTMLDivElement>('#vision-container')
  if (!visionContainer) return

  visionContainer.innerHTML = `
    <div class="vision-viewer bg-white rounded-lg shadow-md p-6">
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">🔍 AI Image Analysis</h2>
        <p class="text-gray-600">Upload an image and let the AI describe what it sees</p>
        <p class="text-sm text-gray-500 mt-1">Powered by Ollama (llava vision model)</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left: Image Upload -->
        <div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
            <div class="flex items-center justify-center w-full">
              <label for="image-upload" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div id="upload-prompt" class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                  <p class="text-xs text-gray-500">PNG, JPG, GIF, WebP (MAX. 10MB)</p>
                </div>
                <div id="image-preview" class="hidden w-full h-full p-2">
                  <img id="preview-img" class="w-full h-full object-contain rounded" alt="Preview" />
                </div>
                <input id="image-upload" type="file" class="hidden" accept="image/*" />
              </label>
            </div>
          </div>

          <!-- Analysis Type Selection -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Analysis Type</label>
            <select id="analysis-type" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="describe">General Description</option>
              <option value="objects">Identify Objects</option>
              <option value="text">Extract Text (OCR)</option>
              <option value="colors">Color Analysis</option>
              <option value="technical">Technical Analysis</option>
              <option value="creative">Creative Caption</option>
              <option value="accessibility">Accessibility Description</option>
              <option value="custom">Custom Prompt...</option>
            </select>
          </div>

          <!-- Custom Prompt (hidden by default) -->
          <div id="custom-prompt-container" class="mb-4 hidden">
            <label class="block text-sm font-medium text-gray-700 mb-2">Custom Prompt</label>
            <textarea 
              id="custom-prompt"
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
              placeholder="Enter your custom analysis prompt..."
            ></textarea>
          </div>

          <!-- Analyze Button -->
          <button
            id="analyze-btn"
            class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled
          >
            Analyze Image
          </button>

          <button
            id="clear-vision-btn"
            class="w-full mt-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Clear All
          </button>
        </div>

        <!-- Right: Analysis Results -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Analysis Results</label>
          <div id="analysis-results" class="bg-gray-50 rounded-lg p-4 h-[520px] overflow-y-auto border border-gray-200">
            <div class="text-center text-gray-500 text-sm">
              Upload an image and click "Analyze" to see results here.
            </div>
          </div>
          <div id="analysis-indicator" class="mt-2 text-sm text-gray-500 hidden">
            <span class="inline-block animate-pulse">●</span> Analyzing image...
          </div>
        </div>
      </div>
    </div>
  `
}

/**
 * Setup event listeners
 */
function setupVisionEventListeners(): void {
  const fileInput = document.querySelector<HTMLInputElement>('#image-upload')
  const analyzeBtn = document.querySelector<HTMLButtonElement>('#analyze-btn')
  const clearBtn = document.querySelector<HTMLButtonElement>('#clear-vision-btn')
  const analysisType = document.querySelector<HTMLSelectElement>('#analysis-type')

  if (!fileInput || !analyzeBtn || !clearBtn || !analysisType) return

  // File upload
  fileInput.addEventListener('change', handleImageUpload)

  // Analyze button
  analyzeBtn.addEventListener('click', handleAnalyze)

  // Clear button
  clearBtn.addEventListener('click', handleClear)

  // Analysis type change
  analysisType.addEventListener('change', () => {
    const customContainer = document.querySelector<HTMLDivElement>('#custom-prompt-container')
    if (customContainer) {
      customContainer.classList.toggle('hidden', analysisType.value !== 'custom')
    }
  })
}

/**
 * Handle image upload
 */
function handleImageUpload(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    alert('Image size must be less than 10MB')
    return
  }

  // Read file as base64
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target?.result as string
    currentImage = base64

    // Show preview
    const uploadPrompt = document.querySelector('#upload-prompt')
    const imagePreview = document.querySelector('#image-preview')
    const previewImg = document.querySelector<HTMLImageElement>('#preview-img')

    if (uploadPrompt && imagePreview && previewImg) {
      uploadPrompt.classList.add('hidden')
      imagePreview.classList.remove('hidden')
      previewImg.src = base64
    }

    // Enable analyze button
    const analyzeBtn = document.querySelector<HTMLButtonElement>('#analyze-btn')
    if (analyzeBtn) {
      analyzeBtn.disabled = false
    }
  }
  reader.readAsDataURL(file)
}

/**
 * Handle analyze button click
 */
async function handleAnalyze(): Promise<void> {
  if (!currentImage || isAnalyzing) return

  const analysisType = document.querySelector<HTMLSelectElement>('#analysis-type')
  const customPrompt = document.querySelector<HTMLTextAreaElement>('#custom-prompt')
  const analyzeBtn = document.querySelector<HTMLButtonElement>('#analyze-btn')

  if (!analysisType || !analyzeBtn) return

  // Get prompt
  let prompt: string
  if (analysisType.value === 'custom') {
    prompt = customPrompt?.value.trim() || ANALYSIS_PROMPTS.describe
  } else {
    prompt = ANALYSIS_PROMPTS[analysisType.value as keyof typeof ANALYSIS_PROMPTS] || ANALYSIS_PROMPTS.describe
  }

  // Reset results
  analysisResult = ''
  renderResults()

  // Disable button and show indicator
  isAnalyzing = true
  analyzeBtn.disabled = true
  showAnalysisIndicator(true)

  // Stream analysis
  await analyzeImageAPI(
    { imageData: currentImage, prompt },
    (chunk: string) => {
      analysisResult += chunk
      renderResults()
      scrollResultsToBottom()
    },
    (error: string) => {
      analysisResult = `Error: ${error}`
      renderResults()
      enableAnalyzeButton()
    },
    () => {
      enableAnalyzeButton()
    }
  )
}

/**
 * Handle clear button
 */
function handleClear(): void {
  currentImage = null
  analysisResult = ''
  isAnalyzing = false

  // Reset file input
  const fileInput = document.querySelector<HTMLInputElement>('#image-upload')
  if (fileInput) {
    fileInput.value = ''
  }

  // Hide preview, show upload prompt
  const uploadPrompt = document.querySelector('#upload-prompt')
  const imagePreview = document.querySelector('#image-preview')

  if (uploadPrompt && imagePreview) {
    uploadPrompt.classList.remove('hidden')
    imagePreview.classList.add('hidden')
  }

  // Disable analyze button
  const analyzeBtn = document.querySelector<HTMLButtonElement>('#analyze-btn')
  if (analyzeBtn) {
    analyzeBtn.disabled = true
  }

  // Clear results
  renderResults()
}

/**
 * Render analysis results
 */
function renderResults(): void {
  const resultsContainer = document.querySelector<HTMLDivElement>('#analysis-results')
  if (!resultsContainer) return

  if (!analysisResult) {
    resultsContainer.innerHTML = `
      <div class="text-center text-gray-500 text-sm">
        Upload an image and click "Analyze" to see results here.
      </div>
    `
  } else {
    resultsContainer.innerHTML = `<div class="markdown-body">${renderMarkdown(analysisResult)}</div>`
  }
}

/**
 * Render markdown to sanitized HTML
 */
function renderMarkdown(markdown: string): string {
  try {
    const html = marked.parse(markdown) as string
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'a', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'table',
        'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div'
      ],
      ALLOWED_ATTR: ['href', 'class', 'target', 'rel']
    })
  } catch (err) {
    console.error('Markdown render error:', err)
    return markdown
  }
}

/**
 * Scroll results to bottom
 */
function scrollResultsToBottom(): void {
  const resultsContainer = document.querySelector<HTMLDivElement>('#analysis-results')
  if (resultsContainer) {
    resultsContainer.scrollTop = resultsContainer.scrollHeight
  }
}

/**
 * Show/hide analysis indicator
 */
function showAnalysisIndicator(show: boolean): void {
  const indicator = document.querySelector<HTMLDivElement>('#analysis-indicator')
  if (indicator) {
    indicator.classList.toggle('hidden', !show)
  }
}

/**
 * Enable analyze button
 */
function enableAnalyzeButton(): void {
  const analyzeBtn = document.querySelector<HTMLButtonElement>('#analyze-btn')
  if (analyzeBtn && currentImage) {
    analyzeBtn.disabled = false
  }
  isAnalyzing = false
  showAnalysisIndicator(false)
}
