import Course from '../models/courseModel.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'

// 获取所有课程
export const getAllCourses = catchAsync(async (req, res, next) => {
    const courses = await Course.find()

    res.status(200).json({
        status: 'success',
        results: courses.length,
        data: {
            courses,
        },
    })
})

// 获取推荐课程
export const getRecommendedCourses = catchAsync(async (req, res, next) => {
    const courses = await Course.find({ isRecommended: true })

    res.status(200).json({
        status: 'success',
        results: courses.length,
        data: {
            courses,
        },
    })
})

// 获取单个课程
export const getCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findOne({ course_id: req.params.id })

    if (!course) {
        return next(new AppError('未找到该课程', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            course,
        },
    })
})

// 创建课程
export const createCourse = catchAsync(async (req, res, next) => {
    const newCourse = await Course.create(req.body)

    res.status(201).json({
        status: 'success',
        data: {
            course: newCourse,
        },
    })
})

// 更新课程
export const updateCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findOneAndUpdate(
        { course_id: req.params.id },
        req.body,
        {
            new: true,
            runValidators: true,
        }
    )

    if (!course) {
        return next(new AppError('未找到该课程', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            course,
        },
    })
})

// 删除课程
export const deleteCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findOneAndDelete({ course_id: req.params.id })

    if (!course) {
        return next(new AppError('未找到该课程', 404))
    }

    res.status(204).json({
        status: 'success',
        data: null,
    })
})
