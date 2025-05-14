import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, '请提供消息标题'],
            trim: true,
            maxlength: [100, '标题不能超过100个字符'],
        },
        content: {
            type: String,
            required: [true, '请提供消息内容'],
        },
        type: {
            type: String,
            enum: ['system', 'resource', 'course', 'announcement'],
            default: 'announcement',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft',
        },
        targetAudience: {
            type: String,
            enum: ['all', 'students', 'teachers', 'admins'],
            default: 'all',
        },
        expiresAt: {
            type: Date,
            default: () => {
                const date = new Date()
                date.setDate(date.getDate() + 30) // 默认30天后过期
                return date
            },
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
        },
        relatedResource: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resource',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
)

// 添加索引
notificationSchema.index({ status: 1 })
notificationSchema.index({ targetAudience: 1 })
notificationSchema.index({ expiresAt: 1 })
notificationSchema.index({ createdAt: -1 })

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
