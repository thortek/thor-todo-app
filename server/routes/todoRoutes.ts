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