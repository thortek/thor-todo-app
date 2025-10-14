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