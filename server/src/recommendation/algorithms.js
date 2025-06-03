/**
 * 推荐算法模块
 * 实现基于内容的推荐、协同过滤推荐以及混合推荐算法
 */

import Resource from '../models/resourceModel.js'
import ResourceRelationship from '../models/resourceRelationshipModel.js'
import User from '../models/userModel.js'

/**
 * 加载资源数据
 * @returns {Promise<Array>} 资源数据数组
 */
const loadResourcesData = async () => {
    try {
        const resources = await Resource.find({}).lean()
        return resources
    } catch (error) {
        console.error('加载资源数据失败:', error)
        return []
    }
}

/**
 * 加载资源关系数据
 * @param {Boolean} populate 是否填充关联的资源数据
 * @returns {Promise<Array>} 资源关系数据数组
 */
const loadRelationshipsData = async (populate = false) => {
    try {
        let query = ResourceRelationship.find({})

        if (populate) {
            query = query
                .populate({
                    path: 'similar_resources.resource_id',
                    model: 'Resource',
                })
                .populate({
                    path: 'co_accessed_with.resource_id',
                    model: 'Resource',
                })
                .populate({
                    path: 'recommended_sequence',
                    model: 'Resource',
                })
        }

        const relationships = await query.lean()
        console.log(
            `加载了 ${relationships.length} 条资源关系数据${
                populate ? '(包含关联资源)' : ''
            }`
        )
        return relationships
    } catch (error) {
        console.error('加载资源关系数据失败:', error)
        return []
    }
}

/**
 * 加载用户数据
 * @returns {Promise<Array>} 用户数据数组
 */
const loadUsersData = async () => {
    try {
        const users = await User.find({}).lean()
        return users
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
 * @returns {Promise<Object>} 推荐结果对象
 */
export const contentBasedRecommendation = async (user, limit = 10) => {
    if (!user) {
        return {
            success: false,
            message: '未提供用户信息',
            recommendations: [],
        }
    }

    // console.log('[contentBased] 用户数据:', user)

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
    const resources = await loadResourcesData()
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

        // 学科匹配得分 - 提高权重
        if (preferredSubjects.includes(resource.subject)) {
            score += 10 // 学科直接匹配得高分
        }

        // 兴趣/标签重叠得分 - 大幅提高权重
        const commonInterests = resourceTags.filter((tag) =>
            interests.includes(tag)
        )
        score += commonInterests.length * 8 // 每个匹配的标签得更高分

        // 模糊兴趣匹配 - 新增：检查用户兴趣是否包含在资源标签中或资源学科中
        interests.forEach((interest) => {
            // 检查兴趣是否与资源学科匹配
            if (resource.subject && resource.subject.includes(interest)) {
                score += 6 // 学科包含兴趣关键词
            }

            // 检查兴趣是否与资源标题匹配
            if (resource.title && resource.title.includes(interest)) {
                score += 4 // 标题包含兴趣关键词
            }

            // 检查资源标签是否包含兴趣的部分匹配
            resourceTags.forEach((tag) => {
                if (tag.includes(interest) || interest.includes(tag)) {
                    score += 3 // 部分匹配
                }
            })
        })

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

        // 大幅降低基于选课人数的分数权重，避免热门课程覆盖个性化推荐
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

        // 将选课人数权重从0.001降低到0.00001，并设置上限
        const popularityScore = Math.min(enrollment * 0.00001, 0.5) // 最多贡献0.5分
        score += popularityScore

        return {
            ...resource,
            score,
            algorithm: 'content',
            recommendation_reason: `基于内容匹配 (学科: ${
                resource.subject || '未知'
            }, 难度: ${resource.difficulty || '未知'}, 兴趣匹配: ${
                commonInterests.length
            }个, 匹配得分: ${score.toFixed(2)})`,
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
 * @returns {Promise<Object>} 推荐结果对象
 */
export const collaborativeFilteringRecommendation = async (
    user,
    limit = 10
) => {
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
    const relationships = await loadRelationshipsData()
    const resources = await loadResourcesData()

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
 * 结合基于内容的推荐和协同过滤推荐结果
 *
 * @param {Object} user 用户对象
 * @param {Number} limit 推荐数量限制
 * @param {Object} weights 权重对象 { content: 0.5, collaborative: 0.5 }
 * @returns {Promise<Object>} 推荐结果对象
 */
export const hybridRecommendation = async (
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

    console.log('[hybrid] 开始混合推荐计算...')
    console.log(
        `[hybrid] 权重设置: 内容推荐=${weights.content}, 协同过滤=${weights.collaborative}`
    )

    // 获取各算法的推荐结果
    const [contentRecommendations, collaborativeRecommendations] =
        await Promise.all([
            contentBasedRecommendation(user, Math.floor(limit * 2)), // 获取更多候选项
            collaborativeFilteringRecommendation(user, Math.floor(limit * 2)), // 获取更多候选项
        ])

    // 如果两种算法都失败，返回错误
    if (
        (!contentRecommendations.success &&
            !collaborativeRecommendations.success) ||
        (contentRecommendations.recommendations.length === 0 &&
            collaborativeRecommendations.recommendations.length === 0)
    ) {
        return {
            success: false,
            message: '无法获取推荐结果',
            recommendations: [],
        }
    }

    // 合并并重新评分候选资源
    const recommendationMap = new Map()

    // 处理基于内容的推荐
    if (
        contentRecommendations.success &&
        contentRecommendations.recommendations.length > 0
    ) {
        for (const rec of contentRecommendations.recommendations) {
            recommendationMap.set(rec._id.toString(), {
                ...rec,
                contentScore: rec.score || 0,
                collaborativeScore: 0,
                totalScore: 0,
                algorithms: ['content'],
                originalReasons: [rec.recommendation_reason],
            })
        }
    }

    // 处理协同过滤推荐
    if (
        collaborativeRecommendations.success &&
        collaborativeRecommendations.recommendations.length > 0
    ) {
        for (const rec of collaborativeRecommendations.recommendations) {
            const resourceId = rec._id.toString()
            const existing = recommendationMap.get(resourceId)

            if (existing) {
                // 更新已有记录
                existing.collaborativeScore = rec.score || 0
                existing.algorithms.push('collaborative')
                existing.originalReasons.push(rec.recommendation_reason)
            } else {
                // 添加新记录
                recommendationMap.set(resourceId, {
                    ...rec,
                    contentScore: 0,
                    collaborativeScore: rec.score || 0,
                    totalScore: 0,
                    algorithms: ['collaborative'],
                    originalReasons: [rec.recommendation_reason],
                })
            }
        }
    }

    // 检查用户最近交互的资源，获取预定义的关联资源
    const userInteractions = user.course_interactions || []
    if (userInteractions.length > 0) {
        // 获取用户最近交互的3个资源ID
        const recentInteractions = userInteractions
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 3)
            .map((interaction) => interaction.resource_id?.toString())
            .filter(Boolean)

        if (recentInteractions.length > 0) {
            console.log(
                `[hybrid] 找到${recentInteractions.length}个最近交互资源，查找预定义关系`
            )

            // 从ResourceRelationship中加载相关资源关系
            const relationships = await loadRelationshipsData(true)

            // 遍历用户最近交互的资源，查找关联资源
            for (const resourceId of recentInteractions) {
                const relationship = relationships.find(
                    (r) =>
                        r.resource_id && r.resource_id.toString() === resourceId
                )

                if (relationship) {
                    console.log(`[hybrid] 找到资源 ${resourceId} 的关系数据`)

                    // 处理相似资源
                    if (
                        relationship.similar_resources &&
                        relationship.similar_resources.length > 0
                    ) {
                        relationship.similar_resources.forEach((similar) => {
                            if (
                                similar.resource_id &&
                                typeof similar.resource_id === 'object'
                            ) {
                                const similarResource = similar.resource_id
                                const resourceId =
                                    similarResource._id.toString()

                                // 相似度分数
                                const similarityScore =
                                    similar.similarity_score || 0.5
                                // 给予关系型推荐更高的权重
                                const relationshipScore = similarityScore * 10

                                // 生成推荐原因
                                let reason = '基于您最近查看过的内容推荐'
                                if (
                                    similar.common_topics &&
                                    similar.common_topics.length > 0
                                ) {
                                    reason += `；相同主题: ${similar.common_topics.join(
                                        ', '
                                    )}`
                                }

                                // 添加或更新推荐
                                const existing =
                                    recommendationMap.get(resourceId)
                                if (existing) {
                                    // 增加额外的关系分数
                                    existing.relationshipScore =
                                        (existing.relationshipScore || 0) +
                                        relationshipScore
                                    existing.algorithms.push('relationship')
                                    existing.originalReasons.push(reason)
                                } else {
                                    // 添加新的推荐
                                    recommendationMap.set(resourceId, {
                                        ...similarResource,
                                        contentScore: 0,
                                        collaborativeScore: 0,
                                        relationshipScore: relationshipScore,
                                        totalScore: 0,
                                        algorithms: ['relationship'],
                                        originalReasons: [reason],
                                    })
                                }
                            }
                        })
                    }

                    // 处理共同访问资源 (给予较低权重)
                    if (
                        relationship.co_accessed_with &&
                        relationship.co_accessed_with.length > 0
                    ) {
                        relationship.co_accessed_with.forEach((coAccessed) => {
                            if (
                                coAccessed.resource_id &&
                                typeof coAccessed.resource_id === 'object'
                            ) {
                                const coAccessedResource =
                                    coAccessed.resource_id
                                const resourceId =
                                    coAccessedResource._id.toString()

                                // 计算共同访问得分
                                const coAccessScore =
                                    ((coAccessed.co_access_percentage || 0) /
                                        100) *
                                    5

                                // 添加或更新推荐
                                const existing =
                                    recommendationMap.get(resourceId)
                                if (existing) {
                                    existing.coAccessScore =
                                        (existing.coAccessScore || 0) +
                                        coAccessScore
                                    existing.algorithms.push('co-access')
                                    existing.originalReasons.push(
                                        `其他用户在查看相似内容后也浏览了此资源`
                                    )
                                } else {
                                    recommendationMap.set(resourceId, {
                                        ...coAccessedResource,
                                        contentScore: 0,
                                        collaborativeScore: 0,
                                        coAccessScore: coAccessScore,
                                        totalScore: 0,
                                        algorithms: ['co-access'],
                                        originalReasons: [
                                            `其他用户在查看相似内容后也浏览了此资源`,
                                        ],
                                    })
                                }
                            }
                        })
                    }
                }
            }
        }
    }

    // 计算总分并生成最终推荐列表
    const finalRecommendations = Array.from(recommendationMap.values()).map(
        (rec) => {
            // 计算加权总分
            const contentWeightedScore =
                (rec.contentScore || 0) * weights.content
            const collaborativeWeightedScore =
                (rec.collaborativeScore || 0) * weights.collaborative
            const relationshipScore = (rec.relationshipScore || 0) * 1.5 // 给予关系推荐更高的权重
            const coAccessScore = (rec.coAccessScore || 0) * 0.8 // 给予共同访问推荐适当的权重

            const totalScore =
                contentWeightedScore +
                collaborativeWeightedScore +
                relationshipScore +
                coAccessScore

            // 生成混合推荐原因
            let recommendationReason = ''
            const usedAlgorithms = rec.algorithms.join('-')

            if (rec.algorithms.length > 1) {
                // 如果使用了多种算法，生成混合原因
                recommendationReason = `基于多种推荐算法(${usedAlgorithms})匹配: ${rec.originalReasons[0]}`
            } else if (rec.algorithms.includes('relationship')) {
                // 主题关系推荐
                recommendationReason = rec.originalReasons[0]
            } else if (rec.algorithms.includes('co-access')) {
                // 共同访问推荐
                recommendationReason = rec.originalReasons[0]
            } else {
                // 单一算法推荐
                recommendationReason = rec.originalReasons[0]
            }

            return {
                ...rec,
                score: totalScore,
                algorithm: usedAlgorithms,
                recommendation_reason: recommendationReason,
                // 移除中间计算字段
                contentScore: undefined,
                collaborativeScore: undefined,
                relationshipScore: undefined,
                coAccessScore: undefined,
                algorithms: undefined,
                originalReasons: undefined,
            }
        }
    )

    // 按总分排序并限制数量
    const sortedRecommendations = finalRecommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    return {
        success: true,
        message: '混合推荐结果',
        recommendations: sortedRecommendations,
    }
}

/**
 * 获取特定用户的推荐
 * @param {String} userId 用户ID
 * @param {Number} limit 推荐数量限制
 * @param {Object} options 选项（算法偏好、权重）
 * @returns {Promise<Object>} 推荐结果对象
 */
export const getUserRecommendations = async (
    userId,
    limit = 10,
    options = {}
) => {
    if (!userId) {
        return {
            success: false,
            message: '未提供用户ID',
            recommendations: [],
        }
    }

    // 加载用户数据
    const users = await loadUsersData()
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
 * 获取热门资源推荐
 * @param {Number} limit 推荐数量限制
 * @returns {Promise<Object>} 推荐结果对象
 */
export const getPopularRecommendations = async (limit = 10) => {
    try {
        // 从数据库获取资源并按enrollCount排序
        const popularResources = await Resource.find({})
            .sort({ enrollCount: -1 })
            .limit(limit)
            .lean()

        if (!popularResources || popularResources.length === 0) {
            return {
                success: false,
                message: '无法获取热门资源',
                recommendations: [],
            }
        }

        // 为每个资源添加算法标识和推荐原因
        const recommendedResources = popularResources.map((resource) => ({
            ...resource,
            algorithm: 'popular',
            recommendation_reason: `热门资源 (已有${
                resource.enrollCount || 0
            }人学习)`,
        }))

        return {
            success: true,
            message: '热门资源推荐结果',
            recommendations: recommendedResources,
        }
    } catch (error) {
        console.error('获取热门推荐失败:', error)
        return {
            success: false,
            message: '获取热门推荐时出错',
            recommendations: [],
        }
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
