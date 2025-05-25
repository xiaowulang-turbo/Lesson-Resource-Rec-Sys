import mongoose from 'mongoose'
import Resource from '../models/resourceModel.js'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置环境变量
config({ path: path.join(__dirname, '../../../config.env') })

// 连接数据库
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

// 为课程类型资源创建默认courseStructure
const createDefaultCourseStructure = (resource) => {
    return {
        parentCourse: null, // 课程本身不需要父课程
        chapter: {
            number: null,
            title: '',
            subtitle: '',
            level: 1,
            parentChapter: null,
        },
        order: {
            courseOrder: 0,
            chapterOrder: 0,
            sectionOrder: 0,
        },
        learningPath: {
            isRequired: true,
            prerequisites: [],
            estimatedDuration: 0,
            difficultyProgression: resource.difficulty || 3,
        },
        completion: {
            isCompleted: false,
            completedBy: [],
        },
    }
}

// 为独立资源类型创建默认courseStructure
const createDefaultResourceStructure = (resource) => {
    return {
        parentCourse: null, // 独立资源没有父课程
        chapter: {
            number: null,
            title: '',
            subtitle: '',
            level: 1,
            parentChapter: null,
        },
        order: {
            courseOrder: 0,
            chapterOrder: 0,
            sectionOrder: 0,
        },
        learningPath: {
            isRequired: true,
            prerequisites: [],
            estimatedDuration: 30, // 默认30分钟
            difficultyProgression: resource.difficulty || 3,
        },
        completion: {
            isCompleted: false,
            completedBy: [],
        },
    }
}

// 检查courseStructure是否为空或不完整
const isCourseStructureIncomplete = (courseStructure) => {
    if (!courseStructure) return true

    // 检查必要的子对象是否存在
    const requiredFields = ['chapter', 'order', 'learningPath', 'completion']
    for (const field of requiredFields) {
        if (!courseStructure[field]) return true
    }

    // 检查具体字段是否存在
    if (!('number' in courseStructure.chapter)) return true
    if (!('courseOrder' in courseStructure.order)) return true
    if (!('isRequired' in courseStructure.learningPath)) return true
    if (!('isCompleted' in courseStructure.completion)) return true

    return false
}

// 主修复函数
const fixMissingCourseStructure = async () => {
    try {
        console.log('🚀 开始修复缺失的courseStructure字段...')

        // 查找所有资源
        const allResources = await Resource.find({})
        console.log(`📚 找到 ${allResources.length} 个资源需要检查`)

        let fixedCount = 0
        let skippedCount = 0

        for (const resource of allResources) {
            // 检查courseStructure是否缺失或不完整
            if (isCourseStructureIncomplete(resource.courseStructure)) {
                console.log(
                    `🔧 修复资源: ${resource.title} (${resource.contentType})`
                )

                let newCourseStructure
                if (resource.contentType === 'course') {
                    newCourseStructure = createDefaultCourseStructure(resource)
                } else {
                    newCourseStructure =
                        createDefaultResourceStructure(resource)
                }

                // 更新资源
                try {
                    await Resource.findByIdAndUpdate(
                        resource._id,
                        { courseStructure: newCourseStructure },
                        { new: true }
                    )
                    fixedCount++
                    console.log(`  ✅ 已修复: ${resource.title}`)
                } catch (error) {
                    console.error(
                        `  ❌ 修复失败: ${resource.title}`,
                        error.message
                    )
                }
            } else {
                skippedCount++
                if (skippedCount % 50 === 0) {
                    console.log(`⏩ 已跳过 ${skippedCount} 个正常资源...`)
                }
            }
        }

        console.log(`\n🎉 courseStructure修复完成！`)
        console.log(`📊 统计信息:`)
        console.log(`   - 总资源数量: ${allResources.length}`)
        console.log(`   - 修复资源数量: ${fixedCount}`)
        console.log(`   - 跳过资源数量: ${skippedCount}`)
        console.log(
            `   - 修复成功率: ${(
                (fixedCount / (fixedCount + skippedCount)) *
                100
            ).toFixed(2)}%`
        )

        // 验证修复结果
        console.log('\n🔍 验证修复结果...')
        const remainingIncomplete = await Resource.find({
            $or: [
                { courseStructure: { $exists: false } },
                { courseStructure: null },
                { 'courseStructure.chapter': { $exists: false } },
                { 'courseStructure.order': { $exists: false } },
                { 'courseStructure.learningPath': { $exists: false } },
                { 'courseStructure.completion': { $exists: false } },
            ],
        })

        if (remainingIncomplete.length > 0) {
            console.log(
                `⚠️  仍有 ${remainingIncomplete.length} 个资源的courseStructure不完整`
            )
            remainingIncomplete.forEach((resource) => {
                console.log(`   - ${resource.title} (${resource._id})`)
            })
        } else {
            console.log('✅ 所有资源的courseStructure字段都已完整！')
        }
    } catch (error) {
        console.error('❌ 修复过程中发生错误:', error)
    } finally {
        await mongoose.disconnect()
        console.log('📴 数据库连接已关闭')
    }
}

// 执行脚本
const main = async () => {
    await connectDB()
    await fixMissingCourseStructure()
}

main()
