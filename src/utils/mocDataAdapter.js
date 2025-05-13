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

    console.log('mocCourse', mocCourse)

    // 难度等级映射
    const difficultyMap = {
        入门: 1,
        初级: 1,
        中级: 3,
        高级: 4,
        专家: 5,
    }

    // 获取学校信息的辅助函数
    const getSchoolInfo = (course) => {
        // 安全地获取shortName的辅助函数
        const safeGetShortName = (value) => {
            if (!value) return ''
            // 确保value是字符串类型
            const strValue = String(value)
            return strValue.includes('-') ? strValue.split('-')[0] : ''
        }

        // 优先使用schoolPanel信息
        const schoolPanel =
            course.schoolPanel || course.originalData?.schoolPanel
        if (schoolPanel) {
            return {
                id: schoolPanel.id || null,
                name: schoolPanel.name || '',
                shortName: schoolPanel.shortName || '',
                imgUrl: schoolPanel.imgUrl || '',
                supportMooc: Boolean(schoolPanel.supportMooc),
                supportSpoc: Boolean(schoolPanel.supportSpoc),
                bgPhoto: schoolPanel.bgPhoto || '',
            }
        }

        // 如果没有schoolPanel，尝试使用school信息
        const school = course.school || course.originalData?.school
        if (school) {
            return {
                id: school.id || null,
                name: school.name || '',
                shortName: school.shortName || '',
                imgUrl: school.imgUrl || '',
                supportMooc: Boolean(school.supportMooc),
                supportSpoc: Boolean(school.supportSpoc),
                bgPhoto: school.bgPhoto || '',
            }
        }

        // 如果有highlightUniversity，使用它
        const schoolName =
            course.highlightUniversity ||
            course.originalData?.highlightUniversity
        if (schoolName) {
            // 尝试从tid或courseId中提取shortName，使用安全的方法
            const shortName =
                safeGetShortName(course.tid) ||
                safeGetShortName(course.courseId) ||
                ''

            return {
                id: null,
                name: cleanHtmlAndWhitespace(schoolName),
                shortName: shortName,
                imgUrl: '',
                supportMooc: true,
                supportSpoc: false,
                bgPhoto: '',
            }
        }

        // 如果都没有，返回默认值
        return {
            id: null,
            name: course.schoolName || '',
            shortName: '',
            imgUrl: '',
            supportMooc: false,
            supportSpoc: false,
            bgPhoto: '',
        }
    }

    // 提取课程ID的辅助函数
    const extractCourseId = (course) => {
        // 安全地获取ID的辅助函数
        const safeGetId = (value) => {
            if (!value) return null
            // 确保value是字符串类型
            const strValue = String(value)
            return strValue.includes('-') ? strValue : null
        }

        // 优先使用完整的courseId（包含学校代码）
        const fullCourseId = safeGetId(course.courseId)
        if (fullCourseId) return fullCourseId

        // 尝试从tid中获取完整ID
        const tidId = safeGetId(course.tid)
        if (tidId) return tidId

        // 如果有学校代码和ID，则组合
        const schoolShortName =
            course.schoolPanel?.shortName ||
            course.school?.shortName ||
            course.originalData?.schoolPanel?.shortName ||
            course.originalData?.school?.shortName ||
            (course.tid ? String(course.tid).split('-')[0] : null)

        const courseId =
            course.id ||
            course.termId ||
            (course.tid ? String(course.tid).split('-')[1] : null)

        if (schoolShortName && courseId) {
            return `${schoolShortName}-${String(courseId)}`
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

    // 转换为系统资源模型
    const resource = {
        title: cleanHtmlAndWhitespace(mocCourse.name),
        description: cleanHtmlAndWhitespace(mocCourse.description),
        contentType: 'course',
        pedagogicalType: 'courseware',
        format: 'url',
        subject: mocCourse.categoryName || '未分类',
        grade: '高等教育',
        difficulty: difficultyMap[mocCourse.level] || 3,
        url: mocCourse.courseUrl || '',
        cover: mocCourse.imgUrl || '',
        price: 0,
        originalPrice: 0,
        authors: mocCourse.teacherName || '',
        publisher: mocCourse.schoolName || '',
        organization: mocCourse.schoolName || '',
        school: getSchoolInfo(mocCourse),
        enrollCount: mocCourse.enrollCount || 0,
        studyAvatars: [],
        tags: extractTags(mocCourse),
        highlightContent: cleanHtmlAndWhitespace(mocCourse.highlightContent),
        metadata: {
            mocSourceType: 'icourse163',
            mocSourceId: extractCourseId(mocCourse),
            originalData: mocCourse,
        },
    }

    return resource
}

/**
 * 将MOOC教材数据转换为系统资源模型
 * @param {Object} mocTextbook - MOOC API返回的教材数据对象
 * @returns {Object} - 符合系统资源模型的数据对象
 */
export function convertMocTextbookToResource(mocItem) {
    if (!mocItem) return null

    // 从mocItem中获取教材数据
    const textbook = mocItem.mocTextbookVo || mocItem
    if (!textbook) return null

    // 标签处理函数
    const extractTags = (item) => {
        const tags = []

        // 从关键字提取标签
        if (item.highlightContent) {
            const matches = item.highlightContent.match(/\{##([^#]+)##\}/g)
            if (matches) {
                matches.forEach((match) => {
                    const tag = match.replace(/\{##|##\}/g, '')
                    if (tag && !tags.includes(tag)) tags.push(tag)
                })
            }
        }

        // 添加出版社作为标签
        if (item.highlightUniversity) {
            tags.push(item.highlightUniversity)
        }

        return tags
    }

    // 转换为系统资源模型
    const resource = {
        originalId: textbook.id || textbook.ycTextbookId || mocItem.courseId,
        title: cleanHtmlAndWhitespace(textbook.name),
        description: cleanHtmlAndWhitespace(textbook.description),
        contentType: 'resource',
        pedagogicalType: 'reference',
        format: 'url',
        subject: '教育', // 默认学科，可根据实际情况调整
        grade: '高等教育',
        difficulty: 3, // 默认中等难度
        url: textbook.linkUrl || '',
        cover: textbook.cover || '',
        price: textbook.price || 0,
        originalPrice: textbook.originalPrice || 0,
        authors: mocItem.highlightTeacherNames || textbook.editorInChief || '',
        publisher: mocItem.highlightUniversity || '高等教育出版社',
        organization: mocItem.highlightUniversity || '高等教育出版社',
        school: {
            id: null,
            name: mocItem.highlightUniversity || '高等教育出版社',
            shortName: '',
            imgUrl: '',
            supportMooc: true,
            supportSpoc: false,
            bgPhoto: '',
        },
        enrollCount: textbook.enrollCount || 0,
        studyAvatars: textbook.studyAvatars || [],
        tags: extractTags(mocItem),
        highlightContent: cleanHtmlAndWhitespace(
            mocItem.highlightContent || ''
        ),
        metadata: {
            mocSourceType: 'textbook',
            mocSourceId:
                textbook.id || textbook.ycTextbookId || mocItem.courseId,
            originalData: mocItem,
        },
    }

    return resource
}

/**
 * 批量转换MOOC课程数据
 * @param {Array} mocCourses - MOOC课程数据数组
 * @returns {Array} - 转换后的资源数组
 */
export function convertMocCoursesToResources(mocCourses) {
    if (!Array.isArray(mocCourses)) return []

    return mocCourses
        .map((course) => convertMocCourseToResource(course))
        .filter(Boolean)
}

/**
 * 批量转换MOOC教材数据
 * @param {Array} mocTextbooks - MOOC教材数据数组
 * @returns {Array} - 转换后的资源数组
 */
export function convertMocTextbooksToResources(mocTextbooks) {
    if (!Array.isArray(mocTextbooks)) return []

    return mocTextbooks
        .map((textbook) => convertMocTextbookToResource(textbook))
        .filter(Boolean)
}

/**
 * 从MOOC API响应中提取并转换课程或教材数据
 * @param {Object} mocResponse - MOOC API响应数据
 * @returns {Array} - 转换后的资源数组
 */
export function extractAndConvertMocSearchResults(mocResponse) {
    if (!mocResponse || !mocResponse.result) return []

    // 尝试从不同的数据结构中获取结果列表
    let items = []

    if (Array.isArray(mocResponse.result)) {
        items = mocResponse.result
    } else if (
        mocResponse.result.list &&
        Array.isArray(mocResponse.result.list)
    ) {
        items = mocResponse.result.list
    } else if (
        mocResponse.result.termDto &&
        Array.isArray(mocResponse.result.termDto)
    ) {
        items = mocResponse.result.termDto
    } else if (
        mocResponse.result.result &&
        Array.isArray(mocResponse.result.result)
    ) {
        items = mocResponse.result.result
    }

    // 根据类型进行转换
    return items
        .map((item) => {
            // 检测数据类型，选择合适的转换器
            if (item.type === 308 || item.mocTextbookVo) {
                // 教材类型
                return convertMocTextbookToResource(item)
            } else {
                // 课程类型
                return convertMocCourseToResource(item)
            }
        })
        .filter(Boolean)
}

/**
 * 从MOOC API响应中创建分页信息
 * @param {Object} mocResponse - MOOC API响应数据
 * @returns {Object} - 分页信息对象
 */
export function createPaginationFromMocResponse(mocResponse) {
    if (!mocResponse || !mocResponse.result) {
        return {
            page: 1,
            limit: 20,
            totalCount: 0,
            totalPages: 0,
        }
    }

    // 获取分页信息
    const query = mocResponse.result.query || {}
    const totalCount = mocResponse.result.totalCount || 0

    // 优先使用响应中提供的分页大小，否则使用默认值
    const pageSize = query.pageSize || 20
    const pageIndex = query.pageIndex || 1

    return {
        page: pageIndex,
        limit: pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
    }
}
