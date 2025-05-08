import express from 'express'
import {
    getAllResources,
    getResource,
    createResource,
    updateResource,
    deleteResource,
    addRating,
    getResourceFile,
    downloadResourceFile,
} from '../controllers/resourceController.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'
import {
    resourceUpload,
    handleUploadErrors,
} from '../middlewares/fileMiddleware.js'

const router = express.Router()

// 公开路由
router.get('/', getAllResources)
router.get('/:id', getResource)

// 文件访问路由 - 可以公开访问，但会在控制器中检查权限
router.get('/:id/file', getResourceFile)
router.get('/:id/download', downloadResourceFile)

// 保护后续所有路由
router.use(protect)

// 评分路由
router.post('/:id/ratings', addRating)

// 限制创建、更新、删除资源的权限
router.use(restrictTo('admin', 'teacher'))

// 使用新的文件上传中间件
router.post('/', resourceUpload, handleUploadErrors, createResource)
router.patch('/:id', updateResource)
router.delete('/:id', deleteResource)

export default router
