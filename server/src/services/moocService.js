import Resource from '../models/resourceModel.js'
import fetch from 'node-fetch' // 确保安装: npm install node-fetch

/**
 * 将MOOC课程数据转换为系统资源模型
 * @param {Object} mocCourse - MOOC API返回的课程数据对象
 * @returns {Object} - 符合系统资源模型的数据对象
 */
function convertMocCourseToResource(mocCourse) {
    if (!mocCourse) return null

    console.log('mocCourse', mocCourse)

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
                // body: `mocCourseQueryVo={"keyword":"${keyword}","pageIndex":${pageIndex},"highlight":true,"orderBy":${orderBy},"stats":30,"pageSize":${pageSize}}`,
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

/**
 * 专门搜索MOOC课程（不包含prodectType参数，type=306）
 * @param {String} keyword - 搜索关键词
 * @param {Number} page - 页码
 * @param {Number} limit - 每页数量
 * @returns {Promise<Array>} - 课程数组
 */
export async function fetchMoocCoursesOnly(keyword, page = 1, limit = 20) {
    try {
        console.log('开始搜索MOOC课程:', keyword)

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
                // 注意：这里没有包含 prodectType 参数
                body: `mocCourseQueryVo={"keyword":"${keyword}","pageIndex":${page},"highlight":true,"orderBy":0,"stats":30,"pageSize":${limit}}`,
            }
        )

        const data = await response.json()
        console.log('搜索课程API响应:', data)

        if (data.code !== 0) {
            throw new Error(data.message || '搜索课程失败')
        }

        const results = data.result?.list || []
        console.log('原始课程搜索结果数量:', results.length)

        // 只处理type=306的课程
        const courseResults = results.filter((item) => item.type === 306)
        console.log('过滤后的课程数量:', courseResults.length)

        // 转换为统一的资源格式
        const convertedResults = courseResults.map((item) =>
            convertMoocItemToResource(item, 'course')
        )

        console.log('转换后的课程资源数量:', convertedResults.length)
        console.log(convertedResults, 'convertedResults')
        return convertedResults
    } catch (error) {
        console.error('搜索MOOC课程失败:', error)
        throw error
    }
}

/**
 * 转换MOOC搜索结果项为资源格式
 * @param {Object} item - MOOC搜索结果项
 * @param {String} contentType - 内容类型 ('resource' 或 'course')
 * @returns {Object} - 转换后的资源对象
 */
function convertMoocItemToResource(item, contentType = 'resource') {
    const course = item.mocCourseCard?.mocCourseCardDto || {}
    const termPanel = course.termPanel || {}
    const schoolPanel = course.schoolPanel || {}

    // console.log(item, 'item')
    // console.log(course, 'course')

    // 格式化讲师信息
    const lectorPanels = termPanel.lectorPanels || []
    const teacherNames = lectorPanels
        .map((lector) => lector.realName || lector.nickName)
        .filter(Boolean)
        .join(', ')

    return {
        // 基本信息
        originalId: course.id?.toString() || '',
        title: course.name || item.highlightName || '',
        description: termPanel.jsonContent || '暂无描述',

        // 分类信息
        subject: inferSubjectFromData(item) || '通用',
        grade: '高等教育',
        difficulty: inferDifficultyFromData(item) || 3,

        // 资源详情
        url: constructCourseUrl(course.id, course.shortName),
        cover: course.imgUrl || '',

        // 价格信息
        price: termPanel.price || 0,
        originalPrice: termPanel.originalPrice || 0,

        // 作者信息
        authors: teacherNames || '',
        publisher: '中国大学MOOC',
        organization: schoolPanel.name || '',

        // 学校信息
        school: {
            id: schoolPanel.id || null,
            name: schoolPanel.name || '',
            shortName: schoolPanel.shortName || '',
            imgUrl: schoolPanel.imgUrl || '',
            supportMooc: schoolPanel.supportMooc || false,
            supportSpoc: schoolPanel.supportSpoc || false,
            bgPhoto: schoolPanel.bgPhoto || '',
        },

        // 学习数据
        enrollCount: termPanel.enrollCount || course.learnerCount || 0,
        studyAvatars: [],
        tags: extractTagsFromHighlight(item.highlightContent) || [],

        // 高亮和搜索信息
        highlightContent: item.highlightContent || '',

        // 元数据
        contentType: contentType,
        pedagogicalType: 'courseware',
        format: 'url',

        // 访问控制
        access: {
            isPublic: true,
        },

        // 创建者信息
        createdBy: process.env.SYSTEM_ADMIN_ID || '62a1f3c90c87e55b76b7215e',

        // MOOC特有信息
        metadata: {
            source: 'mooc',
            type: item.type || 0,
            courseId: course.id,
            termId: course.currentTermId,
            productType: course.productType,
            courseType: course.courseType,
            mode: course.mode,
            channel: course.channel,
            lessonsCount: termPanel.lessonsCount,
            certified: termPanel.certified,
            weight: course.weight,
            firstPublishTime: course.firstPublishTime,
            mocSourceId: course.id,
            mocSourceType: 'icourse163',
            originalData: item,
        },
    }
}

/**
 * 从数据中推断学科
 * @param {Object} item - MOOC数据项
 * @returns {String} - 学科名称
 */
function inferSubjectFromData(item) {
    const title = (
        item.highlightName ||
        item.mocCourseCard?.mocCourseCardDto?.name ||
        ''
    ).toLowerCase()
    const content = (item.highlightContent || '').toLowerCase()

    const subjects = {
        计算机: [
            '计算机',
            '编程',
            '软件',
            '算法',
            'python',
            'java',
            'javascript',
            '数据结构',
        ],
        数学: ['数学', '高等数学', '线性代数', '概率论', '统计学'],
        物理: ['物理', '力学', '电磁学', '光学', '热学'],
        化学: ['化学', '有机化学', '无机化学', '物理化学'],
        生物: ['生物', '生物学', '生命科学', '生物技术', '生物工程'],
        经济: ['经济', '经济学', '金融', '管理', '商业'],
        语言: ['英语', '汉语', '语言', '文学', '外语'],
        工程: ['工程', '机械', '电子', '自动化', '建筑'],
        医学: ['医学', '临床', '护理', '药学', '医疗'],
        艺术: ['艺术', '设计', '美术', '音乐', '绘画'],
    }

    for (const [subject, keywords] of Object.entries(subjects)) {
        if (
            keywords.some(
                (keyword) =>
                    title.includes(keyword) || content.includes(keyword)
            )
        ) {
            return subject
        }
    }

    return '通用'
}

/**
 * 从数据中推断难度等级
 * @param {Object} item - MOOC数据项
 * @returns {Number} - 难度等级 (1-5)
 */
function inferDifficultyFromData(item) {
    const title = (
        item.highlightName ||
        item.mocCourseCard?.mocCourseCardDto?.name ||
        ''
    ).toLowerCase()
    const content = (item.highlightContent || '').toLowerCase()

    if (
        title.includes('入门') ||
        title.includes('基础') ||
        content.includes('零基础')
    ) {
        return 1
    } else if (title.includes('初级') || content.includes('初学者')) {
        return 2
    } else if (title.includes('中级') || title.includes('进阶')) {
        return 3
    } else if (title.includes('高级') || title.includes('专业')) {
        return 4
    } else if (
        title.includes('专家') ||
        title.includes('研究生') ||
        content.includes('高深')
    ) {
        return 5
    }

    return 3 // 默认中等难度
}

/**
 * 构建课程URL
 * @param {String} courseId - 课程ID
 * @param {String} shortName - 短名称
 * @returns {String} - 课程URL
 */
function constructCourseUrl(courseId, shortName) {
    if (!courseId) return ''
    return `https://www.icourse163.org/course/${shortName}-${courseId}`
}

/**
 * 从高亮内容中提取标签
 * @param {String} highlightContent - 高亮内容
 * @returns {Array} - 标签数组
 */
function extractTagsFromHighlight(highlightContent) {
    if (!highlightContent) return []

    const tags = []
    const highlighted = highlightContent.match(/\{##([^#]+)##\}/g)

    if (highlighted) {
        highlighted.forEach((match) => {
            const tag = match.replace(/\{##([^#]+)##\}/, '$1')
            if (tag && !tags.includes(tag)) {
                tags.push(tag)
            }
        })
    }

    return tags.slice(0, 5) // 限制标签数量
}

/**
 * 保存课程资源到数据库（支持去重）
 * @param {Array} courseResources - 课程资源数组
 * @param {String} userId - 用户ID
 * @returns {Promise<Object>} - 保存结果
 */
export async function saveCourseResourcesToDatabase(courseResources, userId) {
    const Resource = (await import('../models/resourceModel.js')).default

    try {
        let saved = 0
        let updated = 0
        let skipped = 0
        const errors = []

        for (const resource of courseResources) {
            try {
                // 检查是否已存在（根据originalId或title去重）
                const existingResource = await Resource.findOne({
                    $or: [
                        { originalId: resource.originalId },
                        {
                            title: resource.title,
                            'metadata.source': 'mooc',
                        },
                    ],
                })

                if (existingResource) {
                    // 更新现有资源
                    Object.assign(existingResource, {
                        ...resource,
                        updatedAt: new Date(),
                        createdBy: userId || existingResource.createdBy,
                    })
                    await existingResource.save()
                    updated++
                } else {
                    // 创建新资源
                    await Resource.create({
                        ...resource,
                        createdBy:
                            userId ||
                            process.env.SYSTEM_ADMIN_ID ||
                            '62a1f3c90c87e55b76b7215e',
                    })
                    saved++
                }
            } catch (error) {
                console.error('保存单个课程资源失败:', error)
                errors.push({
                    resource: resource.title,
                    error: error.message,
                })
                skipped++
            }
        }

        console.log(
            `课程资源保存完成: 新增 ${saved}, 更新 ${updated}, 跳过 ${skipped}`
        )

        return {
            success: true,
            results: saved + updated,
            details: {
                saved,
                updated,
                skipped,
                errors,
            },
        }
    } catch (error) {
        console.error('保存课程资源到数据库失败:', error)
        return {
            success: false,
            error: error.message,
            results: 0,
        }
    }
}
