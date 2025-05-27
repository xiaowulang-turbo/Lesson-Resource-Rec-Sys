import Resource from '../models/resourceModel.js'

/**
 * 课程章节结构使用示例
 * 演示如何创建和管理带有章节结构的课程资源
 */

// 示例：创建一门JavaScript基础课程
export async function createJavaScriptCourse() {
    try {
        // 1. 首先创建主课程资源
        const mainCourse = new Resource({
            title: 'JavaScript从入门到精通',
            description: '一门全面的JavaScript编程课程，适合初学者到中级开发者',
            pedagogicalType: 'courseware',
            format: 'interactive',
            contentType: 'course', // 标识为课程
            subject: '计算机科学',
            grade: '大学',
            difficulty: 3,
            authors: '张教授',
            organization: '计算机学院',
            createdBy: '507f1f77bcf86cd799439011', // 示例用户ID
            // 课程本身不需要父课程
            courseStructure: {
                parentCourse: null,
                chapter: {
                    number: 0,
                    title: '课程主页',
                    level: 0,
                },
                order: {
                    courseOrder: 0,
                },
                learningPath: {
                    estimatedDuration: 2400, // 40小时
                },
            },
        })

        await mainCourse.save()
        console.log('主课程创建成功:', mainCourse._id)

        // 2. 创建第一章的资源
        const chapter1Resources = [
            {
                title: 'JavaScript简介',
                description: '了解JavaScript的历史和基本概念',
                pedagogicalType: 'courseware',
                format: 'pptx',
                chapterInfo: {
                    number: 1,
                    title: '第一章：JavaScript基础',
                    level: 1,
                },
                orderInfo: {
                    courseOrder: 1,
                    chapterOrder: 1,
                },
                estimatedDuration: 60,
            },
            {
                title: '变量和数据类型',
                description: '学习JavaScript中的变量声明和基本数据类型',
                pedagogicalType: 'tutorial',
                format: 'video',
                chapterInfo: {
                    number: 1,
                    title: '第一章：JavaScript基础',
                    level: 1,
                },
                orderInfo: {
                    courseOrder: 2,
                    chapterOrder: 2,
                },
                estimatedDuration: 90,
            },
            {
                title: '第一章练习',
                description: '巩固第一章所学内容的练习题',
                pedagogicalType: 'assessment',
                format: 'interactive',
                chapterInfo: {
                    number: 1,
                    title: '第一章：JavaScript基础',
                    level: 1,
                },
                orderInfo: {
                    courseOrder: 3,
                    chapterOrder: 3,
                },
                estimatedDuration: 45,
            },
        ]

        const chapter1CreatedResources = []
        for (let i = 0; i < chapter1Resources.length; i++) {
            const resourceData = chapter1Resources[i]
            const resource = new Resource({
                title: resourceData.title,
                description: resourceData.description,
                pedagogicalType: resourceData.pedagogicalType,
                format: resourceData.format,
                contentType: 'resource',
                subject: '计算机科学',
                grade: '大学',
                difficulty: 2,
                authors: '张教授',
                organization: '计算机学院',
                createdBy: '507f1f77bcf86cd799439011',
                courseStructure: {
                    parentCourse: mainCourse._id,
                    chapter: resourceData.chapterInfo,
                    order: resourceData.orderInfo,
                    learningPath: {
                        isRequired: true,
                        prerequisites:
                            i > 0 ? [chapter1CreatedResources[i - 1]._id] : [],
                        estimatedDuration: resourceData.estimatedDuration,
                        difficultyProgression: i + 1,
                    },
                },
            })

            await resource.save()
            chapter1CreatedResources.push(resource)
            console.log(`第一章资源创建成功: ${resource.title}`)
        }

        // 3. 创建第二章的资源
        const chapter2Resources = [
            {
                title: '函数基础',
                description: '学习如何定义和使用JavaScript函数',
                pedagogicalType: 'courseware',
                format: 'pptx',
                chapterInfo: {
                    number: 2,
                    title: '第二章：函数和作用域',
                    level: 1,
                },
                orderInfo: {
                    courseOrder: 4,
                    chapterOrder: 1,
                },
                estimatedDuration: 75,
                prerequisites: [chapter1CreatedResources[2]._id], // 需要完成第一章练习
            },
            {
                title: '作用域和闭包',
                description: '深入理解JavaScript的作用域链和闭包概念',
                pedagogicalType: 'tutorial',
                format: 'video',
                chapterInfo: {
                    number: 2,
                    title: '第二章：函数和作用域',
                    level: 1,
                },
                orderInfo: {
                    courseOrder: 5,
                    chapterOrder: 2,
                },
                estimatedDuration: 120,
            },
        ]

        const chapter2CreatedResources = []
        for (let i = 0; i < chapter2Resources.length; i++) {
            const resourceData = chapter2Resources[i]
            const resource = new Resource({
                title: resourceData.title,
                description: resourceData.description,
                pedagogicalType: resourceData.pedagogicalType,
                format: resourceData.format,
                contentType: 'resource',
                subject: '计算机科学',
                grade: '大学',
                difficulty: 3,
                authors: '张教授',
                organization: '计算机学院',
                createdBy: '507f1f77bcf86cd799439011',
                courseStructure: {
                    parentCourse: mainCourse._id,
                    chapter: resourceData.chapterInfo,
                    order: resourceData.orderInfo,
                    learningPath: {
                        isRequired: true,
                        prerequisites:
                            resourceData.prerequisites ||
                            (i > 0
                                ? [chapter2CreatedResources[i - 1]._id]
                                : []),
                        estimatedDuration: resourceData.estimatedDuration,
                        difficultyProgression: i + 4,
                    },
                },
            })

            await resource.save()
            chapter2CreatedResources.push(resource)
            console.log(`第二章资源创建成功: ${resource.title}`)
        }

        return {
            mainCourse,
            chapter1Resources: chapter1CreatedResources,
            chapter2Resources: chapter2CreatedResources,
        }
    } catch (error) {
        console.error('创建课程失败:', error)
        throw error
    }
}

// 示例：查询课程结构
export async function getCourseStructureExample(courseId) {
    try {
        // 获取课程的完整结构
        const courseStructure = await Resource.getCourseStructure(courseId)
        console.log('课程结构:', JSON.stringify(courseStructure, null, 2))

        // 获取特定章节的资源
        const chapter1Resources = await Resource.findByChapter(courseId, 1)
        console.log(
            '第一章资源:',
            chapter1Resources.map((r) => r.title)
        )

        // 获取课程中的所有资源（按顺序）
        const allResources = await Resource.findByCourse(courseId)
        console.log(
            '所有资源（按顺序）:',
            allResources.map(
                (r) => `${r.courseStructure.order.courseOrder}. ${r.title}`
            )
        )

        return courseStructure
    } catch (error) {
        console.error('查询课程结构失败:', error)
        throw error
    }
}

// 示例：学习进度管理
export async function learningProgressExample(courseId, userId) {
    try {
        // 获取课程中的第一个资源
        const firstResource = await Resource.findOne({
            'courseStructure.parentCourse': courseId,
            'courseStructure.order.courseOrder': 1,
        })

        if (firstResource) {
            // 标记为已完成
            await firstResource.markCompleted(userId)
            console.log(`资源 "${firstResource.title}" 已标记为完成`)

            // 获取下一个资源
            const nextResourceInfo = await Resource.getNextResource(
                firstResource._id,
                userId
            )
            if (nextResourceInfo.resource) {
                console.log(`下一个资源: ${nextResourceInfo.resource.title}`)
                console.log(`可访问: ${nextResourceInfo.canAccess}`)
            }

            // 获取整体学习进度
            const progress = await Resource.getCourseProgress(courseId, userId)
            console.log('学习进度:', progress)
        }

        return true
    } catch (error) {
        console.error('学习进度管理失败:', error)
        throw error
    }
}

// 示例：检查资源访问权限
export async function checkResourceAccessExample(resourceId, userId) {
    try {
        const resource = await Resource.findById(resourceId)
        if (!resource) {
            console.log('资源不存在')
            return false
        }

        // 检查访问权限
        const accessInfo = await resource.canUserAccess(userId)
        console.log('访问权限检查结果:', accessInfo)

        // 获取资源在课程中的位置
        const positionInfo = await resource.getPositionInCourse()
        console.log('资源位置信息:', positionInfo)

        return accessInfo.canAccess
    } catch (error) {
        console.error('检查访问权限失败:', error)
        throw error
    }
}

// 示例：复制资源到新章节
export async function copyResourceExample(
    sourceResourceId,
    targetCourseId,
    userId
) {
    try {
        const sourceResource = await Resource.findById(sourceResourceId)
        if (!sourceResource) {
            console.log('源资源不存在')
            return null
        }

        const newChapterInfo = {
            number: 3,
            title: '第三章：高级特性',
            level: 1,
        }

        const newOrderInfo = {
            courseOrder: 10,
            chapterOrder: 1,
        }

        const copiedResource = await sourceResource.copyToChapter(
            targetCourseId,
            newChapterInfo,
            newOrderInfo,
            userId
        )

        console.log(`资源已复制: ${copiedResource.title}`)
        return copiedResource
    } catch (error) {
        console.error('复制资源失败:', error)
        throw error
    }
}

// 使用示例函数
export async function runExamples() {
    try {
        console.log('开始创建示例课程...')
        const course = await createJavaScriptCourse()

        console.log('\n查询课程结构...')
        await getCourseStructureExample(course.mainCourse._id)

        console.log('\n模拟学习进度...')
        const userId = '507f1f77bcf86cd799439012' // 示例学习者ID
        await learningProgressExample(course.mainCourse._id, userId)

        console.log('\n检查资源访问权限...')
        await checkResourceAccessExample(
            course.chapter1Resources[0]._id,
            userId
        )

        console.log('\n示例运行完成！')
    } catch (error) {
        console.error('运行示例失败:', error)
    }
}

export default {
    createJavaScriptCourse,
    getCourseStructureExample,
    learningProgressExample,
    checkResourceAccessExample,
    copyResourceExample,
    runExamples,
}
