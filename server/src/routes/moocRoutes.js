import express from 'express'
import {
    proxyMoocRequest,
    searchCourses,
    importCoursesToDatabase,
    getImportedCourses,
    proxyMoocCourseRequest,
    saveMoocCourses,
} from '../controllers/moocController.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 公开路由
router.post('/proxy', proxyMoocRequest) // 代理MOOC API请求（教材）
router.post('/proxy-courses', proxyMoocCourseRequest) // 代理MOOC API请求（课程）
router.get('/search', searchCourses) // 搜索MOOC课程

// 需要登录的路由
router.use(protect)

// 保存MOOC资源
router.post('/save', saveMoocCourses) // 保存教材资源
router.post('/save-courses', saveMoocCourses) // 保存课程资源

// 获取已导入的MOOC课程
router.get('/imported', getImportedCourses)

// 管理员权限路由
router.use(restrictTo('admin', 'teacher'))

// 将MOOC课程导入到数据库
router.post('/import', importCoursesToDatabase)

export default router
