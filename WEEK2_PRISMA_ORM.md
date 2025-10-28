# Week 2: Prisma ORM Integration

## Goal
Replace the in-memory storage in `todoStore.ts` with Prisma ORM, which will generate TypeScript-safe database clients and prepare our application for SQLite database integration in Week 3.

---

## Part 1: Understanding Prisma

### 1.1 What is Prisma?

Prisma is a next-generation ORM (Object-Relational Mapping) tool that provides:

- **Type Safety**: Auto-generated TypeScript types based on your database schema
- **Intuitive API**: Write database queries using JavaScript/TypeScript (no SQL required)
- **Schema-First**: Define your data models in a declarative schema file
- **Migration System**: Version control for your database structure
- **Database Agnostic**: Works with PostgreSQL, MySQL, SQLite, SQL Server, MongoDB, and more

### 1.2 How Prisma Works

1. You define your data models in `schema.prisma`
2. Prisma generates a type-safe client based on your schema
3. You use the Prisma Client in your code to query the database
4. Prisma handles all SQL generation and type conversions

### 1.3 Benefits for Our Project

- Replace in-memory arrays with persistent database queries
- Get autocomplete and type checking for all database operations
- Prepare for easy SQLite integration in Week 3
- Maintain the same interface/controller structure we already built

---

## Part 2: Install and Initialize Prisma

### 2.1 Install Prisma Dependencies

Install Prisma CLI (dev dependency), Prisma Client (runtime dependency), and dotenv:

```bash
npm install --save-dev prisma
npm install @prisma/client dotenv
```

**Packages explained:**
- `prisma`: CLI tool for schema management, migrations, and code generation
- `@prisma/client`: Runtime client library used in your application code
- `dotenv`: Loads environment variables from `.env` file into `process.env`

### 2.2 Initialize Prisma

Run the Prisma initialization command:

```bash
npx prisma init --datasource-provider sqlite
```

This creates:
- `prisma/` directory
- `prisma/schema.prisma` file (your database schema definition)
- `.env` file (database connection configuration)

**Output you'll see:**
```
✔ Your Prisma schema was created at prisma/schema.prisma
  You can now open it in your favorite editor.

Next steps:
1. Set the DATABASE_URL in the .env file to point to your existing database
2. Set the provider of the datasource block in schema.prisma to match your database
3. Run prisma db pull to turn your database schema into a Prisma schema
4. Run prisma generate to generate the Prisma Client
```

### 2.3 Examine the Generated Files

**Check `prisma/schema.prisma`:**
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**Check `.env`:**
```env
DATABASE_URL="file:./dev.db"
```

**Note:** The `.env` file contains sensitive configuration. Make sure it's in your `.gitignore`!

### 2.4 Configure dotenv in Your Server

To load environment variables from `.env` into your Node.js application, you need to configure dotenv.

**Update `server/index.ts`** to load environment variables at the very top:

```typescript
// Load environment variables FIRST (before any other imports that might use them)
import dotenv from 'dotenv'
dotenv.config()

// Now import everything else
import express from 'express'
import cors from 'cors'
import { initializeSeedData } from './models/todoStore.js'
import todoRoutes from './routes/todoRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/todos', todoRoutes)
app.use('/api/categories', categoryRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' })
})

// Initialize seed data
initializeSeedData()

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
```

**Why at the top?**
- `dotenv.config()` must run before any code that accesses `process.env`
- Prisma Client reads `DATABASE_URL` from `process.env`
- Loading it first ensures all environment variables are available

**Alternative: Using Node.js flags (Optional)**

Instead of importing dotenv in your code, you can use Node.js's built-in flag:

```bash
# In package.json scripts
"server": "node --env-file=.env --watch-path=server --import tsx server/index.ts"
```

However, for simplicity and compatibility, we'll use the dotenv package method.

### 2.5 Update .gitignore

Ensure your `.gitignore` includes:

```
.env
*.db
*.db-journal
node_modules/
dist/
dist-server/
```

---

## Part 3: Define Prisma Schema

### 3.1 Understanding the Schema Syntax

Prisma uses its own schema definition language. Here's the basic syntax:

```prisma
model ModelName {
  fieldName  FieldType  @attribute
  
  @@blockAttribute
}
```

**Common Field Types:**
- `String`: Text data
- `Int`: Integer numbers
- `Boolean`: true/false
- `DateTime`: Date and time
- `Float`: Decimal numbers

**Common Attributes:**
- `@id`: Primary key
- `@default(...)`: Default value
- `@unique`: Unique constraint
- `@relation(...)`: Defines relationships

### 3.2 Design Our Schema

Based on our existing interfaces in `todoStore.ts`, we need:

1. **Category Model**
   - `id`: Unique identifier (String)
   - `name`: Category name (String)
   - Relationship: A category can have many todos

2. **Todo Model**
   - `id`: Unique identifier (String)
   - `name`: Todo name (String)
   - `status`: One of "pending", "in-progress", "completed"
   - `categoryId`: Foreign key to Category
   - `dueDate`: Due date (DateTime)
   - Relationship: A todo belongs to one category

### 3.3 Write the Schema

Replace the contents of `prisma/schema.prisma` with:

```prisma
// This is your Prisma schema file
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Category model
model Category {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationship: One category has many todos
  todos     Todo[]
}

// Todo model
model Todo {
  id         String   @id @default(uuid())
  name       String
  status     String   @default("pending") // "pending" | "in-progress" | "completed"
  categoryId String
  dueDate    DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  // Relationship: Many todos belong to one category
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
}
```

**Schema Features Explained:**

- `@id @default(uuid())`: Auto-generate unique IDs using UUID format
- `@default(now())`: Automatically set to current timestamp on creation
- `@updatedAt`: Automatically update timestamp on any change
- `@relation(...)`: Defines foreign key relationship with cascade delete
- `onDelete: Cascade`: When a category is deleted, all its todos are also deleted
- `createdAt` and `updatedAt`: Track when records are created/modified (bonus fields!)

### 3.4 Schema Best Practices

✅ **Do:**
- Always include `@id` on every model
- Use meaningful field names
- Add timestamps (`createdAt`, `updatedAt`) for debugging
- Define proper relationships between models

❌ **Don't:**
- Use reserved SQL keywords as field names
- Forget to specify the datasource provider
- Hard-code database URLs in the schema file

---

## Part 4: Generate Prisma Client

### 4.1 Generate the Client

Run the Prisma generate command:

```bash
npx prisma generate
```

**Output you'll see:**
```
✔ Generated Prisma Client to ./node_modules/@prisma/client in 150ms

You can now start using Prisma Client in your code:

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

**What just happened?**
- Prisma read your `schema.prisma` file
- Generated TypeScript types for `Category` and `Todo`
- Created a type-safe client with methods like `prisma.category.findMany()`, `prisma.todo.create()`, etc.
- Installed the client in `node_modules/@prisma/client`

### 4.2 Explore Generated Types

The Prisma Client now has full TypeScript support. You can explore it by creating a test file:

**Create `server/test-prisma.ts`** (temporary file):

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Hover over 'category' in VS Code to see available methods
async function test() {
  // TypeScript knows all available methods and fields!
  const categories = await prisma.category.findMany()
  const todos = await prisma.todo.findMany({
    include: {
      category: true  // Include related category data
    }
  })
  
  console.log({ categories, todos })
}

test()
```

**Note:** Don't run this yet! We haven't created the database. We'll do that in Week 3.

### 4.3 Add Generate Script to package.json

For convenience, add a script to regenerate the client:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "server": "nodemon --watch server --exec tsx server/index.ts",
  "server:build": "tsc --project tsconfig.server.json",
  "prisma:generate": "prisma generate",
  "prisma:studio": "prisma studio"
}
```

Now you can run:
```bash
npm run prisma:generate
```

---

## Part 5: Update Server Code to Use Prisma

### 5.1 Create Prisma Client Instance

Create a new file `server/db/prisma.ts`:

```bash
mkdir server/db
```

**`server/db/prisma.ts`:**
```typescript
import { PrismaClient } from '@prisma/client'

// Create a single Prisma Client instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Enable query logging (helpful for learning!)
})

// Handle cleanup on shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma
```

**Why a single instance?**
- Prisma Client manages a connection pool internally
- Creating multiple instances can exhaust database connections
- This pattern ensures one shared client across your app

### 5.2 Update todoStore.ts to Use Prisma

Now we'll modify `server/models/todoStore.ts` to replace the in-memory store with Prisma queries.

**Replace `server/models/todoStore.ts` with:**

```typescript
import prisma from '../db/prisma.js'
import { Category, Todo } from '@prisma/client'

// Re-export Prisma types
export type { Category, Todo }

// Keep the CreateTodoInput interface for API validation
export interface CreateTodoInput {
  name: string
  status?: "pending" | "in-progress" | "completed"
  categoryId: string
  dueDate: Date | string
}

// Note: We no longer need the in-memory store or generateId()
// Prisma handles ID generation via UUID

// Initialize with seed data
export async function initializeSeedData(): Promise<void> {
  // Check if data already exists
  const existingCategories = await prisma.category.count()
  
  if (existingCategories === 0) {
    console.log('Initializing seed data...')
    
    // Create a category
    const schoolCategory = await addCategory('School')
    
    // Create todos
    await createTodo({
      name: 'Mow the Lawn',
      status: 'pending',
      categoryId: schoolCategory.id,
      dueDate: new Date('2025-10-10')
    })
    
    await createTodo({
      name: 'Finish my homework',
      status: 'in-progress',
      categoryId: schoolCategory.id,
      dueDate: new Date('2025-10-08')
    })
    
    await createTodo({
      name: 'Watch the October 2, 2025 class session video',
      status: 'completed',
      categoryId: schoolCategory.id,
      dueDate: new Date('2025-10-03')
    })
    
    console.log('Seed data initialized!')
  }
}

// ============================================
// CRUD Operations for Todos
// ============================================

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const todo = await prisma.todo.create({
    data: {
      name: input.name,
      status: input.status || "pending",
      categoryId: input.categoryId,
      dueDate: typeof input.dueDate === "string" 
        ? new Date(input.dueDate) 
        : input.dueDate,
    },
  })
  return todo
}

export async function getAllTodos(): Promise<Todo[]> {
  return await prisma.todo.findMany({
    orderBy: {
      dueDate: 'asc'  // Optional: sort by due date
    }
  })
}

export async function getTodoById(id: string): Promise<Todo | null> {
  return await prisma.todo.findUnique({
    where: { id }
  })
}

export async function updateTodo(
  id: string,
  updates: Partial<Pick<Todo, "name" | "status" | "categoryId" | "dueDate">>
): Promise<Todo | null> {
  try {
    return await prisma.todo.update({
      where: { id },
      data: updates,
    })
  } catch (error) {
    // If todo doesn't exist, Prisma throws an error
    return null
  }
}

export async function deleteTodo(id: string): Promise<boolean> {
  try {
    await prisma.todo.delete({
      where: { id }
    })
    return true
  } catch (error) {
    // If todo doesn't exist, return false
    return false
  }
}

export async function clearCompletedTodos(): Promise<number> {
  const result = await prisma.todo.deleteMany({
    where: {
      status: 'completed'
    }
  })
  return result.count
}

// ============================================
// CRUD Operations for Categories
// ============================================

export async function addCategory(name: string): Promise<Category> {
  return await prisma.category.create({
    data: { name }
  })
}

export async function getAllCategories(): Promise<Category[]> {
  return await prisma.category.findMany({
    orderBy: {
      name: 'asc'  // Alphabetical order
    }
  })
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return await prisma.category.findUnique({
    where: { id }
  })
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    await prisma.category.delete({
      where: { id }
    })
    return true
  } catch (error) {
    return false
  }
}
```

**Key Changes:**
- ✅ All functions are now `async` and return `Promise<T>`
- ✅ Replaced array operations with Prisma queries
- ✅ Used Prisma's type-safe query methods
- ✅ Leveraged TypeScript types from `@prisma/client`
- ✅ Let Prisma handle ID generation (UUID)
- ✅ Added error handling for update/delete operations

### 5.3 Update Controllers to Handle Async Operations

Since `todoStore.ts` functions are now async, we need to update our controllers.

**Update `server/controllers/todoController.ts`:**

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
export async function getTodos(req: Request, res: Response) {
  try {
    const todos = await getAllTodos()  // Now awaiting the promise
    res.json(todos)
  } catch (error) {
    console.error('Error fetching todos:', error)
    res.status(500).json({ error: 'Failed to fetch todos' })
  }
}

// GET /api/todos/:id
export async function getTodo(req: Request, res: Response) {
  try {
    const { id } = req.params
    const todo = await getTodoById(id)  // Now awaiting the promise
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' })
    }
    
    res.json(todo)
  } catch (error) {
    console.error('Error fetching todo:', error)
    res.status(500).json({ error: 'Failed to fetch todo' })
  }
}

// POST /api/todos
export async function createTodoHandler(req: Request, res: Response) {
  try {
    const input: CreateTodoInput = req.body
    
    // Validation
    if (!input.name || !input.categoryId) {
      return res.status(400).json({ error: 'Name and categoryId are required' })
    }
    
    const newTodo = await createTodo(input)  // Now awaiting the promise
    res.status(201).json(newTodo)
  } catch (error) {
    console.error('Error creating todo:', error)
    res.status(500).json({ error: 'Failed to create todo' })
  }
}

// PUT /api/todos/:id
export async function updateTodoHandler(req: Request, res: Response) {
  try {
    const { id } = req.params
    const updates = req.body
    
    const updatedTodo = await updateTodo(id, updates)  // Now awaiting the promise
    
    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' })
    }
    
    res.json(updatedTodo)
  } catch (error) {
    console.error('Error updating todo:', error)
    res.status(500).json({ error: 'Failed to update todo' })
  }
}

// DELETE /api/todos/:id
export async function deleteTodoHandler(req: Request, res: Response) {
  try {
    const { id } = req.params
    const deleted = await deleteTodo(id)  // Now awaiting the promise
    
    if (!deleted) {
      return res.status(404).json({ error: 'Todo not found' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting todo:', error)
    res.status(500).json({ error: 'Failed to delete todo' })
  }
}

// DELETE /api/todos/completed
export async function clearCompletedHandler(req: Request, res: Response) {
  try {
    const count = await clearCompletedTodos()  // Now awaiting the promise
    res.json({ deletedCount: count })
  } catch (error) {
    console.error('Error clearing completed todos:', error)
    res.status(500).json({ error: 'Failed to clear completed todos' })
  }
}
```

**Update `server/controllers/categoryController.ts`:**

```typescript
import { Request, Response } from 'express'
import {
  addCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
} from '../models/todoStore.js'

// GET /api/categories
export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await getAllCategories()  // Now awaiting the promise
    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
}

// GET /api/categories/:id
export async function getCategory(req: Request, res: Response) {
  try {
    const { id } = req.params
    const category = await getCategoryById(id)  // Now awaiting the promise
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    res.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    res.status(500).json({ error: 'Failed to fetch category' })
  }
}

// POST /api/categories
export async function createCategoryHandler(req: Request, res: Response) {
  try {
    const { name } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' })
    }
    
    const newCategory = await addCategory(name)  // Now awaiting the promise
    res.status(201).json(newCategory)
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ error: 'Failed to create category' })
  }
}

// DELETE /api/categories/:id
export async function deleteCategoryHandler(req: Request, res: Response) {
  try {
    const { id } = req.params
    const deleted = await deleteCategory(id)  // Now awaiting the promise
    
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting category:', error)
    res.status(500).json({ error: 'Failed to delete category' })
  }
}
```

**Changes Made:**
- ✅ Added `async` keyword to all controller functions
- ✅ Added `await` to all store function calls
- ✅ Added `console.error()` for better debugging

---

## Part 6: Understanding Prisma Migrations

### 6.1 What are Migrations?

Migrations are version-controlled changes to your database schema. Think of them as "Git commits" for your database structure.

**Why use migrations?**
- Track all database schema changes over time
- Apply changes consistently across different environments (dev, staging, prod)
- Rollback to previous schema versions if needed
- Collaborate with team members on database changes

### 6.2 Migration Workflow

```
1. Edit schema.prisma
2. Run: npx prisma migrate dev
3. Prisma generates SQL file
4. Migration is applied to database
5. Prisma Client is regenerated
```

### 6.3 Common Prisma Migration Commands

```bash
# Create and apply a new migration (development)
npx prisma migrate dev --name descriptive_name

# Apply pending migrations (production)
npx prisma migrate deploy

# Reset database (deletes all data!)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Generate Prisma Client without migrating
npx prisma generate
```

### 6.4 When to Run Migrations

**Run migrations when:**
- Adding a new model to `schema.prisma`
- Adding/removing fields from existing models
- Changing field types or attributes
- Modifying relationships between models

**Don't run migrations yet!** We'll wait until Week 3 when we actually create the SQLite database.

### 6.5 Add Migration Script to package.json

Update your scripts in `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "server": "nodemon --watch server --exec tsx server/index.ts",
  "server:build": "tsc --project tsconfig.server.json",
  "prisma:generate": "prisma generate",
  "prisma:studio": "prisma studio",
  "prisma:migrate": "prisma migrate dev"
}
```

---

## Part 7: Prisma Client Features to Explore

### 7.1 Query Methods

Prisma provides intuitive query methods. Here are the most common ones:

#### Find Operations
```typescript
// Find all records
await prisma.todo.findMany()

// Find one by unique field (id)
await prisma.todo.findUnique({ where: { id: '123' } })

// Find first match
await prisma.todo.findFirst({ where: { status: 'pending' } })
```

#### Create Operations
```typescript
// Create single record
await prisma.todo.create({
  data: {
    name: 'New Todo',
    status: 'pending',
    categoryId: 'cat-123',
    dueDate: new Date()
  }
})

// Create with relation
await prisma.category.create({
  data: {
    name: 'Work',
    todos: {
      create: [
        { name: 'Task 1', status: 'pending', dueDate: new Date() },
        { name: 'Task 2', status: 'pending', dueDate: new Date() }
      ]
    }
  }
})
```

#### Update Operations
```typescript
// Update single record
await prisma.todo.update({
  where: { id: '123' },
  data: { status: 'completed' }
})

// Update many records
await prisma.todo.updateMany({
  where: { status: 'pending' },
  data: { status: 'in-progress' }
})
```

#### Delete Operations
```typescript
// Delete single record
await prisma.todo.delete({ where: { id: '123' } })

// Delete many records
await prisma.todo.deleteMany({ where: { status: 'completed' } })
```

### 7.2 Filtering and Sorting

```typescript
// Filter todos by status
await prisma.todo.findMany({
  where: {
    status: 'pending'
  }
})

// Filter by date range
await prisma.todo.findMany({
  where: {
    dueDate: {
      gte: new Date('2025-10-01'),  // Greater than or equal
      lte: new Date('2025-10-31')   // Less than or equal
    }
  }
})

// Sort results
await prisma.todo.findMany({
  orderBy: {
    dueDate: 'asc'  // or 'desc'
  }
})

// Multiple sort criteria
await prisma.todo.findMany({
  orderBy: [
    { status: 'asc' },
    { dueDate: 'asc' }
  ]
})
```

### 7.3 Relations and Includes

```typescript
// Get todos with their category data
await prisma.todo.findMany({
  include: {
    category: true
  }
})

// Get category with all its todos
await prisma.category.findUnique({
  where: { id: 'cat-123' },
  include: {
    todos: true
  }
})

// Select specific fields only
await prisma.todo.findMany({
  select: {
    id: true,
    name: true,
    status: true,
    category: {
      select: {
        name: true
      }
    }
  }
})
```

### 7.4 Aggregations and Counting

```typescript
// Count records
const todoCount = await prisma.todo.count()

// Count with filter
const pendingCount = await prisma.todo.count({
  where: { status: 'pending' }
})

// Group by and count
const statusCounts = await prisma.todo.groupBy({
  by: ['status'],
  _count: true
})
```

### 7.5 Transactions

For operations that must succeed or fail together:

```typescript
// Example: Move todo to different category and log the change
await prisma.$transaction(async (tx) => {
  await tx.todo.update({
    where: { id: 'todo-123' },
    data: { categoryId: 'new-cat-id' }
  })
  
  await tx.changeLog.create({
    data: {
      action: 'moved_category',
      todoId: 'todo-123'
    }
  })
})
```

---

## Part 8: Testing Your Prisma Integration

### 8.1 Current State (Without Database)

**Important Note:** We can't fully test Prisma yet because we haven't created the actual SQLite database file. That happens in Week 3!

However, we can verify our code compiles and has no type errors.

### 8.2 Check TypeScript Compilation

Run TypeScript compiler to check for errors:

```bash
npm run server:build
```

You should see:
```
✓ No TypeScript errors found
```

### 8.3 Verify Prisma Client Generation

Make sure Prisma Client is generated:

```bash
npm run prisma:generate
```

Expected output:
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

### 8.4 Review Code Changes Checklist

Before moving to Week 3, verify:

- ✅ `prisma/schema.prisma` defines Category and Todo models
- ✅ `server/db/prisma.ts` creates Prisma Client instance
- ✅ `server/models/todoStore.ts` uses Prisma queries (all functions are async)
- ✅ `server/controllers/todoController.ts` awaits async operations
- ✅ `server/controllers/categoryController.ts` awaits async operations
- ✅ `.env` file exists and contains `DATABASE_URL`
- ✅ `.env` is in `.gitignore`
- ✅ No TypeScript compilation errors

### 8.5 What We'll Test in Week 3

Once we create the SQLite database in Week 3, we'll be able to:
- Run the server and seed data
- Make API calls and see data persist
- Restart the server and data still exists
- Use Prisma Studio to view/edit data visually

---

## Part 9: Common Prisma Patterns and Best Practices

### 9.1 Error Handling

```typescript
// Handle "record not found" errors
export async function getTodoById(id: string): Promise<Todo | null> {
  try {
    return await prisma.todo.findUnique({ where: { id } })
  } catch (error) {
    console.error('Database error:', error)
    return null
  }
}

// Handle unique constraint violations
export async function createCategory(name: string): Promise<Category | null> {
  try {
    return await prisma.category.create({ data: { name } })
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('Category name already exists')
    }
    return null
  }
}
```

**Common Prisma Error Codes:**
- `P2002`: Unique constraint violation
- `P2025`: Record not found
- `P2003`: Foreign key constraint failed

### 9.2 Reusable Query Patterns

```typescript
// Create reusable query options
const todoWithCategory = {
  include: {
    category: true
  }
}

// Use in multiple places
const todos = await prisma.todo.findMany(todoWithCategory)
const todo = await prisma.todo.findUnique({
  where: { id: '123' },
  ...todoWithCategory
})
```

### 9.3 Input Validation

```typescript
// Validate before creating
export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  // Check if category exists
  const categoryExists = await prisma.category.findUnique({
    where: { id: input.categoryId }
  })
  
  if (!categoryExists) {
    throw new Error('Category not found')
  }
  
  return await prisma.todo.create({
    data: {
      name: input.name,
      status: input.status || 'pending',
      categoryId: input.categoryId,
      dueDate: new Date(input.dueDate)
    }
  })
}
```

### 9.4 Prisma Client Singleton Pattern

We already implemented this in `server/db/prisma.ts`, but here's why it matters:

```typescript
// ❌ BAD: Creating multiple instances
import { PrismaClient } from '@prisma/client'
const prisma1 = new PrismaClient()
const prisma2 = new PrismaClient()  // Don't do this!

// ✅ GOOD: Import single instance
import prisma from '../db/prisma.js'
```

**Why?**
- Each PrismaClient instance creates its own connection pool
- Multiple instances can exhaust database connections
- Single instance is more efficient and prevents connection issues

---

## Part 10: Prisma Studio (Database GUI)

### 10.1 What is Prisma Studio?

Prisma Studio is a visual database browser that comes with Prisma. It's like phpMyAdmin for any database Prisma supports.

**Features:**
- View all tables and data
- Add, edit, delete records through GUI
- Filter and search data
- View relationships between models
- No SQL required!

### 10.2 Launch Prisma Studio

```bash
npx prisma studio
```

Or use the npm script we added:
```bash
npm run prisma:studio
```

**Note:** This won't work yet because we don't have a database! We'll use this extensively in Week 3.

### 10.3 What You'll See in Week 3

When you run Prisma Studio with a database:
1. Browser opens to `http://localhost:5555`
2. Left sidebar shows your models (Category, Todo)
3. Click a model to view/edit records
4. Add new records with a form
5. See foreign key relationships visually

---

## Part 11: Preparing for Week 3

### 11.1 Current Architecture

```
Frontend (Vite + TypeScript)
    ↓ HTTP Requests
Express API Server
    ↓ Function Calls
Prisma Client (Type-safe queries)
    ↓ SQL Queries
[DATABASE WILL GO HERE IN WEEK 3]
```

### 11.2 What's Missing?

Right now, Prisma Client is ready to talk to a database, but the database doesn't exist yet!

**In Week 3, we'll:**
1. Run `npx prisma migrate dev` to create the SQLite database file
2. Apply our schema as actual database tables
3. Seed initial data
4. Test full data persistence
5. Explore with Prisma Studio

### 11.3 Why Wait Until Week 3?

**Pedagogical Reasons:**
- Week 2 focuses on understanding Prisma schema and client generation
- Separates ORM concepts from database creation
- Allows time to understand type safety before adding persistence
- Makes Week 3 feel like "flipping the switch" to enable full persistence

### 11.4 Files Created This Week

```
thor-todo-app/
├── .env                    # Database URL configuration
├── prisma/
│   └── schema.prisma       # Database schema definition
├── server/
│   ├── db/
│   │   └── prisma.ts       # Prisma Client instance
│   ├── models/
│   │   └── todoStore.ts    # Updated to use Prisma (async)
│   ├── controllers/
│   │   ├── todoController.ts    # Updated to await async calls
│   │   └── categoryController.ts # Updated to await async calls
└── node_modules/
    └── @prisma/client/     # Generated Prisma Client
```

---

## Part 12: Week 2 Summary and Checklist

### 12.1 What We Accomplished

✅ **Installed Prisma**: CLI, client packages, and dotenv  
✅ **Configured Environment**: Set up dotenv to load environment variables  
✅ **Initialized Prisma**: Created `prisma/` directory and schema file  
✅ **Defined Schema**: Created Category and Todo models with relationships  
✅ **Generated Client**: Auto-generated TypeScript types and query methods  
✅ **Created Prisma Instance**: Singleton pattern in `server/db/prisma.ts`  
✅ **Updated todoStore**: Replaced in-memory arrays with Prisma queries  
✅ **Updated Controllers**: Made all controller functions async  
✅ **Learned Migrations**: Understood the migration workflow (ready for Week 3)  
✅ **Explored Features**: Learned Prisma query methods, filtering, relations  

### 12.2 Key Concepts Learned

**1. ORM (Object-Relational Mapping)**
- Maps database tables to TypeScript objects
- Eliminates need to write raw SQL
- Provides type safety and autocomplete

**2. Schema-First Development**
- Define models in `schema.prisma`
- Generate code from schema
- Single source of truth for data structure

**3. Type Safety**
- Prisma generates TypeScript types
- Catch errors at compile time, not runtime
- IDE autocomplete for all database operations

**4. Async/Await Pattern**
- All database operations are asynchronous
- Must use `async`/`await` keywords
- Handle promises properly in controllers

**5. Relations**
- Define one-to-many relationships in schema
- Query related data easily with `include`
- Cascade deletes to maintain referential integrity

### 12.3 Pre-Week 3 Checklist

Before starting Week 3, ensure:

- [ ] Prisma packages installed (`@prisma/client`, `prisma` dev dependency, and `dotenv`)
- [ ] `dotenv` configured in `server/index.ts` (imported and called before other imports)
- [ ] `prisma/schema.prisma` file exists with Category and Todo models
- [ ] `.env` file exists with `DATABASE_URL="file:./dev.db"`
- [ ] `.env` is in `.gitignore`
- [ ] `server/db/prisma.ts` creates Prisma Client instance
- [ ] `server/models/todoStore.ts` uses Prisma queries (all functions return Promises)
- [ ] All controller functions are `async` and `await` store operations
- [ ] No TypeScript compilation errors
- [ ] Prisma Client generated successfully (`npm run prisma:generate`)

### 12.4 What's Next in Week 3?

**Week 3 Preview:**
1. Run `npx prisma migrate dev` to create SQLite database
2. Apply schema as actual database tables
3. Seed the database with initial data
4. Start the server and verify data persistence
5. Use Prisma Studio to view/edit data
6. Test all API endpoints with real database
7. Implement advanced queries (filtering, sorting, pagination)

---

## Additional Resources

### Official Documentation
- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma with SQLite](https://www.prisma.io/docs/concepts/database-connectors/sqlite)

### Video Tutorials
- [Prisma Crash Course (Traversy Media)](https://www.youtube.com/watch?v=RebA5J-rlwg)
- [Full Stack TypeScript with Prisma](https://www.youtube.com/watch?v=ZGZqK2CqKNc)

### Interactive Learning
- [Prisma Playground](https://playground.prisma.io/)
- [Prisma Examples Repository](https://github.com/prisma/prisma-examples)

---

## Troubleshooting

### Issue: "Cannot find module '@prisma/client'"

**Solution:**
```bash
npm install @prisma/client
npm run prisma:generate
```

### Issue: "Schema.prisma not found"

**Solution:**
Ensure you ran `npx prisma init` and that `prisma/schema.prisma` exists.

### Issue: TypeScript errors about undefined types

**Solution:**
```bash
npm run prisma:generate
```
Restart your TypeScript language server (VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server")

### Issue: "Environment variable not found: DATABASE_URL"

**Solution:**
1. Check that `.env` file exists in project root with:
```
DATABASE_URL="file:./dev.db"
```

2. Ensure `dotenv` is installed:
```bash
npm install dotenv
```

3. Verify `dotenv.config()` is called at the top of `server/index.ts`:
```typescript
import dotenv from 'dotenv'
dotenv.config()  // Must be before other imports
```

### Issue: "Cannot find module 'dotenv'"

**Solution:**
```bash
npm install dotenv
```

### Issue: Environment variables not loading

**Solution:**
- Make sure `dotenv.config()` is called BEFORE any code that uses `process.env`
- Check that your `.env` file has no syntax errors (no quotes around values, no spaces around =)
- Verify `.env` is in the root directory of your project (same level as `package.json`)

### Issue: Can't run migrations yet

**Expected!** We'll create the actual database in Week 3. For now, just focus on understanding the Prisma Client code.

---

## Conclusion

Congratulations! You've successfully integrated Prisma ORM into your Express API server. Your application is now prepared for true database persistence, which we'll enable in Week 3 by creating and connecting to a SQLite database.

**Key Takeaway:** Prisma acts as a bridge between your TypeScript code and the database, providing type safety, intuitive APIs, and automatic SQL generation. You've set up this bridge; next week we'll connect it to a real database on the other side!

---

**Next:** [Week 3: SQLite Database Integration](./WEEK3_SQLITE_DATABASE.md) (coming soon)
