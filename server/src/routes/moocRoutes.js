import express from 'express'
import {
    proxyMoocRequest,
    searchCourses,
    importCoursesToDatabase,
    getImportedCourses,
    getCourseEvaluate,
} from '../controllers/moocController.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 公开路由
router.post('/proxy', proxyMoocRequest) // 代理MOOC API请求
router.get('/search', searchCourses) // 搜索MOOC课程
router.get('/evaluations', getCourseEvaluate) // 获取课程评价数据

// 需要登录的路由
router.use(protect)

// 获取已导入的MOOC课程
router.get('/imported', getImportedCourses)

// 管理员权限路由
router.use(restrictTo('admin', 'teacher'))

// 将MOOC课程导入到数据库
router.post('/import', importCoursesToDatabase)

export default router
