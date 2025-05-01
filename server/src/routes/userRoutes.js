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
} from '../controllers/userController.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 保护所有用户路由
router.use(protect)

// 当前用户路由
router.get('/me', getMe, getUser)
router.patch('/updateMe', uploadUserPhoto, updateMe)
router.delete('/deleteMe', deleteMe)

// 限制以下路由仅管理员可访问
router.use(restrictTo('admin'))

router.route('/').get(getAllUsers)

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

export default router
