import express from 'express'
import cors from 'cors'
import todoRoutes from './routes/todoRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import { initializeSeedData } from './models/todoStore.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors()) // Enable CORS for frontend
app.use(express.json()) // Parse JSON bodies

// Initialize seed data
initializeSeedData()

// Routes
app.use('/api/todos', todoRoutes)
app.use('/api/categories', categoryRoutes)

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