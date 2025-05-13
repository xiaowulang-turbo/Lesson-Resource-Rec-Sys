import { BASE_URL } from './apiConfig' // 从 apiConfig.js 导入 BASE_URL
import { API_URL } from '../utils/constants'

// 缓存最近的搜索结果
const searchCache = new Map()
const CACHE_EXPIRY = 5 * 60 * 1000 // 缓存5分钟

// 生成缓存键
function generateCacheKey(query, filters = {}) {
    return `${query}:${JSON.stringify(filters)}`
}

/**
 * 搜索资源
 * @param {string} query - 搜索关键词
 * @returns {Promise<Array>} - 资源列表
 */
export async function searchResources(query) {
    if (!query) return []

    try {
        const response = await fetch(
            `${API_URL}/api/v1/search?q=${encodeURIComponent(query)}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            }
        )

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || '搜索资源失败')
        }

        const data = await response.json()
        return data.data?.resources || []
    } catch (err) {
        console.error('搜索资源失败:', err)
        throw err
    }
}

// --- 后续可以添加 searchCourses 和 searchAll 等函数 ---
