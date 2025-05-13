import mongoose from 'mongoose'
import Resource from '../models/resourceModel.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env') })

/**
 * 查看当前资源数量
 */
const checkResourceCount = async () => {
    try {
        // 连接数据库
        console.log('正在连接到数据库...')
        await mongoose.connect(
            process.env.MONGODB_URI || process.env.DATABASE_URL
        )
        console.log('已连接到 MongoDB')

        // 查询资源总数
        const totalCount = await Resource.countDocuments({})
        console.log(`当前数据库中共有 ${totalCount} 条资源`)

        // 查看最近添加的资源（前5条）
        const recentResources = await Resource.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id title createdAt')

        if (recentResources.length > 0) {
            console.log('\n最近添加的5条资源:')
            recentResources.forEach((resource, index) => {
                console.log(
                    `${index + 1}. ${resource.title} (ID: ${
                        resource._id
                    }, 创建时间: ${resource.createdAt})`
                )
            })
        }
    } catch (error) {
        console.error('查询资源失败:', error)
    } finally {
        // 关闭数据库连接
        await mongoose.connection.close()
        console.log('数据库连接已关闭')
    }
}

// 执行查询操作
checkResourceCount()
    .then(() => console.log('查询资源数量脚本执行完成'))
    .catch((err) => console.error('查询资源数量脚本执行失败:', err))
