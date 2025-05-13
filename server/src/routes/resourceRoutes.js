import express from 'express'
import {
    createResource,
    getAllResources,
    getResource,
    updateResource,
    deleteResource,
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

// 保存MOOC资源到数据库的路由 - 不需要认证
router.post('/mooc', saveMoocResources)

// 以下路由需要登录
router.use(protect)
router.post('/', resourceUpload, handleUploadErrors, createResource)
router.patch('/:id', updateResource)
router.delete('/:id', deleteResource)

export default router
