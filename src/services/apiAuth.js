import { BASE_URL, ENDPOINTS } from './apiConfig'

// 辅助函数：获取存储的认证信息
function getStoredAuth() {
    const auth = localStorage.getItem('auth')
    return auth ? JSON.parse(auth) : null
}

// 辅助函数：存储认证信息
function storeAuth(auth) {
    localStorage.setItem('auth', JSON.stringify(auth))
}

// 辅助函数：清除认证信息
function clearAuth() {
    localStorage.removeItem('auth')
}

// 注册
export async function signup({ fullName, email, password }) {
    try {
        const res = await fetch(`${BASE_URL}${ENDPOINTS.AUTH.SIGNUP}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: fullName, email, password }),
        })

        const data = await res.json()

        if (!res.ok) throw new Error(data.message || '注册失败')

        // 存储认证信息
        storeAuth(data)
        return data
    } catch (error) {
        throw new Error(error.message)
    }
}

// 登录
export async function login({ email, password }) {
    try {
        const res = await fetch(`${BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        const data = await res.json()

        if (!res.ok) throw new Error(data.message || '登录失败')

        // 存储认证信息
        storeAuth(data)
        return data
    } catch (error) {
        throw new Error(error.message)
    }
}

// 获取当前用户信息
export async function getCurrentUser() {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) return null

        const res = await fetch(`${BASE_URL}${ENDPOINTS.USERS.ME}`, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        })

        if (!res.ok) {
            clearAuth()
            return null
        }

        const data = await res.json()
        return data.data.user
    } catch (error) {
        clearAuth()
        return null
    }
}

// 登出
export async function logout() {
    clearAuth()
}

// 更新当前用户信息
export async function updateCurrentUser({ password, name }) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const res = await fetch(`${BASE_URL}${ENDPOINTS.USERS.UPDATE_ME}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify({ name, password }),
        })

        const data = await res.json()

        if (!res.ok) throw new Error(data.message || '更新失败')

        // 更新存储的用户信息
        const currentAuth = getStoredAuth()
        storeAuth({
            ...currentAuth,
            data: {
                user: {
                    ...currentAuth.data.user,
                    ...data.data.user,
                },
            },
        })

        return data
    } catch (error) {
        throw new Error(error.message)
    }
}
