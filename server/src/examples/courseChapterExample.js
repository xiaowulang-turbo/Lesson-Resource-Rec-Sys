import Resource from '../models/resourceModel.js'

// 课程章节功能使用示例

/**
 * 示例1: 创建软件工程课程的多个章节资源
 */
async function createSoftwareEngineeringCourse() {
    const courseInfo = {
        id: 'CS401_2024_Spring',
        name: '软件工程',
        code: 'CS401',
        semester: '2024春季',
        instructor: '张教授',
    }

    // 第1章 - 软件工程概述
    const chapter1Resources = [
        {
            title: '软件工程概述-课件',
            description: '介绍软件工程的基本概念和发展历程',
            pedagogicalType: 'courseware',
            format: 'pptx',
            subject: '计算机科学',
            grade: '本科三年级',
            difficulty: 2,
            course: courseInfo,
            chapter: {
                number: 1,
                title: '软件工程概述',
                section: 1,
                sectionTitle: '软件工程基本概念',
                order: 1,
            },
            createdBy: '用户ID', // 实际使用时需要真实的用户ID
            url: 'path/to/chapter1_section1.pptx',
        },
        {
            title: '软件危机与解决方案',
            description: '讲解软件危机的产生原因和解决方案',
            pedagogicalType: 'courseware',
            format: 'pptx',
            subject: '计算机科学',
            grade: '本科三年级',
            difficulty: 2,
            course: courseInfo,
            chapter: {
                number: 1,
                title: '软件工程概述',
                section: 2,
                sectionTitle: '软件危机与解决方案',
                order: 2,
            },
            createdBy: '用户ID',
            url: 'path/to/chapter1_section2.pptx',
        },
    ]

    // 第2章 - 软件生命周期
    const chapter2Resources = [
        {
            title: '软件生命周期模型',
            description: '介绍瀑布模型、螺旋模型等软件生命周期模型',
            pedagogicalType: 'courseware',
            format: 'pptx',
            subject: '计算机科学',
            grade: '本科三年级',
            difficulty: 3,
            course: courseInfo,
            chapter: {
                number: 2,
                title: '软件生命周期',
                section: 1,
                sectionTitle: '生命周期模型',
                order: 3,
            },
            createdBy: '用户ID',
            url: 'path/to/chapter2_section1.pptx',
        },
        {
            title: '敏捷开发方法',
            description: '介绍敏捷开发的原则和实践方法',
            pedagogicalType: 'courseware',
            format: 'video',
            subject: '计算机科学',
            grade: '本科三年级',
            difficulty: 3,
            course: courseInfo,
            chapter: {
                number: 2,
                title: '软件生命周期',
                section: 2,
                sectionTitle: '敏捷开发',
                order: 4,
            },
            createdBy: '用户ID',
            url: 'path/to/agile_development.mp4',
        },
    ]

    try {
        // 批量创建资源
        const allResources = [...chapter1Resources, ...chapter2Resources]
        const createdResources = await Resource.insertMany(allResources)
        console.log(`成功创建 ${createdResources.length} 个课程资源`)
        return createdResources
    } catch (error) {
        console.error('创建课程资源失败:', error)
        throw error
    }
}

/**
 * 示例2: 查询特定课程的所有资源（按章节排序）
 */
async function getCourseResources(courseId) {
    try {
        const resources = await Resource.findByCourse(courseId, {
            sort: 'chapter',
            limit: 100,
        })

        console.log(`课程 ${courseId} 共有 ${resources.length} 个资源:`)
        resources.forEach((resource) => {
            console.log(
                `- 第${resource.chapter.number}章第${resource.chapter.section}节: ${resource.title}`
            )
        })

        return resources
    } catch (error) {
        console.error('查询课程资源失败:', error)
        throw error
    }
}

/**
 * 示例3: 查询特定章节的资源
 */
async function getChapterResources(courseId, chapterNumber) {
    try {
        const resources = await Resource.findByChapter(courseId, chapterNumber)

        console.log(`课程 ${courseId} 第${chapterNumber}章资源:`)
        resources.forEach((resource) => {
            console.log(`- 第${resource.chapter.section}节: ${resource.title}`)
        })

        return resources
    } catch (error) {
        console.error('查询章节资源失败:', error)
        throw error
    }
}

/**
 * 示例4: 获取课程结构（章节树状结构）
 */
async function getCourseStructure(courseId) {
    try {
        const structure = await Resource.getCourseStructure(courseId)

        if (structure.length > 0) {
            const course = structure[0]
            console.log(`课程: ${course.courseName} (${course.courseId})`)

            course.chapters.forEach((chapter) => {
                console.log(`  第${chapter.number}章: ${chapter.title}`)
                chapter.sections.forEach((section) => {
                    if (section.section) {
                        console.log(
                            `    第${section.section}节: ${section.sectionTitle}`
                        )
                        console.log(
                            `      - ${section.title} (${section.pedagogicalType})`
                        )
                    }
                })
            })
        }

        return structure
    } catch (error) {
        console.error('获取课程结构失败:', error)
        throw error
    }
}

/**
 * 示例5: 查询教师的所有课程
 */
async function getInstructorCourses(instructor) {
    try {
        const courses = await Resource.findCoursesByInstructor(instructor)

        console.log(`${instructor} 教授的课程:`)
        courses.forEach((course) => {
            console.log(
                `- ${course.courseName} (${course.courseCode}) - ${course.resourceCount}个资源`
            )
        })

        return courses
    } catch (error) {
        console.error('查询教师课程失败:', error)
        throw error
    }
}

// 使用示例
export async function runExamples() {
    try {
        console.log('=== 课程章节功能示例 ===\n')

        // 1. 创建课程资源
        console.log('1. 创建软件工程课程资源...')
        await createSoftwareEngineeringCourse()

        // 2. 查询课程资源
        console.log('\n2. 查询课程所有资源...')
        await getCourseResources('CS401_2024_Spring')

        // 3. 查询特定章节
        console.log('\n3. 查询第1章资源...')
        await getChapterResources('CS401_2024_Spring', 1)

        // 4. 获取课程结构
        console.log('\n4. 获取课程结构...')
        await getCourseStructure('CS401_2024_Spring')

        // 5. 查询教师课程
        console.log('\n5. 查询张教授的课程...')
        await getInstructorCourses('张教授')
    } catch (error) {
        console.error('示例执行失败:', error)
    }
}

export {
    createSoftwareEngineeringCourse,
    getCourseResources,
    getChapterResources,
    getCourseStructure,
    getInstructorCourses,
}
