import { Router } from 'express'
import { generateImageHandler } from '../controllers/imageGenController.js'

const router = Router()

/**
 * POST /api/image-gen/generate
 * Generate an image using Flux-Schnell model
 */
router.post('/generate', generateImageHandler)

export default router
