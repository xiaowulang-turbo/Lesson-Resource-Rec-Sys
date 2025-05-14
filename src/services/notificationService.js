import { API_URL } from '../utils/constants'
import { getStoredAuth } from './apiAuth'
/**
 * 通知服务 - 封装与通知相关的API调用
 */
const BASE_URL = `${API_URL}/api/v1/notifications`

/**
 * 获取用户通知列表
 * @param {Object} params - 查询参数 {page, limit}
 * @returns {Promise} - 通知列表和分页信息
 */
export const getUserNotifications = async (params = {}) => {
    const auth = getStoredAuth()
    if (!auth?.token) return null

    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page)
    if (params.limit) queryParams.append('limit', params.limit)

    const response = await fetch(`${BASE_URL}?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '获取通知失败')
    }

    return response.json()
}

/**
 * 获取未读通知
 * @returns {Promise} - 未读通知列表
 */
export const getUnreadNotifications = async () => {
    const auth = getStoredAuth()
    if (!auth?.token) return null

    const response = await fetch(`${BASE_URL}/unread`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '获取未读通知失败')
    }

    return response.json()
}

/**
 * 标记通知为已读
 * @param {string} id - 通知ID
 * @returns {Promise} - 操作结果
 */
export const markAsRead = async (id) => {
    const auth = getStoredAuth()
    if (!auth?.token) return null

    const response = await fetch(`${BASE_URL}/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '标记已读失败')
    }

    return response.json()
}

/**
 * 标记所有通知为已读
 * @returns {Promise} - 操作结果
 */
export const markAllAsRead = async () => {
    const auth = getStoredAuth()
    if (!auth?.token) return null

    const response = await fetch(`${BASE_URL}/read-all`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '标记所有通知为已读失败')
    }

    return response.json()
}

/**
 * 删除用户通知
 * @param {string} id - 通知ID
 * @returns {Promise} - 操作结果
 */
export const deleteUserNotification = async (id) => {
    const auth = getStoredAuth()
    if (!auth?.token) return null

    const response = await fetch(`${BASE_URL}/user/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '删除通知失败')
    }

    return response.json()
}

// ---------- 管理员API ----------

/**
 * 创建新通知
 * @param {Object} data - 通知数据
 * @returns {Promise} - 创建的通知
 */
export const createNotification = async (data) => {
    const auth = getStoredAuth()
    if (!auth?.token) return null

    const response = await fetch(BASE_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '创建通知失败')
    }

    return response.json()
}

/**
 * 更新通知
 * @param {string} id - 通知ID
 * @param {Object} data - 更新数据
 * @returns {Promise} - 更新后的通知
 */
export const updateNotification = async (id, data) => {
    const auth = getStoredAuth()
    if (!auth?.token) return null

    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '更新通知失败')
    }

    return response.json()
}

/**
 * 删除通知
 * @param {string} id - 通知ID
 * @returns {Promise} - 操作结果
 */
export const deleteNotification = async (id) => {
    const auth = getStoredAuth()
    if (!auth?.token) return null

    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '删除通知失败')
    }

    return response.json()
}

/**
 * 发布通知
 * @param {string} id - 通知ID
 * @returns {Promise} - 操作结果
 * @deprecated 新通知已在创建时自动发布，此函数保留用于向后兼容或特殊情况
 */
export const publishNotification = async (id) => {
    const auth = getStoredAuth()
    if (!auth?.token) return null

    const response = await fetch(`${BASE_URL}/${id}/publish`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '发布通知失败')
    }

    return response.json()
}

/**
 * 归档通知
 * @param {string} id - 通知ID
 * @returns {Promise} - 操作结果
 */
export const archiveNotification = async (id) => {
    const auth = getStoredAuth()
    if (!auth?.token) return null

    const response = await fetch(`${BASE_URL}/${id}/archive`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '归档通知失败')
    }

    return response.json()
}
