import express from 'express'
import {
    uploadSingleFile,
    uploadMultipleFiles,
    importSingleFile,
    importMultipleFiles,
    previewCourseFiles,
    deleteCourseResource,
} from '../controllers/courseImportController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 保护所有路由，需要登录
router.use(protect)

// 单文件上传和导入
router.post('/upload-single', uploadSingleFile, importSingleFile)

// 多文件批量上传和导入
router.post('/upload-multiple', uploadMultipleFiles, importMultipleFiles)

// 预览课程文件列表
router.get('/preview/:courseId', previewCourseFiles)

// 删除课程资源
router.delete('/resource/:resourceId', deleteCourseResource)

export default router
