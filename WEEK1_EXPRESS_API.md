# Week 1: Express API Server Implementation

## Goal
Build a RESTful API server using Express.js and TypeScript that serves the todo/category functionality currently in `todoModel.ts`.

---

## Part 1: Project Setup

### 1.1 Install Dependencies

Install Express and its TypeScript types:

```bash
npm install express cors
npm install --save-dev @types/express @types/cors @types/node tsx nodemon
```

**Packages explained:**
- `express`: Web framework for Node.js
- `cors`: Enable Cross-Origin Resource Sharing (allows frontend to call API)
- `@types/express`, `@types/cors`, `@types/node`: TypeScript type definitions
- `tsx`: Run TypeScript files directly in Node.js
- `nodemon`: Auto-restart server on file changes

### 1.2 Update package.json Scripts

Add server scripts to `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "server": "nodemon --watch server --exec tsx server/index.ts",
  "server:build": "tsc --project tsconfig.server.json"
}
```

### 1.3 Create Server Directory Structure

```bash
mkdir server
mkdir server/routes
mkdir server/controllers
mkdir server/models
```

Your project structure will look like:
```
thor-todo-app/
├── server/              # Backend API
│   ├── index.ts         # Express server entry point
│   ├── models/
│   │   └── todoStore.ts # Data store (copied from todoModel.ts logic)
│   ├── controllers/
│   │   ├── todoController.ts
│   │   └── categoryController.ts
│   └── routes/
│       ├── todoRoutes.ts
│       └── categoryRoutes.ts
├── src/                 # Frontend (existing)
├── tsconfig.json        # Frontend TypeScript config
└── tsconfig.server.json # Backend TypeScript config
```

### 1.4 Create Server TypeScript Config

Create `tsconfig.server.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist-server",
    "rootDir": "./server",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["server/**/*"],
  "exclude": ["node_modules"]
}
```

---

## Part 2: Build the API Server

### 2.1 Create Data Models (`server/models/todoStore.ts`)

Copy your interfaces and store logic from `todoModel.ts`:

```typescript
export interface Category {
  id: string
  name: string
}

export interface Todo {
  id: string
  name: string
  status: "pending" | "in-progress" | "completed"
  categoryId: string
  dueDate: Date
}

export interface CreateTodoInput {
  name: string
  status?: "pending" | "in-progress" | "completed"
  categoryId: string
  dueDate: Date | string
}

// In-memory store (will be replaced with database in Week 3)
const store = {
  todos: [] as Todo[],
  categories: [] as Category[],
}

function generateId(): string {
  const now = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${now}-${randomStr}`
}

// Initialize with seed data
export function initializeSeedData(): void {
  if (store.categories.length === 0 && store.todos.length === 0) {
    const schoolCategory = addCategory('School')
    
    createTodo({
      name: 'Mow the Lawn',
      status: 'pending',
      categoryId: schoolCategory.id,
      dueDate: new Date('2025-10-10')
    })
    
    createTodo({
      name: 'Finish my homework',
      status: 'in-progress',
      categoryId: schoolCategory.id,
      dueDate: new Date('2025-10-08')
    })
    
    createTodo({
      name: 'Watch the October 2, 2025 class session video',
      status: 'completed',
      categoryId: schoolCategory.id,
      dueDate: new Date('2025-10-03')
    })
    
    console.log('Seed data initialized')
  }
}

// CRUD operations for Todos
export function createTodo(input: CreateTodoInput): Todo {
  const newTodo: Todo = {
    id: generateId(),
    name: input.name,
    status: input.status || "pending",
    categoryId: input.categoryId,
    dueDate: typeof input.dueDate === "string" ? new Date(input.dueDate) : input.dueDate,
  }
  store.todos.push(newTodo)
  return newTodo
}

export function getAllTodos(): Todo[] {
  return [...store.todos]
}

export function getTodoById(id: string): Todo | undefined {
  return store.todos.find((t) => t.id === id)
}

export function updateTodo(
  id: string,
  updates: Partial<Pick<Todo, "name" | "status" | "categoryId" | "dueDate">>
): Todo | undefined {
  const todo = store.todos.find((t) => t.id === id)
  if (!todo) return undefined

  if (updates.name !== undefined) todo.name = updates.name
  if (updates.status !== undefined) todo.status = updates.status
  if (updates.categoryId !== undefined) todo.categoryId = updates.categoryId
  if (updates.dueDate !== undefined) todo.dueDate = updates.dueDate

  return todo
}

export function deleteTodo(id: string): boolean {
  const originalLength = store.todos.length
  store.todos = store.todos.filter((todo) => todo.id !== id)
  return store.todos.length < originalLength
}

export function clearCompletedTodos(): number {
  const originalLength = store.todos.length
  store.todos = store.todos.filter((todo) => todo.status !== 'completed')
  return originalLength - store.todos.length
}

// CRUD operations for Categories
export function addCategory(name: string): Category {
  const newCategory: Category = {
    id: generateId(),
    name,
  }
  store.categories.push(newCategory)
  return newCategory
}

export function getAllCategories(): Category[] {
  return [...store.categories]
}

export function getCategoryById(id: string): Category | undefined {
  return store.categories.find((c) => c.id === id)
}

export function deleteCategory(id: string): boolean {
  const originalLength = store.categories.length
  store.categories = store.categories.filter((category) => category.id !== id)
  return store.categories.length < originalLength
}
```

### 2.2 Create Todo Controller (`server/controllers/todoController.ts`)

Handle the business logic for todo endpoints:

```typescript
import { Request, Response } from 'express'
import {
  createTodo,
  getAllTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  clearCompletedTodos,
  CreateTodoInput,
} from '../models/todoStore.js'

// GET /api/todos
export function getTodos(req: Request, res: Response) {
  try {
    const todos = getAllTodos()
    res.json(todos)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' })
  }
}

// GET /api/todos/:id
export function getTodo(req: Request, res: Response) {
  try {
    const { id } = req.params
    const todo = getTodoById(id)
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' })
    }
    
    res.json(todo)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todo' })
  }
}

// POST /api/todos
export function createTodoHandler(req: Request, res: Response) {
  try {
    const input: CreateTodoInput = req.body
    
    // Validation
    if (!input.name || !input.categoryId) {
      return res.status(400).json({ error: 'Name and categoryId are required' })
    }
    
    const newTodo = createTodo(input)
    res.status(201).json(newTodo)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' })
  }
}

// PUT /api/todos/:id
export function updateTodoHandler(req: Request, res: Response) {
  try {
    const { id } = req.params
    const updates = req.body
    
    const updatedTodo = updateTodo(id, updates)
    
    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' })
    }
    
    res.json(updatedTodo)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' })
  }
}

// DELETE /api/todos/:id
export function deleteTodoHandler(req: Request, res: Response) {
  try {
    const { id } = req.params
    const deleted = deleteTodo(id)
    
    if (!deleted) {
      return res.status(404).json({ error: 'Todo not found' })
    }
    
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' })
  }
}

// DELETE /api/todos/completed
export function clearCompletedHandler(req: Request, res: Response) {
  try {
    const count = clearCompletedTodos()
    res.json({ deletedCount: count })
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear completed todos' })
  }
}
```

### 2.3 Create Category Controller (`server/controllers/categoryController.ts`)

```typescript
import { Request, Response } from 'express'
import {
  addCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
} from '../models/todoStore.js'

// GET /api/categories
export function getCategories(req: Request, res: Response) {
  try {
    const categories = getAllCategories()
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
}

// GET /api/categories/:id
export function getCategory(req: Request, res: Response) {
  try {
    const { id } = req.params
    const category = getCategoryById(id)
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    res.json(category)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category' })
  }
}

// POST /api/categories
export function createCategoryHandler(req: Request, res: Response) {
  try {
    const { name } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }
    
    const newCategory = addCategory(name)
    res.status(201).json(newCategory)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' })
  }
}

// DELETE /api/categories/:id
export function deleteCategoryHandler(req: Request, res: Response) {
  try {
    const { id } = req.params
    const deleted = deleteCategory(id)
    
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' })
  }
}
```

### 2.4 Create Todo Routes (`server/routes/todoRoutes.ts`)

```typescript
import { Router } from 'express'
import {
  getTodos,
  getTodo,
  createTodoHandler,
  updateTodoHandler,
  deleteTodoHandler,
  clearCompletedHandler,
} from '../controllers/todoController.js'

const router = Router()

router.get('/', getTodos)
router.get('/:id', getTodo)
router.post('/', createTodoHandler)
router.put('/:id', updateTodoHandler)
router.delete('/:id', deleteTodoHandler)
router.delete('/completed/clear', clearCompletedHandler) // Note: specific route before :id

export default router
```

### 2.5 Create Category Routes (`server/routes/categoryRoutes.ts`)

```typescript
import { Router } from 'express'
import {
  getCategories,
  getCategory,
  createCategoryHandler,
  deleteCategoryHandler,
} from '../controllers/categoryController.js'

const router = Router()

router.get('/', getCategories)
router.get('/:id', getCategory)
router.post('/', createCategoryHandler)
router.delete('/:id', deleteCategoryHandler)

export default router
```

### 2.6 Create Express Server (`server/index.ts`)

Main server entry point:

```typescript
import express from 'express'
import cors from 'cors'
import todoRoutes from './routes/todoRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import { initializeSeedData } from './models/todoStore.js'

const app = express()
const PORT = process.env.PORT || 3100

// Middleware
app.use(cors()) // Enable CORS for frontend
app.use(express.json()) // Parse JSON bodies

// Initialize seed data
initializeSeedData()

// Routes
app.use('/api/todos', todoRoutes)
app.use('/api/categories', categoryRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📋 API endpoints available at http://localhost:${PORT}/api`)
})
```

---

## Part 3: Update Frontend to Use API

### 3.1 Create API Service (`src/apiService.ts`)

Create a centralized service for API calls:

```typescript
import type { Todo, Category, CreateTodoInput } from './todoModel'

const API_BASE_URL = 'http://localhost:3100/api'

// Helper function for fetch requests
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

// Todo API calls
export async function fetchAllTodos(): Promise<Todo[]> {
  return fetchJSON<Todo[]>(`${API_BASE_URL}/todos`)
}

export async function createTodoAPI(input: CreateTodoInput): Promise<Todo> {
  return fetchJSON<Todo>(`${API_BASE_URL}/todos`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateTodoAPI(
  id: string,
  updates: Partial<Pick<Todo, 'name' | 'status' | 'categoryId' | 'dueDate'>>
): Promise<Todo> {
  return fetchJSON<Todo>(`${API_BASE_URL}/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export async function deleteTodoAPI(id: string): Promise<void> {
  return fetchJSON<void>(`${API_BASE_URL}/todos/${id}`, {
    method: 'DELETE',
  })
}

export async function clearCompletedTodosAPI(): Promise<{ deletedCount: number }> {
  return fetchJSON<{ deletedCount: number }>(`${API_BASE_URL}/todos/completed/clear`, {
    method: 'DELETE',
  })
}

// Category API calls
export async function fetchAllCategories(): Promise<Category[]> {
  return fetchJSON<Category[]>(`${API_BASE_URL}/categories`)
}

export async function createCategoryAPI(name: string): Promise<Category> {
  return fetchJSON<Category>(`${API_BASE_URL}/categories`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function deleteCategoryAPI(id: string): Promise<void> {
  return fetchJSON<void>(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
  })
}
```

### 3.2 Update `src/todoModel.ts`

Replace the local store functions with API calls. Keep the interfaces but remove the store logic:

```typescript
// Keep interfaces (export them for apiService.ts)
export interface Category {
  id: string
  name: string
}

export interface Todo {
  id: string
  name: string
  status: "pending" | "in-progress" | "completed"
  categoryId: string
  dueDate: Date
}

export interface CreateTodoInput {
  name: string
  status?: "pending" | "in-progress" | "completed"
  categoryId: string
  dueDate: Date | string
}

// Import API functions
import {
  fetchAllTodos,
  createTodoAPI,
  updateTodoAPI,
  deleteTodoAPI,
  clearCompletedTodosAPI,
  fetchAllCategories,
  createCategoryAPI,
  deleteCategoryAPI,
} from './apiService'

// Replace store functions with API calls
export async function getAllTodos(): Promise<Todo[]> {
  return fetchAllTodos()
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  return createTodoAPI(input)
}

export async function editTodo(
  id: string,
  updates: Partial<Pick<Todo, "name" | "status" | "categoryId" | "dueDate">>
): Promise<Todo> {
  return updateTodoAPI(id, updates)
}

export async function deleteTodo(id: string): Promise<void> {
  return deleteTodoAPI(id)
}

export async function clearCompletedTodos(): Promise<number> {
  const result = await clearCompletedTodosAPI()
  return result.deletedCount
}

export async function getAllCategories(): Promise<Category[]> {
  return fetchAllCategories()
}

export async function addCategory(name: string): Promise<Category> {
  return createCategoryAPI(name)
}

export async function deleteCategory(id: string): Promise<void> {
  return deleteCategoryAPI(id)
}
```

### 3.3 Update `src/main.ts` and Other Files

Now all your functions return Promises, so you need to update calls to use `await`:

**Example changes in `main.ts`:**

```typescript
// Before:
const categories = getAllCategories()

// After:
const categories = await getAllCategories()

// Before:
createTodo({ name, categoryId, dueDate, status })
renderTodoList()

// After:
await createTodo({ name, categoryId, dueDate, status })
renderTodoList()
```

You'll need to make functions `async` where you call these methods.

---

## Part 4: Testing

### 4.1 Start the Server

In one terminal:
```bash
npm run server
```

You should see:
```
🚀 Server running on http://localhost:3100
📋 API endpoints available at http://localhost:3100/api
```

### 4.2 Start the Frontend

In another terminal:
```bash
npm run dev
```

### 4.3 Test the API Endpoints

Use a tool like Postman, Thunder Client (VS Code extension), or curl:

**Get all todos:**
```bash
curl http://localhost:3100/api/todos
```

**Create a todo:**
```bash
curl -X POST http://localhost:3100/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Task",
    "categoryId": "REPLACE_WITH_ACTUAL_ID",
    "dueDate": "2025-10-20",
    "status": "pending"
  }'
```

**Get all categories:**
```bash
curl http://localhost:3100/api/categories
```

### 4.4 Verify Frontend Integration

1. Open your app in the browser
2. Try creating, editing, and deleting todos
3. Check the browser console and network tab for any errors
4. Verify data persists across page refreshes (it won't - in-memory storage resets when server restarts)

---

## Common Issues & Solutions

### Issue: CORS Errors
**Solution:** Make sure `cors()` middleware is enabled in `server/index.ts`

### Issue: "Cannot find module" errors
**Solution:** Check that all imports use `.js` extension (TypeScript requirement for ES modules)

### Issue: Port already in use
**Solution:** Change PORT in `server/index.ts` or kill the process using port 3100

### Issue: Frontend can't reach API
**Solution:** Verify API_BASE_URL in `apiService.ts` matches your server's address

---

## Next Steps

- ✅ You now have a working Express API server
- ✅ Frontend communicates with backend via REST API
- ⏭️ **Week 2:** Replace in-memory store with Prisma ORM
- ⏭️ **Week 3:** Connect Prisma to SQLite database

---

## Key Concepts Learned

- **RESTful API design**: GET, POST, PUT, DELETE methods
- **Express routing**: Organizing endpoints with routers
- **MVC pattern**: Separating models, controllers, and routes
- **Middleware**: CORS, body parsing, error handling
- **TypeScript with Node.js**: Type-safe backend development
- **Frontend-backend separation**: Client-server architecture
