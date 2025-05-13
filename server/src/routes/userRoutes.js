import express from 'express'
import {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    getMe,
    updateMe,
    deleteMe,
    uploadUserPhoto,
    addFavoriteResource,
    removeFavoriteResource,
    getFavoriteResources,
    getUserUploadedResources,
} from '../controllers/userController.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 保护所有用户路由
router.use(protect)

// 当前用户路由
router.get('/me', getMe, getUser)
router.patch('/updateMe', uploadUserPhoto, updateMe)
router.delete('/deleteMe', deleteMe)

// 新增：收藏和取消收藏资源的路由
router.patch('/:userId/favorites/:resourceId', addFavoriteResource)
router.delete('/:userId/favorites/:resourceId', removeFavoriteResource)

// 新增：获取用户收藏资源列表
router.get('/:userId/collections', getFavoriteResources)

// 新增：获取用户上传的资源列表
router.get('/:userId/uploads', getUserUploadedResources)

// 限制以下路由仅管理员可访问
router.use(restrictTo('admin'))

router.route('/').get(getAllUsers)

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

export default router
