export const BASE_URL = 'http://localhost:3000/api/v1'

export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        SIGNUP: '/auth/signup',
        LOGOUT: '/auth/logout',
    },
    USERS: {
        ME: '/users/me',
        UPDATE_ME: '/users/updateMe',
        DELETE_ME: '/users/deleteMe',
    },
    RESOURCES: {
        BASE: '/resources',
        RATINGS: (id) => `/resources/${id}/ratings`,
        SINGLE: (id) => `/resources/${id}`,
        RECOMMENDED: '/resources/recommended',
    },
    STATS: {
        BASE: '/stats',
    },
}

// 获取存储的认证令牌
export const getAuthToken = () => {
    const auth = localStorage.getItem('auth')
    return auth ? JSON.parse(auth).token : null
}

// API请求辅助函数
export const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken()

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        credentials: 'include',
        mode: 'cors',
    }

    const requestOptions = {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers },
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, requestOptions)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `请求失败: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('API请求错误:', error)
        throw error
    }
}
