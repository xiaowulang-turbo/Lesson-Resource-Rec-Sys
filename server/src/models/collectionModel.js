import mongoose from 'mongoose'
const { Schema } = mongoose

const collectionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        contentType: {
            type: String,
            required: true,
            enum: ['course', 'resource'],
        },
        contentId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'contentType',
        },
        notes: {
            type: String,
            trim: true,
        },
        folders: [
            {
                type: String,
                trim: true,
            },
        ],
        isPublic: {
            type: Boolean,
            default: false,
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
collectionSchema.index(
    { userId: 1, contentType: 1, contentId: 1 },
    { unique: true }
)
collectionSchema.index({ folders: 1 })

const Collection = mongoose.model('Collection', collectionSchema)

export default Collection
