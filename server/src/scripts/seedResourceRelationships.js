import mongoose from 'mongoose'
import Resource from '../models/resourceModel.js'
import ResourceRelationship from '../models/resourceRelationshipModel.js'
import dotenv from 'dotenv'

dotenv.config()

/**
 * 打印资源关系统计信息
 */
const printStatistics = async () => {
    const totalRelationships = await ResourceRelationship.countDocuments()
    console.log('\n===== 资源关系统计信息 =====')
    console.log(`资源关系总数: ${totalRelationships}`)

    // 获取相似资源统计
    const similarResourcesStats = await ResourceRelationship.aggregate([
        { $project: { similar_count: { $size: '$similar_resources' } } },
        {
            $group: {
                _id: null,
                avg: { $avg: '$similar_count' },
                max: { $max: '$similar_count' },
                min: { $min: '$similar_count' },
            },
        },
    ])

    if (similarResourcesStats.length > 0) {
        console.log('\n相似资源统计:')
        console.log(
            `  平均相似资源数: ${similarResourcesStats[0].avg.toFixed(2)}`
        )
        console.log(`  最大相似资源数: ${similarResourcesStats[0].max}`)
        console.log(`  最小相似资源数: ${similarResourcesStats[0].min}`)
    }

    // 获取共同访问统计
    const coAccessedStats = await ResourceRelationship.aggregate([
        { $project: { co_access_count: { $size: '$co_accessed_with' } } },
        {
            $group: {
                _id: null,
                avg: { $avg: '$co_access_count' },
                max: { $max: '$co_access_count' },
                min: { $min: '$co_access_count' },
            },
        },
    ])

    if (coAccessedStats.length > 0) {
        console.log('\n共同访问统计:')
        console.log(
            `  平均共同访问资源数: ${coAccessedStats[0].avg.toFixed(2)}`
        )
        console.log(`  最大共同访问资源数: ${coAccessedStats[0].max}`)
        console.log(`  最小共同访问资源数: ${coAccessedStats[0].min}`)
    }

    // 获取推荐序列统计
    const recommendedStats = await ResourceRelationship.aggregate([
        { $project: { seq_count: { $size: '$recommended_sequence' } } },
        {
            $group: {
                _id: null,
                avg: { $avg: '$seq_count' },
                max: { $max: '$seq_count' },
                min: { $min: '$seq_count' },
            },
        },
    ])

    if (recommendedStats.length > 0) {
        console.log('\n推荐序列统计:')
        console.log(`  平均推荐序列长度: ${recommendedStats[0].avg.toFixed(2)}`)
        console.log(`  最大推荐序列长度: ${recommendedStats[0].max}`)
        console.log(`  最小推荐序列长度: ${recommendedStats[0].min}`)
    }

    console.log('\n===========================')
}

/**
 * 为资源创建关系数据的函数
 * 包括相似资源、共同访问和推荐序列
 */
const seedResourceRelationships = async () => {
    try {
        // 连接数据库
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('已连接到 MongoDB')

        // 清除现有的资源关系数据
        await ResourceRelationship.deleteMany({})
        console.log('已清除现有资源关系数据')

        // 获取所有资源
        const resources = await Resource.find({}).select(
            '_id title subject grade pedagogicalType tags difficulty'
        )

        if (resources.length === 0) {
            console.log('没有找到资源，请先确保存在资源数据')
            return
        }

        console.log(`找到 ${resources.length} 个资源`)

        // 创建资源关系
        let createdRelationships = 0
        for (const resource of resources) {
            // 计算与其他资源的相似度
            const similarResources = []

            for (const otherResource of resources) {
                // 跳过自身
                if (otherResource._id.equals(resource._id)) continue

                // 计算相似度 (简单示例: 基于学科、年级和类型的匹配)
                let similarityScore = 0

                // 学科相同加 0.4
                if (otherResource.subject === resource.subject) {
                    similarityScore += 0.4
                }

                // 年级相同加 0.3
                if (otherResource.grade === resource.grade) {
                    similarityScore += 0.3
                }

                // 教学类型相同加 0.2
                if (
                    otherResource.pedagogicalType === resource.pedagogicalType
                ) {
                    similarityScore += 0.2
                }

                // 难度差异不超过1加 0.1
                if (
                    Math.abs(otherResource.difficulty - resource.difficulty) <=
                    1
                ) {
                    similarityScore += 0.1
                }

                // 仅添加相似度大于 0.5 的资源
                if (similarityScore >= 0.5) {
                    // 创建共同主题和技能数组 (实际应用中应基于实际内容分析)
                    const commonTopics = ['相关主题']
                    const commonSkills = ['共同技能']

                    similarResources.push({
                        resource_id: otherResource._id,
                        similarity_score: similarityScore,
                        common_topics: commonTopics,
                        common_skills: commonSkills,
                    })
                }
            }

            // 构建共同访问数据 (随机生成示例数据)
            const coAccessedResources = []
            const randomOffset = Math.floor(
                Math.random() * (resources.length - 1)
            )

            for (let i = 0; i < Math.min(5, resources.length - 1); i++) {
                const index = (randomOffset + i) % resources.length
                const otherResource = resources[index]

                // 跳过自身
                if (otherResource._id.equals(resource._id)) continue

                const coAccessCount = Math.floor(Math.random() * 50) + 10 // 生成10-59之间的随机数

                coAccessedResources.push({
                    resource_id: otherResource._id,
                    co_access_count: coAccessCount,
                    co_access_percentage: Math.floor(Math.random() * 70) + 30, // 生成30-99之间的随机数
                })
            }

            // 构建推荐序列 (随机选择3个相似资源作为推荐序列)
            const shuffledResources = [...resources]
                .filter((r) => !r._id.equals(resource._id))
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map((r) => r._id)

            // 创建资源关系记录
            await ResourceRelationship.create({
                resource_id: resource._id,
                resource_title: resource.title,
                similar_resources: similarResources,
                co_accessed_with: coAccessedResources,
                recommended_sequence: shuffledResources,
            })

            createdRelationships++

            // 每创建10个关系记录打印一次进度
            if (createdRelationships % 10 === 0) {
                console.log(
                    `已创建 ${createdRelationships}/${resources.length} 个资源关系`
                )
            }
        }

        console.log(`完成！已创建 ${createdRelationships} 个资源关系记录`)

        // 打印统计信息
        await printStatistics()
    } catch (error) {
        console.error('资源关系数据填充失败:', error)
    } finally {
        await mongoose.connection.close()
        console.log('数据库连接已关闭')
    }
}

// 运行脚本
seedResourceRelationships()
