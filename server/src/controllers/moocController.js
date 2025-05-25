import {
    processMoocCourses,
    searchMoocCourses,
    fetchMoocCoursesOnly,
    saveCourseResourcesToDatabase,
} from '../services/moocService.js'
import Resource from '../models/resourceModel.js'

/**
 * 代理MOOC API请求（教材）
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
 * 代理MOOC课程搜索请求（不包含prodectType，用于搜课程）
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
export const proxyMoocCourseRequest = async (req, res) => {
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
            console.error('解析MOOC课程请求参数失败:', error)
        }

        // 提取关键参数
        const {
            keyword = '人工智能',
            pageIndex = 1,
            pageSize = 20,
        } = searchParams

        // 获取MOOC课程资源
        const courseResources = await fetchMoocCoursesOnly(
            keyword,
            pageIndex,
            pageSize
        )

        // 返回转换后的资源
        res.status(200).json({
            code: 0,
            message: 'success',
            result: {
                list: courseResources,
                query: {
                    keyword,
                    pageIndex,
                    pageSize,
                },
                totalCount: courseResources.length,
            },
        })
    } catch (error) {
        console.error('处理MOOC课程请求失败:', error)
        res.status(500).json({
            code: -1,
            message: '处理MOOC课程请求失败',
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
 * 保存MOOC课程资源到数据库
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
export const saveMoocCourses = async (req, res) => {
    try {
        const { resources, userId } = req.body

        if (!resources || !Array.isArray(resources)) {
            return res.status(400).json({
                success: false,
                message: '请提供有效的课程资源数组',
            })
        }

        console.log(`准备保存 ${resources.length} 个课程资源`)

        // 保存课程资源到数据库
        const result = await saveCourseResourcesToDatabase(resources, userId)

        if (result.success) {
            res.status(200).json({
                success: true,
                message: `成功处理 ${result.results} 个课程资源`,
                results: result.results,
                details: result.details,
            })
        } else {
            res.status(500).json({
                success: false,
                message: '保存课程资源失败',
                error: result.error,
                results: 0,
            })
        }
    } catch (error) {
        console.error('保存MOOC课程资源失败:', error)
        res.status(500).json({
            success: false,
            message: '保存课程资源失败',
            error: error.message,
            results: 0,
        })
    }
}

// 默认导出所有控制器函数
export default {
    proxyMoocRequest,
    searchCourses,
    importCoursesToDatabase,
    getImportedCourses,
    proxyMoocCourseRequest,
    saveMoocCourses,
}
