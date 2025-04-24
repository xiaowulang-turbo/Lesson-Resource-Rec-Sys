import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import authRoutes from './routes/authRoutes.js'
import resourceRoutes from './routes/resourceRoutes.js'
import userRoutes from './routes/userRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import statsRoutes from './routes/statsRoutes.js'
import recommendationRoutes from './routes/recommendationRoutes.js'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import globalErrorHandler from './middlewares/errorMiddleware.js'
import path from 'path'
import { fileURLToPath } from 'url'

// 获取 __dirname 在 ES Modules 中的等效值
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// 中间件
app.use(helmet())
app.use(
    cors({
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Origin',
            'Accept',
        ],
    })
)
app.use(express.json({ limit: '10kb' }))
app.use(morgan('dev'))

// 添加静态文件服务中间件，用于访问上传的文件
app.use('/public', express.static(path.join(__dirname, '..', 'public')))

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
app.use('/api/v1/stats', statsRoutes)
app.use('/api/v1/recommendations', recommendationRoutes)

// 添加中国大学慕课的API代理路由
app.post('/api/course/search', async (req, res) => {
    try {
        // 从请求URL中获取csrfKey参数
        const csrfKey = req.query.csrfKey || 'fba6bd9e19744ab0b9092da379ef375d'

        const response = await fetch(
            `https://www.icourse163.org/web/j/mocSearchBean.searchCourse.rpc?csrfKey=${csrfKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded;charset=UTF-8',
                    Cookie: 'NTESSTUDYSI=fba6bd9e19744ab0b9092da379ef375d',
                    Origin: 'https://www.icourse163.org',
                    Referer: 'https://www.icourse163.org',
                },
                body: req.body.toString(),
            }
        )
        const data = await response.json()
        res.json(data)
    } catch (error) {
        console.error('代理请求失败:', error)
        res.status(500).json({ error: '代理请求失败' })
    }
})

// 全局错误处理
app.use(globalErrorHandler)

export default app
