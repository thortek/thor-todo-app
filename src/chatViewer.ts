import type { ChatMessage } from './chatModel'
import { streamChatAPI } from './chatApiService'

let messages: ChatMessage[] = []
let isStreaming = false

/**
 * Initialize the chat viewer
 */
export function initChatViewer(): void {
  renderChatInterface()
  setupChatEventListeners()
}

/**
 * Render the chat interface HTML
 */
function renderChatInterface(): void {
  const chatContainer = document.querySelector<HTMLDivElement>('#chat-container')
  if (!chatContainer) return

  chatContainer.innerHTML = `
    <div class="chat-viewer bg-white rounded-lg shadow-md flex flex-col h-[600px]">
      <!-- Chat Header -->
      <div class="chat-header bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg">
        <h2 class="text-xl font-semibold">AI Chat Assistant</h2>
        <p class="text-sm text-blue-100">Powered by Ollama (gpt-oss)</p>
      </div>

      <!-- Messages Container -->
      <div id="chat-messages" class="chat-messages flex-1 overflow-y-auto p-6 space-y-4">
        <div class="text-center text-gray-500 text-sm">
          Start a conversation by typing a message below.
        </div>
      </div>

      <!-- Input Area -->
      <div class="chat-input-area border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
        <div class="flex gap-2">
          <textarea
            id="chat-input"
            class="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            rows="2"
          ></textarea>
          <button
            id="send-btn"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <div class="flex justify-between items-center mt-2">
          <button
            id="clear-chat-btn"
            class="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear Chat
          </button>
          <span id="streaming-indicator" class="text-sm text-gray-500 hidden">
            <span class="inline-block animate-pulse">●</span> AI is typing...
          </span>
        </div>
      </div>
    </div>
  `
}

/**
 * Setup event listeners for chat interface
 */
function setupChatEventListeners(): void {
  const input = document.querySelector<HTMLTextAreaElement>('#chat-input')
  const sendBtn = document.querySelector<HTMLButtonElement>('#send-btn')
  const clearBtn = document.querySelector<HTMLButtonElement>('#clear-chat-btn')

  if (!input || !sendBtn || !clearBtn) return

  // Send message on button click
  sendBtn.addEventListener('click', () => {
    handleSendMessage()
  })

  // Send message on Enter (Shift+Enter for new line)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  })

  // Clear chat
  clearBtn.addEventListener('click', () => {
    messages = []
    renderMessages()
  })
}

/**
 * Handle sending a message
 */
async function handleSendMessage(): Promise<void> {
  if (isStreaming) return

  const input = document.querySelector<HTMLTextAreaElement>('#chat-input')
  const sendBtn = document.querySelector<HTMLButtonElement>('#send-btn')
  
  if (!input || !sendBtn) return

  const content = input.value.trim()
  if (!content) return

  // Add user message
  const userMessage: ChatMessage = {
    role: 'user',
    content,
    timestamp: new Date(),
  }
  messages.push(userMessage)
  
  // Clear input
  input.value = ''
  
  // Update UI
  renderMessages()
  scrollToBottom()
  
  // Disable input while streaming
  isStreaming = true
  input.disabled = true
  sendBtn.disabled = true
  showStreamingIndicator(true)

  // Create placeholder for assistant response
  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: '',
    timestamp: new Date(),
  }
  messages.push(assistantMessage)
  renderMessages()

  // Stream the response
  await streamChatAPI(
    messages.slice(0, -1), // Send all messages except the empty assistant one
    (chunk: string) => {
      // Append chunk to the last message
      assistantMessage.content += chunk
      updateLastMessage(assistantMessage.content)
      scrollToBottom()
    },
    (error: string) => {
      // Handle error
      assistantMessage.content = `Error: ${error}`
      updateLastMessage(assistantMessage.content)
      console.error('Chat error:', error)
      enableInput()
    },
    () => {
      // Complete
      enableInput()
    }
  )
}

/**
 * Render all messages
 */
function renderMessages(): void {
  const messagesContainer = document.querySelector<HTMLDivElement>('#chat-messages')
  if (!messagesContainer) return

  if (messages.length === 0) {
    messagesContainer.innerHTML = `
      <div class="text-center text-gray-500 text-sm">
        Start a conversation by typing a message below.
      </div>
    `
    return
  }

  messagesContainer.innerHTML = messages
    .map((msg) => createMessageHTML(msg))
    .join('')
}

/**
 * Update the last message content (for streaming)
 */
function updateLastMessage(content: string): void {
  const messagesContainer = document.querySelector<HTMLDivElement>('#chat-messages')
  if (!messagesContainer) return

  const lastMessage = messagesContainer.lastElementChild
  if (lastMessage) {
    const contentDiv = lastMessage.querySelector('.message-content')
    if (contentDiv) {
      contentDiv.textContent = content
    }
  }
}

/**
 * Create HTML for a single message
 */
function createMessageHTML(message: ChatMessage): string {
  const isUser = message.role === 'user'
  const alignment = isUser ? 'justify-end' : 'justify-start'
  const bgColor = isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
  const roundedClass = isUser ? 'rounded-l-lg rounded-tr-lg' : 'rounded-r-lg rounded-tl-lg'
  
  return `
    <div class="flex ${alignment}">
      <div class="${bgColor} ${roundedClass} px-4 py-2 max-w-[70%] break-words">
        <div class="message-content whitespace-pre-wrap">${escapeHtml(message.content)}</div>
      </div>
    </div>
  `
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom(): void {
  const messagesContainer = document.querySelector<HTMLDivElement>('#chat-messages')
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }
}

/**
 * Show/hide streaming indicator
 */
function showStreamingIndicator(show: boolean): void {
  const indicator = document.querySelector<HTMLSpanElement>('#streaming-indicator')
  if (indicator) {
    indicator.classList.toggle('hidden', !show)
  }
}

/**
 * Enable input after streaming completes
 */
function enableInput(): void {
  const input = document.querySelector<HTMLTextAreaElement>('#chat-input')
  const sendBtn = document.querySelector<HTMLButtonElement>('#send-btn')
  
  if (input && sendBtn) {
    input.disabled = false
    sendBtn.disabled = false
    input.focus()
  }
  
  isStreaming = false
  showStreamingIndicator(false)
}
