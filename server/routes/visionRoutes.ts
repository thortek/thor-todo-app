import { Router } from 'express'
import { analyzeImageHandler } from '../controllers/visionController.js'

const router = Router()

// POST /api/vision/analyze - Analyze an image with streaming response
router.post('/analyze', analyzeImageHandler)

export default router
