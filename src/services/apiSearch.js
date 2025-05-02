import { BASE_URL } from './apiConfig' // 从 apiConfig.js 导入 BASE_URL

// 缓存最近的搜索结果
const searchCache = new Map()
const CACHE_EXPIRY = 5 * 60 * 1000 // 缓存5分钟

// 生成缓存键
function generateCacheKey(query, filters = {}) {
    return `${query}:${JSON.stringify(filters)}`
}

// 搜索资源
export async function searchResources(query, filters = {}) {
    // 检查缓存
    const cacheKey = generateCacheKey(query, filters)
    const cachedResult = searchCache.get(cacheKey)

    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_EXPIRY) {
        console.log('使用缓存搜索结果:', query)
        return cachedResult.data
    }

    // 构建查询字符串
    const params = new URLSearchParams()

    // 添加搜索词 (对标题和描述进行模糊搜索，不区分大小写)
    if (query) {
        // 注意：直接在 URL 中传递复杂的 $or/$regex 可能不安全或不方便
        // 更好的做法是在后端处理名为 'q' 或 'search' 的参数
        // 这里暂时模拟一个简单的标题搜索
        params.append('title[$regex]', query)
        params.append('title[$options]', 'i')
        // 如果后端支持更复杂的搜索（例如搜索多个字段），可以调整这里
        // params.append('q', query);
    }

    // 添加筛选条件 (例如：difficulty=3, type=1)
    for (const key in filters) {
        if (filters[key] && filters[key] !== 'all') {
            // 忽略空值和 'all' 选项
            params.append(key, filters[key])
        }
    }

    const queryString = params.toString()
    const url = `${BASE_URL}/resources${queryString ? '?' + queryString : ''}`

    try {
        const response = await fetch(url)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})) // 尝试解析错误体
            throw new Error(
                `API Error: ${response.status} ${response.statusText}. ${
                    errorData.message || ''
                }`
            )
        }

        const data = await response.json()

        // 检查返回的数据结构是否符合预期
        if (
            data.status === 'success' &&
            data.data &&
            Array.isArray(data.data.resources)
        ) {
            // 将结果存入缓存
            searchCache.set(cacheKey, {
                data: data.data.resources,
                timestamp: Date.now(),
            })

            return data.data.resources // 返回资源数组
        } else {
            console.error('Unexpected API response structure:', data)
            throw new Error('获取资源数据失败或格式不正确')
        }
    } catch (error) {
        console.error('Error fetching resources:', error)
        // 重新抛出错误，以便 React Query 可以捕获它
        throw error
    }
}

// --- 后续可以添加 searchCourses 和 searchAll 等函数 ---
