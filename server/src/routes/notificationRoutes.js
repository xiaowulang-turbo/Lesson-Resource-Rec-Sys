import express from 'express'
import * as notificationController from '../controllers/notificationController.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 保护所有通知路由
router.use(protect)

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

// 用户路由
router.get('/', notificationController.getUserNotifications)
router.get('/unread', notificationController.getUnreadNotifications)
router.patch('/:id/read', notificationController.markAsRead)
router.patch('/:id/unread', notificationController.markAsUnread)
router.delete('/user/:id', notificationController.deleteUserNotification)
router.patch('/read-all', notificationController.markAllAsRead)

export default router
