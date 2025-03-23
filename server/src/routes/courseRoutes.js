import express from 'express'
import {
    getAllCourses,
    getRecommendedCourses,
    getCourse,
} from '../controllers/courseController.js'

const router = express.Router()

router.route('/').get(getAllCourses)

router.route('/recommended').get(getRecommendedCourses)

router.route('/:id').get(getCourse)

export default router
