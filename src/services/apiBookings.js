import { BASE_URL, ENDPOINTS } from './apiConfig'

// 获取存储的认证信息
function getStoredAuth() {
    const auth = localStorage.getItem('auth')
    return auth ? JSON.parse(auth) : null
}

// 获取当天日期（结束时间）
function getToday(options = {}) {
    const today = new Date()
    if (options.end) {
        today.setHours(23, 59, 59, 999)
    } else {
        today.setHours(0, 0, 0, 0)
    }
    return today.toISOString()
}

// 分页获取预订列表
export async function getBookings({ filter, sortBy, page }) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        // 构建查询URL
        const url = new URL(`${BASE_URL}${ENDPOINTS.BOOKINGS.BASE}`)

        // 添加筛选条件
        if (filter) {
            url.searchParams.append(filter.field, filter.value)
        }

        // 添加排序
        if (sortBy) {
            url.searchParams.append(
                'sort',
                `${sortBy.direction === 'desc' ? '-' : ''}${sortBy.field}`
            )
        }

        // 添加分页
        if (page) {
            url.searchParams.append('page', page)
            url.searchParams.append('limit', 10) // 每页10条记录
        }

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.message || '无法获取预订列表')

        return {
            data: data.data.bookings,
            count: data.data.total || data.data.bookings.length,
        }
    } catch (error) {
        console.error('获取预订列表失败:', error)
        throw error
    }
}

// 获取所有预订
export async function getAllBookings() {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const response = await fetch(`${BASE_URL}${ENDPOINTS.BOOKINGS.BASE}`, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.message || '无法获取预订列表')

        return data.data.bookings
    } catch (error) {
        console.error('获取预订列表失败:', error)
        throw error
    }
}

// 获取预订详情
export async function getBooking(id) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const response = await fetch(
            `${BASE_URL}${ENDPOINTS.BOOKINGS.SINGLE(id)}`,
            {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            }
        )

        const data = await response.json()
        if (!response.ok) throw new Error(data.message || '无法获取预订详情')

        return data.data.booking
    } catch (error) {
        console.error('获取预订详情失败:', error)
        throw error
    }
}

// 创建预订
export async function createBooking(bookingData) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const response = await fetch(`${BASE_URL}${ENDPOINTS.BOOKINGS.BASE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify(bookingData),
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.message || '创建预订失败')

        return data.data.booking
    } catch (error) {
        console.error('创建预订失败:', error)
        throw error
    }
}

// 更新预订
export async function updateBooking(id, updateData) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const response = await fetch(
            `${BASE_URL}${ENDPOINTS.BOOKINGS.SINGLE(id)}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify(updateData),
            }
        )

        const data = await response.json()
        if (!response.ok) throw new Error(data.message || '更新预订失败')

        return data.data.booking
    } catch (error) {
        console.error('更新预订失败:', error)
        throw error
    }
}

// 删除预订
export async function deleteBooking(id) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const response = await fetch(
            `${BASE_URL}${ENDPOINTS.BOOKINGS.SINGLE(id)}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            }
        )

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || '删除预订失败')
        }

        return true
    } catch (error) {
        console.error('删除预订失败:', error)
        throw error
    }
}

// 更新预订状态
export async function updateBookingStatus(id, status) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        const response = await fetch(
            `${BASE_URL}${ENDPOINTS.BOOKINGS.STATUS(id)}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({ status }),
            }
        )

        const data = await response.json()
        if (!response.ok) throw new Error(data.message || '更新预订状态失败')

        return data.data.booking
    } catch (error) {
        console.error('更新预订状态失败:', error)
        throw error
    }
}

// 获取指定日期之后的预订
export async function getBookingsAfterDate(date) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        // 构建查询URL
        const url = new URL(`${BASE_URL}${ENDPOINTS.BOOKINGS.BASE}`)

        // 添加日期筛选参数
        url.searchParams.append('createdAt[gte]', date)
        url.searchParams.append('createdAt[lte]', getToday({ end: true }))

        // 默认按创建时间降序排序
        url.searchParams.append('sort', '-createdAt')

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.message || '无法获取最近预订')

        return data.data.bookings
    } catch (error) {
        console.error('获取最近预订失败:', error)
        throw error
    }
}

// 获取指定日期之后的入住记录
export async function getStaysAfterDate(date) {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        // 构建查询URL
        const url = new URL(`${BASE_URL}${ENDPOINTS.BOOKINGS.BASE}`)

        // 添加日期筛选参数，查询入住日期大于等于指定日期且小于等于今天的记录
        url.searchParams.append('startDate[gte]', date)
        url.searchParams.append('startDate[lte]', getToday({ end: true }))

        // 处理状态参数，支持新旧系统，使用 $in 操作符
        url.searchParams.append(
            'status[$in]',
            'in-progress,completed,checked-in,checked-out'
        )

        // 默认按开始日期排序
        url.searchParams.append('sort', 'startDate')

        console.log('Fetching stays with URL:', url.toString())

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('Error response:', errorData)
            throw new Error(errorData.message || '无法获取入住记录')
        }

        const data = await response.json()
        return data.data.bookings
    } catch (error) {
        console.error('获取入住记录失败:', error)
        throw error
    }
}

// 获取今日活动（今天入住或退房的预订）
export async function getStaysTodayActivity() {
    try {
        const auth = getStoredAuth()
        if (!auth?.token) throw new Error('未登录')

        // 构建查询URL
        const url = new URL(
            `${BASE_URL}${ENDPOINTS.BOOKINGS.BASE}/today-activity`
        )

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.message || '无法获取今日活动')

        return data.data.bookings
    } catch (error) {
        console.error('获取今日活动失败:', error)
        throw error
    }
}
