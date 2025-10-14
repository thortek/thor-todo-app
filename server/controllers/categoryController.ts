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