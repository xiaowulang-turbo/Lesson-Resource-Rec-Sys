import {
    processMoocCourses,
    searchMoocCourses,
    saveMoocCoursesToDatabase,
} from '../services/moocService.js'
import Resource from '../models/resourceModel.js'

/**
 * 代理MOOC API请求
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
export const proxyMoocRequest = async (req, res) => {
    try {
        // 解析请求体
        const bodyStr = req.body.toString()
        let searchParams = {}

        try {
            // 尝试从请求体中提取JSON参数
            const match = bodyStr.match(/mocCourseQueryVo=(.+)/)
            if (match && match[1]) {
                searchParams = JSON.parse(match[1])
            }
        } catch (error) {
            console.error('解析MOOC请求参数失败:', error)
        }

        // 提取关键参数
        const {
            keyword = '人工智能',
            pageIndex = 1,
            pageSize = 20,
            orderBy = 0,
        } = searchParams

        // 获取MOOC资源
        const moocCourses = await processMoocCourses(
            {
                keyword,
                pageIndex,
                pageSize,
                orderBy,
            },
            false
        )

        // 返回转换后的资源
        res.status(200).json({
            code: 0,
            message: 'success',
            result: {
                list: moocCourses,
                query: {
                    keyword,
                    pageIndex,
                    pageSize,
                },
                totalCount: moocCourses.length,
            },
        })
    } catch (error) {
        console.error('处理MOOC请求失败:', error)
        res.status(500).json({
            code: -1,
            message: '处理MOOC请求失败',
            error: error.message,
        })
    }
}

/**
 * 搜索MOOC课程
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
export const searchCourses = async (req, res) => {
    try {
        const { keyword = '人工智能', page = 1, limit = 20 } = req.query

        const result = await searchMoocCourses(
            keyword,
            parseInt(page),
            parseInt(limit)
        )

        res.status(200).json({
            status: 'success',
            data: result,
        })
    } catch (error) {
        console.error('搜索MOOC课程失败:', error)
        res.status(500).json({
            status: 'error',
            message: '搜索MOOC课程失败',
            error: error.message,
        })
    }
}

/**
 * 将MOOC课程导入到数据库
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
export const importCoursesToDatabase = async (req, res) => {
    try {
        const { keyword = '人工智能', pageIndex = 1, pageSize = 20 } = req.body

        const moocCourses = await processMoocCourses(
            {
                keyword,
                pageIndex,
                pageSize,
            },
            true
        ) // true表示保存到数据库

        res.status(200).json({
            status: 'success',
            message: `成功导入 ${moocCourses.length} 个MOOC课程到数据库`,
            data: {
                importedCount: moocCourses.length,
                courses: moocCourses.map((course) => ({
                    id: course._id,
                    title: course.title,
                    source: 'icourse163',
                })),
            },
        })
    } catch (error) {
        console.error('导入MOOC课程到数据库失败:', error)
        res.status(500).json({
            status: 'error',
            message: '导入MOOC课程到数据库失败',
            error: error.message,
        })
    }
}

/**
 * 获取已导入的MOOC课程
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
export const getImportedCourses = async (req, res) => {
    try {
        const { page = 1, limit = 20, keyword } = req.query

        // 构建查询条件
        const query = {
            'metadata.mocSourceType': 'icourse163',
            contentType: 'course',
        }

        // 如果提供了关键词，添加文本搜索
        if (keyword) {
            query.$text = { $search: keyword }
        }

        // 执行查询
        const courses = await Resource.find(query)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))

        // 获取总数
        const total = await Resource.countDocuments(query)

        res.status(200).json({
            status: 'success',
            data: {
                courses,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalCount: total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        })
    } catch (error) {
        console.error('获取已导入的MOOC课程失败:', error)
        res.status(500).json({
            status: 'error',
            message: '获取已导入的MOOC课程失败',
            error: error.message,
        })
    }
}

/**
 * 获取课程评价数据
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
export const getCourseEvaluate = async (req, res) => {
    try {
        // 从请求中获取查询参数
        const {
            courseId,
            pageIndex = 1,
            pageSize = 20,
            orderBy = 3,
        } = req.query
        const csrfKey = req.query.csrfKey || 'fa2c35db81bb400a97f5ed9465e22b9d'

        // 读取示例数据 - 在生产环境中，这里应该是从MOOC平台API获取的真实数据
        // 目前我们使用样例数据
        const reviewData = await import('../data/review.json', {
            assert: { type: 'json' },
        })
        const data = reviewData.default

        // 在实际应用中，这里应该根据courseId查询相应课程的评价
        // 修改数据中的courseId和其他查询参数，使其与请求参数匹配
        if (data && data.result && data.result.query) {
            data.result.query.courseId = courseId
            data.result.query.pageIndex = parseInt(pageIndex)
            data.result.query.pageSize = parseInt(pageSize)
            data.result.query.orderBy = parseInt(orderBy)
        }

        res.status(200).json(data)
    } catch (error) {
        console.error('获取课程评价数据失败:', error)
        res.status(500).json({
            code: -1,
            message: '获取课程评价数据失败',
            error: error.message,
        })
    }
}

export default {
    proxyMoocRequest,
    searchCourses,
    importCoursesToDatabase,
    getImportedCourses,
    getCourseEvaluate,
}
