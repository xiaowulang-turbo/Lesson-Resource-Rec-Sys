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
        pedagogicalType: {
            type: String,
            required: [true, '请提供资源的教学类型'],
            enum: [
                'courseware', // 课件 (PPT, Slides)
                'tutorial', // 教程 (操作指南, 步骤说明)
                'project', // 项目 (设计, 实验方案)
                'assessment', // 测评/练习 (习题, 测验)
                'reference', // 参考资料 (文献, 书籍章节)
                'lesson_plan', // 教案
                'tool', // 工具 (软件, 在线应用)
                'link', // 外部链接 (网站, 博客文章)
                'other', // 其他
            ],
            default: 'other',
        },
        format: {
            type: String,
            required: [true, '请提供资源的格式'],
            enum: [
                'pdf',
                'docx',
                'pptx',
                'video',
                'audio',
                'image',
                'zip',
                'url',
                'interactive', // H5P, SCORM 等
                'software', // 需要安装的软件
                'other', // 其他格式
            ],
            default: 'other',
        },
        contentType: {
            // 新增字段，区分资源和课程
            type: String,
            required: [true, '请指定内容类型'],
            enum: ['resource', 'course'],
            default: 'resource', // 默认为资源
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
            default: '',
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
        organization: {
            // 新增字段，用于存储课程组织
            type: String,
            trim: true,
            default: '',
        },
        // 学校信息
        school: {
            id: {
                type: Number,
                default: null,
            },
            name: {
                type: String,
                trim: true,
                default: '',
            },
            shortName: {
                type: String,
                trim: true,
                default: '',
            },
            imgUrl: {
                type: String,
                default: '',
            },
            supportMooc: {
                type: Boolean,
                default: false,
            },
            supportSpoc: {
                type: Boolean,
                default: false,
            },
            bgPhoto: {
                type: String,
                default: '',
            },
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
        // 学习数据
        enrollCount: {
            type: Number,
            default: 0,
        },
        studyAvatars: [String],
        tags: [String],
        // 高亮和搜索信息
        highlightContent: {
            type: String,
            default: '',
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
            upvotes: {
                type: Number,
                default: 0,
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
resourceSchema.index({ subject: 1, grade: 1, pedagogicalType: 1 })
resourceSchema.index({ format: 1 })
resourceSchema.index({ averageRating: -1 })
resourceSchema.index({ enrollCount: -1 })
resourceSchema.index({ createdAt: -1 })
resourceSchema.index({ 'stats.views': -1 })
resourceSchema.index({ 'stats.downloads': -1 })
resourceSchema.index({ 'stats.lastViewed': -1 })
resourceSchema.index({ 'access.isPublic': 1 })
resourceSchema.index({ tags: 1 })
resourceSchema.index({ 'version.number': 1 })

// 添加新的静态方法
resourceSchema.statics.findPopular = async function (limit = 10) {
    return this.aggregate([
        {
            $addFields: {
                popularityScore: {
                    $add: [
                        { $multiply: ['$stats.views', 1] },
                        { $multiply: ['$stats.downloads', 2] },
                        { $multiply: ['$stats.shares', 1.5] },
                        { $multiply: ['$stats.favorites', 3] },
                        { $multiply: ['$averageRating', 4] },
                    ],
                },
            },
        },
        { $sort: { popularityScore: -1 } },
        { $limit: limit },
    ])
}

resourceSchema.statics.findByPedagogicalType = async function (
    pedagogicalType,
    { sort = 'latest', page = 1, limit = 10 } = {}
) {
    const query = this.find({ pedagogicalType })

    switch (sort) {
        case 'popular':
            query.sort({ 'stats.views': -1 })
            break
        case 'rating':
            query.sort({ averageRating: -1 })
            break
        case 'downloads':
            query.sort({ 'stats.downloads': -1 })
            break
        default:
            query.sort({ createdAt: -1 })
    }

    return query
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('tags')
        .populate('createdBy', 'name avatar')
}

resourceSchema.statics.findBySubjectAndGrade = async function (subject, grade) {
    return this.find({
        subject,
        grade,
        'access.isPublic': true,
    })
        .sort({ averageRating: -1 })
        .populate('tags')
}

resourceSchema.statics.searchByKeyword = async function (keyword) {
    return this.find(
        { $text: { $search: keyword } },
        { score: { $meta: 'textScore' } }
    )
        .sort({ score: { $meta: 'textScore' } })
        .populate('tags')
        .populate('createdBy', 'name avatar')
}

resourceSchema.statics.findRecentlyViewed = async function (
    userId,
    limit = 10
) {
    return this.find({
        'stats.views': { $gt: 0 },
        $or: [
            { 'access.isPublic': true },
            { 'access.allowedUsers': userId },
            { createdBy: userId },
        ],
    })
        .sort({ 'stats.lastViewed': -1 })
        .limit(limit)
        .populate('tags')
}

// 添加新的实例方法
resourceSchema.methods.isAccessibleBy = function (user) {
    if (this.access.isPublic) return true
    if (!user) return false

    if (this.createdBy.toString() === user._id.toString()) return true
    if (this.access.allowedUsers.includes(user._id)) return true
    if (this.access.allowedRoles.includes(user.role)) return true

    return false
}

resourceSchema.methods.incrementShare = async function () {
    this.stats.shares += 1
    await this.save()
}

resourceSchema.methods.toggleFavorite = async function (userId) {
    const isFavorited = await mongoose.model('Collection').exists({
        userId,
        contentType: 'resource',
        contentId: this._id,
    })

    if (isFavorited) {
        this.stats.favorites -= 1
        await mongoose.model('Collection').deleteOne({
            userId,
            contentType: 'resource',
            contentId: this._id,
        })
    } else {
        this.stats.favorites += 1
        await mongoose.model('Collection').create({
            userId,
            contentType: 'resource',
            contentId: this._id,
        })
    }

    await this.save()
    return !isFavorited
}

const Resource = mongoose.model('Resource', resourceSchema)

export default Resource
