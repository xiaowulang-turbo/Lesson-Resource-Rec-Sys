import mongoose from 'mongoose'

/**
 * 连接数据库
 * 使用环境变量 MONGODB_URI 存储数据库连接字符串
 * 请确保在 .env 文件中设置了 MONGODB_URI
 */
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('未设置 MONGODB_URI 环境变量，请在 .env 文件中配置')
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB 连接成功: ${conn.connection.host}`)
    } catch (error) {
        console.error(`MongoDB 连接错误: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB
