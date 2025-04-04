import Course from '../models/courseModel.js'
import Resource from '../models/resourceModel.js'
import User from '../models/userModel.js'

// 获取系统统计数据
export const getSystemStats = async (req, res) => {
    try {
        // 1. 获取基础统计数据
        const [courseCount, resourceCount, userCount] = await Promise.all([
            Course.countDocuments(),
            Resource.countDocuments(),
            User.countDocuments(),
        ])

        // 2. 获取资源类型分布
        const resourceDistribution = await Resource.aggregate([
            {
                $group: {
                    _id: '$type',
                    value: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    value: 1,
                },
            },
        ])

        // 3. 获取难度分布
        const difficultyDistribution = await Course.aggregate([
            {
                $group: {
                    _id: '$course_difficulty',
                    value: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    name: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ['$_id', 'Beginner'] },
                                    then: '入门',
                                },
                                {
                                    case: { $eq: ['$_id', 'Intermediate'] },
                                    then: '初级',
                                },
                                {
                                    case: { $eq: ['$_id', 'Advanced'] },
                                    then: '中级',
                                },
                                {
                                    case: { $eq: ['$_id', 'Expert'] },
                                    then: '高级',
                                },
                            ],
                            default: '其他',
                        },
                    },
                    value: 1,
                },
            },
        ])

        // 4. 获取热门课程（使用新的数字字段）
        const topCourses = await Course.aggregate([
            {
                $sort: { course_students_enrolled_count: -1 },
            },
            {
                $limit: 5,
            },
            {
                $project: {
                    id: '$course_id',
                    title: '$course_title',
                    enrollCount: '$course_students_enrolled_count',
                    rating: '$course_rating',
                },
            },
        ])

        // 5. 获取月活用户数据（这里使用模拟数据，因为需要用户活动日志表）
        const monthlyActiveUsers = Array.from(
            { length: 12 },
            () => Math.floor(Math.random() * 5000) + 1000
        )

        // 6. 获取在线用户数（这里使用模拟数据，实际应该通过用户session或websocket连接统计）
        const onlineCount = Math.floor(Math.random() * 300) + 50

        // 7. 返回统计数据
        res.status(200).json({
            status: 'success',
            data: {
                courseCount,
                resourceCount,
                userCount,
                onlineCount,
                totalViews: resourceCount * 10, // 简单估算，实际应该从访问日志统计
                completionRate: 75, // 模拟数据，实际应该从课程完成记录统计
                monthlyActiveUsers,
                resourceDistribution,
                difficultyDistribution,
                topCourses,
            },
        })
    } catch (error) {
        console.error('获取统计数据失败:', error)
        res.status(500).json({
            status: 'error',
            message: '获取统计数据失败',
        })
    }
}
