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
} from "./apiService"

// Keep interfaces (export them for apiService.ts)
export interface Category {
  id: string // unique identifier
  name: string // category name
}

export interface Todo {
  id: string // unique identifier
  name: string // brief description
  status: "pending" | "in-progress" | "completed" // current state
  categoryId: string // links to a category
  dueDate: Date // deadline
}

// NEW: Add this input type for creating todos
export interface CreateTodoInput {
  name: string
  status?: "pending" | "in-progress" | "completed" // Optional, defaults to "pending"
  categoryId: string
  dueDate: Date | string // Accept both Date and string
}

// const store = {
//   todos: [] as Todo[],
//   categories: [] as Category[],
// }

// Initialize with seed data
/* function initializeSeedData(): void {
  // Only initialize if the store is empty
  if (store.categories.length === 0 && store.todos.length === 0) {
    // Create the School category
    const schoolCategory = addCategory("School")

    // Create the three todo items
    createTodo({
      name: "Mow the Lawn",
      status: "pending",
      categoryId: schoolCategory.id,
      dueDate: new Date("2025-10-10"),
    })

    createTodo({
      name: "Finish my homework",
      status: "in-progress",
      categoryId: schoolCategory.id,
      dueDate: new Date("2025-10-08"),
    })

    createTodo({
      name: "Watch the October 2, 2025 class session video",
      status: "completed",
      categoryId: schoolCategory.id,
      dueDate: new Date("2025-10-03"),
    })

    console.log("Seed data initialized with School category and 3 todos")
  }
} */

// Initialize seed data when the module loads
//initializeSeedData()

/* function generateId(): string {
  // Get current time to ensure uniqueness
  const now = Date.now()

  // Generate random string: convert random number to base-36 and clean it up
  const randomStr = Math.random().toString(36).substring(2, 8)

  return `${now}-${randomStr}`
} */

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  return createTodoAPI(input)
}

// Function to create a new Todo
/* export function createTodo(input: CreateTodoInput): Todo {
  const newTodo = {
    id: generateId(), // auto-generate unique ID
    name: input.name,
    status: input.status || "pending", // default to 'pending'
    categoryId: input.categoryId,
    dueDate:
      typeof input.dueDate === "string"
        ? new Date(input.dueDate)
        : input.dueDate,
  }
  // Create new array with the added todo
  store.todos = [...store.todos, newTodo]
  console.log(
    `New todo was added with name: ${newTodo.name} to this existing store of todos:`,
    store.todos
  )
  return newTodo
} */

export async function editTodo(
  id: string,
  updates: Partial<Pick<Todo, "name" | "status" | "categoryId" | "dueDate">>
): Promise<Todo> {
  return updateTodoAPI(id, updates)
}

/* export function editTodo(
  id: string,
  updates: Partial<Pick<Todo, "name" | "status" | "categoryId" | "dueDate">>
): Todo | undefined {
  const todo = store.todos.find((t) => t.id === id)
  if (!todo) {
    console.warn(`Todo with id ${id} not found.`)
    return undefined
  }
  if (updates.name !== undefined) {
    const newTodoName = updates.name.trim()
    if (!newTodoName) throw new Error("Todo name cannot be empty.")
    todo.name = newTodoName
  }
  if (updates.status !== undefined) {
    todo.status = updates.status
  }
  if (updates.categoryId !== undefined) {
    todo.categoryId = updates.categoryId
  }
  if (updates.dueDate !== undefined) {
    todo.dueDate = updates.dueDate
  }
  return todo
} */

export async function addCategory(name: string): Promise<Category> {
  return createCategoryAPI(name)
}

// Function to create a new Category
/* export function addCategory(name: string): Category {
  const newCategory = {
    id: generateId(), // auto-generate unique ID
    name,
  }
  store.categories = [...store.categories, newCategory]
  console.log(
    `New category was added with name: ${newCategory.name} to this existing store of categories:`,
    store.categories
  )
  return newCategory
} */

export async function deleteTodo(id: string): Promise<void> {
  return deleteTodoAPI(id)
}

/* export function deleteTodo(id: string): boolean {
  const originalLength = store.todos.length
  // Create a new array excluding the todo with the given id
  store.todos = store.todos.filter((todo) => todo.id !== id)
  console.log(
    `Updated todos after deletion of todo with id ${id}: `,
    store.todos
  )
  return store.todos.length < originalLength // Return true if a todo was deleted
} */

export async function deleteCategory(id: string): Promise<void> {
  return deleteCategoryAPI(id)
}

/* export function deleteCategory(id: string): boolean {
  const originalLength = store.categories.length
  // Create a new array excluding the category with the given id
  store.categories = store.categories.filter((category) => category.id !== id)
  console.log(
    `Updated categories after deletion of category with id ${id}: `,
    store.categories
  )
  return store.categories.length < originalLength // Return true if a category was deleted
} */

export async function getAllCategories(): Promise<Category[]> {
  return fetchAllCategories()
}

/* export function getAllCategories(): Category[] {
  return [...store.categories] // Return a copy
} */

export async function getAllTodos(): Promise<Todo[]> {
  return fetchAllTodos()
}

/* export function getAllTodos(): Todo[] {
  return [...store.todos] // Return a copy
} */

export async function clearCompletedTodos(): Promise<number> {
  const result = await clearCompletedTodosAPI()
  return result.deletedCount
}

/* export function clearCompletedTodos(): number {
  const originalLength = store.todos.length
  // Filter out all completed todos
  store.todos = store.todos.filter((todo) => todo.status !== 'completed')
  const deletedCount = originalLength - store.todos.length
  console.log(
    `Cleared ${deletedCount} completed todos. Remaining todos:`,
    store.todos
  )
  return deletedCount // Return the number of todos cleared
} */
