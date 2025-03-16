import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import connectDB from './config/database.js'
import app from './app.js'
import errorHandler from './middlewares/errorMiddleware.js'
import AppError from './utils/AppError.js'

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
app.listen(port, () => {
    console.log(`服务器运行在端口 ${port}`)
})
