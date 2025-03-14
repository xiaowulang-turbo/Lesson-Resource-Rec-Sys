/* eslint-disable no-unused-vars */
import { BASE_URL } from './apiConfig'

function getStoredAuth() {
    const auth = localStorage.getItem('auth')
    return auth ? JSON.parse(auth) : null
}

export async function getCabins() {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const res = await fetch(`${BASE_URL}/resources`, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || '无法加载资源')

        return data.data.resources
    } catch (error) {
        console.error(error)
        throw new Error('无法加载资源')
    }
}

export async function createEditCabin(newCabin, id) {
    const url = id ? `${BASE_URL}/cabins/${id}` : `${BASE_URL}/cabins`
    const res = await fetch(url, {
        method: id ? 'PATCH' : 'POST',
        body: JSON.stringify(newCabin),
    })
}

export async function deleteCabin(id) {
    const res = await fetch(`${BASE_URL}/cabins/${id}`, {
        method: 'DELETE',
    })
}

export async function createEditResource(newResource, id) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const formData = new FormData()
        Object.keys(newResource).forEach((key) => {
            if (key === 'file' && newResource[key]) {
                formData.append('file', newResource[key])
            } else {
                formData.append(key, newResource[key])
            }
        })

        const url = id ? `${BASE_URL}/resources/${id}` : `${BASE_URL}/resources`

        const res = await fetch(url, {
            method: id ? 'PATCH' : 'POST',
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
            body: formData,
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || '无法创建/更新资源')

        return data.data.resource
    } catch (error) {
        console.error(error)
        throw new Error('无法创建/更新资源')
    }
}

export async function deleteResource(id) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const res = await fetch(`${BASE_URL}/resources/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || '无法删除资源')

        return data.data
    } catch (error) {
        console.error(error)
        throw new Error('无法删除资源')
    }
}
