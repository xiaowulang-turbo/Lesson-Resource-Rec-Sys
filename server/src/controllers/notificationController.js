import Notification from '../models/notificationModel.js'
import cacheService from '../services/RedisCacheService.js'
import AppError from '../utils/appError.js'

// 创建新通知
export const createNotification = async (req, res, next) => {
    try {
        req.body.createdBy = req.user.id
        req.body.status = 'published'
        const notification = await Notification.create(req.body)
        const cacheKey = `${cacheService.prefix}notifications_`
        await cacheService.clear(cacheKey)
        res.status(201).json({
            status: 'success',
            data: { notification },
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
        notification.status = 'published'
        notification.updatedBy = req.user.id
        await notification.save()
        const cacheKey = `${cacheService.prefix}notifications_`
        await cacheService.clear(cacheKey)
        res.status(200).json({
            status: 'success',
            data: { notification },
        })
    } catch (err) {
        next(err)
    }
}

// 获取用户通知（直接查notifications表，过滤已发布、未过期、目标受众匹配的通知）
export const getUserNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit
        const now = new Date()
        let audience = ['all']
        if (req.user.role === 'teacher') {
            audience.push('teachers')
        } else if (req.user.role === 'admin') {
            audience.push('admins')
        }
        const cacheKey = `${cacheService.prefix}notifications_${req.user.role}_${page}_${limit}`
        const cachedData = await cacheService.get(cacheKey)
        if (cachedData) {
            return res.status(200).json(cachedData)
        }
        // 只返回已发布、未过期、目标受众匹配的通知
        const query = {
            status: 'published',
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gt: now } },
            ],
            targetAudience: { $in: audience },
        }
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
        const total = await Notification.countDocuments(query)
        const result = {
            status: 'success',
            results: notifications.length,
            data: {
                notifications,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit,
                },
            },
        }
        await cacheService.set(cacheKey, result, 300)
        res.status(200).json(result)
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

// 管理员获取全部通知（不做过滤，支持分页）
export const getAllNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit
        // 仅管理员可访问
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ status: 'fail', message: '无权限' })
        }
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
        const total = await Notification.countDocuments()
        res.status(200).json({
            status: 'success',
            results: notifications.length,
            data: {
                notifications,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit,
                },
            },
        })
    } catch (err) {
        next(err)
    }
}
