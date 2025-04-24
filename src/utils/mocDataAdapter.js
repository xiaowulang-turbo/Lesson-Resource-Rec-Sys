/**
 * MOOC数据适配器
 * 将中国大学MOOC API返回的数据结构转换为系统资源模型格式
 */

// 清理HTML标签和特殊空格符的工具函数
const cleanHtmlAndWhitespace = (text) => {
    if (!text || typeof text !== 'string') return ''

    // 去除HTML标签
    let cleanText = text.replace(/<[^>]*>/g, '')

    // 替换常见HTML实体
    cleanText = cleanText
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&lsquo;/g, "'")
        .replace(/&rsquo;/g, "'")
        .replace(/&hellip;/g, '...')
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')

    // 通用HTML实体替换（如&#xxxx;形式）
    cleanText = cleanText.replace(/&#(\d+);/g, (match, dec) => {
        return String.fromCharCode(dec)
    })

    // 去除多余空格、换行和制表符
    cleanText = cleanText.replace(/\s+/g, ' ').trim()

    return cleanText
}

/**
 * 将MOOC课程数据转换为系统资源模型
 * @param {Object} mocCourse - MOOC API返回的课程数据对象
 * @returns {Object} - 符合系统资源模型的数据对象
 */
export function convertMocCourseToResource(mocCourse) {
    if (!mocCourse) return null

    // 难度等级映射
    const difficultyMap = {
        入门: 1,
        初级: 1,
        中级: 3,
        高级: 4,
        专家: 5,
    }

    // 提取课程ID的辅助函数
    const extractCourseId = (course) => {
        // 优先使用完整的courseId（包含学校代码）
        if (course.courseId) {
            const courseIdStr = String(course.courseId)
            if (courseIdStr.includes('-')) {
                return courseIdStr
            }
        }

        // 如果有学校代码和ID，则组合
        if (course.schoolCode && (course.id || course.termId)) {
            const id = String(course.id || course.termId)
            return `${course.schoolCode}-${id}`
        }

        // 从originalData中尝试获取
        if (course.originalData) {
            if (course.originalData.courseId) {
                const originalCourseIdStr = String(course.originalData.courseId)
                if (originalCourseIdStr.includes('-')) {
                    return originalCourseIdStr
                }
            }
            if (
                course.originalData.schoolCode &&
                (course.originalData.id || course.originalData.termId)
            ) {
                const originalId = String(
                    course.originalData.id || course.originalData.termId
                )
                return `${course.originalData.schoolCode}-${originalId}`
            }
        }

        // 如果都没有，则返回null
        return null
    }

    // 标签处理
    const extractTags = (course) => {
        const tags = []
        // 从课程名称、分类等提取可能的标签
        if (course.categoryName) tags.push(course.categoryName)
        if (course.schoolName) tags.push(course.schoolName)

        // 添加更多标签来源
        if (course.type && typeof course.type === 'string')
            tags.push(course.type)
        if (course.targetUser && typeof course.targetUser === 'string')
            tags.push(course.targetUser)

        return tags
    }

    // 生成唯一ID
    const generateId = (course) => {
        // 使用课程ID、课程名称或随机ID生成唯一标识符
        const sourceId = extractCourseId(course)
        if (sourceId) return `mooc-${sourceId}`

        // 如果没有ID，使用标题或随机数
        if (course.name)
            return `mooc-${course.name
                .replace(/\s+/g, '-')
                .toLowerCase()}-${Date.now()}`

        // 最后的备选方案
        return `mooc-${Math.random().toString(36).substring(2, 15)}`
    }

    // 安全获取图片URL
    const getImageUrl = (course) => {
        // 首先检查标准字段
        const possibleFields = [
            'imgUrl',
            'bigPhotoUrl',
            'thumbnail',
            'picture',
            'smallPhotoUrl',
        ]
        for (const field of possibleFields) {
            if (course[field] && typeof course[field] === 'string') {
                return course[field]
            }
        }

        // 检查嵌套在mocTextbookVo中的cover字段
        if (course.mocTextbookVo && course.mocTextbookVo.cover) {
            return course.mocTextbookVo.cover
        }

        // 检查原始数据中的cover字段
        if (course.originalData) {
            // 检查mocTextbookVo
            if (
                course.originalData.mocTextbookVo &&
                course.originalData.mocTextbookVo.cover
            ) {
                return course.originalData.mocTextbookVo.cover
            }

            // 检查其他可能的图片字段
            for (const field of possibleFields) {
                if (
                    course.originalData[field] &&
                    typeof course.originalData[field] === 'string'
                ) {
                    return course.originalData[field]
                }
            }
        }

        return '' // 默认空字符串
    }

    // 安全获取描述
    const getDescription = (course) => {
        const possibleFields = [
            'description',
            'shortDescription',
            'intro',
            'summary',
        ]
        for (const field of possibleFields) {
            if (course[field] && typeof course[field] === 'string') {
                return cleanHtmlAndWhitespace(course[field])
            }
        }
        return '无描述' // 默认描述
    }

    // 安全获取教师名
    const getTeacherName = (course) => {
        const possibleFields = [
            'teacherName',
            'lectorName',
            'teacher',
            'author',
        ]
        for (const field of possibleFields) {
            if (course[field] && typeof course[field] === 'string') {
                return cleanHtmlAndWhitespace(course[field])
            }
        }
        return '未知教师' // 默认教师名
    }

    // 安全获取学校/机构名
    const getSchoolName = (course) => {
        // 首先检查标准字段
        const possibleFields = [
            'schoolName',
            'school',
            'organization',
            'provider',
        ]
        for (const field of possibleFields) {
            if (course[field] && typeof course[field] === 'string') {
                return cleanHtmlAndWhitespace(course[field])
            }
        }

        // 检查嵌套在mocTextbookVo中的字段
        if (course.mocTextbookVo) {
            if (course.mocTextbookVo.editorInChief) {
                return cleanHtmlAndWhitespace(
                    course.mocTextbookVo.editorInChief
                ) // 使用主编作为机构
            }

            // 尝试其他可能的字段
            for (const field of possibleFields) {
                if (
                    course.mocTextbookVo[field] &&
                    typeof course.mocTextbookVo[field] === 'string'
                ) {
                    return cleanHtmlAndWhitespace(course.mocTextbookVo[field])
                }
            }
        }

        // 检查原始数据
        if (course.originalData) {
            // 检查highlightUniversity字段
            if (course.originalData.highlightUniversity) {
                return cleanHtmlAndWhitespace(
                    course.originalData.highlightUniversity
                )
            }

            // 检查mocTextbookVo
            if (course.originalData.mocTextbookVo) {
                if (course.originalData.mocTextbookVo.editorInChief) {
                    return cleanHtmlAndWhitespace(
                        course.originalData.mocTextbookVo.editorInChief
                    )
                }

                for (const field of possibleFields) {
                    if (
                        course.originalData.mocTextbookVo[field] &&
                        typeof course.originalData.mocTextbookVo[field] ===
                            'string'
                    ) {
                        return cleanHtmlAndWhitespace(
                            course.originalData.mocTextbookVo[field]
                        )
                    }
                }
            }

            // 检查教师名字段
            if (course.originalData.highlightTeacherNames) {
                return cleanHtmlAndWhitespace(
                    course.originalData.highlightTeacherNames
                )
            }
        }

        return '未知机构' // 默认机构名
    }

    // 安全获取难度级别
    const getDifficulty = (course) => {
        let difficulty = 3 // 默认中级

        if (course.level && typeof course.level === 'string') {
            difficulty = difficultyMap[course.level] || 3
        } else if (course.difficulty) {
            if (typeof course.difficulty === 'number') {
                difficulty = Math.min(Math.max(course.difficulty, 1), 5) // 确保在1-5范围内
            } else if (typeof course.difficulty === 'string') {
                difficulty = difficultyMap[course.difficulty] || 3
            }
        }

        return difficulty
    }

    // 获取注册人数
    const getEnrollCount = (course) => {
        const possibleFields = [
            'enrollCount',
            'learnerCount',
            'studentCount',
            'participants',
        ]
        for (const field of possibleFields) {
            if (course[field] && !isNaN(parseInt(course[field]))) {
                return parseInt(course[field])
            }
        }
        return 0 // 默认0
    }

    // 构建转换后的资源对象
    const resourceId = generateId(mocCourse)
    const courseId = extractCourseId(mocCourse)

    // 处理教材类型资源
    const isTextbook =
        mocCourse.type === 308 ||
        (mocCourse.originalData && mocCourse.originalData.type === 308) ||
        mocCourse.mocTextbookVo ||
        (mocCourse.originalData && mocCourse.originalData.mocTextbookVo)

    let title = mocCourse.name || mocCourse.title

    // 从教材中提取真实标题
    if (!title && isTextbook) {
        if (mocCourse.mocTextbookVo && mocCourse.mocTextbookVo.name) {
            title = mocCourse.mocTextbookVo.name
        } else if (
            mocCourse.originalData &&
            mocCourse.originalData.mocTextbookVo &&
            mocCourse.originalData.mocTextbookVo.name
        ) {
            title = mocCourse.originalData.mocTextbookVo.name
        } else if (
            mocCourse.originalData &&
            mocCourse.originalData.highlightName
        ) {
            // 处理高亮标题，移除高亮标记
            title = mocCourse.originalData.highlightName
                .replace(/{##/g, '')
                .replace(/##}/g, '')
        }
    }

    // 清理标题中的HTML标签
    title = cleanHtmlAndWhitespace(title)

    const resource = {
        // 添加唯一ID
        id: resourceId,

        // 基本信息
        title: title || '未知课程',
        description: getDescription(mocCourse),
        pedagogicalType: isTextbook ? 'reference' : 'courseware', // 教材类型为参考资料
        format: isTextbook ? 'pdf' : 'interactive', // 教材格式为PDF
        contentType: 'course', // 标记为课程类型

        // 分类信息
        subject: mocCourse.categoryName || '计算机科学',
        grade: 'university', // 默认高等教育
        difficulty: getDifficulty(mocCourse),

        // 资源详情
        url: courseId ? `https://www.icourse163.org/course/${courseId}` : '',
        cover: getImageUrl(mocCourse),

        // 作者与发布者信息
        authors: getTeacherName(mocCourse),
        publisher: '中国大学MOOC',
        organization: getSchoolName(mocCourse),

        // 学习和评价数据
        enrollCount: getEnrollCount(mocCourse),
        tags: extractTags(mocCourse),
        averageRating: mocCourse.score ? mocCourse.score / 2 : 4.0, // 假设MOOC评分为10分制，默认4.0分

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

        // 额外的MOOC特定数据
        metadata: {
            mocSourceId: courseId,
            mocSourceType: 'icourse163',
            startTime: mocCourse.startTime,
            endTime: mocCourse.endTime,
            termId: mocCourse.termId,
            originalData: mocCourse, // 保存原始数据以备后用
        },
    }

    console.log(`已转换MOOC课程 "${resource.title}" (ID: ${resource.id})`)
    return resource
}

/**
 * 将MOOC API返回的课程列表转换为系统资源列表
 * @param {Array} mocCourses - MOOC API返回的课程数组
 * @returns {Array} - 符合系统资源模型的数据数组
 */
export function convertMocCoursesToResources(mocCourses) {
    if (!Array.isArray(mocCourses)) return []

    return mocCourses
        .filter((course) => course) // 过滤无效数据
        .map((course) => convertMocCourseToResource(course))
}

/**
 * 从MOOC搜索响应中提取课程列表并转换
 * @param {Object} mocResponse - MOOC API响应数据
 * @returns {Array} - 转换后的资源数组
 */
export function extractAndConvertMocSearchResults(mocResponse) {
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

        // 转换前处理数据 - 确保每个课程对象都包含其原始数据
        courses = courses.map((course) => {
            // 如果是mocTextbookVo对象，则将其整体附加到课程对象上
            if (course.mocTextbookVo) {
                // 将mocTextbookVo的属性合并到主对象
                const textbookData = course.mocTextbookVo

                // 优先使用教材中的属性
                if (textbookData.name && !course.name) {
                    course.name = textbookData.name
                }

                if (textbookData.description && !course.description) {
                    course.description = textbookData.description
                }

                if (textbookData.cover && !course.cover) {
                    course.cover = textbookData.cover
                }

                if (textbookData.enrollCount && !course.enrollCount) {
                    course.enrollCount = textbookData.enrollCount
                }

                if (textbookData.editorInChief && !course.organization) {
                    course.organization = textbookData.editorInChief
                }

                if (textbookData.courseId && !course.courseId) {
                    course.courseId = textbookData.courseId
                }

                // 设置type为308表示教材
                course.type = 308
            } else if (
                course.originalData &&
                course.originalData.mocTextbookVo
            ) {
                // 同样处理originalData中的mocTextbookVo
                const textbookData = course.originalData.mocTextbookVo

                if (textbookData.name && !course.name) {
                    course.name = textbookData.name
                }

                if (textbookData.description && !course.description) {
                    course.description = textbookData.description
                }

                if (textbookData.cover && !course.cover) {
                    course.cover = textbookData.cover
                }

                if (textbookData.enrollCount && !course.enrollCount) {
                    course.enrollCount = textbookData.enrollCount
                }

                if (textbookData.editorInChief && !course.organization) {
                    course.organization = textbookData.editorInChief
                }

                if (textbookData.courseId && !course.courseId) {
                    course.courseId = textbookData.courseId
                }

                // 设置type为308表示教材
                course.type = 308
            }

            // 处理高亮字段
            if (course.highlightName && !course.name) {
                course.name = cleanHtmlAndWhitespace(
                    course.highlightName.replace(/{##/g, '').replace(/##}/g, '')
                )
            }

            if (course.highlightContent && !course.description) {
                course.description = cleanHtmlAndWhitespace(
                    course.highlightContent
                        .replace(/spContent=/g, '')
                        .replace(/{##/g, '')
                        .replace(/##}/g, '')
                )
            }

            if (course.highlightUniversity && !course.organization) {
                course.organization = cleanHtmlAndWhitespace(
                    course.highlightUniversity
                )
            }

            if (course.highlightTeacherNames && !course.authors) {
                course.authors = cleanHtmlAndWhitespace(
                    course.highlightTeacherNames
                )
            }

            return course
        })

        return convertMocCoursesToResources(courses)
    } catch (error) {
        console.error('转换MOOC搜索结果时出错:', error)
        return []
    }
}

/**
 * 创建资源分页信息
 * @param {Object} mocResponse - MOOC API响应数据
 * @returns {Object} - 分页信息
 */
export function createPaginationFromMocResponse(mocResponse) {
    try {
        const pagination = {
            pageSize: 20,
            pageIndex: 1,
            totalCount: 0,
            totalPageCount: 1,
        }

        if (mocResponse && mocResponse.result) {
            if (mocResponse.result.pagination) {
                pagination.pageSize =
                    mocResponse.result.pagination.pageSize || 20
                pagination.pageIndex =
                    mocResponse.result.pagination.pageIndex || 1
                pagination.totalCount =
                    mocResponse.result.pagination.totleCount || 0
                pagination.totalPageCount =
                    mocResponse.result.pagination.totlePageCount || 1
            } else if (mocResponse.result.query) {
                pagination.pageSize = mocResponse.result.query.pageSize || 20
                pagination.pageIndex = mocResponse.result.query.pageIndex || 1
                pagination.totalCount = mocResponse.result.totalCount || 0
                pagination.totalPageCount = Math.ceil(
                    pagination.totalCount / pagination.pageSize
                )
            }
        }

        return pagination
    } catch (error) {
        console.error('创建分页信息时出错:', error)
        return {
            pageSize: 20,
            pageIndex: 1,
            totalCount: 0,
            totalPageCount: 1,
        }
    }
}
