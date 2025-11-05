import express from 'express'
import cors from 'cors'
import todoRoutes from './routes/todoRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
//import { initializeSeedData } from './models/todoStore.js'

const app = express()
const PORT = process.env.PORT || 3000

// CORS Configuration - MUST be before routes
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))


//Middleware
app.use(express.json()) // Parse JSON bodies

// Initialize seed data
//initializeSeedData()

// Routes
app.use('/api/todos', todoRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/chat', chatRoutes)

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