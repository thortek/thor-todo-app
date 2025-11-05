# AI Chat Feature - Implementation Guide

## Overview
A real-time AI chat interface has been added to your Todo App, powered by Ollama running locally with the `gpt-oss` model using OpenAI-compatible API syntax.

## Architecture

### Backend Components

#### 1. **AI Service Layer** (`server/services/aiService.ts`)
- Configures OpenAI client to connect to Ollama
- Provides streaming and non-streaming chat completion functions
- Handles communication with local Ollama server on port 11434

#### 2. **Chat Controller** (`server/controllers/chatController.ts`)
- Handles POST requests to `/api/chat/stream`
- Implements Server-Sent Events (SSE) for real-time streaming
- Validates message format and handles errors gracefully

#### 3. **Chat Routes** (`server/routes/chatRoutes.ts`)
- Registers the `/api/chat/stream` endpoint
- Integrated into main Express server

### Frontend Components

#### 4. **Chat Model** (`src/chatModel.ts`)
- TypeScript interfaces for chat messages and streaming chunks
- Type safety for message roles (user, assistant, system)

#### 5. **Chat API Service** (`src/chatApiService.ts`)
- Handles streaming fetch requests to the backend
- Parses Server-Sent Events
- Provides callbacks for chunks, errors, and completion

#### 6. **Chat Viewer** (`src/chatViewer.ts`)
- Full chat UI with message bubbles
- Real-time streaming response display
- Auto-scroll, typing indicators, and clear chat functionality
- XSS protection with HTML escaping

#### 7. **Navigation** (`src/main.ts`)
- Tab-based navigation between Todos and Chat views
- Lazy initialization of chat interface
- Smooth view transitions

#### 8. **Styling** (`src/style.css`)
- Custom styles for navigation tabs
- Chat-specific scrollbar styling
- Responsive design elements

## Configuration

### Environment Variables (.env)
```env
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=gpt-oss
```

## Prerequisites

1. **Ollama must be running locally** on port 11434
2. The `gpt-oss` model must be installed in Ollama

### Installing and Running Ollama

```bash
# Install Ollama (if not already installed)
# Visit https://ollama.ai for installation instructions

# Pull the gpt-oss model
ollama pull gpt-oss

# Start Ollama (if not running)
ollama serve
```

## Running the Application

### Terminal 1: Start the Backend Server
```bash
npm run server
```

### Terminal 2: Start the Frontend Dev Server
```bash
npm run dev
```

## Using the Chat Feature

1. Open your browser to `http://localhost:5173`
2. Click the **💬 AI Chat** tab in the header
3. Type your message in the text area
4. Press **Send** or hit Enter to send
5. Watch the AI response stream in real-time
6. Use **Clear Chat** to start a new conversation

## Features

- ✅ Real-time streaming responses
- ✅ Message history maintained during session
- ✅ Typing indicators while AI responds
- ✅ Auto-scroll to latest messages
- ✅ Clear chat functionality
- ✅ Responsive design with Tailwind CSS
- ✅ Error handling and validation
- ✅ XSS protection

## API Endpoints

### POST `/api/chat/stream`
Streams AI chat responses using Server-Sent Events.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ]
}
```

**Response:** Server-Sent Events stream
```
data: {"content":"Hello"}
data: {"content":"!"}
data: {"content":" I'm"}
...
data: {"done":true}
```

## Troubleshooting

### Chat not responding
1. Verify Ollama is running: `curl http://localhost:11434/api/tags`
2. Check the `gpt-oss` model is installed
3. Review browser console for errors
4. Check server logs for API errors

### CORS Issues
The server is configured to accept requests from `http://localhost:5173`. If using a different port, update the CORS configuration in `server/index.ts`.

### Streaming Issues
Ensure your proxy/nginx is not buffering responses. The header `X-Accel-Buffering: no` is set to disable buffering.

## Next Steps / Future Enhancements

- Add conversation history persistence to database
- Support for multiple Ollama models with a dropdown selector
- System prompts for different conversation modes
- Export chat history
- Markdown rendering for code blocks
- Copy message functionality
- Conversation search

## File Structure

```
server/
├── services/
│   └── aiService.ts         # Ollama integration
├── controllers/
│   └── chatController.ts    # Request handling
├── routes/
│   └── chatRoutes.ts        # Route definitions
└── index.ts                 # Main server (updated)

src/
├── chatModel.ts             # TypeScript types
├── chatApiService.ts        # API client
├── chatViewer.ts            # UI components
├── main.ts                  # App navigation (updated)
└── style.css                # Styling (updated)
```

## Dependencies

- `openai` (v6.8.0+) - OpenAI client library (Ollama compatible)
- Express.js - Backend server
- TypeScript - Type safety
- Tailwind CSS - Styling
