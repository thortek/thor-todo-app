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