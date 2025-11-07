import express from 'express'
import cors from 'cors'
import todoRoutes from './routes/todoRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import visionRoutes from './routes/visionRoutes.js'
//import { initializeSeedData } from './models/todoStore.js'

const app = express()
const PORT = process.env.PORT || 3100

// CORS Configuration - MUST be before routes
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Body parsing middleware with increased limits for image uploads
app.use(express.json({ limit: '50mb' })) // Increased from default 100kb
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Initialize seed data
//initializeSeedData()

// Routes
app.use('/api/todos', todoRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/vision', visionRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📋 API endpoints available at http://localhost:${PORT}/api`)
})