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
import moocRoutes from './routes/moocRoutes.js'
import tagRoutes from './routes/tagRoutes.js'
import searchRoutes from './routes/searchRoutes.js'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import globalErrorHandler from './middlewares/errorMiddleware.js'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import 'dotenv/config'
import fs from 'fs'
import cacheService from './services/RedisCacheService.js'

// 获取 __dirname 在 ES Modules 中的等效值
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// 检查数据库连接状态
mongoose.connection.on('connected', () => {
    console.log('数据库连接成功')
})

mongoose.connection.on('error', (err) => {
    console.error('数据库连接错误:', err)
})

mongoose.connection.on('disconnected', () => {
    console.log('数据库连接断开')
})

// 中间件
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: [
                    "'self'",
                    'http://localhost:5173',
                    'http://127.0.0.1:5173',
                ],
                frameSrc: ["'self'"],
                childSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'blob:'],
                mediaSrc: ["'self'", 'data:', 'blob:'],
            },
        },
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
)

app.use(
    cors({
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Origin',
            'Accept',
        ],
        exposedHeaders: ['Content-Length', 'Content-Type'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    })
)
app.use(express.json({ limit: '100kb' }))
app.use(morgan('dev'))

// 添加静态文件服务中间件，用于访问上传的文件
app.use('/public', express.static(path.join(__dirname, '..', 'public')))

// 确保public/uploads/images目录存在
const imagesDir = path.join(__dirname, '..', 'public', 'uploads', 'images')
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
}

// 复制默认头像到images目录
const defaultUserSrc = path.join(
    __dirname,
    '..',
    '..',
    'src',
    'public',
    'default-user.jpg'
)
const defaultUserDest = path.join(imagesDir, 'default-user.jpg')
if (fs.existsSync(defaultUserSrc) && !fs.existsSync(defaultUserDest)) {
    fs.copyFileSync(defaultUserSrc, defaultUserDest)
    console.log('默认头像已复制到:', defaultUserDest)
}

// 设置文件下载头的中间件
app.use('/public/uploads', (req, res, next) => {
    // 检查是否请求下载文件
    if (req.query.download === 'true') {
        // 设置Content-Disposition头，让浏览器下载而不是打开文件
        const filename = path.basename(req.url.split('?')[0]) // 获取文件名
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}"`
        )
    }
    next()
})

// 添加额外的调试日志
app.use((req, res, next) => {
    console.log(
        `${new Date().toISOString()} - ${req.method} ${req.originalUrl}`
    )
    next()
})

// 限制请求
const limiter = rateLimit({
    max: 500,
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
app.use('/api/v1/mooc', moocRoutes)
app.use('/api/v1/tags', tagRoutes)
app.use('/api/v1/search', searchRoutes)

// 添加中国大学慕课的API代理路由
app.post('/api/course/search', async (req, res) => {
    try {
        // 重定向到mooc代理处理程序
        req.url = '/api/v1/mooc/proxy'
        app._router.handle(req, res)
    } catch (error) {
        console.error('代理请求失败:', error)
        res.status(500).json({ error: '代理请求失败' })
    }
})

// 全局错误处理
app.use(globalErrorHandler)

// 服务端渲染支持，将所有未匹配的路由交给前端路由处理
app.get('*', (req, res) => {
    res.sendFile(path.join(path.join(__dirname, '..', 'public'), 'index.html'))
})

// 设置定时清理过期缓存（Redis会自动处理，此部分仅为保持API兼容）
setInterval(async () => {
    await cacheService.cleanup()
}, 3600000) // 每小时检查一次

export default app
