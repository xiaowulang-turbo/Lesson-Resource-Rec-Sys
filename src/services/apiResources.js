import { BASE_URL, ENDPOINTS } from './apiConfig'

// 获取所有资源
export async function getAllResources(filters = {}) {
    try {
        const queryString = new URLSearchParams(filters).toString()
        const url = `${BASE_URL}${ENDPOINTS.RESOURCES.BASE}${
            queryString ? `?${queryString}` : ''
        }`

        const res = await fetch(url)
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || '获取资源列表失败')

        return data.data.resources
    } catch (error) {
        console.error('获取资源列表失败:', error)
        throw new Error(error.message)
    }
}

// 获取单个资源
export async function getResourceById(id) {
    try {
        const res = await fetch(`${BASE_URL}${ENDPOINTS.RESOURCES.BASE}/${id}`)
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || '获取资源详情失败')

        return data.data.resource
    } catch (error) {
        console.error('获取资源详情失败:', error)
        throw new Error(error.message)
    }
}

// 获取推荐资源
export async function getRecommendedResources() {
    try {
        const res = await fetch(
            `${BASE_URL}${ENDPOINTS.RESOURCES.BASE}/recommended`
        )
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || '获取推荐资源失败')

        return data.data.resources
    } catch (error) {
        console.error('获取推荐资源失败:', error)
        throw new Error(error.message)
    }
}
