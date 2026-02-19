import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'

const app: Application = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'CMS API is running' })
})

app.use('/auth', authRoutes)
app.use('/users', userRoutes)

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[unhandled error]', err)
  res.status(500).json({ success: false, message: 'Unexpected server error' })
})

export default app
