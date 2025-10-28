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