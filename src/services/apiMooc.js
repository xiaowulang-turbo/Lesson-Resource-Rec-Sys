import { BASE_URL, getAuthToken, apiRequest } from './apiConfig'
import { extractAndConvertMocSearchResults } from '../utils/mocDataAdapter'
import { API_URL } from '../utils/constants'

/**
 * 从MOOC API搜索课程（旧版本，保留兼容性）
 * @param {string} query - 搜索关键词
 * @param {object} options - 搜索选项，如页码、每页数量等
 * @returns {Promise<object>} - 搜索结果
 */
export async function searchMoocCourses_old(query, options = {}) {
    const { page = 1, limit = 20 } = options

    try {
        const response = await fetch(
            `${API_URL}/v1/mooc/search?keyword=${encodeURIComponent(
                query
            )}&page=${page}&limit=${limit}`
        )

        if (!response.ok) {
            throw new Error('搜索MOOC课程失败')
        }

        const data = await response.json()
        return data.data // 返回resources和pagination
    } catch (error) {
        console.error('搜索MOOC课程出错:', error)
        throw error
    }
}

/**
 * 直接调用MOOC API搜索教材（包含prodectType=5）
 * @param {string} query - 搜索关键词
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @returns {Promise<array>} - 搜索结果数组
 */
export async function searchMoocCoursesDirectly(query, page = 1, limit = 20) {
    try {
        console.log('搜索MOOC教材，查询词:', query, '页面:', page)

        const response = await fetch(
            `${API_URL}/api/course/search?csrfKey=fba6bd9e19744ab0b9092da379ef375d`,
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded;charset=UTF-8',
                },
                body: `mocCourseQueryVo={"keyword":"${query}","pageIndex":${page},"highlight":true,"orderBy":0,"stats":30,"pageSize":${limit},"prodectType":5}`,
            }
        )

        console.log('响应状态:', response.status, response.statusText)

        if (!response.ok) {
            const error = await response.text()
            console.error('搜索MOOC教材响应错误:', error)
            throw new Error(
                `网络错误: ${response.status} ${response.statusText}`
            )
        }

        const data = await response.json()
        console.log('MOOC教材响应数据:', data)

        if (data.code !== 0) {
            throw new Error(data.message || 'MOOC教材搜索失败')
        }

        const results = data.result?.list || []
        // console.log('MOOC教材搜索结果数量:', results.length)
        // console.log('MOOC教材搜索结果:', results)

        // 将MOOC原始数据转换为统一格式
        const convertedResults = results.map((item) => {
            const course = item.mocCourseCard?.mocCourseCardDto || {}
            const termPanel = course.termPanel || {}
            const schoolPanel = course.schoolPanel || {}

            // 格式化讲师信息
            const lectorPanels = termPanel.lectorPanels || []
            const teacherNames = lectorPanels
                .map((lector) => lector.realName || lector.nickName)
                .filter(Boolean)
                .join(', ')

            return {
                // 基本信息
                originalId: course.id?.toString() || '',
                title: item.highlightName || course.name || '',
                description: termPanel.jsonContent || '暂无描述',

                // 分类信息（从数据中推断）
                subject: '通用', // 默认学科
                grade: '高等教育', // 默认年级
                difficulty: 3, // 默认难度

                // 资源详情
                url: '', // MOOC课程一般没有直接URL
                cover: course.imgUrl || '',

                // 价格信息
                price: termPanel.price || 0,
                originalPrice: termPanel.originalPrice || 0,

                // 作者/讲师信息
                authors: teacherNames || '',
                publisher: '',
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
                tags: [],

                // 高亮和搜索信息
                highlightContent: item.highlightContent || '',

                // 元数据
                contentType: 'resource', // 标记为教材资源
                pedagogicalType: 'courseware', // 默认为课件类型
                format: 'url', // 在线资源

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
                },
            }
        })

        console.log('转换后的MOOC教材结果:', convertedResults.length, '个')
        return convertedResults
    } catch (error) {
        console.error('搜索MOOC教材失败:', error)
        throw error
    }
}

/**
 * 直接调用MOOC API搜索课程（不包含prodectType参数）
 * @param {string} query - 搜索关键词
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @returns {Promise<array>} - 搜索结果数组
 */
export async function searchMoocCourses(query, page = 1, limit = 20) {
    try {
        console.log('搜索MOOC课程，查询词:', query, '页面:', page)

        const response = await fetch(
            `${API_URL}/api/course/search-courses?csrfKey=fba6bd9e19744ab0b9092da379ef375d`,
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded;charset=UTF-8',
                },
                body: `mocCourseQueryVo={"keyword":"${query}","pageIndex":${page},"highlight":true,"orderBy":0,"stats":30,"pageSize":${limit}}`,
            }
        )

        console.log('响应状态:', response.status, response.statusText)

        if (!response.ok) {
            const error = await response.text()
            console.error('搜索课程响应错误:', error)
            throw new Error(
                `网络错误: ${response.status} ${response.statusText}`
            )
        }

        const data = await response.json()
        console.log('课程响应数据:', data)

        if (data.code !== 0) {
            throw new Error(data.message || '课程搜索失败')
        }

        const results = data.result?.list || []
        console.log('课程搜索结果数量:', results.length)

        // 将课程原始数据转换为统一格式，只处理type=306的课程
        // // .filter((item) => item.type === 306) // 只处理课程类型（type=306）
        // const convertedResults = results.map((item) => {
        //     const course = item.mocCourseCard?.mocCourseCardDto || {}
        //     const termPanel = course.termPanel || {}
        //     const schoolPanel = course.schoolPanel || {}

        //     // 格式化讲师信息
        //     const lectorPanels = termPanel.lectorPanels || []
        //     const teacherNames = lectorPanels
        //         .map((lector) => lector.realName || lector.nickName)
        //         .filter(Boolean)
        //         .join(', ')

        //     return {
        //         // 基本信息
        //         originalId: course.id?.toString() || '',
        //         title: item.highlightName || course.name || '',
        //         description: termPanel.jsonContent || '暂无描述',

        //         // 分类信息（从数据中推断）
        //         subject: '通用', // 默认学科
        //         grade: '高等教育', // 默认年级
        //         difficulty: 3, // 默认难度

        //         // 资源详情
        //         url: '', // MOOC课程一般没有直接URL
        //         cover: course.imgUrl || '',

        //         // 价格信息
        //         price: termPanel.price || 0,
        //         originalPrice: termPanel.originalPrice || 0,

        //         // 作者/讲师信息
        //         authors: teacherNames || '',
        //         publisher: '',
        //         organization: schoolPanel.name || '',

        //         // 学校信息
        //         school: {
        //             id: schoolPanel.id || null,
        //             name: schoolPanel.name || '',
        //             shortName: schoolPanel.shortName || '',
        //             imgUrl: schoolPanel.imgUrl || '',
        //             supportMooc: schoolPanel.supportMooc || false,
        //             supportSpoc: schoolPanel.supportSpoc || false,
        //             bgPhoto: schoolPanel.bgPhoto || '',
        //         },

        //         // 学习数据
        //         enrollCount: termPanel.enrollCount || course.learnerCount || 0,
        //         studyAvatars: [],
        //         tags: [],

        //         // 高亮和搜索信息
        //         highlightContent: item.highlightContent || '',

        //         // 元数据
        //         contentType: 'course', // 标记为课程资源
        //         pedagogicalType: 'courseware', // 默认为课件类型
        //         format: 'url', // 在线资源

        //         // MOOC特有信息
        //         metadata: {
        //             source: 'mooc',
        //             type: item.type || 0,
        //             courseId: course.id,
        //             termId: course.currentTermId,
        //             productType: course.productType,
        //             courseType: course.courseType,
        //             mode: course.mode,
        //             channel: course.channel,
        //             lessonsCount: termPanel.lessonsCount,
        //             certified: termPanel.certified,
        //             weight: course.weight,
        //             firstPublishTime: course.firstPublishTime,
        //         },
        //     }
        // })

        // console.log('转换后的课程结果:', convertedResults.length, '个')
        return results
    } catch (error) {
        console.error('搜索MOOC课程失败:', error)
        throw error
    }
}

// 保存MOOC教材资源到数据库
export async function saveMoocResources(resources, userId = null) {
    try {
        const token = getAuthToken()

        const response = await fetch(`${API_URL}/api/v1/mooc/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({
                resources,
                userId,
            }),
            credentials: 'include',
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || '保存MOOC教材资源失败')
        }

        const data = await response.json()
        return data
    } catch (err) {
        console.error('保存MOOC教材资源失败:', err)
        throw err
    }
}

// 保存MOOC课程资源到数据库
export async function saveMoocCourses(courses, userId) {
    try {
        console.log('准备保存课程资源:', courses.length, '个')

        const token = getAuthToken()

        const response = await fetch(`${API_URL}/api/v1/mooc/save-courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({
                resources: courses,
                userId,
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            console.error('保存课程资源响应错误:', error)
            throw new Error(
                `保存失败: ${response.status} ${response.statusText}`
            )
        }

        const result = await response.json()
        console.log('课程资源保存结果:', result)
        return result
    } catch (error) {
        console.error('保存课程资源失败:', error)
        throw error
    }
}
