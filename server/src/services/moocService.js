import Resource from '../models/resourceModel.js'
import fetch from 'node-fetch' // 确保安装: npm install node-fetch

/**
 * 将MOOC课程数据转换为系统资源模型
 * @param {Object} mocCourse - MOOC API返回的课程数据对象
 * @returns {Object} - 符合系统资源模型的数据对象
 */
function convertMocCourseToResource(mocCourse) {
    if (!mocCourse) return null

    // 难度等级映射
    const difficultyMap = {
        入门: 1,
        初级: 1,
        中级: 3,
        高级: 4,
        专家: 5,
    }

    // 标签处理
    const extractTags = (course) => {
        const tags = []
        // 从课程名称、分类等提取可能的标签
        if (course.categoryName) tags.push(course.categoryName)
        if (course.schoolName) tags.push(course.schoolName)
        return tags
    }

    // 构建转换后的资源对象
    return {
        // 基本信息
        title: mocCourse.name || mocCourse.title || '未知课程',
        description:
            mocCourse.description || mocCourse.shortDescription || '无描述',
        pedagogicalType: 'courseware', // 默认类型
        format: 'interactive', // 默认为在线交互式内容
        contentType: 'course', // 标记为课程类型

        // 分类信息
        subject: mocCourse.categoryName || '计算机科学',
        grade: 'university', // 默认高等教育
        difficulty: difficultyMap[mocCourse.level] || 3, // 转换难度等级

        // 资源详情
        url: `https://www.icourse163.org/course/${mocCourse.courseId}`,
        cover: mocCourse.imgUrl || mocCourse.bigPhotoUrl || '',

        // 作者与发布者信息
        authors: mocCourse.teacherName || mocCourse.lectorName || '',
        publisher: '中国大学MOOC',
        organization: mocCourse.schoolName || '',

        // 学习和评价数据
        enrollCount: mocCourse.enrollCount || mocCourse.learnerCount || 0,
        tags: extractTags(mocCourse),
        averageRating: mocCourse.score ? mocCourse.score / 2 : 0, // 假设MOOC评分为10分制

        // 统计数据
        stats: {
            views: mocCourse.hotScore || 0,
            downloads: 0,
            shares: 0,
            favorites: 0,
        },

        // 访问控制
        access: {
            isPublic: true,
        },

        // 创建者信息 (需要提供系统管理员ID)
        createdBy: process.env.SYSTEM_ADMIN_ID || '62a1f3c90c87e55b76b7215e',

        // 额外的MOOC特定数据
        metadata: {
            mocSourceId: mocCourse.courseId || mocCourse.id,
            mocSourceType: 'icourse163',
            startTime: mocCourse.startTime,
            endTime: mocCourse.endTime,
            termId: mocCourse.termId,
            originalData: mocCourse, // 保存原始数据以备后用
        },
    }
}

/**
 * 从MOOC搜索响应中提取课程列表并转换
 * @param {Object} mocResponse - MOOC API响应数据
 * @returns {Array} - 转换后的资源数组
 */
function extractAndConvertMocSearchResults(mocResponse) {
    try {
        // 适应不同的MOOC API响应结构
        let courses = []

        if (mocResponse && mocResponse.result) {
            if (mocResponse.result.list) {
                // 一种可能的响应结构
                courses = mocResponse.result.list
            } else if (mocResponse.result.results) {
                // 另一种可能的响应结构
                courses = mocResponse.result.results
            } else if (Array.isArray(mocResponse.result)) {
                // 直接返回数组的情况
                courses = mocResponse.result
            }
        }

        return courses
            .filter((course) => course) // 过滤无效数据
            .map((course) => convertMocCourseToResource(course))
    } catch (error) {
        console.error('转换MOOC搜索结果时出错:', error)
        return []
    }
}

/**
 * 从MOOC API获取课程数据
 * @param {Object} params - 搜索参数
 * @returns {Promise<Array>} - 处理后的资源数组
 */
export async function fetchMoocCourses(params = {}) {
    try {
        const {
            keyword = '人工智能',
            pageIndex = 1,
            pageSize = 20,
            orderBy = 0,
        } = params

        const response = await fetch(
            `https://www.icourse163.org/web/j/mocSearchBean.searchCourse.rpc?csrfKey=fba6bd9e19744ab0b9092da379ef375d`,
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded;charset=UTF-8',
                    Cookie: 'NTESSTUDYSI=fba6bd9e19744ab0b9092da379ef375d',
                    Origin: 'https://www.icourse163.org',
                    Referer: 'https://www.icourse163.org',
                },
                body: `mocCourseQueryVo={"keyword":"${keyword}","pageIndex":${pageIndex},"highlight":true,"orderBy":${orderBy},"stats":30,"pageSize":${pageSize},"prodectType":5}`,
            }
        )

        const data = await response.json()
        console.log('MOOC API原始响应:', data)

        return extractAndConvertMocSearchResults(data)
    } catch (error) {
        console.error('获取MOOC课程数据失败:', error)
        return []
    }
}

/**
 * 将MOOC课程数据保存到数据库
 * @param {Array} moocCourses - 转换后的资源数据数组
 * @returns {Promise<Array>} - 保存后的资源数组
 */
export async function saveMoocCoursesToDatabase(moocCourses) {
    try {
        const savedResources = []

        for (const course of moocCourses) {
            // 检查是否已存在相同的MOOC资源
            const existingResource = await Resource.findOne({
                'metadata.mocSourceId': course.metadata.mocSourceId,
                'metadata.mocSourceType': 'icourse163',
            })

            if (existingResource) {
                // 更新现有资源
                Object.assign(existingResource, course)
                await existingResource.save()
                savedResources.push(existingResource)
            } else {
                // 创建新资源
                const newResource = await Resource.create(course)
                savedResources.push(newResource)
            }
        }

        return savedResources
    } catch (error) {
        console.error('保存MOOC课程数据到数据库失败:', error)
        return []
    }
}

/**
 * 获取并处理MOOC课程数据的完整流程
 * @param {Object} params - 搜索参数
 * @param {Boolean} saveToDb - 是否保存到数据库
 * @returns {Promise<Array>} - 处理后的资源数组
 */
export async function processMoocCourses(params = {}, saveToDb = false) {
    const moocCourses = await fetchMoocCourses(params)

    if (saveToDb && moocCourses.length > 0) {
        return await saveMoocCoursesToDatabase(moocCourses)
    }

    return moocCourses
}

/**
 * 根据关键词搜索MOOC课程
 * @param {String} keyword - 搜索关键词
 * @param {Number} page - 页码
 * @param {Number} limit - 每页数量
 * @returns {Promise<Object>} - 搜索结果和分页信息
 */
export async function searchMoocCourses(keyword, page = 1, limit = 20) {
    try {
        const resources = await processMoocCourses(
            {
                keyword,
                pageIndex: page,
                pageSize: limit,
            },
            false
        )

        return {
            resources,
            pagination: {
                page,
                limit,
                totalCount: resources.length, // 实际应从API响应中获取
                totalPages: Math.ceil(resources.length / limit),
            },
        }
    } catch (error) {
        console.error('搜索MOOC课程失败:', error)
        return {
            resources: [],
            pagination: {
                page,
                limit,
                totalCount: 0,
                totalPages: 0,
            },
        }
    }
}
