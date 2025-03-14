import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import connectDB from './config/database.js'
import errorHandler from './middlewares/errorMiddleware.js'
import AppError from './utils/AppError.js'

// 导入路由
import authRoutes from './routes/authRoutes.js'
import resourceRoutes from './routes/resourceRoutes.js'
import userRoutes from './routes/userRoutes.js'

// 获取当前文件的目录路径
const __dirname = dirname(fileURLToPath(import.meta.url))

// 加载环境变量
dotenv.config({ path: join(__dirname, '../.env') })

// 连接数据库
connectDB()

const app = express()

// 安全中间件
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10kb' }))
app.use(morgan('dev'))

// 限制请求速率
const limiter = rateLimit({
    max: 100, // 每个IP每小时最多100个请求
    windowMs: 60 * 60 * 1000,
    message: '请求次数过多，请稍后再试！',
})
app.use('/api', limiter)

// 路由
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/resources', resourceRoutes)
app.use('/api/v1/users', userRoutes)

// 处理未找到的路由
app.all('*', (req, res, next) => {
    next(new AppError(`找不到路径: ${req.originalUrl}`, 404))
})

// 错误处理中间件
app.use(errorHandler)

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`服务器运行在端口 ${port}`)
})
