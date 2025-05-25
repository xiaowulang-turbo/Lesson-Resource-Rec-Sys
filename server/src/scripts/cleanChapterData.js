import mongoose from 'mongoose'
import Resource from '../models/resourceModel.js'
import { config } from 'dotenv'

config()

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

// 清理章节数据
const cleanChapterData = async () => {
    try {
        console.log('🧹 开始清理已有的章节数据...')

        // 1. 删除所有章节资源
        const deleteResult = await Resource.deleteMany({
            contentType: 'resource',
            'courseStructure.parentCourse': { $ne: null },
        })
        console.log(`🗑️  删除了 ${deleteResult.deletedCount} 个章节资源`)

        // 2. 重置所有原始课程的结构
        const courses = await Resource.find({ contentType: 'course' })
        console.log(`🔄 找到 ${courses.length} 门课程需要重置`)

        for (const course of courses) {
            await Resource.findByIdAndUpdate(course._id, {
                $set: {
                    'courseStructure.parentCourse': null,
                    'courseStructure.chapter': {
                        number: null,
                        title: '',
                        subtitle: '',
                        level: 1,
                        parentChapter: null,
                    },
                    'courseStructure.order': {
                        courseOrder: 0,
                        chapterOrder: 0,
                        sectionOrder: 0,
                    },
                    'courseStructure.learningPath': {
                        isRequired: true,
                        prerequisites: [],
                        estimatedDuration: 0,
                        difficultyProgression: 5,
                    },
                },
            })
            console.log(`  ✓ 重置课程: ${course.title}`)
        }

        console.log('✅ 数据清理完成！')
    } catch (error) {
        console.error('❌ 清理过程中发生错误:', error)
    } finally {
        await mongoose.disconnect()
        console.log('📴 数据库连接已关闭')
    }
}

// 执行脚本
const main = async () => {
    await connectDB()
    await cleanChapterData()
}

main()
