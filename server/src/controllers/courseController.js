import Course from '../models/courseModel.js'

// 获取所有课程
export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
        res.status(200).json({
            status: 'success',
            results: courses.length,
            data: {
                courses,
            },
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        })
    }
}

// 获取推荐课程
export const getRecommendedCourses = async (req, res) => {
    try {
        // 基于评分和注册人数的简单推荐算法
        const recommendedCourses = await Course.find()
            .sort({
                course_rating: -1,
                course_students_enrolled: -1,
            })
            .limit(10)

        res.status(200).json({
            status: 'success',
            results: recommendedCourses.length,
            data: {
                courses: recommendedCourses,
            },
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        })
    }
}

// 根据ID获取单个课程
export const getCourse = async (req, res) => {
    try {
        const course = await Course.findOne({ course_id: req.params.id })
        if (!course) {
            return res.status(404).json({
                status: 'fail',
                message: '未找到该课程',
            })
        }
        res.status(200).json({
            status: 'success',
            data: {
                course,
            },
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        })
    }
}
