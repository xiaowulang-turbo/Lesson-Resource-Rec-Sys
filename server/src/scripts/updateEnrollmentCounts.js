import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Course from '../models/courseModel.js'

// 获取当前文件的目录路径
const __dirname = dirname(fileURLToPath(import.meta.url))

// 加载环境变量
dotenv.config({ path: join(__dirname, '../../.env') })

async function updateEnrollmentCounts() {
    try {
        // 连接数据库
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('数据库连接成功')

        // 更新所有课程的注册人数
        console.log('开始更新课程注册人数...')
        await Course.updateAllEnrollmentCounts()
        console.log('课程注册人数更新完成')

        // 关闭数据库连接
        await mongoose.connection.close()
        console.log('数据库连接已关闭')
        process.exit(0)
    } catch (error) {
        console.error('更新失败:', error)
        process.exit(1)
    }
}

// 运行更新脚本
updateEnrollmentCounts()
