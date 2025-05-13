import mongoose from 'mongoose'
import Resource from '../models/resourceModel.js'
import ResourceRelationship from '../models/resourceRelationshipModel.js'
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
 * 删除最近添加的资源
 * @param {Number} count 要删除的资源数量
 * @returns {Promise<void>}
 */
const deleteRecentResources = async (count = 20) => {
    try {
        // 连接数据库
        console.log('正在连接到数据库...')
        await mongoose.connect(
            process.env.MONGODB_URI || process.env.DATABASE_URL
        )
        console.log('已连接到 MongoDB')

        // 查找最近添加的资源
        const recentResources = await Resource.find({})
            .sort({ createdAt: -1 })
            .limit(count)
            .select('_id title createdAt')

        if (recentResources.length === 0) {
            console.log('没有找到可删除的资源')
            return
        }

        console.log(`找到 ${recentResources.length} 个最近添加的资源`)

        // 提取资源ID
        const resourceIds = recentResources.map((resource) => resource._id)

        // 显示要删除的资源信息
        console.log('要删除的资源:')
        recentResources.forEach((resource, index) => {
            console.log(
                `${index + 1}. ${resource.title} (ID: ${
                    resource._id
                }, 创建时间: ${resource.createdAt})`
            )
        })

        // 删除相关的资源关系数据
        const relationshipResult = await ResourceRelationship.deleteMany({
            resource_id: { $in: resourceIds },
        })
        console.log(`已删除 ${relationshipResult.deletedCount} 条资源关系数据`)

        // 删除资源
        const deleteResult = await Resource.deleteMany({
            _id: { $in: resourceIds },
        })

        console.log(`成功删除了 ${deleteResult.deletedCount} 条最近添加的资源`)
    } catch (error) {
        console.error('删除资源失败:', error)
    } finally {
        // 关闭数据库连接
        await mongoose.connection.close()
        console.log('数据库连接已关闭')
    }
}

// 获取命令行参数，允许指定删除数量
const args = process.argv.slice(2)
const count = args[0] ? parseInt(args[0]) : 100

// 执行删除操作
deleteRecentResources(count)
    .then(() => console.log('删除资源脚本执行完成'))
    .catch((err) => console.error('删除资源脚本执行失败:', err))
