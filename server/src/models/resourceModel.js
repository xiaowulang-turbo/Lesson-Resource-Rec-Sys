import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema(
    {
        // 基本信息
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
            type: Number,
            required: [true, '请提供资源类型'],
            enum: [1, 2, 3, 4, 5], // 1:文档, 2:视频, 3:音频, 4:图片, 5:其他
        },
        // 分类信息
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
        // 资源详情
        url: {
            type: String,
            required: [true, '请提供资源链接'],
        },
        cover: {
            type: String,
            default: '',
        },
        // 文件信息
        fileInfo: {
            size: Number, // 文件大小(bytes)
            format: String, // 文件格式
            duration: Number, // 媒体时长(秒)
            resolution: String, // 视频/图片分辨率
            lastModified: Date, // 文件最后修改时间
        },
        // 价格信息
        price: {
            type: Number,
            default: 0,
        },
        originalPrice: {
            type: Number,
            default: 0,
        },
        // 作者信息
        authors: {
            type: String,
            default: '',
        },
        publisher: {
            type: String,
            default: '',
        },
        // 创建和更新信息
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, '资源必须有创建者'],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
        // 学习和评价数据
        enrollCount: {
            type: Number,
            default: 0,
        },
        studyAvatars: [String],
        tags: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Tag',
            },
        ],
        // 高亮和搜索信息
        highlightContent: {
            type: String,
            default: '',
        },
        // 评分系统
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
        // 使用统计
        stats: {
            views: {
                type: Number,
                default: 0,
            },
            downloads: {
                type: Number,
                default: 0,
            },
            shares: {
                type: Number,
                default: 0,
            },
            favorites: {
                type: Number,
                default: 0,
            },
            lastViewed: {
                type: Date,
                default: Date.now,
            },
        },
        // 权限控制
        access: {
            isPublic: {
                type: Boolean,
                default: true,
            },
            allowedUsers: [
                {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                },
            ],
            allowedRoles: [
                {
                    type: String,
                    enum: ['user', 'teacher', 'admin'],
                },
            ],
        },
        // 版本控制
        version: {
            number: {
                type: String,
                default: '1.0.0',
            },
            history: [
                {
                    version: String,
                    changes: String,
                    updatedBy: {
                        type: mongoose.Schema.ObjectId,
                        ref: 'User',
                    },
                    updatedAt: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
        },
        // 分页查询相关
        pageInfo: {
            pageSize: {
                type: Number,
                default: 10,
            },
            pageIndex: {
                type: Number,
                default: 1,
            },
            totalCount: {
                type: Number,
                default: 0,
            },
            totalPageCount: {
                type: Number,
                default: 1,
            },
        },
        // 额外的元数据
        metadata: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// 虚拟字段：计算资源热度分数
resourceSchema.virtual('popularityScore').get(function () {
    const viewWeight = 1
    const downloadWeight = 2
    const shareWeight = 1.5
    const favoriteWeight = 3
    const ratingWeight = 4

    return (
        this.stats.views * viewWeight +
        this.stats.downloads * downloadWeight +
        this.stats.shares * shareWeight +
        this.stats.favorites * favoriteWeight +
        this.averageRating * ratingWeight
    )
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

// 更新时间的中间件
resourceSchema.pre('save', function (next) {
    this.updatedAt = Date.now()
    next()
})

// 添加新的实例方法
resourceSchema.methods.incrementViews = async function () {
    this.stats.views += 1
    this.stats.lastViewed = Date.now()
    await this.save()
}

resourceSchema.methods.incrementDownloads = async function () {
    this.stats.downloads += 1
    await this.save()
}

resourceSchema.methods.addRating = async function (userId, rating, review) {
    const existingRatingIndex = this.ratings.findIndex(
        (r) => r.user.toString() === userId.toString()
    )

    if (existingRatingIndex > -1) {
        this.ratings[existingRatingIndex] = { user: userId, rating, review }
    } else {
        this.ratings.push({ user: userId, rating, review })
    }

    await this.save()
}

resourceSchema.methods.updateVersion = async function (
    version,
    changes,
    userId
) {
    this.version.number = version
    this.version.history.push({
        version,
        changes,
        updatedBy: userId,
        updatedAt: Date.now(),
    })
    await this.save()
}

// 索引设置
resourceSchema.index({
    title: 'text',
    description: 'text',
    highlightContent: 'text',
})
resourceSchema.index({ subject: 1, grade: 1, type: 1 })
resourceSchema.index({ averageRating: -1 })
resourceSchema.index({ enrollCount: -1 })
resourceSchema.index({ createdAt: -1 })
resourceSchema.index({ 'stats.views': -1 })
resourceSchema.index({ 'stats.downloads': -1 })
resourceSchema.index({ 'stats.lastViewed': -1 })
resourceSchema.index({ 'access.isPublic': 1 })
resourceSchema.index({ tags: 1 })
resourceSchema.index({ 'version.number': 1 })

const Resource = mongoose.model('Resource', resourceSchema)

export default Resource
