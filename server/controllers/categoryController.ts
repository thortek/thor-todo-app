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