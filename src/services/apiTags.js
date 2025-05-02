import { BASE_URL } from './apiConfig'

// 获取所有兴趣标签
export async function getAllInterestTags() {
    try {
        const res = await fetch(`${BASE_URL}/tags/interests`, {
            credentials: 'include',
        })

        if (!res.ok) {
            throw new Error('获取兴趣标签失败')
        }

        const { data } = await res.json()
        return data.tags
    } catch (error) {
        console.error('获取兴趣标签失败:', error)
        return []
    }
}

// 搜索兴趣标签
export async function searchInterestTags(query) {
    try {
        const res = await fetch(
            `${BASE_URL}/tags/search?query=${encodeURIComponent(
                query
            )}&type=interest`,
            {
                credentials: 'include',
            }
        )

        if (!res.ok) {
            throw new Error('搜索兴趣标签失败')
        }

        const { data } = await res.json()
        return data.tags
    } catch (error) {
        console.error('搜索兴趣标签失败:', error)
        return []
    }
}

// 创建兴趣标签（仅限管理员）
export async function createInterestTag(tagData) {
    try {
        const res = await fetch(`${BASE_URL}/tags`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: tagData.name,
                type: 'interest',
                category: tagData.category || 'other',
                description: tagData.description || '',
            }),
        })

        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.message || '创建兴趣标签失败')
        }

        return await res.json()
    } catch (error) {
        console.error('创建兴趣标签失败:', error)
        throw error
    }
}

// 批量创建兴趣标签（仅限管理员）
export async function createManyInterestTags(tags) {
    try {
        const res = await fetch(`${BASE_URL}/tags/batch`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tags: tags.map((tag) => ({
                    name: tag,
                    type: 'interest',
                })),
            }),
        })

        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.message || '批量创建兴趣标签失败')
        }

        return await res.json()
    } catch (error) {
        console.error('批量创建兴趣标签失败:', error)
        throw error
    }
}
