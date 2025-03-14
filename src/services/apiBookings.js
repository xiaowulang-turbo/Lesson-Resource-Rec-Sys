import { PAGE_SIZE } from '../utils/constants'
import { getToday } from '../utils/helpers'
import { BASE_URL } from './apiConfig'

function getStoredAuth() {
    const auth = localStorage.getItem('auth')
    return auth ? JSON.parse(auth) : null
}

export async function getBookings({ filter, sortBy, page }) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        let url = new URL(`${BASE_URL}/resources`)

        // 1. Filter
        if (filter) {
            url.searchParams.append(filter.field, filter.value)
        }

        // 2. Sort
        if (sortBy) {
            url.searchParams.append(
                'sort',
                `${sortBy.direction === 'desc' ? '-' : ''}${sortBy.field}`
            )
        }

        // 3. Pagination
        if (page) {
            url.searchParams.append('page', page)
            url.searchParams.append('limit', PAGE_SIZE)
        }

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || '无法加载资源')

        return {
            data: data.data.resources,
            count: data.data.total,
        }
    } catch (error) {
        console.error(error)
        throw new Error('无法加载资源')
    }
}

export async function getBooking(id) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const res = await fetch(`${BASE_URL}/resources/${id}`, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || '无法找到资源')

        return data.data.resource
    } catch (error) {
        console.error(error)
        throw new Error('无法找到资源')
    }
}

// Returns all BOOKINGS that are were created after the given date. Useful to get bookings created in the last 30 days, for example.
// date: ISOString
export async function getBookingsAfterDate(date) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const url = new URL(`${BASE_URL}/resources`)
        url.searchParams.append('createdAfter', date)
        url.searchParams.append('createdBefore', getToday({ end: true }))

        const res = await fetch(url, {
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

// Returns all STAYS that are were created after the given date
export async function getStaysAfterDate(date) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const url = new URL(`${BASE_URL}/resources`)
        url.searchParams.append('startDate[gte]', date)
        url.searchParams.append('startDate[lte]', getToday())

        const res = await fetch(url, {
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

// Activity means that there is a check in or a check out today
export async function getStaysTodayActivity() {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const url = new URL(`${BASE_URL}/resources/today-activity`)

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || '无法加载今日活动')

        return data.data.resources
    } catch (error) {
        console.error(error)
        throw new Error('无法加载今日活动')
    }
}

export async function updateBooking(id, obj) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const res = await fetch(`${BASE_URL}/resources/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify(obj),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || '无法更新资源')

        return data.data.resource
    } catch (error) {
        console.error(error)
        throw new Error('无法更新资源')
    }
}

export async function deleteBooking(id) {
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
