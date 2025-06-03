import express from 'express'
import {
    createResource,
    getAllResources,
    getResource,
    updateResource,
    deleteResource,
    deleteMultipleResources,
    getResourceFile,
    saveMoocResources,
} from '../controllers/resourceController.js'
import { protect } from '../middlewares/authMiddleware.js'
import {
    resourceUpload,
    handleUploadErrors,
} from '../middlewares/fileMiddleware.js'

const router = express.Router()

// 公开资源相关路由
router.get('/', getAllResources)
router.get('/:id', getResource)
router.get('/:id/file', getResourceFile)

// 需要身份验证的路由
router.use(protect) // 应用身份验证中间件到以下所有路由

// 新增：批量删除资源路由（需要放在单个资源删除路由之前，避免路径冲突）
router.delete('/batch-delete', deleteMultipleResources)

// 其他需要身份验证的路由
router.post('/', resourceUpload, handleUploadErrors, createResource)
router.patch('/:id', resourceUpload, handleUploadErrors, updateResource)
router.delete('/:id', deleteResource)
router.post('/mooc', saveMoocResources)

export default router
