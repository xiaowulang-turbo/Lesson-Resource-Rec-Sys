import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import catchAsync from '../utils/catchAsync.js'
import { DataServiceFactory } from '../services/DataServiceFactory.js' // 导入 DataServiceFactory
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 获取 dataService 实例
const dataService = new DataServiceFactory().getAdapter()

// Controller function for homepage recommendations
export const getHomepageRecommendations = catchAsync(async (req, res, next) => {
    // const limit = req.query.limit ? parseInt(req.query.limit, 10) : 8 // Comment out unused variable
    let recommendationsResult
    let currentUser = null

    // 1. 检查是否存在 token 并验证
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1]
        console.log('Token found in headers.')
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

    // 2. 根据用户状态和角色选择推荐算法
    if (currentUser) {
        console.log(
            `Executing recommendations for logged-in user: ${currentUser.email}`
        ) // Log: Executing logged-in logic
        // Logged-in user - Implement content-based recommendation
        // const userId = currentUser.id || currentUser._id; // Remove unused variable
        // console.log(`Getting recommendations for logged-in user: ${userId}`); // Redundant log

        // --- Load Resource Data --- (Similar to guest logic)
        let coursesData = []
        let loadError = null
        try {
            const dataPath = path.join(__dirname, '../data/resources.json')
            const jsonData = fs.readFileSync(dataPath, 'utf8')
            coursesData = JSON.parse(jsonData)
        } catch (error) {
            loadError = error
        }

        if (loadError || !coursesData || coursesData.length === 0) {
            console.error(
                'Courses data is not loaded or empty for logged-in user:',
                loadError
            )
            // Return empty recommendations instead of 500 error for a smoother user experience
            recommendationsResult = {
                success: true,
                message: '无法加载课程数据，暂无推荐',
                recommendations: [],
            }
        } else {
            // --- Get User Preferences ---
            const preferredSubjects = currentUser.preferred_subjects || []
            const interests = currentUser.interests || []
            const preferredDifficulty = currentUser.preferred_difficulty
            const limit = parseInt(req.query.limit) || 10

            // --- Calculate Scores and Recommend ---
            const scoredResources = coursesData.map((resource) => {
                let score = 0
                const resourceTags = Array.isArray(resource.tags)
                    ? resource.tags
                    : []

                // Score based on subject match
                if (preferredSubjects.includes(resource.subject)) {
                    score += 5 // High score for direct subject match
                }

                // Score based on interest/tag overlap
                const commonInterests = resourceTags.filter((tag) =>
                    interests.includes(tag)
                )
                score += commonInterests.length * 2 // Score per matching tag

                // Score based on difficulty proximity
                if (
                    preferredDifficulty !== undefined &&
                    resource.difficulty !== undefined
                ) {
                    const diffDelta = Math.abs(
                        resource.difficulty - preferredDifficulty
                    )
                    if (diffDelta === 0) {
                        score += 3 // Perfect difficulty match
                    } else if (diffDelta === 1) {
                        score += 1 // Close difficulty match
                    }
                    // Larger differences get no points for difficulty
                }

                // Add a small amount based on enroll count to break ties
                const enrollment = parseInt(
                    resource.enrollCount?.toString().replace(/[^0-9]/g, '') ||
                        '0',
                    10
                )
                score += enrollment * 0.001

                return { ...resource, score }
            })

            // Sort by score (descending) and take top N
            const recommendedResources = scoredResources
                .filter((r) => r.score > 0) // Only recommend resources with a positive score
                .sort((a, b) => b.score - a.score)
                .slice(0, limit)
                .map((resource) => ({
                    ...resource,
                    id: resource.metadata?.id, // Ensure ID is present
                    recommendation_reason: `根据你的偏好推荐 (学科: ${
                        resource.subject
                    }, 难度: ${
                        resource.difficulty
                    }, 匹配得分: ${resource.score.toFixed(2)})`,
                }))

            recommendationsResult = {
                success: true,
                message: '为你推荐的资源',
                recommendations: recommendedResources,
            }
        }
    } else {
        console.log('Executing guest recommendations.')
        // 对于访客用户，执行不同的推荐逻辑，例如推荐热门课程
        // 确保 coursesData 已加载
        let coursesData = []
        let loadError = null
        try {
            const dataPath = path.join(__dirname, '../data/resources.json') // Now __dirname is defined correctly
            const jsonData = fs.readFileSync(dataPath, 'utf8')
            coursesData = JSON.parse(jsonData)
        } catch (error) {
            loadError = error
        }

        if (loadError || !coursesData || coursesData.length === 0) {
            // Check loadError as well
            console.error('Courses data is not loaded or empty:', loadError)
            return res.status(500).json({
                status: 'error',
                message: '课程数据加载失败',
                results: 0,
                data: { recommendations: [] },
            })
        }

        const limit = parseInt(req.query.limit) || 10 // 获取limit参数，默认为10

        const popularCourses = coursesData // Restore popular course logic
            .sort((a, b) => {
                const enrollmentA = parseInt(
                    a.course_students_enrolled?.replace(/[^0-9]/g, '') || '0',
                    10
                )
                const enrollmentB = parseInt(
                    b.course_students_enrolled?.replace(/[^0-9]/g, '') || '0',
                    10
                )
                return enrollmentB - enrollmentA
            })
            .slice(0, limit)
            .map((course) => ({
                ...course,
                id: course.metadata?.id,
                recommendation_reason: '热门课程，很多学习者都在学习',
            }))

        recommendationsResult = {
            success: true,
            message: '热门课程推荐', // Changed message
            recommendations: popularCourses, // Use popular courses
        }
    }

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
        },
    })
})

// Add other recommendation-related controllers if needed
