import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import connectDB from './config/database.js'
import app from './app.js'
import errorHandler from './middlewares/errorMiddleware.js'
import AppError from './utils/appError.js'
import cacheService from './services/RedisCacheService.js'

// 获取当前文件的目录路径
const __dirname = dirname(fileURLToPath(import.meta.url))

// 加载环境变量
dotenv.config({ path: join(__dirname, '../.env') })

// 连接数据库
connectDB()

// 处理未找到的路由
app.all('*', (req, res, next) => {
    next(new AppError(`找不到路径: ${req.originalUrl}`, 404))
})

// 错误处理中间件
app.use(errorHandler)

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log(`服务器运行在端口 ${port}`)
})

// 优雅地处理进程终止，确保资源释放
process.on('SIGTERM', async () => {
    console.log('接收到SIGTERM信号，正在关闭服务器...')
    await cacheService.close()
    server.close(() => {
        console.log('服务器已关闭')
        process.exit(0)
    })
})

process.on('SIGINT', async () => {
    console.log('接收到SIGINT信号，正在关闭服务器...')
    await cacheService.close()
    server.close(() => {
        console.log('服务器已关闭')
        process.exit(0)
    })
})
