import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import Tag from '../models/tagModel.js'

// 获取当前文件的目录名
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载环境变量，使用server目录下的.env文件
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// 连接数据库
const DB_URI =
    process.env.DATABASE_URI || 'mongodb://localhost:27017/lessonResourceRecSys'

// 连接到MongoDB
mongoose
    .connect(DB_URI)
    .then(() => console.log('数据库连接成功'))
    .catch((err) => {
        console.error('数据库连接失败:', err)
        process.exit(1)
    })

// 查询并显示标签
const checkTags = async () => {
    try {
        // 查询推荐系统相关标签
        const functionTags = await Tag.find({ category: 'function' }).lean()

        console.log('=== 功能相关标签 ===')
        console.log(JSON.stringify(functionTags, null, 2))

        // 查询教学相关标签
        const teachingTags = await Tag.find({ category: 'teaching' }).lean()

        console.log('\n=== 教学相关标签 ===')
        console.log(JSON.stringify(teachingTags, null, 2))

        // 查询标签统计
        const tagCounts = await Tag.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
        ])

        console.log('\n=== 标签统计 ===')
        console.log(JSON.stringify(tagCounts, null, 2))

        process.exit()
    } catch (error) {
        console.error('查询失败:', error)
        process.exit(1)
    }
}

// 执行查询
checkTags()
