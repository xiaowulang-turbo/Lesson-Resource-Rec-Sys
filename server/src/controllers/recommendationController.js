import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import catchAsync from '../utils/catchAsync.js'
import { DataService } from '../services/DataService.js' // 导入 DataService
// 导入推荐算法模块
import {
    contentBasedRecommendation,
    collaborativeFilteringRecommendation,
    hybridRecommendation,
    getPopularRecommendations,
} from '../recommendation/algorithms.js'

// 获取 dataService 实例
const dataService = new DataService()

// 添加日志记录函数
const logRecommendation = (user, algorithm, result) => {
    console.log(`[推荐系统] 用户: ${user?.email || '访客'}, 算法: ${algorithm}`)
    console.log(
        `[推荐系统] 结果状态: ${result?.success}, 推荐数量: ${
            result?.recommendations?.length || 0
        }`
    )
    if (result?.recommendations?.length > 0) {
        console.log(
            `[推荐系统] 前3个推荐: ${result.recommendations
                .slice(0, 3)
                .map((r) => r.title)
                .join(', ')}`
        )
    }
}

// Controller function for homepage recommendations
export const getHomepageRecommendations = catchAsync(async (req, res, next) => {
    let recommendationsResult
    let currentUser = null
    let usedAlgorithm = 'unknown'

    // console.log(req.headers, 'req.headers')

    // fetch(
    //     'https://www.icourse163.org/web/j/mocSearchBean.searchCourse.rpc?csrfKey=fba6bd9e19744ab0b9092da379ef375d',
    //     {
    //         method: 'POST',
    //         headers: {
    //             Cookie: 'NTESSTUDYSI=fba6bd9e19744ab0b9092da379ef375d; EDUWEBDEVICE=87cd2566a4df449f80f9a4b14f41f499',
    //             'Content-Type':
    //                 'application/x-www-form-urlencoded;charset=UTF-8',
    //         },
    //         body: 'mocCourseQueryVo={"keyword":"人工智能","pageIndex":1,"highlight":true,"orderBy":0,"stats":30,"pageSize":20,"prodectType":5}',
    //     }
    // )
    //     .then((response) => response.json())
    //     .then((data) => console.log(data.result.list, 'data'))
    //     .catch((error) => console.error('Error:', error))

    // 1. 检查是否存在 token 并验证
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1]
        console.log('Token found in headers.', token)
        console.log(process.env.JWT_SECRET, 'process.env.JWT_SECRET')
    }

    if (token) {
        try {
            // 验证 token (使用环境变量中的密钥)
            const decoded = await promisify(jwt.verify)(
                token,
                process.env.JWT_SECRET // 确保 .env 文件中有 JWT_SECRET
            )
            console.log('Token decoded successfully. User ID:', decoded.id)

            // 从数据库查找用户 (使用 DataService)
            // 假设 dataService 有 getUserById 方法
            const freshUser = await dataService.getUserById(decoded.id) // 假设 token payload 中有 id

            if (freshUser) {
                // 确保我们获取的是普通对象或检查模型实例的属性
                currentUser = freshUser // Mongoose 模型实例或普通对象
                console.log('User found in DB:', currentUser.email)

                // 打印用户偏好信息，用于调试
                console.log(
                    `[推荐系统] 用户偏好: 学科=${currentUser.preferred_subjects?.join(
                        ','
                    )}`
                )
                console.log(
                    `[推荐系统] 用户兴趣: ${currentUser.interests?.join(',')}`
                )
                console.log(
                    `[推荐系统] 用户交互记录: ${
                        currentUser.course_interactions?.length || 0
                    }条`
                )
            } else {
                console.log('User not found in DB for decoded ID:', decoded.id)
                currentUser = null
            }
        } catch (err) {
            // Token 无效、过期或查找用户失败
            console.error(
                'Token validation or user lookup failed:',
                err.message
            )
            currentUser = null
        }
    } else {
        console.log('No token found in request headers.')
        currentUser = null
    }

    // 2. 根据用户状态选择推荐算法
    const limit = parseInt(req.query.limit) || 10 // 获取limit参数，默认为10

    // 从请求参数中获取算法偏好（如果有的话）
    const algorithmPreference = req.query.algorithm || 'hybrid'
    const contentWeight = parseFloat(req.query.contentWeight) || 0.5
    const collaborativeWeight = parseFloat(req.query.collaborativeWeight) || 0.5

    if (currentUser) {
        console.log(
            `Executing recommendations for logged-in user: ${currentUser.email}`
        )

        // 根据请求参数选择算法
        if (algorithmPreference === 'content') {
            // 使用基于内容的推荐
            console.log('[推荐系统] 使用基于内容的推荐算法')
            usedAlgorithm = 'content'
            recommendationsResult = contentBasedRecommendation(
                currentUser,
                limit
            )
        } else if (algorithmPreference === 'collaborative') {
            // 使用协同过滤推荐
            console.log('[推荐系统] 使用协同过滤推荐算法')
            usedAlgorithm = 'collaborative'
            recommendationsResult = collaborativeFilteringRecommendation(
                currentUser,
                limit
            )
        } else {
            // 默认使用混合推荐
            console.log('[推荐系统] 使用混合推荐算法，权重为:', {
                content: contentWeight,
                collaborative: collaborativeWeight,
            })
            usedAlgorithm = 'hybrid'
            const weights = {
                content: contentWeight,
                collaborative: collaborativeWeight,
            }
            recommendationsResult = hybridRecommendation(
                currentUser,
                limit,
                weights
            )

            // 如果混合推荐失败（例如，用户没有交互记录），则回退到基于内容的推荐
            if (
                !recommendationsResult.success ||
                recommendationsResult.recommendations.length === 0
            ) {
                console.log('[推荐系统] 混合推荐失败，回退到基于内容的推荐')
                usedAlgorithm = 'content (fallback)'
                recommendationsResult = contentBasedRecommendation(
                    currentUser,
                    limit
                )

                // 如果基于内容的推荐也失败，则回退到热门推荐
                if (
                    !recommendationsResult.success ||
                    recommendationsResult.recommendations.length === 0
                ) {
                    console.log(
                        '[推荐系统] 基于内容的推荐也失败，回退到热门推荐'
                    )
                    usedAlgorithm = 'popular (fallback)'
                    recommendationsResult = getPopularRecommendations(limit)
                }
            }
        }
    } else {
        console.log('Executing guest recommendations.')
        // 对于访客用户，使用热门推荐
        console.log('[推荐系统] 用户未登录，使用热门推荐')
        usedAlgorithm = 'popular'
        recommendationsResult = getPopularRecommendations(limit)
    }

    // 记录推荐结果
    logRecommendation(currentUser, usedAlgorithm, recommendationsResult)

    // 3. 处理推荐结果并响应
    if (!recommendationsResult || !recommendationsResult.success) {
        console.error('Recommendation failed:', recommendationsResult?.message)
        // Fallback or error response if recommendations fail
        return res.status(200).json({
            // Return 200 but with empty recommendations or specific error message
            status: 'success', // Or 'error' depending on desired frontend handling
            message: recommendationsResult?.message || '无法生成推荐',
            results: 0,
            data: {
                recommendations: [],
            },
        })
    }

    res.status(200).json({
        status: 'success',
        message: recommendationsResult.message,
        results: recommendationsResult.recommendations.length,
        data: {
            recommendations: recommendationsResult.recommendations,
            algorithm: usedAlgorithm,
        },
    })
})

// 根据用户ID获取推荐（API端点）
export const getRecommendationsByUserId = catchAsync(async (req, res, next) => {
    const { userId } = req.params
    const limit = parseInt(req.query.limit) || 10
    let usedAlgorithm = 'unknown'

    if (!userId) {
        return res.status(400).json({
            status: 'error',
            message: '未提供用户ID',
            results: 0,
            data: { recommendations: [] },
        })
    }

    // 从请求参数中获取算法偏好
    const algorithmPreference = req.query.algorithm || 'hybrid'
    const contentWeight = parseFloat(req.query.contentWeight) || 0.5
    const collaborativeWeight = parseFloat(req.query.collaborativeWeight) || 0.5

    // 加载用户数据
    let user = null
    try {
        user = await dataService.getUserById(userId)
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error.message)
    }

    if (!user) {
        return res.status(404).json({
            status: 'error',
            message: `未找到ID为 ${userId} 的用户`,
            results: 0,
            data: { recommendations: [] },
        })
    }

    // 打印用户信息用于调试
    console.log(`[推荐系统] 获取用户${userId}的推荐`)
    console.log(
        `[推荐系统] 用户偏好: 学科=${user.preferred_subjects?.join(',')}`
    )
    console.log(`[推荐系统] 用户兴趣: ${user.interests?.join(',')}`)
    console.log(
        `[推荐系统] 用户交互记录: ${user.course_interactions?.length || 0}条`
    )

    // 根据指定算法生成推荐
    let recommendationsResult

    if (algorithmPreference === 'content') {
        console.log('[推荐系统] 使用基于内容的推荐算法')
        usedAlgorithm = 'content'
        recommendationsResult = contentBasedRecommendation(user, limit)
    } else if (algorithmPreference === 'collaborative') {
        console.log('[推荐系统] 使用协同过滤推荐算法')
        usedAlgorithm = 'collaborative'
        recommendationsResult = collaborativeFilteringRecommendation(
            user,
            limit
        )
    } else {
        // 默认混合推荐
        console.log('[推荐系统] 使用混合推荐算法，权重为:', {
            content: contentWeight,
            collaborative: collaborativeWeight,
        })
        usedAlgorithm = 'hybrid'
        const weights = {
            content: contentWeight,
            collaborative: collaborativeWeight,
        }
        recommendationsResult = hybridRecommendation(user, limit, weights)

        // 如果混合推荐失败，回退到基于内容的推荐
        if (
            !recommendationsResult.success ||
            recommendationsResult.recommendations.length === 0
        ) {
            console.log('[推荐系统] 混合推荐失败，回退到基于内容的推荐')
            usedAlgorithm = 'content (fallback)'
            recommendationsResult = contentBasedRecommendation(user, limit)

            // 如果基于内容的推荐也失败，则回退到热门推荐
            if (
                !recommendationsResult.success ||
                recommendationsResult.recommendations.length === 0
            ) {
                console.log('[推荐系统] 基于内容的推荐也失败，回退到热门推荐')
                usedAlgorithm = 'popular (fallback)'
                recommendationsResult = getPopularRecommendations(limit)
            }
        }
    }

    // 记录推荐结果
    logRecommendation(user, usedAlgorithm, recommendationsResult)

    if (!recommendationsResult.success) {
        return res.status(200).json({
            status: 'success',
            message: recommendationsResult.message || '无法生成推荐',
            results: 0,
            data: { recommendations: [] },
        })
    }

    res.status(200).json({
        status: 'success',
        message: recommendationsResult.message,
        results: recommendationsResult.recommendations.length,
        data: {
            recommendations: recommendationsResult.recommendations,
            algorithm: usedAlgorithm,
        },
    })
})

// 获取与特定资源相似的资源推荐
export const getSimilarResources = catchAsync(async (req, res, next) => {
    const { resourceId } = req.params
    const limit = parseInt(req.query.limit) || 4

    if (!resourceId) {
        return res.status(400).json({
            status: 'error',
            message: '未提供资源ID',
            results: 0,
            data: { recommendations: [] },
        })
    }

    console.log(
        `[推荐系统] 获取资源ID ${resourceId} 的相似资源，数量限制为 ${limit}`
    )

    // 加载资源数据和关系数据
    const resourcesData = await dataService.getAllResources()
    const resources = resourcesData.resources || [] // 从返回的对象中提取resources数组
    const resourceRelationships = await dataService.getResourceRelationships()

    // 查找目标资源
    const targetResource = resources.find(
        (r) => r.id.toString() === resourceId.toString()
    )

    if (!targetResource) {
        return res.status(404).json({
            status: 'error',
            message: '资源不存在',
            results: 0,
            data: { recommendations: [] },
        })
    }

    // 初始化推荐结果数组
    let recommendedResources = []

    // 1. 从资源关系中查找显式定义的相似资源
    const currentResourceRelationship = resourceRelationships.find(
        (r) => r.resource_id === resourceId.toString()
    )

    if (currentResourceRelationship?.similar_resources?.length > 0) {
        // 处理相似资源数据
        const similarResources = currentResourceRelationship.similar_resources
            .map((similar) => {
                const resource = resources.find(
                    (r) => r.id.toString() === similar.resource_id.toString()
                )

                if (resource) {
                    return {
                        ...resource,
                        similarityScore: similar.similarity_score,
                        commonTopics: similar.common_topics,
                        commonSkills: similar.common_skills,
                        recommendationReason: `基于${similar.common_topics.join(
                            '、'
                        )}的内容匹配`,
                    }
                }
                return null
            })
            .filter((item) => item !== null)

        // 添加显式定义的相似资源
        recommendedResources = [...similarResources]
    }

    // 2. 如果相似资源不足，添加共同访问的资源
    if (
        recommendedResources.length < limit &&
        currentResourceRelationship?.co_accessed_with?.length > 0
    ) {
        const remainingSlots = limit - recommendedResources.length

        // 获取已经添加的资源ID列表，避免重复
        const addedResourceIds = recommendedResources.map((r) =>
            r.id.toString()
        )

        const coAccessedResources = currentResourceRelationship.co_accessed_with
            .filter(
                (item) =>
                    !addedResourceIds.includes(item.resource_id.toString())
            )
            .map((coAccessed) => {
                const resource = resources.find(
                    (r) => r.id.toString() === coAccessed.resource_id.toString()
                )

                if (resource) {
                    return {
                        ...resource,
                        coAccessCount: coAccessed.co_access_count,
                        coAccessPercentage: coAccessed.co_access_percentage,
                        recommendationReason: `${coAccessed.co_access_percentage}%的用户同时访问了此资源`,
                    }
                }
                return null
            })
            .filter((item) => item !== null)
            .slice(0, remainingSlots)

        // 合并相似资源和共同访问资源
        recommendedResources.push(...coAccessedResources)
    }

    // 3. 如果推荐数量仍不足，使用基于内容的过滤
    if (recommendedResources.length < limit) {
        const remainingSlots = limit - recommendedResources.length
        const addedResourceIds = recommendedResources.map((r) =>
            r.id.toString()
        )

        // 使用内容过滤方法找到额外的推荐
        const contentBasedRecs = contentBasedSimilarityFiltering(
            targetResource,
            resources,
            remainingSlots,
            addedResourceIds
        )

        // 合并内容过滤推荐结果
        recommendedResources.push(...contentBasedRecs)
    }

    // 确保不超过limit个推荐
    const finalRecommendations = recommendedResources.slice(0, limit)

    res.status(200).json({
        status: 'success',
        message: '相似资源推荐',
        results: finalRecommendations.length,
        data: {
            recommendations: finalRecommendations,
            sourceResource: {
                id: targetResource.id,
                title: targetResource.title,
                subject: targetResource.subject,
                tags: targetResource.tags,
            },
        },
    })
})

/**
 * 基于内容的相似资源过滤
 * 辅助函数，用于基于内容相似度查找相关资源
 */
const contentBasedSimilarityFiltering = (
    targetResource,
    allResources,
    limit,
    excludeIds = []
) => {
    if (!targetResource || !allResources || allResources.length === 0) {
        return []
    }

    // 为每个资源计算与目标资源的相似度分数
    const scoredResources = allResources
        .filter((r) => {
            // 排除目标资源和已经在推荐列表中的资源
            return (
                r.id.toString() !== targetResource.id.toString() &&
                !excludeIds.includes(r.id.toString())
            )
        })
        .map((resource) => {
            let score = 0

            // 相同主题加分
            if (resource.subject === targetResource.subject) {
                score += 5
            }

            // 难度接近加分
            if (resource.difficulty && targetResource.difficulty) {
                const diffDelta = Math.abs(
                    resource.difficulty - targetResource.difficulty
                )
                if (diffDelta === 0) {
                    score += 3 // 完全匹配难度
                } else if (diffDelta === 1) {
                    score += 1 // 难度接近
                }
            }

            // 标签重叠加分
            if (resource.tags && targetResource.tags) {
                const resourceTags = Array.isArray(resource.tags)
                    ? resource.tags
                    : []
                const currentTags = Array.isArray(targetResource.tags)
                    ? targetResource.tags
                    : []

                const commonTags = resourceTags.filter((tag) =>
                    currentTags.includes(tag)
                )
                score += commonTags.length * 2 // 每个匹配的标签得分

                // 记录共同标签用于推荐原因
                resource.commonTags = commonTags
            }

            // 相同年级加分
            if (resource.grade === targetResource.grade) {
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
            if (resource.subject === targetResource.subject) {
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

// Add other recommendation-related controllers if needed
