import mongoose from 'mongoose'

const userNotificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        notificationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Notification',
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
)

// 添加复合索引
userNotificationSchema.index({ userId: 1, notificationId: 1 }, { unique: true })
userNotificationSchema.index({ userId: 1, isRead: 1 })
userNotificationSchema.index({ userId: 1, isDeleted: 1 })

const UserNotification = mongoose.model(
    'UserNotification',
    userNotificationSchema
)

export default UserNotification
