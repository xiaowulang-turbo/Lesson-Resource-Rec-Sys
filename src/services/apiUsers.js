import { BASE_URL } from './apiConfig'
import { API_URL } from '../utils/constants'
import axiosInstance from './axiosInstance' // 假设你有一个配置好的 axios 实例
import { getStoredAuth } from './apiAuth.js'

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

export async function getUsers() {
    try {
        const response = await axiosInstance.get('/users')
        // 后端 API 将用户数据包装在 response.data.data.users 中
        return response.data.data.users
    } catch (error) {
        console.error('获取用户列表失败:', error)
        // 确保在错误情况下也抛出错误，让 React Query 处理
        throw new Error(error.response?.data?.message || '无法加载用户数据')
    }
}

export async function deleteMe() {
    const auth = getStoredAuth()
    if (!auth || !auth.token) throw new Error('用户未登录')

    const res = await fetch(`${BASE_URL}/users/deleteMe`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${auth.token}`,
        },
    })

    if (!res.ok) {
        const data = await res.json().catch(() => ({})) // 尝试解析JSON，失败则返回空对象
        throw new Error(data.message || '删除账户失败')
    }

    // 对于204 No Content，通常没有响应体
    return null // 或者返回一个表示成功的特定对象，如 { status: 'success' }
}

// 新增：添加资源到收藏夹
export async function addFavorite(userId, resourceId) {
    const auth = getStoredAuth()
    if (!auth || !auth.token) throw new Error('用户未登录')

    const res = await fetch(
        `${BASE_URL}/users/${userId}/favorites/${resourceId}`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${auth.token}`,
                'Content-Type': 'application/json',
            },
        }
    )

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.message || '添加收藏失败')
    }

    // console.log('添加收藏成功', data)

    return data.data // 返回更新后的收藏列表等信息
}

// 新增：从收藏夹移除资源
export async function removeFavorite(userId, resourceId) {
    const auth = getStoredAuth()
    if (!auth || !auth.token) throw new Error('用户未登录')

    const res = await fetch(
        `${BASE_URL}/users/${userId}/favorites/${resourceId}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        }
    )

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.message || '移除收藏失败')
    }

    return data.data // 返回更新后的收藏列表等信息
}

// 删除指定用户
export async function deleteUser(userId) {
    const auth = getStoredAuth()
    if (!auth || !auth.token) throw new Error('用户未登录')

    const res = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${auth.token}`,
        },
    })

    if (res.status === 204) {
        return { success: true, message: '用户已成功删除' }
    }

    let data = null
    try {
        data = await res.json()
    } catch (e) {
        // 兼容无内容
    }

    if (!res.ok) {
        throw new Error((data && data.message) || '删除用户失败')
    }

    return data
}

// 更新指定用户
export async function updateUser(userId, userData) {
    const auth = getStoredAuth()
    if (!auth || !auth.token) throw new Error('用户未登录')

    const res = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(userData),
    })

    let data = null
    try {
        data = await res.json()
    } catch (e) {
        // 兼容无内容
    }

    if (!res.ok) {
        throw new Error((data && data.message) || '更新用户信息失败')
    }

    return data
}
