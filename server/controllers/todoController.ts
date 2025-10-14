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