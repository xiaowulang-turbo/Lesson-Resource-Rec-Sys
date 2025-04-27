// Base URL for your API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

/**
 * Fetches homepage recommendations from the backend.
 * Handles both guest and logged-in users.
 */
export const fetchHomepageRecommendations = async (limit = 8) => {
    try {
        const url = `${API_URL}/recommendations/homepage?limit=${limit}`

        // 修正获取token的方式，从auth对象中获取，而不是直接获取jwt
        let token = null
        const storedAuth = localStorage.getItem('auth')
        if (storedAuth) {
            try {
                const authData = JSON.parse(storedAuth)
                token = authData.token
            } catch (e) {
                console.error('Error parsing auth data:', e)
            }
        }

        const headers = {
            'Content-Type': 'application/json',
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const res = await fetch(url, {
            method: 'GET',
            headers: headers,
        })

        if (!res.ok) {
            // Try to parse error message from backend if available
            let errorMessage = `HTTP error! status: ${res.status}`
            try {
                const errorData = await res.json()
                errorMessage = errorData.message || errorMessage
            } catch (e) {
                // Ignore if response body is not JSON or empty
            }
            throw new Error(errorMessage)
        }

        const data = await res.json()

        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch recommendations')
        }

        // Return the recommendations array
        return data.data.recommendations
    } catch (error) {
        console.error('Error fetching homepage recommendations:', error)
        // Re-throw the error so the calling component can handle it (e.g., show error message)
        throw error
    }
}

/**
 * 获取与指定资源相似的资源推荐
 * @param {string} resourceId - 当前正在查看的资源ID
 * @param {number} limit - 要返回的相似资源数量限制
 * @returns {Promise<Array>} - 相似资源数组
 */
export const fetchSimilarResources = async (resourceId, limit = 4) => {
    try {
        // 在实际项目中，这里会调用后端API
        // const url = `${API_URL}/recommendations/similar/${resourceId}?limit=${limit}`;

        // 由于此刻可能还没有实现后端API，我们先使用模拟数据
        // 模拟API调用延迟
        await new Promise((resolve) => setTimeout(resolve, 300))

        // 生成模拟的相似资源数据
        const mockSimilarResources = generateMockSimilarResources(
            resourceId,
            limit
        )

        return mockSimilarResources
    } catch (error) {
        console.error('获取相似资源推荐失败:', error)
        // 在生产环境中，如果API失败，返回空数组而不是抛出错误，以避免UI错误
        return []
    }
}

/**
 * 生成模拟的相似资源数据
 * @private
 */
function generateMockSimilarResources(resourceId, limit) {
    // 资源类型列表
    const types = [1, 2, 3, 4, 5] // 对应文档、视频、音频、图片、其他
    const subjects = [
        '数学',
        '语文',
        '英语',
        '物理',
        '化学',
        '历史',
        '地理',
        '生物',
        '政治',
        '信息技术',
    ]
    const grades = [
        '小学一年级',
        '小学二年级',
        '小学三年级',
        '小学四年级',
        '小学五年级',
        '小学六年级',
        '初中一年级',
        '初中二年级',
        '初中三年级',
        '高中一年级',
        '高中二年级',
        '高中三年级',
    ]
    const difficulties = [1, 2, 3, 4, 5] // 对应入门、初级、中级、高级、专家

    // 随机生成几个相似资源
    const count = Math.min(limit, 4 + Math.floor(Math.random() * 3)) // 生成4-6个资源，但不超过传入的limit
    const resources = []

    for (let i = 0; i < count; i++) {
        // 确保ID与当前资源不同
        const id = `sim-${resourceId.substring(0, 3)}-${i + 1}`

        // 随机生成资源数据
        resources.push({
            id,
            title: `相似教学资源 ${i + 1} - ${
                subjects[Math.floor(Math.random() * subjects.length)]
            }`,
            description:
                '这是一个与当前资源相似的推荐资源，基于内容或协同过滤算法推荐。',
            type: types[Math.floor(Math.random() * types.length)],
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            grade: grades[Math.floor(Math.random() * grades.length)],
            difficulty:
                difficulties[Math.floor(Math.random() * difficulties.length)],
            price: Math.random() > 0.7 ? Math.floor(Math.random() * 100) : 0, // 70%概率免费
            createdAt: new Date(
                Date.now() -
                    Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)
            ).toISOString(), // 过去90天内随机时间
            coverImage: `https://picsum.photos/seed/${id}/300/200`, // 使用随机图片服务生成封面
            tags: generateRandomTags(),
            stats: {
                views: Math.floor(Math.random() * 1000),
                likes: Math.floor(Math.random() * 200),
                downloads: Math.floor(Math.random() * 100),
            },
        })
    }

    return resources
}

/**
 * 生成随机标签
 * @private
 */
function generateRandomTags() {
    const allTags = [
        '小学教育',
        '中学教育',
        '高中教育',
        '教学课件',
        '教案',
        '习题',
        '考试',
        '练习',
        '知识点',
        '重点难点',
        '实验',
        '课外阅读',
        '教学视频',
        '教学资料',
        '教学指导',
        '教学计划',
    ]

    // 随机选择2-4个标签
    const count = 2 + Math.floor(Math.random() * 3)
    const tags = []

    // 从标签池中随机选择不重复的标签
    const tagPool = [...allTags]
    for (let i = 0; i < count && tagPool.length > 0; i++) {
        const index = Math.floor(Math.random() * tagPool.length)
        tags.push(tagPool[index])
        tagPool.splice(index, 1) // 从池中移除已选标签
    }

    return tags
}

// Add other recommendation-related API functions here if needed
