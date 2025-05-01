import express from 'express'
import {
    getAllTags,
    getTagsByType,
    searchTags,
    createTag,
    deleteTag,
    getUserInterestTags,
    createManyTags,
} from '../controllers/tagController.js'
import { protect, restrictTo } from '../controllers/authController.js'

const router = express.Router()

// 公共路由 - 无需登录
router.get('/search', searchTags)
router.get('/interests', getUserInterestTags)
router.get('/type/:type', getTagsByType)
router.get('/', getAllTags)

// 受保护路由 - 需要登录
router.use(protect)

// 管理员路由 - 需要管理员权限
router.use(restrictTo('admin'))
router.post('/', createTag)
router.post('/batch', createManyTags)
router.delete('/:id', deleteTag)

export default router
