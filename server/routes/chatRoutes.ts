import { Router } from 'express'
import { streamChat } from '../controllers/chatController.js'

const router = Router()

// POST /api/chat/stream - Stream chat completion
router.post('/stream', streamChat)

export default router
