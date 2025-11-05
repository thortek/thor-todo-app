## Implementation Plan: AI Chat Feature

### Phase 1: Backend Infrastructure

#### 1.1 Install Required Dependencies
```bash
npm install openai
npm install --save-dev @types/node
```

#### 1.2 Environment Configuration
Add to your .env file:
```env
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2  # or whatever model you're running
```

#### 1.3 Create AI Service Layer
**File: `server/services/aiService.ts`**
- Create a service to interface with Ollama using OpenAI-compatible API
- Handle streaming responses
- Error handling and retry logic

#### 1.4 Create Chat Controller
**File: `server/controllers/chatController.ts`**
- Handle chat message endpoints
- Support both regular and streaming responses
- Message validation and sanitization

#### 1.5 Create Chat Routes  
**File: `server/routes/chatRoutes.ts`**
- `POST /api/chat/message` - Send a message and get response
- `POST /api/chat/stream` - Send a message and get streaming response
- `GET /api/chat/models` - Get available models (optional)

#### 1.6 Update Main Server
**File: index.ts**
- Import and register chat routes
- Add any necessary middleware for streaming

### Phase 2: Database Schema (Optional)
If you want to persist chat history:

#### 2.1 Prisma Schema Update
**File: schema.prisma**
```prisma
model ChatSession {
  id        String   @id @default(uuid())
  title     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  messages  ChatMessage[]
}

model ChatMessage {
  id          String      @id @default(uuid())
  content     String
  role        String      // "user" or "assistant"
  timestamp   DateTime    @default(now())
  sessionId   String
  session     ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}
```

### Phase 3: Frontend Implementation

#### 3.1 Create Chat Types
**File: `src/chatModel.ts`**
- Define TypeScript interfaces for chat messages, sessions, API responses

#### 3.2 Create Chat API Service
**File: `src/chatApiService.ts`**
- API calls to chat endpoints
- Handle streaming responses
- Error handling

#### 3.3 Create Chat UI Components
**File: `src/chatViewer.ts`**
- Chat interface with message bubbles
- Input field and send button
- Auto-scroll to newest messages
- Typing indicators
- Loading states

#### 3.4 Update Main Application
**File: main.ts**
- Add navigation between todo and chat views
- Initialize chat functionality

#### 3.5 Add Styling
**File: style.css**
- Chat-specific CSS classes
- Message bubble styling
- Responsive design

### Phase 4: Routing & Navigation

#### 4.1 Client-Side Routing
Since you don't appear to have a router, you'll need:
- Simple hash-based routing or state management
- Navigation between todo list and chat views
- URL handling for deep linking

#### 4.2 UI Navigation
- Add a navigation header or sidebar
- Toggle between "Todos" and "Chat" views
- Preserve state when switching views

### Questions for You:

1. **Model Selection**: What specific Ollama model are you running? (llama3.2, codellama, etc.)

2. **Chat Persistence**: Do you want to save chat history to the database, or keep it session-only?

3. **UI Integration**: Would you prefer:
   - A separate chat page/view that you navigate to?
   - A chat sidebar that's always visible?
   - A modal/popup chat interface?

4. **Streaming**: Do you want real-time streaming responses (like ChatGPT) or simple request/response?

5. **Authentication**: Any authentication/authorization needed for the chat feature?

6. **Context**: Should the AI have any context about the user's todos, or should it be a general-purpose chat?

Once you answer these questions, I can provide more specific implementation details and start generating the actual code files for you. Would you like me to begin with any particular phase, or do you have preferences about the architecture decisions mentioned above?