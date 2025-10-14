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