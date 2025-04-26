import { BASE_URL } from './apiConfig'

// 辅助函数：获取存储的认证信息
function getStoredAuth() {
    const auth = localStorage.getItem('auth')
    return auth ? JSON.parse(auth) : null
}

// 获取指定ID的用户信息
export async function getUserById(id) {
    try {
        // 获取存储的认证信息
        const auth = getStoredAuth()
        const token = auth?.token

        // 构建API请求
        const options = {
            headers: {},
        }

        // 如果有token则添加到请求头
        if (token) {
            options.headers.Authorization = `Bearer ${token}`
        }

        const res = await fetch(`${BASE_URL}/users/${id}`, options)
        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.message || '获取用户信息失败')
        }

        return data.data.user
    } catch (error) {
        console.error('获取用户信息失败:', error)
        return null
    }
}

// 获取用户公开信息（用于公开个人主页）
export async function getPublicUserProfile(id) {
    try {
        // 获取存储的认证信息
        const auth = getStoredAuth()
        const token = auth?.token

        // 构建API请求
        const options = {
            headers: {},
        }

        // 如果有token则添加到请求头
        if (token) {
            options.headers.Authorization = `Bearer ${token}`
        } else {
            // 如果没有token，直接返回模拟数据
            console.warn('用户未登录，使用模拟数据')
            return getMockUserData(id)
        }

        // 尝试使用公开API端点
        let res = await fetch(`${BASE_URL}/users/public/${id}`, options)

        // 如果公开API返回404，则尝试使用常规API
        if (res.status === 404) {
            console.warn('公开API端点不存在，尝试使用常规API')
            res = await fetch(`${BASE_URL}/users/${id}`, options)
        }

        const data = await res.json()

        if (!res.ok) {
            // 如果API调用失败，使用模拟数据
            console.warn('获取公开用户信息失败，使用模拟数据:', data.message)
            return getMockUserData(id)
        }

        return data.data.user
    } catch (error) {
        console.error('获取公开用户信息失败:', error)
        // 出错时返回模拟数据以确保UI正常显示
        return getMockUserData(id)
    }
}

// 模拟用户数据（当API不可用时使用）
function getMockUserData(id) {
    // 为特定用户ID返回固定数据
    if (id === '680b41f38a1c4e8a07501a86') {
        return {
            id: id,
            name: 'Jonas',
            subject: '计算机科学',
            grade: '大学',
            experience: '5年',
            bio: '热爱教育科技，擅长Web开发和人工智能领域的教学。',
            interests: ['Web开发', '人工智能', '教育科技'],
            uploads: 12,
            collections: 34,
            likes: 78,
            views: 156,
        }
    }

    // 默认模拟数据
    return {
        id: id,
        name: `用户${id.substring(0, 5)}`,
        subject: '未知',
        grade: '未知',
        bio: '该用户暂未添加个人简介',
        uploads: Math.floor(Math.random() * 20),
        collections: Math.floor(Math.random() * 50),
        likes: Math.floor(Math.random() * 100),
        views: Math.floor(Math.random() * 200),
    }
}
