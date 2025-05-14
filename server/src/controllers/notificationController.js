import Notification from '../models/notificationModel.js'
import UserNotification from '../models/userNotificationModel.js'
import User from '../models/userModel.js'
import Account from '../models/accountModel.js'
import cacheService from '../services/RedisCacheService.js'
import AppError from '../utils/appError.js'

// 创建新通知
export const createNotification = async (req, res, next) => {
    try {
        // 添加创建者ID
        req.body.createdBy = req.user.id

        // 直接设置状态为已发布，跳过草稿状态
        req.body.status = 'published'

        // 创建通知
        const notification = await Notification.create(req.body)

        // 发布通知给目标用户 - 直接集成发布逻辑
        // 查找目标用户
        let userQuery = {}

        // 根据目标受众过滤用户
        if (notification.targetAudience !== 'all') {
            const accounts = await Account.find({
                role: notification.targetAudience.slice(0, -1),
            }) // 去掉末尾的's'
            const accountIds = accounts.map((account) => account._id)
            userQuery = { accountId: { $in: accountIds } }
        }

        const users = await User.find(userQuery)

        // 为每个用户创建通知状态记录
        const userNotifications = users.map((user) => ({
            userId: user._id,
            notificationId: notification._id,
        }))

        // 批量插入用户通知
        if (userNotifications.length > 0) {
            await UserNotification.insertMany(userNotifications, {
                ordered: false,
            })
        }

        // 清除相关缓存
        const cacheKey = `${cacheService.prefix}notifications_`
        await cacheService.clear(cacheKey)

        res.status(201).json({
            status: 'success',
            data: {
                notification,
                recipientCount: userNotifications.length,
            },
        })
    } catch (err) {
        next(err)
    }
}

// 更新通知
export const updateNotification = async (req, res, next) => {
    try {
        // 只能更新草稿状态的通知
        const notification = await Notification.findById(req.params.id)

        if (!notification) {
            return next(new AppError('找不到该通知', 404))
        }

        if (notification.status !== 'draft') {
            return next(new AppError('只能更新草稿状态的通知', 400))
        }

        // 添加更新者ID
        req.body.updatedBy = req.user.id

        // 更新通知
        const updatedNotification = await Notification.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        )

        res.status(200).json({
            status: 'success',
            data: {
                notification: updatedNotification,
            },
        })
    } catch (err) {
        next(err)
    }
}

// 发布通知 - 推送给目标用户
export const publishNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id)

        if (!notification) {
            return next(new AppError('找不到该通知', 404))
        }

        if (notification.status === 'published') {
            return next(new AppError('该通知已经发布', 400))
        }

        // 更新通知状态为已发布
        notification.status = 'published'
        notification.updatedBy = req.user.id
        await notification.save()

        // 查找目标用户
        let userQuery = {}

        // 根据目标受众过滤用户
        if (notification.targetAudience !== 'all') {
            const accounts = await Account.find({
                role: notification.targetAudience.slice(0, -1),
            }) // 去掉末尾的's'
            const accountIds = accounts.map((account) => account._id)
            userQuery = { accountId: { $in: accountIds } }
        }

        const users = await User.find(userQuery)

        // 为每个用户创建通知状态记录
        const userNotifications = users.map((user) => ({
            userId: user._id,
            notificationId: notification._id,
        }))

        // 批量插入用户通知
        if (userNotifications.length > 0) {
            await UserNotification.insertMany(userNotifications, {
                ordered: false,
            })
        }

        // 清除相关缓存
        const cacheKey = `${cacheService.prefix}notifications_`
        await cacheService.clear(cacheKey)

        res.status(200).json({
            status: 'success',
            data: {
                notification,
                recipientCount: userNotifications.length,
            },
        })
    } catch (err) {
        next(err)
    }
}

// 获取用户通知
export const getUserNotifications = async (req, res, next) => {
    try {
        // 添加分页
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit

        // 检查缓存
        const cacheKey = `${cacheService.prefix}notifications_${req.user._id}_${page}_${limit}`
        const cachedData = await cacheService.get(cacheKey)

        if (cachedData) {
            return res.status(200).json(cachedData)
        }

        // 查询未删除的用户通知
        const userNotifications = await UserNotification.find({
            userId: req.user._id,
            isDeleted: false,
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'notificationId',
                select: 'title content type priority status expiresAt createdAt',
            })

        // 获取总数量
        const total = await UserNotification.countDocuments({
            userId: req.user._id,
            isDeleted: false,
        })

        console.log(userNotifications, 'userNotifications')

        const result = {
            status: 'success',
            results: userNotifications.length,
            data: {
                notifications: userNotifications,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit,
                },
            },
        }

        // 缓存结果
        await cacheService.set(cacheKey, result, 300) // 缓存5分钟

        res.status(200).json(result)
    } catch (err) {
        console.log(err)

        next(err)
    }
}

// 获取未读通知
export const getUnreadNotifications = async (req, res, next) => {
    try {
        const userNotifications = await UserNotification.find({
            userId: req.user._id,
            isRead: false,
            isDeleted: false,
        }).populate({
            path: 'notificationId',
            select: 'title content type priority status expiresAt createdAt',
        })

        res.status(200).json({
            status: 'success',
            results: userNotifications.length,
            data: {
                notifications: userNotifications,
            },
        })
    } catch (err) {
        next(err)
    }
}

// 将通知标记为已读
export const markAsRead = async (req, res, next) => {
    try {
        const userNotification = await UserNotification.findOneAndUpdate(
            {
                userId: req.user._id,
                notificationId: req.params.id,
                isDeleted: false,
            },
            {
                isRead: true,
                readAt: Date.now(),
            },
            {
                new: true,
            }
        )

        if (!userNotification) {
            return next(new AppError('找不到该通知或通知已删除', 404))
        }

        res.status(200).json({
            status: 'success',
            data: {
                userNotification,
            },
        })
    } catch (err) {
        next(err)
    }
}

// 将通知标记为未读
export const markAsUnread = async (req, res, next) => {
    try {
        const userNotification = await UserNotification.findOneAndUpdate(
            {
                userId: req.user._id,
                notificationId: req.params.id,
                isDeleted: false,
            },
            {
                isRead: false,
                readAt: null,
            },
            {
                new: true,
            }
        )

        if (!userNotification) {
            return next(new AppError('找不到该通知或通知已删除', 404))
        }

        res.status(200).json({
            status: 'success',
            data: {
                userNotification,
            },
        })
    } catch (err) {
        next(err)
    }
}

// 将所有通知标记为已读
export const markAllAsRead = async (req, res, next) => {
    try {
        await UserNotification.updateMany(
            {
                userId: req.user._id,
                isRead: false,
                isDeleted: false,
            },
            {
                isRead: true,
                readAt: Date.now(),
            }
        )

        res.status(200).json({
            status: 'success',
            message: '所有通知已标记为已读',
        })
    } catch (err) {
        next(err)
    }
}

// 删除用户通知（仅对当前用户）
export const deleteUserNotification = async (req, res, next) => {
    try {
        const userNotification = await UserNotification.findOneAndUpdate(
            {
                userId: req.user._id,
                notificationId: req.params.id,
            },
            {
                isDeleted: true,
            },
            {
                new: true,
            }
        )

        if (!userNotification) {
            return next(new AppError('找不到该通知', 404))
        }

        res.status(200).json({
            status: 'success',
            data: null,
        })
    } catch (err) {
        next(err)
    }
}

// 归档通知（仅管理员）
export const archiveNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            {
                status: 'archived',
                updatedBy: req.user.id,
            },
            {
                new: true,
            }
        )

        if (!notification) {
            return next(new AppError('找不到该通知', 404))
        }

        res.status(200).json({
            status: 'success',
            data: {
                notification,
            },
        })
    } catch (err) {
        next(err)
    }
}

// 删除通知（仅管理员，物理删除）
export const deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id)

        if (!notification) {
            return next(new AppError('找不到该通知', 404))
        }

        // 删除相关的用户通知记录
        await UserNotification.deleteMany({ notificationId: notification._id })

        // 删除通知本身
        await Notification.findByIdAndDelete(req.params.id)

        res.status(204).json({
            status: 'success',
            data: null,
        })
    } catch (err) {
        next(err)
    }
}
