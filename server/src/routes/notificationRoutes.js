import express from 'express'
import * as notificationController from '../controllers/notificationController.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 保护所有通知路由
router.use(protect)

// 用户路由
router.get('/', notificationController.getUserNotifications)

// 管理员路由
router.post('/', restrictTo('admin'), notificationController.createNotification)
router.patch(
    '/:id',
    restrictTo('admin'),
    notificationController.updateNotification
)
router.delete(
    '/:id',
    restrictTo('admin'),
    notificationController.deleteNotification
)
// 保留API用于向后兼容，但新通知已在创建时自动发布
router.patch(
    '/:id/publish',
    restrictTo('admin'),
    notificationController.publishNotification
)
router.patch(
    '/:id/archive',
    restrictTo('admin'),
    notificationController.archiveNotification
)

// 管理员获取全部通知（不做过滤，支持分页）
router.get(
    '/all',
    restrictTo('admin'),
    notificationController.getAllNotifications
)

export default router
