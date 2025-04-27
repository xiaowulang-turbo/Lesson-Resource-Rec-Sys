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
