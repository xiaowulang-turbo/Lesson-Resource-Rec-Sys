// Base URL for your API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
import {
    calculateItemSimilarityMatrix,
    findSimilarResources,
    prepareRatingMatrix,
} from '../utils/recommendationAlgorithms'

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
        // 构造调用后端API的URL
        const url = `${API_URL}/recommendations/similar/${resourceId}?limit=${limit}`

        // 获取存储的用户认证信息（如果有的话）
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

        // 设置请求头
        const headers = {
            'Content-Type': 'application/json',
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        // 发送API请求
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
        })

        if (!response.ok) {
            // 尝试解析错误消息
            let errorMessage = `HTTP error! status: ${response.status}`
            try {
                const errorData = await response.json()
                errorMessage = errorData.message || errorMessage
            } catch (e) {
                // 无法解析响应体时忽略
            }
            throw new Error(errorMessage)
        }

        const data = await response.json()

        if (data.status !== 'success') {
            throw new Error(data.message || '获取相似资源失败')
        }

        console.log('从后端获取的相似资源:', data.data.recommendations)

        // 返回推荐结果
        return data.data.recommendations
    } catch (error) {
        console.error('获取相似资源推荐失败:', error)

        // 如果API失败，返回空数组而不是抛出错误，以避免UI错误
        return []
    }
}

/**
 * 基于内容过滤的推荐算法
 * @param {Object} currentResource - 当前资源
 * @param {Array} allResources - 所有资源列表
 * @param {Number} limit - 推荐数量
 * @param {Array} excludeIds - 要排除的资源ID列表
 * @returns {Array} - 推荐结果
 */
const contentBasedFiltering = (
    currentResource,
    allResources,
    limit,
    excludeIds = []
) => {
    if (!currentResource || !allResources || allResources.length === 0) {
        return []
    }

    // 为每个资源计算与当前资源的相似度分数
    const scoredResources = allResources
        .filter((r) => {
            // 排除当前资源和已经在推荐列表中的资源
            return (
                r.id.toString() !== currentResource.id.toString() &&
                !excludeIds.includes(r.id.toString())
            )
        })
        .map((resource) => {
            let score = 0

            // 相同主题加分
            if (resource.subject === currentResource.subject) {
                score += 5
            }

            // 难度接近加分
            if (resource.difficulty && currentResource.difficulty) {
                const diffDelta = Math.abs(
                    resource.difficulty - currentResource.difficulty
                )
                if (diffDelta === 0) {
                    score += 3 // 完全匹配难度
                } else if (diffDelta === 1) {
                    score += 1 // 难度接近
                }
            }

            // 标签重叠加分
            if (resource.tags && currentResource.tags) {
                const resourceTags = Array.isArray(resource.tags)
                    ? resource.tags
                    : []
                const currentTags = Array.isArray(currentResource.tags)
                    ? currentResource.tags
                    : []

                const commonTags = resourceTags.filter((tag) =>
                    currentTags.includes(tag)
                )
                score += commonTags.length * 2 // 每个匹配的标签得分

                // 记录共同标签用于推荐原因
                resource.commonTags = commonTags
            }

            // 相同年级加分
            if (resource.grade === currentResource.grade) {
                score += 2
            }

            // 添加少量基于热门程度的分数
            let enrollment = 0
            try {
                const enrollCountStr = resource.enrollCount?.toString() || '0'
                enrollment = parseInt(
                    enrollCountStr.replace(/[^0-9]/g, '') || '0',
                    10
                )
            } catch (err) {
                enrollment = 0
            }
            score += enrollment * 0.001

            // 生成推荐原因
            let recommendationReason = `与您正在查看的资源相似`
            if (resource.subject === currentResource.subject) {
                recommendationReason = `同样是${resource.subject}领域的资源`
            } else if (resource.commonTags && resource.commonTags.length > 0) {
                recommendationReason = `包含相似标签: ${resource.commonTags
                    .slice(0, 2)
                    .join('、')}`
            }

            return {
                ...resource,
                similarityScore: score,
                recommendationReason,
            }
        })
        .filter((r) => r.similarityScore > 3) // 只保留相似度较高的
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit)

    return scoredResources
}

/**
 * 获取资源关系数据
 * @private
 */
const fetchResourceRelationships = async () => {
    // 实际项目中，这里应该从API获取
    // 由于目前可能没有API可用，我们使用示例数据
    // 资源关系数据示例
    return [
        {
            resource_id: '1473948443',
            resource_title: '人工智能及其航空航天应用',
            similar_resources: [
                {
                    resource_id: '1474376445',
                    similarity_score: 0.78,
                    common_topics: ['人工智能', '数据科学'],
                    common_skills: ['机器学习', '深度学习'],
                },
                {
                    resource_id: '1474376441',
                    similarity_score: 0.85,
                    common_topics: ['航空航天', '智能控制'],
                    common_skills: ['人工智能', '控制系统'],
                },
                {
                    resource_id: '1474376444',
                    similarity_score: 0.72,
                    common_topics: ['航空航天', '无人机'],
                    common_skills: ['智能控制', '网络通信'],
                },
            ],
            co_accessed_with: [
                {
                    resource_id: '1474376441',
                    co_access_count: 180,
                    co_access_percentage: 65,
                },
                {
                    resource_id: '1474376444',
                    co_access_count: 150,
                    co_access_percentage: 55,
                },
            ],
            recommended_sequence: ['1474376441', '1474376444', '1474376445'],
        },
        {
            resource_id: '1474376441',
            resource_title: '电推进智能控制',
            similar_resources: [
                {
                    resource_id: '1473948443',
                    similarity_score: 0.85,
                    common_topics: ['航空航天', '智能控制'],
                    common_skills: ['人工智能', '控制系统'],
                },
                {
                    resource_id: '1474376444',
                    similarity_score: 0.79,
                    common_topics: ['航空航天', '智能控制'],
                    common_skills: ['无人机技术', '控制系统'],
                },
            ],
            co_accessed_with: [
                {
                    resource_id: '1473948443',
                    co_access_count: 180,
                    co_access_percentage: 75,
                },
                {
                    resource_id: '1474376444',
                    co_access_count: 120,
                    co_access_percentage: 50,
                },
            ],
            recommended_sequence: ['1473948443', '1474376444'],
        },
        {
            resource_id: '1474376444',
            resource_title: '无人机集群技术——智能组网与协同',
            similar_resources: [
                {
                    resource_id: '1473948443',
                    similarity_score: 0.72,
                    common_topics: ['航空航天', '无人机'],
                    common_skills: ['智能控制', '网络通信'],
                },
                {
                    resource_id: '1474376441',
                    similarity_score: 0.79,
                    common_topics: ['航空航天', '智能控制'],
                    common_skills: ['无人机技术', '控制系统'],
                },
            ],
            co_accessed_with: [
                {
                    resource_id: '1473948443',
                    co_access_count: 150,
                    co_access_percentage: 60,
                },
                {
                    resource_id: '1474376441',
                    co_access_count: 120,
                    co_access_percentage: 48,
                },
            ],
            recommended_sequence: ['1473948443', '1474376441'],
        },
        {
            resource_id: '1474376450',
            resource_title: '信息技术',
            similar_resources: [
                {
                    resource_id: '1474376455',
                    similarity_score: 0.83,
                    common_topics: ['信息技术', '电子信息'],
                    common_skills: ['技术服务', '产品检测'],
                },
                {
                    resource_id: '1474376456',
                    similarity_score: 0.79,
                    common_topics: ['信息技术', '智能终端'],
                    common_skills: ['技术服务', '产品开发'],
                },
            ],
            co_accessed_with: [
                {
                    resource_id: '1474376455',
                    co_access_count: 200,
                    co_access_percentage: 70,
                },
                {
                    resource_id: '1474376456',
                    co_access_count: 180,
                    co_access_percentage: 65,
                },
            ],
            recommended_sequence: ['1474376455', '1474376456'],
        },
        {
            resource_id: '1474376455',
            resource_title: '智能通信终端产品检测与维修',
            similar_resources: [
                {
                    resource_id: '1474376450',
                    similarity_score: 0.83,
                    common_topics: ['信息技术', '电子信息'],
                    common_skills: ['技术服务', '产品检测'],
                },
                {
                    resource_id: '1474376456',
                    similarity_score: 0.9,
                    common_topics: ['电子信息', '智能终端'],
                    common_skills: ['产品检测', '技术服务'],
                },
            ],
            co_accessed_with: [
                {
                    resource_id: '1474376450',
                    co_access_count: 200,
                    co_access_percentage: 75,
                },
                {
                    resource_id: '1474376456',
                    co_access_count: 230,
                    co_access_percentage: 85,
                },
            ],
            recommended_sequence: ['1474376456', '1474376450'],
        },
    ]
}

/**
 * 获取所有资源数据
 * @private
 */
const fetchAllResources = async () => {
    // 实际项目中，这里应该从API获取
    // 由于目前可能没有API可用，我们使用示例数据
    return [
        {
            id: 1473948443,
            title: '人工智能及其航空航天应用',
            description:
                '本书是航空航天新兴领域"十四五"高等教育教材。人工智能时代已然来临，航空航天作为全世界最早的信息科技产业应用技术领域之一，迫切需要开设人工智能技术及其于航空航天的应用课程，为人工智能在航空航天的普及、人才的培养、学科的发展提供条件。',
            subject: '航空航天',
            grade: '本科及研究生',
            difficulty: 4,
            coverImage:
                'https://mooc-image.nosdn.127.net/8393e0cb-73a8-4bc0-8251-3c67f20e8c82.png',
            price: 24.5,
            tags: ['人工智能', '航空航天', '教材'],
            enrollCount: 76,
        },
        {
            id: 1474376445,
            title: '隐私计算导论',
            description:
                '本书是大数据新兴领域"十四五"高等教育教材。在当今社会，数据已经晋升为与传统土地、劳动力、资本和技术并列的"第五生产要素"。',
            subject: '数据科学',
            grade: '本科及研究生',
            difficulty: 4,
            coverImage:
                'https://mooc-image.nosdn.127.net/5e28b0ce-ae67-43bc-b3c9-40cbf496fac3.png',
            price: 27.3,
            tags: ['隐私计算', '数据科学', '人工智能'],
            enrollCount: 24,
        },
        {
            id: 1474376441,
            title: '电推进智能控制',
            description:
                '《电推进智能控制》是航空航天新兴领域"十四五"高等教育教材，专为空天智能电推进技术专业的高年级学生编写。',
            subject: '航空航天',
            grade: '本科高年级',
            difficulty: 4,
            coverImage:
                'https://mooc-image.nosdn.127.net/6da575dc-0957-412e-8df0-6f8171d0b675.png',
            price: 24.5,
            tags: ['电推进', '智能控制', '航空航天'],
            enrollCount: 7,
        },
        {
            id: 1474376450,
            title: '信息技术',
            description:
                '本教材依据教育部最新发布的《高等职业教育专科信息技术课程标准》及《全国高等学校计算机水平考试大纲》编写。',
            subject: '信息技术',
            grade: '专科',
            difficulty: 3,
            coverImage:
                'https://mooc-image.nosdn.127.net/51b4ad86-63e0-4de2-9d1e-8e06d506a241.png',
            price: 32.55,
            tags: ['信息技术', '计算机基础', '职业教育'],
            enrollCount: 11,
        },
        {
            id: 1474376444,
            title: '无人机集群技术——智能组网与协同',
            description:
                '本书是航空航天战略性新兴领域"十四五"高等教育教材体系建设规划项目的研究成果，书中紧密结合无人机集群技术最新发展趋势。',
            subject: '航空航天',
            grade: '本科',
            difficulty: 4,
            coverImage:
                'https://mooc-image.nosdn.127.net/b83d242e-2f0a-46ed-a69e-d366f48d66e6.png',
            price: 24.5,
            tags: ['无人机', '智能组网', '航空航天'],
            enrollCount: 2,
        },
        {
            id: 1474376456,
            title: '智能终端产品技术服务',
            description:
                '本书以项目引领、教学一体化为特色，根据高职高专教学的基本要求，结合岗位技能职业标准。',
            subject: '电子信息',
            grade: '高职高专',
            difficulty: 3,
            coverImage:
                'https://mooc-image.nosdn.127.net/5fd76267-d761-4599-9ee5-5a436ca5d1e5.png',
            price: 34.8,
            tags: ['智能终端', '技术服务', '职业教育'],
            enrollCount: 0,
        },
    ]
}

/**
 * 获取用户交互数据
 * 用于协同过滤算法
 */
const fetchUserInteractions = async () => {
    // 在实际项目中应该从API获取
    // 这里使用示例数据
    return [
        // 用户1的交互记录
        {
            userId: 'user1',
            resourceId: '1473948443',
            interactionType: 'view',
            timestamp: '2023-01-01',
        },
        {
            userId: 'user1',
            resourceId: '1474376441',
            interactionType: 'like',
            timestamp: '2023-01-01',
        },
        {
            userId: 'user1',
            resourceId: '1474376444',
            interactionType: 'download',
            timestamp: '2023-01-02',
        },
        {
            userId: 'user1',
            resourceId: '1474376445',
            interactionType: 'collection',
            timestamp: '2023-01-03',
        },

        // 用户2的交互记录
        {
            userId: 'user2',
            resourceId: '1473948443',
            interactionType: 'like',
            timestamp: '2023-01-01',
        },
        {
            userId: 'user2',
            resourceId: '1474376441',
            interactionType: 'download',
            timestamp: '2023-01-02',
        },
        {
            userId: 'user2',
            resourceId: '1474376448',
            interactionType: 'collection',
            timestamp: '2023-01-03',
        },

        // 用户3的交互记录
        {
            userId: 'user3',
            resourceId: '1474376441',
            interactionType: 'view',
            timestamp: '2023-01-01',
        },
        {
            userId: 'user3',
            resourceId: '1474376444',
            interactionType: 'like',
            timestamp: '2023-01-02',
        },
        {
            userId: 'user3',
            resourceId: '1474376445',
            interactionType: 'download',
            timestamp: '2023-01-03',
        },
        {
            userId: 'user3',
            resourceId: '1474376448',
            interactionType: 'collection',
            timestamp: '2023-01-04',
        },

        // 用户4的交互记录
        {
            userId: 'user4',
            resourceId: '1474376444',
            interactionType: 'like',
            timestamp: '2023-01-01',
        },
        {
            userId: 'user4',
            resourceId: '1474376445',
            interactionType: 'collection',
            timestamp: '2023-01-02',
        },
        {
            userId: 'user4',
            resourceId: '1474376448',
            interactionType: 'download',
            timestamp: '2023-01-03',
        },

        // 用户5的交互记录
        {
            userId: 'user5',
            resourceId: '1473948443',
            interactionType: 'collection',
            timestamp: '2023-01-01',
        },
        {
            userId: 'user5',
            resourceId: '1474376445',
            interactionType: 'like',
            timestamp: '2023-01-02',
        },
        {
            userId: 'user5',
            resourceId: '1474376448',
            interactionType: 'download',
            timestamp: '2023-01-03',
        },

        // 更多用户的交互记录
        {
            userId: 'user6',
            resourceId: '1473948443',
            interactionType: 'like',
            timestamp: '2023-01-01',
        },
        {
            userId: 'user6',
            resourceId: '1474376444',
            interactionType: 'collection',
            timestamp: '2023-01-02',
        },
        {
            userId: 'user6',
            resourceId: '1474376448',
            interactionType: 'download',
            timestamp: '2023-01-03',
        },

        {
            userId: 'user7',
            resourceId: '1474376441',
            interactionType: 'view',
            timestamp: '2023-01-01',
        },
        {
            userId: 'user7',
            resourceId: '1474376444',
            interactionType: 'collection',
            timestamp: '2023-01-02',
        },
        {
            userId: 'user7',
            resourceId: '1474376445',
            interactionType: 'like',
            timestamp: '2023-01-03',
        },

        {
            userId: 'user8',
            resourceId: '1474376441',
            interactionType: 'collection',
            timestamp: '2023-01-01',
        },
        {
            userId: 'user8',
            resourceId: '1474376444',
            interactionType: 'like',
            timestamp: '2023-01-02',
        },
        {
            userId: 'user8',
            resourceId: '1474376448',
            interactionType: 'download',
            timestamp: '2023-01-03',
        },

        {
            userId: 'user9',
            resourceId: '1473948443',
            interactionType: 'download',
            timestamp: '2023-01-01',
        },
        {
            userId: 'user9',
            resourceId: '1474376445',
            interactionType: 'collection',
            timestamp: '2023-01-02',
        },
        {
            userId: 'user9',
            resourceId: '1474376448',
            interactionType: 'like',
            timestamp: '2023-01-03',
        },

        {
            userId: 'user10',
            resourceId: '1474376441',
            interactionType: 'like',
            timestamp: '2023-01-01',
        },
        {
            userId: 'user10',
            resourceId: '1474376444',
            interactionType: 'download',
            timestamp: '2023-01-02',
        },
        {
            userId: 'user10',
            resourceId: '1474376445',
            interactionType: 'collection',
            timestamp: '2023-01-03',
        },
    ]
}

// Add other recommendation-related API functions here if needed
