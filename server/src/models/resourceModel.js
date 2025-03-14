import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, '请提供资源标题'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, '请提供资源描述'],
    },
    type: {
        type: String,
        required: [true, '请提供资源类型'],
        enum: ['video', 'document', 'exercise', 'quiz', 'other'],
    },
    subject: {
        type: String,
        required: [true, '请提供学科'],
    },
    grade: {
        type: String,
        required: [true, '请提供年级'],
    },
    difficulty: {
        type: Number,
        required: [true, '请提供难度等级'],
        min: 1,
        max: 5,
    },
    url: {
        type: String,
        required: [true, '请提供资源链接'],
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, '资源必须有创建者'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    tags: [String],
    ratings: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
            rating: {
                type: Number,
                min: 1,
                max: 5,
            },
            review: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    averageRating: {
        type: Number,
        default: 0,
    },
})

// 计算平均评分的中间件
resourceSchema.pre('save', function (next) {
    if (this.ratings.length > 0) {
        this.averageRating =
            this.ratings.reduce((acc, item) => acc + item.rating, 0) /
            this.ratings.length
    }
    next()
})

const Resource = mongoose.model('Resource', resourceSchema)

export default Resource
