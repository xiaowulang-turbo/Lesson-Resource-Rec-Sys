import express from 'express'
import {
    getAllCourses,
    getRecommendedCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
} from '../controllers/courseController.js'

const router = express.Router()

// 获取所有课程
router.get('/', getAllCourses)

// 获取推荐课程
router.get('/recommended', getRecommendedCourses)

// 获取、更新、删除单个课程
router.route('/:id').get(getCourse).patch(updateCourse).delete(deleteCourse)

// 创建新课程
router.post('/', createCourse)

export default router
