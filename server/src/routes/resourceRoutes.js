import express from 'express'
import {
    getAllResources,
    getResource,
    createResource,
    updateResource,
    deleteResource,
    addRating,
} from '../controllers/resourceController.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 公开路由
router.get('/', getAllResources)
router.get('/:id', getResource)

// 保护后续所有路由
router.use(protect)

// 评分路由
router.post('/:id/ratings', addRating)

// 限制创建、更新、删除资源的权限
router.use(restrictTo('admin', 'teacher'))

router.post('/', createResource)
router.patch('/:id', updateResource)
router.delete('/:id', deleteResource)

export default router
