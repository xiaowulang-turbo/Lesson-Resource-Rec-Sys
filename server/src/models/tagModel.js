import mongoose from 'mongoose'
const { Schema } = mongoose

const tagSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['subject', 'skill', 'topic', 'grade', 'difficulty'],
            default: 'topic',
        },
        description: {
            type: String,
            trim: true,
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

// 添加索引以提高查询性能
tagSchema.index({ name: 1, type: 1 }, { unique: true })

const Tag = mongoose.model('Tag', tagSchema)

export default Tag
