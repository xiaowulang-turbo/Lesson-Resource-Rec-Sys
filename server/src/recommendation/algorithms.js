/**
 * 推荐算法模块
 * 实现基于内容的推荐、协同过滤推荐以及混合推荐算法
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 数据文件路径
const RESOURCES_PATH = path.join(__dirname, '../data/resources.json')
const RELATIONSHIPS_PATH = path.join(
    __dirname,
    '../data/resource_relationships.json'
)
const USERS_PATH = path.join(__dirname, '../data/accounts.json')

/**
 * 加载资源数据
 * @returns {Array} 资源数据数组
 */
const loadResourcesData = () => {
    try {
        const jsonData = fs.readFileSync(RESOURCES_PATH, 'utf8')
        return JSON.parse(jsonData)
    } catch (error) {
        console.error('加载资源数据失败:', error)
        return []
    }
}

/**
 * 加载资源关系数据
 * @returns {Array} 资源关系数据数组
 */
const loadRelationshipsData = () => {
    try {
        const jsonData = fs.readFileSync(RELATIONSHIPS_PATH, 'utf8')
        return JSON.parse(jsonData)
    } catch (error) {
        console.error('加载资源关系数据失败:', error)
        return []
    }
}

/**
 * 加载用户数据
 * @returns {Array} 用户数据数组
 */
const loadUsersData = () => {
    try {
        const jsonData = fs.readFileSync(USERS_PATH, 'utf8')
        return JSON.parse(jsonData)
    } catch (error) {
        console.error('加载用户数据失败:', error)
        return []
    }
}

/**
 * 基于内容的推荐算法
 * 根据用户偏好（学科、兴趣、难度）进行匹配和评分
 *
 * @param {Object} user 用户对象（包含偏好）
 * @param {Number} limit 推荐数量限制
 * @returns {Object} 推荐结果对象
 */
export const contentBasedRecommendation = (user, limit = 10) => {
    if (!user) {
        return {
            success: false,
            message: '未提供用户信息',
            recommendations: [],
        }
    }

    console.log('[contentBased] 用户数据:', user)

    // 获取用户偏好，确保不会有undefined
    const preferredSubjects = user.preferred_subjects || []
    const interests = user.interests || []
    const preferredDifficulty = user.preferred_difficulty || 3 // 默认中级难度

    console.log('[contentBased] 处理后的用户偏好:', {
        preferredSubjects,
        interests,
        preferredDifficulty,
    })

    // 加载资源数据
    const resources = loadResourcesData()
    if (!resources || resources.length === 0) {
        return {
            success: false,
            message: '无法加载资源数据',
            recommendations: [],
        }
    }

    // 为每个资源计算内容匹配得分
    const scoredResources = resources.map((resource) => {
        let score = 0
        const resourceTags = Array.isArray(resource.tags) ? resource.tags : []

        // 学科匹配得分
        if (preferredSubjects.includes(resource.subject)) {
            score += 5 // 学科直接匹配得高分
        }

        // 兴趣/标签重叠得分
        const commonInterests = resourceTags.filter((tag) =>
            interests.includes(tag)
        )
        score += commonInterests.length * 2 // 每个匹配的标签得分

        // 难度匹配得分
        if (
            preferredDifficulty !== undefined &&
            resource.difficulty !== undefined
        ) {
            const diffDelta = Math.abs(
                resource.difficulty - preferredDifficulty
            )
            if (diffDelta === 0) {
                score += 3 // 完全匹配难度
            } else if (diffDelta === 1) {
                score += 1 // 难度接近
            }
        }

        // 添加少量基于选课人数的分数用于打破平局
        let enrollment = 0
        try {
            const enrollCountStr = resource.enrollCount?.toString() || '0'
            enrollment = parseInt(
                enrollCountStr.replace(/[^0-9]/g, '') || '0',
                10
            )
        } catch (err) {
            console.error('处理enrollCount时出错:', err)
            enrollment = 0
        }

        score += enrollment * 0.001

        return {
            ...resource,
            score,
            algorithm: 'content',
            recommendation_reason: `基于内容匹配 (学科: ${
                resource.subject || '未知'
            }, 难度: ${
                resource.difficulty || '未知'
            }, 匹配得分: ${score.toFixed(2)})`,
        }
    })

    // 按得分降序排序并取前N个
    const recommendedResources = scoredResources
        .filter((r) => r.score > 0) // 只推荐得分为正的资源
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    return {
        success: true,
        message: '基于内容的推荐结果',
        recommendations: recommendedResources,
    }
}

/**
 * 协同过滤推荐算法
 * 根据相似度和共同访问数据推荐资源
 *
 * @param {Object} user 用户对象
 * @param {Number} limit 推荐数量限制
 * @returns {Object} 推荐结果对象
 */
export const collaborativeFilteringRecommendation = (user, limit = 10) => {
    if (!user) {
        return {
            success: false,
            message: '未提供用户信息',
            recommendations: [],
        }
    }

    console.log('[collaborativeFiltering] 开始进行协同过滤推荐...')
    console.log('[collaborativeFiltering] 用户数据:', user)

    // 获取用户已交互资源列表
    const userInteractions = user.course_interactions || []
    console.log(
        `[collaborativeFiltering] 用户交互记录数量: ${userInteractions.length}`
    )

    // 如果用户没有交互记录，无法进行协同过滤
    if (userInteractions.length === 0) {
        console.log(
            '[collaborativeFiltering] 用户交互数据不足，无法进行协同过滤推荐'
        )
        return {
            success: false,
            message: '用户交互数据不足，无法进行协同过滤推荐',
            recommendations: [],
        }
    }

    // 获取用户交互过的资源ID列表，安全处理可能的undefined
    const userResourceIds = userInteractions
        .filter((interaction) => interaction && interaction.course_id) // 先过滤掉没有course_id的交互
        .map((interaction) => {
            try {
                return interaction.course_id.toString()
            } catch (err) {
                console.error('处理交互ID时出错:', err)
                return null
            }
        })
        .filter((id) => id) // 过滤掉null和undefined

    console.log(
        `[collaborativeFiltering] 用户交互资源ID: ${userResourceIds.join(', ')}`
    )

    // 如果用户没有有效的交互记录，无法进行协同过滤
    if (userResourceIds.length === 0) {
        console.log(
            '[collaborativeFiltering] 用户有效交互数据不足，无法进行协同过滤推荐'
        )
        return {
            success: false,
            message: '用户有效交互数据不足，无法进行协同过滤推荐',
            recommendations: [],
        }
    }

    // 加载资源关系数据和资源数据
    const relationships = loadRelationshipsData()
    const resources = loadResourcesData()

    if (
        !relationships ||
        relationships.length === 0 ||
        !resources ||
        resources.length === 0
    ) {
        return {
            success: false,
            message: '无法加载资源关系或资源数据',
            recommendations: [],
        }
    }

    // 候选推荐资源集合
    let candidateResources = new Map()

    // 1. 基于用户交互过的资源，查找相似资源
    let matchedRelationshipsCount = 0
    userResourceIds.forEach((resourceId) => {
        const resourceRelationship = relationships.find(
            (r) => r.resource_id === resourceId
        )

        if (resourceRelationship) {
            matchedRelationshipsCount++

            // 添加相似资源
            if (
                resourceRelationship.similar_resources &&
                resourceRelationship.similar_resources.length > 0
            ) {
                resourceRelationship.similar_resources.forEach((similar) => {
                    // 确保similar.resource_id存在且不是undefined
                    if (!similar || !similar.resource_id) return

                    try {
                        const similarId = similar.resource_id.toString()
                        // 跳过用户已交互的资源
                        if (userResourceIds.includes(similarId)) return

                        // 计算相似度得分 (使用similarity_score替代similarity)
                        const similarityScore = similar.similarity_score || 0.5

                        if (candidateResources.has(similarId)) {
                            // 更新已有候选资源的得分
                            const existingScore =
                                candidateResources.get(similarId)
                            candidateResources.set(
                                similarId,
                                existingScore + similarityScore
                            )
                        } else {
                            // 添加新的候选资源
                            candidateResources.set(similarId, similarityScore)
                        }
                    } catch (err) {
                        console.error('处理相似资源时出错:', err)
                    }
                })
            }

            // 添加共同访问资源
            if (
                resourceRelationship.co_accessed_with &&
                resourceRelationship.co_accessed_with.length > 0
            ) {
                resourceRelationship.co_accessed_with.forEach((coAccessed) => {
                    // 确保coAccessed.resource_id存在且不是undefined
                    if (!coAccessed || !coAccessed.resource_id) return

                    try {
                        const coAccessedId = coAccessed.resource_id.toString()
                        // 跳过用户已交互的资源
                        if (userResourceIds.includes(coAccessedId)) return

                        // 计算共同访问得分
                        const coAccessScore =
                            ((coAccessed.co_access_percentage || 0) / 100) * 0.8

                        if (candidateResources.has(coAccessedId)) {
                            // 更新已有候选资源的得分
                            const existingScore =
                                candidateResources.get(coAccessedId)
                            candidateResources.set(
                                coAccessedId,
                                existingScore + coAccessScore
                            )
                        } else {
                            // 添加新的候选资源
                            candidateResources.set(coAccessedId, coAccessScore)
                        }
                    } catch (err) {
                        console.error('处理共同访问资源时出错:', err)
                    }
                })
            }
        }
    })

    // 处理候选推荐资源
    let scoredCandidates = []
    candidateResources.forEach((score, resourceId) => {
        // 查找资源详情
        const resourceDetails = resources.find((r) => {
            if (!r.id) return false
            try {
                return r.id.toString() === resourceId
            } catch (err) {
                console.error('比较资源ID时出错:', err)
                return false
            }
        })

        if (resourceDetails) {
            scoredCandidates.push({
                ...resourceDetails,
                score,
                algorithm: 'collaborative',
                recommendation_reason: `协同过滤推荐 (相似度得分: ${score.toFixed(
                    2
                )})`,
            })
        }
    })

    // 按得分排序并限制数量
    scoredCandidates = scoredCandidates
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    console.log(
        `[collaborativeFiltering] 匹配到 ${matchedRelationshipsCount} 个资源关系，生成 ${scoredCandidates.length} 个推荐`
    )

    return {
        success: scoredCandidates.length > 0,
        message:
            scoredCandidates.length > 0
                ? '协同过滤推荐结果'
                : '未找到合适的协同过滤推荐资源',
        recommendations: scoredCandidates,
    }
}

/**
 * 混合推荐算法
 * 结合基于内容和协同过滤的推荐结果
 *
 * @param {Object} user 用户对象
 * @param {Number} limit 推荐数量限制
 * @param {Object} weights 不同算法的权重配置 {content: 数值, collaborative: 数值}
 * @returns {Object} 混合推荐结果
 */
export const hybridRecommendation = (
    user,
    limit = 10,
    weights = { content: 0.5, collaborative: 0.5 }
) => {
    if (!user) {
        return {
            success: false,
            message: '未提供用户信息',
            recommendations: [],
        }
    }

    // 权重归一化
    const totalWeight = weights.content + weights.collaborative
    const normalizedWeights = {
        content: weights.content / totalWeight,
        collaborative: weights.collaborative / totalWeight,
    }

    // 获取基于内容的推荐结果
    const contentResult = contentBasedRecommendation(user, limit * 2)

    // 获取协同过滤的推荐结果
    const collaborativeResult = collaborativeFilteringRecommendation(
        user,
        limit * 2
    )

    // 如果任一方法失败且没有推荐结果，则使用另一方法的结果
    if (!contentResult.success || contentResult.recommendations.length === 0) {
        return collaborativeResult
    }

    if (
        !collaborativeResult.success ||
        collaborativeResult.recommendations.length === 0
    ) {
        return contentResult
    }

    // 合并两种推荐结果，并重新计算得分
    // 使用Map来跟踪资源ID，避免重复
    const resourceMap = new Map()

    // 处理基于内容的推荐
    contentResult.recommendations.forEach((item) => {
        resourceMap.set(item.id.toString(), {
            ...item,
            contentScore: item.score * normalizedWeights.content,
            collaborativeScore: 0,
            totalScore: item.score * normalizedWeights.content,
        })
    })

    // 处理协同过滤的推荐
    collaborativeResult.recommendations.forEach((item) => {
        const resourceId = item.id.toString()
        if (resourceMap.has(resourceId)) {
            // 更新已有资源的协同过滤得分
            const existingItem = resourceMap.get(resourceId)
            existingItem.collaborativeScore =
                item.score * normalizedWeights.collaborative
            existingItem.totalScore =
                existingItem.contentScore + existingItem.collaborativeScore

            // 更新推荐原因
            existingItem.recommendation_reason = `混合推荐 (内容匹配: ${existingItem.contentScore.toFixed(
                2
            )}, 协同过滤: ${existingItem.collaborativeScore.toFixed(2)})`
            existingItem.algorithm = 'hybrid'

            resourceMap.set(resourceId, existingItem)
        } else {
            // 添加新资源
            resourceMap.set(resourceId, {
                ...item,
                contentScore: 0,
                collaborativeScore:
                    item.score * normalizedWeights.collaborative,
                totalScore: item.score * normalizedWeights.collaborative,
                recommendation_reason: `混合推荐 (主要基于协同过滤: ${(
                    item.score * normalizedWeights.collaborative
                ).toFixed(2)})`,
                algorithm: 'hybrid',
            })
        }
    })

    // 转换为数组，按总分排序，并截取前limit个
    const hybridRecommendations = Array.from(resourceMap.values())
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, limit)
        .map((item) => ({
            ...item,
            score: item.totalScore,
        }))

    return {
        success: hybridRecommendations.length > 0,
        message: '混合推荐结果',
        recommendations: hybridRecommendations,
    }
}

/**
 * 根据用户ID获取用户推荐
 * 包装函数，处理用户ID查找和推荐生成
 *
 * @param {String} userId 用户ID
 * @param {Number} limit 推荐数量
 * @param {Object} options 推荐选项，包含算法权重等
 * @returns {Object} 推荐结果
 */
export const getUserRecommendations = (userId, limit = 10, options = {}) => {
    if (!userId) {
        return {
            success: false,
            message: '未提供用户ID',
            recommendations: [],
        }
    }

    // 加载用户数据
    const users = loadUsersData()
    const user = users.find((u) => u.user_id === userId)

    if (!user) {
        return {
            success: false,
            message: `未找到ID为 ${userId} 的用户`,
            recommendations: [],
        }
    }

    // 默认选项
    const defaultOptions = {
        algorithm: 'hybrid',
        weights: { content: 0.5, collaborative: 0.5 },
    }

    // 合并选项
    const mergedOptions = { ...defaultOptions, ...options }

    // 根据选择的算法生成推荐
    switch (mergedOptions.algorithm) {
        case 'content':
            return contentBasedRecommendation(user, limit)
        case 'collaborative':
            return collaborativeFilteringRecommendation(user, limit)
        case 'hybrid':
        default:
            return hybridRecommendation(user, limit, mergedOptions.weights)
    }
}

/**
 * 为访客用户生成基于热门的推荐
 *
 * @param {Number} limit 推荐数量
 * @returns {Object} 推荐结果
 */
export const getPopularRecommendations = (limit = 10) => {
    console.log('[getPopularRecommendations] 开始获取热门推荐...')

    // 加载资源数据
    const resources = loadResourcesData()

    if (!resources || resources.length === 0) {
        return {
            success: false,
            message: '无法加载资源数据',
            recommendations: [],
        }
    }

    // 按选课人数排序
    const popularResources = resources
        .sort((a, b) => {
            let enrollmentA = 0
            let enrollmentB = 0

            try {
                const enrollAStr = a.enrollCount?.toString() || '0'
                enrollmentA = parseInt(
                    enrollAStr.replace(/[^0-9]/g, '') || '0',
                    10
                )
            } catch (err) {
                console.error('处理enrollCount A时出错:', err)
            }

            try {
                const enrollBStr = b.enrollCount?.toString() || '0'
                enrollmentB = parseInt(
                    enrollBStr.replace(/[^0-9]/g, '') || '0',
                    10
                )
            } catch (err) {
                console.error('处理enrollCount B时出错:', err)
            }

            return enrollmentB - enrollmentA
        })
        .slice(0, limit)
        .map((resource) => {
            let enrollment = 0
            try {
                const enrollStr = resource.enrollCount?.toString() || '0'
                enrollment = parseInt(
                    enrollStr.replace(/[^0-9]/g, '') || '0',
                    10
                )
            } catch (err) {
                console.error('处理最终enrollCount时出错:', err)
            }

            return {
                ...resource,
                score: enrollment * 0.01, // 用于保持与其他推荐格式一致
                algorithm: 'popular',
                recommendation_reason: `热门课程 (${enrollment}人学习)`,
            }
        })

    console.log(
        `[getPopularRecommendations] 获取到 ${popularResources.length} 个热门推荐`
    )

    return {
        success: popularResources.length > 0,
        message: '热门课程推荐',
        recommendations: popularResources,
    }
}

// 导出所有算法
export default {
    contentBasedRecommendation,
    collaborativeFilteringRecommendation,
    hybridRecommendation,
    getUserRecommendations,
    getPopularRecommendations,
}
