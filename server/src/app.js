import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import authRoutes from './routes/authRoutes.js'
import resourceRoutes from './routes/resourceRoutes.js'
import userRoutes from './routes/userRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import courseRoutes from './routes/courseRoutes.js'
import statsRoutes from './routes/statsRoutes.js'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import globalErrorHandler from './middlewares/errorMiddleware.js'

const app = express()

// 中间件
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10kb' }))
app.use(morgan('dev'))

// 添加额外的调试日志
app.use((req, res, next) => {
    console.log(
        `${new Date().toISOString()} - ${req.method} ${req.originalUrl}`
    )
    next()
})

// 限制请求
const limiter = rateLimit({
    max: 200,
    windowMs: 15 * 60 * 1000,
    message: '来自此IP的请求过多，请稍后再试',
})
app.use('/api', limiter)

// 解析请求体
app.use(cookieParser())

// 路由
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/resources', resourceRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/settings', settingsRoutes)
app.use('/api/v1/courses', courseRoutes)
app.use('/api/v1/stats', statsRoutes)

// 全局错误处理
app.use(globalErrorHandler)

export default app
