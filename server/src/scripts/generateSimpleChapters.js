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

// 为人工智能课程生成简化章节结构
const getAISimpleChapters = () => {
    return [
        {
            number: 1,
            title: '课程介绍',
            subtitle: '课程概述与学习目标',
            resources: [
                { title: '课程导学', pedagogicalType: 'courseware' },
                { title: '学习路线图', pedagogicalType: 'reference' },
                { title: '预备知识检测', pedagogicalType: 'assessment' },
            ],
        },
        {
            number: 2,
            title: '基础理论',
            subtitle: '人工智能核心概念',
            resources: [
                { title: '机器学习基础', pedagogicalType: 'courseware' },
                { title: '深度学习入门', pedagogicalType: 'tutorial' },
                { title: '基础理论练习', pedagogicalType: 'assessment' },
            ],
        },
        {
            number: 3,
            title: '核心算法',
            subtitle: '智能算法与实现',
            resources: [
                { title: '搜索算法', pedagogicalType: 'tutorial' },
                { title: '神经网络', pedagogicalType: 'courseware' },
                { title: '算法实践项目', pedagogicalType: 'project' },
            ],
        },
        {
            number: 4,
            title: '应用实战',
            subtitle: '人工智能应用开发',
            resources: [
                { title: '计算机视觉应用', pedagogicalType: 'project' },
                { title: '自然语言处理', pedagogicalType: 'tutorial' },
                { title: '应用案例分析', pedagogicalType: 'courseware' },
            ],
        },
        {
            number: 5,
            title: '前沿发展',
            subtitle: '未来技术趋势',
            resources: [
                { title: '最新技术动态', pedagogicalType: 'reference' },
                { title: '行业发展趋势', pedagogicalType: 'courseware' },
                { title: '综合项目实战', pedagogicalType: 'project' },
            ],
        },
    ]
}

// 为其他学科生成通用简化章节结构
const getGeneralSimpleChapters = () => {
    return [
        {
            number: 1,
            title: '课程介绍',
            subtitle: '课程概述与学习目标',
            resources: [
                { title: '课程导学', pedagogicalType: 'courseware' },
                { title: '学习指南', pedagogicalType: 'reference' },
                { title: '预备知识测试', pedagogicalType: 'assessment' },
            ],
        },
        {
            number: 2,
            title: '理论基础',
            subtitle: '核心概念与原理',
            resources: [
                { title: '基本概念', pedagogicalType: 'courseware' },
                { title: '核心理论', pedagogicalType: 'courseware' },
                { title: '理论练习', pedagogicalType: 'assessment' },
            ],
        },
        {
            number: 3,
            title: '方法技能',
            subtitle: '实用方法与技巧',
            resources: [
                { title: '基本方法', pedagogicalType: 'tutorial' },
                { title: '技能训练', pedagogicalType: 'project' },
                { title: '方法应用', pedagogicalType: 'courseware' },
            ],
        },
        {
            number: 4,
            title: '实践应用',
            subtitle: '理论与实践结合',
            resources: [
                { title: '实践案例', pedagogicalType: 'project' },
                { title: '应用指导', pedagogicalType: 'tutorial' },
                { title: '实践评估', pedagogicalType: 'assessment' },
            ],
        },
        {
            number: 5,
            title: '总结提升',
            subtitle: '知识综合与提升',
            resources: [
                { title: '知识总结', pedagogicalType: 'courseware' },
                { title: '拓展阅读', pedagogicalType: 'reference' },
                { title: '综合测试', pedagogicalType: 'assessment' },
            ],
        },
    ]
}

// 为课程创建简化章节资源
const createSimpleChapterResources = async (parentCourse, chapters, userId) => {
    const createdResources = []
    let totalOrder = 1 // 从1开始，因为不再转换原始课程

    for (const chapter of chapters) {
        let chapterOrder = 1

        for (const resourceInfo of chapter.resources) {
            // 简化的学习时长估算
            const estimatedDuration = (() => {
                switch (resourceInfo.pedagogicalType) {
                    case 'courseware':
                        return 45
                    case 'tutorial':
                        return 30
                    case 'project':
                        return 90
                    case 'assessment':
                        return 25
                    case 'reference':
                        return 20
                    default:
                        return 30
                }
            })()

            // 格式化标题：第X章第X节 资源名称
            const formattedTitle = `第${chapter.number}章第${chapterOrder}节 ${resourceInfo.title}`

            const newResource = new Resource({
                title: formattedTitle,
                description: `《${parentCourse.title}》- ${chapter.title}：${resourceInfo.title}`,
                pedagogicalType: resourceInfo.pedagogicalType,
                format: 'url',
                contentType: 'resource',
                courseStructure: {
                    parentCourse: parentCourse._id,
                    chapter: {
                        number: chapter.number,
                        title: chapter.title,
                        subtitle: chapter.subtitle,
                        level: 1,
                        parentChapter: null,
                    },
                    order: {
                        courseOrder: totalOrder,
                        chapterOrder: chapterOrder,
                        sectionOrder: 0,
                    },
                    learningPath: {
                        isRequired:
                            resourceInfo.pedagogicalType !== 'reference',
                        prerequisites:
                            chapter.number === 2 ? [parentCourse._id] : [],
                        estimatedDuration: estimatedDuration,
                        difficultyProgression: chapter.number * 2,
                    },
                    completion: {
                        isCompleted: false,
                        completedBy: [],
                    },
                },
                subject: parentCourse.subject,
                grade: parentCourse.grade,
                difficulty: Math.min(
                    parentCourse.difficulty + Math.floor(chapter.number / 2),
                    5
                ),
                url: `${parentCourse.url}#chapter-${chapter.number}-resource-${chapterOrder}`,
                cover: parentCourse.cover,
                authors: parentCourse.authors,
                publisher: parentCourse.publisher,
                organization: parentCourse.organization,
                school: parentCourse.school,
                createdBy: userId,
                tags: parentCourse.tags,
                access: {
                    isPublic: true,
                    allowedUsers: [],
                    allowedRoles: [],
                },
                version: {
                    number: '1.0.0',
                    history: [],
                },
            })

            try {
                const savedResource = await newResource.save()
                createdResources.push(savedResource)
                console.log(`  ✓ 创建: ${savedResource.title}`)

                chapterOrder++
                totalOrder++
            } catch (error) {
                console.error(`  ✗ 创建失败: ${formattedTitle}`, error.message)
            }
        }
    }

    return createdResources
}

// 主执行函数
const generateSimpleChapters = async () => {
    try {
        console.log('🚀 开始生成简化章节结构...')

        // 获取所有课程类型的资源
        const courses = await Resource.find({
            contentType: 'course',
            'courseStructure.parentCourse': null, // 确保只处理原始课程
        })
        console.log(`📚 找到 ${courses.length} 门课程需要处理`)

        if (courses.length === 0) {
            console.log('没有找到需要处理的课程')
            return
        }

        // 使用第一个课程的创建者作为默认用户ID
        const defaultUserId = courses[0]?.createdBy

        let processedCount = 0
        let totalSubResources = 0

        for (const course of courses) {
            console.log(`\n📖 处理课程: ${course.title}`)

            // 检查是否已经有子资源
            const existingSubResources = await Resource.find({
                'courseStructure.parentCourse': course._id,
            })

            if (existingSubResources.length > 0) {
                console.log(
                    `⚠️  课程 "${course.title}" 已有 ${existingSubResources.length} 个子资源，跳过`
                )
                continue
            }

            // 根据课程主题选择章节结构
            let chapters
            if (
                course.title.includes('人工智能') ||
                course.title.includes('AI')
            ) {
                chapters = getAISimpleChapters()
            } else {
                chapters = getGeneralSimpleChapters()
            }

            // 创建章节资源
            const subResources = await createSimpleChapterResources(
                course,
                chapters,
                defaultUserId
            )
            totalSubResources += subResources.length

            console.log(
                `✅ 课程 "${course.title}" 处理完成，总共 ${subResources.length} 个章节`
            )
            processedCount++
        }

        console.log(`\n🎉 章节生成完成！`)
        console.log(`📊 统计信息:`)
        console.log(`   - 处理课程数量: ${processedCount}`)
        console.log(`   - 生成章节总数: ${totalSubResources}`)
        console.log(
            `   - 平均每课程章节数: ${
                processedCount > 0
                    ? Math.round(totalSubResources / processedCount)
                    : 0
            }`
        )
    } catch (error) {
        console.error('❌ 生成过程中发生错误:', error)
    } finally {
        await mongoose.disconnect()
        console.log('📴 数据库连接已关闭')
    }
}

// 执行脚本
const main = async () => {
    await connectDB()
    await generateSimpleChapters()
}

main()
