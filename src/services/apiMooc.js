import { BASE_URL } from './apiConfig'
import { extractAndConvertMocSearchResults } from '../utils/mocDataAdapter'

/**
 * 从MOOC API搜索课程
 * @param {string} query - 搜索关键词
 * @param {object} options - 搜索选项，如页码、每页数量等
 * @returns {Promise<object>} - 搜索结果
 */
export async function searchMoocCourses(query, options = {}) {
    const { page = 1, limit = 20 } = options

    try {
        const response = await fetch(
            `${BASE_URL}/v1/mooc/search?keyword=${encodeURIComponent(
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
 * 直接调用MOOC API进行搜索（通过代理）
 * @param {string} query - 搜索关键词
 * @param {object} options - 搜索选项
 * @returns {Promise<array>} - 搜索结果数组
 */
export async function searchMoocCoursesDirectly(query, options = {}) {
    const { page = 1, limit = 20 } = options

    try {
        console.log('开始搜索MOOC课程:', query)
        const response = await fetch(
            `/api/course/search?csrfKey=fba6bd9e19744ab0b9092da379ef375d`,
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded;charset=UTF-8',
                },
                body: `mocCourseQueryVo={"keyword":"${query}","pageIndex":${page},"highlight":true,"orderBy":0,"stats":30,"pageSize":${limit},"prodectType":5}`,
            }
        )

        if (!response.ok) {
            throw new Error('搜索MOOC课程失败')
        }

        const data = await response.json()
        console.log('MOOC搜索原始数据:', data)
        console.log(
            'MOOC搜索原始数据结构:',
            JSON.stringify(data, null, 2).substring(0, 1000)
        )

        // 使用适配器转换数据
        let result = []
        if (data.code === 0 && data.result) {
            // 如果是我们的后端格式化返回的数据
            if (
                Array.isArray(data.result.list) &&
                data.result.list.every((item) => item.id)
            ) {
                result = data.result.list
                console.log('使用后端已格式化的数据')
            } else {
                // 需要使用适配器进行转换
                result = extractAndConvertMocSearchResults(data)
                console.log('使用适配器转换原始MOOC数据')
            }
        }

        // 打印转换后的数据结构
        console.log('转换后的MOOC资源数量:', result.length)
        if (result.length > 0) {
            console.log('第一个资源示例:', JSON.stringify(result[0], null, 2))
        }

        return result
    } catch (error) {
        console.error('直接搜索MOOC课程出错:', error)
        throw error
    }
}
