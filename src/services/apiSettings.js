import { BASE_URL } from './apiConfig'

function getStoredAuth() {
    const auth = localStorage.getItem('auth')
    return auth ? JSON.parse(auth) : null
}

export async function getSettings() {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const res = await fetch(`${BASE_URL}/settings`, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || '无法加载设置')

        return data.data.settings
    } catch (error) {
        console.error(error)
        throw new Error('无法加载设置')
    }
}

// We expect a newSetting object that looks like {setting: newValue}
export async function updateSetting(newSetting) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const res = await fetch(`${BASE_URL}/settings`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify(newSetting),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || '无法更新设置')

        return data.data.settings
    } catch (error) {
        console.error(error)
        throw new Error('无法更新设置')
    }
}
