import mongoose from 'mongoose'
const { Schema } = mongoose

const userResourceInteractionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        resourceId: {
            type: Schema.Types.ObjectId,
            ref: 'Resource',
            required: true,
        },
        interactionType: {
            type: String,
            required: true,
            enum: ['view', 'download', 'rate', 'comment', 'share'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null,
        },
        comment: {
            type: String,
            trim: true,
        },
        duration: {
            type: Number, // 以秒为单位的交互时长
            default: 0,
        },
        metadata: {
            userAgent: String,
            platform: String,
            device: String,
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

// 添加复合索引
userResourceInteractionSchema.index({
    userId: 1,
    resourceId: 1,
    interactionType: 1,
})
userResourceInteractionSchema.index({ resourceId: 1, interactionType: 1 })
userResourceInteractionSchema.index({ createdAt: -1 })

const UserResourceInteraction = mongoose.model(
    'UserResourceInteraction',
    userResourceInteractionSchema
)

export default UserResourceInteraction
