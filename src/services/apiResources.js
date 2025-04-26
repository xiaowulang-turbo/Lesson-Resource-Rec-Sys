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

        // 返回资源和分页信息
        return {
            resources: data.data.resources,
            pagination: data.pagination || {
                total: data.total || data.data.resources.length,
                page: parseInt(filters.page) || 1,
                limit: parseInt(filters.limit) || 10,
                pages: Math.ceil(
                    (data.total || data.data.resources.length) /
                        (parseInt(filters.limit) || 10)
                ),
            },
        }
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

// 获取资源文件
export async function getResourceFile(id) {
    try {
        const res = await fetch(
            `${BASE_URL}${ENDPOINTS.RESOURCES.BASE}/${id}/file`
        )

        if (!res.ok) {
            const errData = await res.json()
            throw new Error(errData.message || '获取资源文件失败')
        }

        // 处理不同响应类型
        const contentType = res.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
            // API返回JSON (包含文件URL)
            const data = await res.json()
            return data.data
        } else {
            // API直接返回文件或重定向 (用于在新窗口打开)
            return {
                directUrl: res.url,
                status: res.status,
            }
        }
    } catch (error) {
        console.error('获取资源文件失败:', error)
        throw new Error(error.message)
    }
}

// 下载资源文件
export async function downloadResourceFile(id) {
    try {
        const res = await fetch(
            `${BASE_URL}${ENDPOINTS.RESOURCES.BASE}/${id}/download`
        )

        if (!res.ok) {
            const errData = await res.json()
            throw new Error(errData.message || '下载资源文件失败')
        }

        // 处理不同响应类型
        const contentType = res.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
            // API返回JSON (包含下载URL)
            const data = await res.json()
            return data.data
        } else {
            // API直接返回文件或重定向 (用于触发浏览器下载)
            return {
                directUrl: res.url,
                status: res.status,
            }
        }
    } catch (error) {
        console.error('下载资源文件失败:', error)
        throw new Error(error.message)
    }
}
