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

// --- 添加创建资源的 API 函数 ---
export async function createResource(formData) {
    // 注意：发送 FormData 时，不需要手动设置 Content-Type header
    // 浏览器会自动设置，并包含正确的 boundary
    try {
        const res = await fetch(`${BASE_URL}${ENDPOINTS.RESOURCES.BASE}`, {
            method: 'POST',
            body: formData,
            // headers: { 'Content-Type': 'multipart/form-data' } // <<-- 不要设置这个!
        })

        const data = await res.json()

        if (!res.ok) {
            console.error('API Error Response:', data)
            throw new Error(data.message || '创建资源失败')
        }

        // 检查返回的数据结构
        if (data.status === 'success' && data.data && data.data.resource) {
            return data.data.resource // 返回新创建的资源对象
        } else {
            console.error('Unexpected API response structure on create:', data)
            throw new Error('创建资源成功，但返回数据格式不正确')
        }
    } catch (error) {
        console.error('创建资源失败:', error)
        throw new Error(error.message || '网络请求错误，无法创建资源')
    }
}
