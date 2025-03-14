import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bookingRoutes from './routes/bookingRoutes.js'

const app = express()

// 中间件
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// 路由
app.use('/api/v1/bookings', bookingRoutes)

export default app
