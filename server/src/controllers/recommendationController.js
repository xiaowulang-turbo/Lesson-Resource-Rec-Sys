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

// Add other recommendation-related controllers if needed
