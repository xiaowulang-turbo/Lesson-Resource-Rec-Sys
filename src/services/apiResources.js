import { BASE_URL, ENDPOINTS } from './apiConfig'

// 辅助函数：获取存储的认证信息
function getStoredAuth() {
    const auth = localStorage.getItem('auth')
    return auth ? JSON.parse(auth) : null
}

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
        // 获取存储的认证信息
        const auth = getStoredAuth()
        const token = auth?.token

        if (!token) {
            throw new Error('您尚未登录，请先登录')
        }

        const res = await fetch(`${BASE_URL}${ENDPOINTS.RESOURCES.BASE}`, {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`,
            },
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

// 获取用户相关资源（上传、收藏或点赞）
export async function getResourcesByUser(userId, type = 'uploads') {
    try {
        // 获取存储的认证信息
        const auth = getStoredAuth()
        const token = auth?.token

        // 如果没有token，直接返回模拟数据
        if (!token) {
            console.warn('用户未登录，使用模拟资源数据')
            return getMockUserResources(userId, type)
        }

        // 构建API请求
        const options = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }

        // 根据type确定获取哪种资源
        let endpoint = ''
        switch (type) {
            case 'collections':
                endpoint = `/users/${userId}/collections`
                break
            case 'liked':
                endpoint = `/users/${userId}/likes`
                break
            case 'uploads':
            default:
                endpoint = `/users/${userId}/resources`
                break
        }

        const res = await fetch(`${BASE_URL}${endpoint}`, options)
        const data = await res.json()

        if (!res.ok) {
            console.warn(
                `获取用户${type}资源失败: ${data.message}，使用模拟数据`
            )
            return getMockUserResources(userId, type)
        }

        return data.data.resources
    } catch (error) {
        console.error(`获取用户${type}资源失败:`, error)
        // 如果API不可用，返回模拟数据
        return getMockUserResources(userId, type)
    }
}

// 模拟用户资源数据（当API不可用时使用）
function getMockUserResources(userId, type) {
    // Jonas的模拟数据
    if (userId === '680b41f38a1c4e8a07501a86') {
        switch (type) {
            case 'collections':
                return [
                    {
                        id: 'c1',
                        title: '高级数据结构教程',
                        type: '教程',
                        subject: '计算机科学',
                        stats: { views: 345, likes: 89, downloads: 122 },
                    },
                    {
                        id: 'c2',
                        title: '机器学习算法实战',
                        type: '视频课程',
                        subject: '人工智能',
                        stats: { views: 567, likes: 134, downloads: 98 },
                    },
                    {
                        id: 'c3',
                        title: 'React高级组件设计模式',
                        type: '文档',
                        subject: 'Web开发',
                        stats: { views: 289, likes: 76, downloads: 45 },
                    },
                ]
            case 'liked':
                return [
                    {
                        id: 'l1',
                        title: '现代JavaScript教程',
                        type: '教程',
                        subject: 'Web开发',
                        stats: { views: 1245, likes: 389, downloads: 276 },
                    },
                    {
                        id: 'l2',
                        title: 'TypeScript实战指南',
                        type: '电子书',
                        subject: 'Web开发',
                        stats: { views: 876, likes: 245, downloads: 189 },
                    },
                ]
            case 'uploads':
            default:
                return [
                    {
                        id: 'u1',
                        title: 'React基础入门教程',
                        type: '教程',
                        subject: 'Web开发',
                        stats: { views: 782, likes: 156, downloads: 98 },
                    },
                    {
                        id: 'u2',
                        title: 'JavaScript ES6+特性详解',
                        type: '文档',
                        subject: 'Web开发',
                        stats: { views: 634, likes: 124, downloads: 87 },
                    },
                    {
                        id: 'u3',
                        title: '数据结构与算法JavaScript实现',
                        type: '电子书',
                        subject: '计算机科学',
                        stats: { views: 429, likes: 87, downloads: 65 },
                    },
                    {
                        id: 'u4',
                        title: 'Node.js后端开发实战',
                        type: '视频课程',
                        subject: 'Web开发',
                        stats: { views: 512, likes: 98, downloads: 76 },
                    },
                ]
        }
    }

    // 默认模拟数据
    const count = Math.floor(Math.random() * 5) + 1 // 1-5个随机资源
    const resources = []

    for (let i = 0; i < count; i++) {
        resources.push({
            id: `${type}-${userId.substring(0, 3)}-${i}`,
            title: `示例${type}资源 ${i + 1}`,
            type: ['教程', '文档', '视频', '电子书'][
                Math.floor(Math.random() * 4)
            ],
            subject: ['数学', '语文', '英语', '科学', '历史', '地理'][
                Math.floor(Math.random() * 6)
            ],
            stats: {
                views: Math.floor(Math.random() * 1000),
                likes: Math.floor(Math.random() * 200),
                downloads: Math.floor(Math.random() * 150),
            },
        })
    }

    return resources
}
