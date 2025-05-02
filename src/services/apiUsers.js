import { BASE_URL } from './apiConfig'
// import { API_URL } from '../utils/constants'

// 辅助函数：获取存储的认证信息
function getStoredAuth() {
    const auth = localStorage.getItem('auth')
    return auth ? JSON.parse(auth) : null
}

// 辅助函数：获取授权头
function getAuthHeaders() {
    const auth = getStoredAuth()
    const headers = {}

    if (auth?.token) {
        headers.Authorization = `Bearer ${auth.token}`
    }

    return headers
}

// 获取指定ID的用户信息
export async function getUserById(id) {
    try {
        // 获取授权头
        const headers = getAuthHeaders()

        const res = await fetch(`${BASE_URL}/users/${id}`, {
            headers,
        })
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

export async function updateCurrentUser(userData) {
    // 获取授权头
    const authHeaders = getAuthHeaders()

    // 判断是否包含文件上传
    if (userData.avatar instanceof File) {
        // 创建FormData对象上传文件
        const formData = new FormData()

        // 添加头像文件
        formData.append('avatar', userData.avatar)

        // 添加其他用户数据
        Object.keys(userData).forEach((key) => {
            if (key !== 'avatar') {
                formData.append(key, userData[key])
            }
        })

        const res = await fetch(`${BASE_URL}/users/updateMe`, {
            method: 'PATCH',
            credentials: 'include',
            headers: authHeaders,
            body: formData, // 使用FormData发送
            // 注意：使用FormData时不需要设置Content-Type头，浏览器会自动设置
        })

        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.message || '更新用户信息失败')
        }

        return res.json()
    } else {
        // 普通数据更新，使用JSON格式
        const res = await fetch(`${BASE_URL}/users/updateMe`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
            },
            body: JSON.stringify(userData),
        })

        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.message || '更新用户信息失败')
        }

        return res.json()
    }
}

export async function getCurrentUser() {
    const authHeaders = getAuthHeaders()

    const res = await fetch(`${BASE_URL}/users/me`, {
        credentials: 'include',
        headers: authHeaders,
    })

    if (!res.ok) {
        throw new Error('获取当前用户信息失败')
    }

    const { data } = await res.json()
    return data.user
}

export async function getUser(userId) {
    const authHeaders = getAuthHeaders()

    const res = await fetch(`${BASE_URL}/users/${userId}`, {
        credentials: 'include',
        headers: authHeaders,
    })

    if (!res.ok) {
        throw new Error('获取用户信息失败')
    }

    const { data } = await res.json()
    return data.user
}

export async function deleteCurrentUser() {
    const authHeaders = getAuthHeaders()

    const res = await fetch(`${BASE_URL}/users/deleteMe`, {
        method: 'DELETE',
        credentials: 'include',
        headers: authHeaders,
    })

    if (!res.ok) {
        throw new Error('删除用户失败')
    }

    return true
}
