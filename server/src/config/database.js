import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        // 使用mock数据库URL，实际使用时需要替换为真实的MongoDB URL
        const mockDBUrl = 'mongodb://localhost:27017/lesson-resource-db'
        const conn = await mongoose.connect(
            process.env.MONGODB_URI || mockDBUrl
        )
        console.log(`MongoDB 连接成功: ${conn.connection.host}`)
    } catch (error) {
        console.error(`MongoDB 连接错误: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB
