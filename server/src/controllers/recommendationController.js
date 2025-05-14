import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import catchAsync from '../utils/catchAsync.js'
import { DataService } from '../services/DataService.js' // 导入 DataService
// 导入Redis缓存服务
import cacheService from '../services/RedisCacheService.js'
// 导入推荐算法模块
import {
    contentBasedRecommendation,
    collaborativeFilteringRecommendation,
    hybridRecommendation,
    getPopularRecommendations,
} from '../recommendation/algorithms.js'
import mongoose from 'mongoose'

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
    const skipCache = req.query.skipCache === 'true' // 获取是否跳过缓存

    // 从请求参数中获取算法偏好（如果有的话）
    const algorithmPreference = req.query.algorithm || 'hybrid'
    const contentWeight = parseFloat(req.query.contentWeight) || 0.5
    const collaborativeWeight = parseFloat(req.query.collaborativeWeight) || 0.5

    // 创建缓存键
    const cacheParams = {
        userId: currentUser?.id || 'guest',
        algorithm: algorithmPreference,
        limit,
        contentWeight,
        collaborativeWeight,
    }
    const cacheKey = cacheService.generateKey(
        'homepage_recommendations',
        cacheParams
    )

    // 如果不跳过缓存，尝试从缓存获取
    if (!skipCache) {
        const cachedResult = await cacheService.get(cacheKey)
        if (cachedResult) {
            console.log(`[推荐系统] 从缓存获取首页推荐结果`)
            recommendationsResult = cachedResult.result
            usedAlgorithm = cachedResult.algorithm

            // 直接返回缓存结果
            return res.status(200).json({
                status: 'success',
                message: recommendationsResult.message,
                results: recommendationsResult.recommendations.length,
                fromCache: true,
                data: {
                    recommendations: recommendationsResult.recommendations,
                    algorithm: usedAlgorithm,
                },
            })
        }
    }

    if (currentUser) {
        console.log(
            `Executing recommendations for logged-in user: ${currentUser.email}`
        )

        // 根据请求参数选择算法
        if (algorithmPreference === 'content') {
            // 使用基于内容的推荐
            console.log('[推荐系统] 使用基于内容的推荐算法')
            usedAlgorithm = 'content'
            recommendationsResult = await contentBasedRecommendation(
                currentUser,
                limit
            )
        } else if (algorithmPreference === 'collaborative') {
            // 使用协同过滤推荐
            console.log('[推荐系统] 使用协同过滤推荐算法')
            usedAlgorithm = 'collaborative'
            recommendationsResult = await collaborativeFilteringRecommendation(
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
            recommendationsResult = await hybridRecommendation(
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
                recommendationsResult = await contentBasedRecommendation(
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
                    recommendationsResult = await getPopularRecommendations(
                        limit
                    )
                }
            }
        }
    } else {
        console.log('Executing guest recommendations.')
        // 对于访客用户，使用热门推荐
        console.log('[推荐系统] 用户未登录，使用热门推荐')
        usedAlgorithm = 'popular'
        recommendationsResult = await getPopularRecommendations(limit)
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
            fromCache: false,
            data: {
                recommendations: [],
            },
        })
    }

    // 将结果缓存(注意：秒为单位)
    const cacheData = {
        result: recommendationsResult,
        algorithm: usedAlgorithm,
    }
    await cacheService.set(cacheKey, cacheData, 180) // 缓存3分钟

    res.status(200).json({
        status: 'success',
        message: recommendationsResult.message,
        results: recommendationsResult.recommendations.length,
        fromCache: false,
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
    const skipCache = req.query.skipCache === 'true' // 获取是否跳过缓存
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

    // 创建缓存键
    const cacheParams = {
        userId,
        algorithm: algorithmPreference,
        limit,
        contentWeight,
        collaborativeWeight,
    }
    const cacheKey = cacheService.generateKey(
        'user_recommendations',
        cacheParams
    )

    // 如果不跳过缓存，尝试从缓存获取
    if (!skipCache) {
        const cachedResult = await cacheService.get(cacheKey)
        if (cachedResult) {
            console.log(`[推荐系统] 从缓存获取用户 ${userId} 的推荐结果`)
            recommendationsResult = cachedResult.result
            usedAlgorithm = cachedResult.algorithm

            // 直接返回缓存结果
            return res.status(200).json({
                status: 'success',
                message: recommendationsResult.message,
                results: recommendationsResult.recommendations.length,
                fromCache: true,
                data: {
                    recommendations: recommendationsResult.recommendations,
                    algorithm: usedAlgorithm,
                },
            })
        }
    }

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
        recommendationsResult = await contentBasedRecommendation(user, limit)
    } else if (algorithmPreference === 'collaborative') {
        console.log('[推荐系统] 使用协同过滤推荐算法')
        usedAlgorithm = 'collaborative'
        recommendationsResult = await collaborativeFilteringRecommendation(
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
        recommendationsResult = await hybridRecommendation(user, limit, weights)

        // 如果混合推荐失败，回退到基于内容的推荐
        if (
            !recommendationsResult.success ||
            recommendationsResult.recommendations.length === 0
        ) {
            console.log('[推荐系统] 混合推荐失败，回退到基于内容的推荐')
            usedAlgorithm = 'content (fallback)'
            recommendationsResult = await contentBasedRecommendation(
                user,
                limit
            )

            // 如果基于内容的推荐也失败，则回退到热门推荐
            if (
                !recommendationsResult.success ||
                recommendationsResult.recommendations.length === 0
            ) {
                console.log('[推荐系统] 基于内容的推荐也失败，回退到热门推荐')
                usedAlgorithm = 'popular (fallback)'
                recommendationsResult = await getPopularRecommendations(limit)
            }
        }
    }

    // 记录推荐结果
    logRecommendation(user, usedAlgorithm, recommendationsResult)

    // 处理推荐结果不成功的情况
    if (!recommendationsResult || !recommendationsResult.success) {
        return res.status(200).json({
            status: 'success',
            message: recommendationsResult?.message || '无法生成推荐',
            results: 0,
            fromCache: false,
            data: { recommendations: [] },
        })
    }

    // 将结果缓存(注意：秒为单位)
    const cacheData = {
        result: recommendationsResult,
        algorithm: usedAlgorithm,
    }
    await cacheService.set(cacheKey, cacheData, 180) // 缓存3分钟

    // 返回结果
    res.status(200).json({
        status: 'success',
        message: recommendationsResult.message,
        results: recommendationsResult.recommendations.length,
        fromCache: false,
        data: {
            recommendations: recommendationsResult.recommendations,
            algorithm: usedAlgorithm,
        },
    })
})

// 获取与特定资源相似的资源推荐
export const getSimilarResources = catchAsync(async (req, res, next) => {
    const { resourceId } = req.params
    const limit = parseInt(req.query.limit) || 6
    const skipCache = req.query.skipCache === 'true' // 获取是否跳过缓存

    if (!resourceId) {
        return res.status(400).json({
            status: 'error',
            message: '必须提供资源ID',
        })
    }

    // 创建缓存键
    const cacheKey = cacheService.generateKey('similar_resources', {
        resourceId,
        limit,
    })

    // 如果不跳过缓存，尝试从缓存获取
    if (!skipCache) {
        const cachedResult = await cacheService.get(cacheKey)
        if (cachedResult) {
            console.log(`[推荐系统] 从缓存获取相似资源推荐结果`)
            return res.status(200).json({
                status: 'success',
                results: cachedResult.length,
                fromCache: true,
                data: {
                    recommendations: cachedResult,
                },
            })
        }
    }

    try {
        // 获取资源数据
        const targetResource = await dataService.getResourceById(resourceId)

        if (!targetResource) {
            console.log(`未找到ID为 ${resourceId} 的资源`)
            return res.status(404).json({
                status: 'error',
                message: `未找到ID为 ${resourceId} 的资源`,
                results: 0,
                data: { recommendations: [] },
            })
        }

        console.log(`找到目标资源: "${targetResource.title}"`)

        // 优先尝试从ResourceRelationship中获取相似资源数据
        const ResourceRelationship = mongoose.model('ResourceRelationship')
        const resourceRelation = await ResourceRelationship.findOne({
            resource_id: new mongoose.Types.ObjectId(resourceId),
        }).populate({
            path: 'similar_resources.resource_id',
            model: 'Resource',
        })

        // 如果找到了资源关系数据并且有相似资源
        if (
            resourceRelation &&
            resourceRelation.similar_resources &&
            resourceRelation.similar_resources.length > 0
        ) {
            console.log(
                `从ResourceRelationship中找到了 ${resourceRelation.similar_resources.length} 个相似资源`
            )

            // 处理并格式化相似资源信息
            const similarResources = resourceRelation.similar_resources
                .filter((item) => item.resource_id) // 确保只保留有效的资源引用
                .map((item) => {
                    const resource = item.resource_id

                    // 确保common_topics和common_skills是数组
                    const commonTopics = Array.isArray(item.common_topics)
                        ? item.common_topics
                        : []
                    const commonSkills = Array.isArray(item.common_skills)
                        ? item.common_skills
                        : []

                    // 生成推荐原因
                    let recommendationReason = '基于主题相关性推荐'
                    if (commonTopics.length > 0 || commonSkills.length > 0) {
                        const reasons = []

                        if (commonTopics.length > 0) {
                            reasons.push(`相同主题: ${commonTopics.join(', ')}`)
                        }

                        if (commonSkills.length > 0) {
                            reasons.push(`相关技能: ${commonSkills.join(', ')}`)
                        }

                        if (reasons.length > 0) {
                            recommendationReason = reasons.join('；')
                        }
                    }

                    // 返回格式化后的资源数据
                    return {
                        ...resource._doc,
                        score: item.similarity_score,
                        algorithm: 'relationship-based',
                        recommendation_reason: recommendationReason,
                    }
                })
                .sort((a, b) => b.score - a.score) // 按相似度降序排序
                .slice(0, limit) // 限制返回数量

            return res.status(200).json({
                status: 'success',
                message: `资源 "${targetResource.title}" 的主题相关推荐`,
                results: similarResources.length,
                data: {
                    recommendations: similarResources,
                    algorithm: 'relationship-based',
                },
            })
        } else {
            console.log(
                `未在ResourceRelationship中找到资源ID ${resourceId} 的相似资源数据，回退到内容相似度计算`
            )
        }

        // 如果没有找到预定义的关系数据，回退到基于内容的相似度计算
        // 添加forSimilarResources标志，确保获取所有资源
        const resourcesData = await dataService.getAllResources({
            forSimilarResources: true,
        })

        // 确保我们有一个有效的资源数组
        const allResources =
            resourcesData && resourcesData.resources
                ? resourcesData.resources
                : []

        console.log(`为相似度计算获取了 ${allResources.length} 个资源`)

        if (!allResources || allResources.length === 0) {
            console.log('没有找到任何资源用于比较')
            return res.status(200).json({
                status: 'success',
                message: '数据库中没有可用资源进行推荐',
                results: 0,
                data: { recommendations: [] },
            })
        }

        // 如果数据库中只有当前资源，无法推荐
        if (
            allResources.length === 1 &&
            allResources[0]._id.toString() === resourceId
        ) {
            console.log('数据库中只有当前资源，无法进行推荐')
            return res.status(200).json({
                status: 'success',
                message: '没有其他资源可供推荐',
                results: 0,
                data: { recommendations: [] },
            })
        }

        // 使用ContentBased相似度过滤函数
        const excludeIds = [resourceId] // 排除当前资源
        const similarResources = await contentBasedSimilarityFiltering(
            targetResource,
            allResources,
            limit,
            excludeIds
        )

        // 如果无法找到类似资源，返回所有资源（排除当前资源）
        if (similarResources.length === 0) {
            console.log('找不到类似资源，返回随机推荐')

            // 过滤掉当前资源
            const randomResources = allResources
                .filter((res) => res._id.toString() !== resourceId)
                .sort(() => 0.5 - Math.random()) // 随机排序
                .slice(0, limit)
                .map((res) => ({
                    ...res,
                    algorithm: 'random',
                    recommendation_reason: '随机推荐',
                }))

            return res.status(200).json({
                status: 'success',
                message: `未找到与"${targetResource.title}"相似的资源，显示随机推荐`,
                results: randomResources.length,
                data: {
                    recommendations: randomResources,
                    algorithm: 'random-fallback',
                },
            })
        }

        console.log(`成功找到 ${similarResources.length} 个相似资源`)

        // 缓存结果
        await cacheService.set(cacheKey, similarResources, 3600) // 缓存1小时

        return res.status(200).json({
            status: 'success',
            message: `资源 "${targetResource.title}" 的相似推荐`,
            results: similarResources.length,
            fromCache: false,
            data: {
                recommendations: similarResources,
            },
        })
    } catch (error) {
        console.error('获取相似资源时出错:', error)
        return res.status(404).json({
            status: 'error',
            message: '获取相似资源失败',
        })
    }
})

/**
 * 基于内容的相似度过滤
 * 用于找到与目标资源相似的其他资源
 */
const contentBasedSimilarityFiltering = async (
    targetResource,
    allResources,
    limit,
    excludeIds = []
) => {
    console.log(`目标资源: ${targetResource.title}, ID: ${targetResource._id}`)
    console.log(`排除资源ID列表: ${JSON.stringify(excludeIds)}`)
    console.log(`可用资源总数: ${allResources.length}`)

    // 提取目标资源的特征
    const targetSubject = targetResource.subject || ''
    const targetTags = Array.isArray(targetResource.tags)
        ? targetResource.tags
        : []
    const targetDifficulty = targetResource.difficulty || 3
    const targetGrade = targetResource.grade || ''

    // 将排除ID列表转换为字符串数组，便于比较
    const excludeIdStrings = excludeIds.map((id) => id.toString())

    // 为调试输出资源_id格式
    if (allResources.length > 0) {
        console.log(
            `资源ID示例: ${allResources[0]._id}, 类型: ${typeof allResources[0]
                ._id}`
        )
    }

    // 计算所有资源的相似性分数
    const scoredResources = allResources
        ?.filter((resource) => {
            // 确保资源有_id字段
            if (!resource._id) {
                console.log(
                    '发现没有_id字段的资源:',
                    resource.title || '未知标题'
                )
                return false
            }

            // 排除当前资源
            const resourceId = resource._id.toString()
            const shouldInclude = !excludeIdStrings.includes(resourceId)

            // 调试输出
            if (!shouldInclude) {
                console.log(
                    `排除资源: ${
                        resource.title || '未知标题'
                    }, ID: ${resourceId}`
                )
            }

            return shouldInclude
        })
        .map((resource) => {
            let score = 0
            const resourceTags = Array.isArray(resource.tags)
                ? resource.tags
                : []

            // 放宽相似度计算条件 - 相同学科得分
            if (resource.subject === targetSubject) {
                score += 3
            }

            // 标签重叠得分 - 降低权重，防止过滤过多
            const commonTags = resourceTags.filter((tag) =>
                targetTags.includes(tag)
            )
            score += commonTags.length * 1

            // 难度相似性得分 - 扩大难度差异容忍度
            if (
                resource.difficulty !== undefined &&
                targetDifficulty !== undefined
            ) {
                const diffDelta = Math.abs(
                    resource.difficulty - targetDifficulty
                )
                if (diffDelta === 0) {
                    score += 2 // 难度完全匹配
                } else if (diffDelta <= 2) {
                    score += 1 // 难度接近
                }
            }

            // 年级匹配得分
            if (resource.grade === targetGrade) {
                score += 1
            }

            // 额外加分 - 确保至少有一些推荐
            score += 0.5

            // 生成推荐原因
            let reason = '基于'
            let reasonParts = []

            if (resource.subject === targetSubject) {
                reasonParts.push(`相同学科 (${targetSubject})`)
            }

            if (commonTags.length > 0) {
                reasonParts.push(`相同标签 (${commonTags.join(', ')})`)
            }

            if (resource.grade === targetGrade) {
                reasonParts.push(`相同年级 (${targetGrade})`)
            }

            if (
                Math.abs(resource.difficulty - targetDifficulty) <= 2 &&
                resource.difficulty !== undefined
            ) {
                reasonParts.push(`相近难度级别`)
            }

            // 如果没有特定原因，添加一个通用原因
            if (reasonParts.length === 0) {
                reasonParts.push('内容匹配')
            }

            reason += reasonParts.join('、')

            return {
                ...resource,
                score,
                algorithm: 'content-similarity',
                recommendation_reason: reason,
            }
        })
        // 修改过滤条件，允许任何有分数的资源
        // .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score) // 按相似度排序
        .slice(0, limit) // 限制数量

    console.log(`找到符合条件的资源数: ${scoredResources.length}`)
    if (scoredResources.length > 0) {
        console.log(
            `前三个推荐资源: ${scoredResources
                .slice(0, 3)
                .map((r) => r.title)
                .join(', ')}`
        )
    }

    return scoredResources
}

// Add other recommendation-related controllers if needed

// 清除推荐缓存
export const clearRecommendationCache = catchAsync(async (req, res, next) => {
    await cacheService.clear()
    return res.status(200).json({
        status: 'success',
        message: '推荐缓存已清除',
    })
})

// 获取缓存统计信息
export const getCacheStats = catchAsync(async (req, res, next) => {
    const stats = await cacheService.getStats()
    return res.status(200).json({
        status: 'success',
        data: stats,
    })
})
