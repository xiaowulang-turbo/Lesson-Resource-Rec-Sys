import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema({
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
        type: Number, // 由String改为Number，与API数据一致
        required: [true, '请提供资源类型'],
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
        default: '', // 资源封面图片
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
        default: '', // 作者/编辑名称
    },
    publisher: {
        type: String,
        default: '', // 出版社/发布机构
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
        default: 0, // 学习/注册人数
    },
    studyAvatars: [String], // 学习者头像列表
    tags: [String],
    // 高亮和搜索信息
    highlightContent: {
        type: String,
        default: '', // 高亮内容，用于搜索结果展示
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
        default: {}, // 存储其他可能的元数据
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

// 更新时间的中间件
resourceSchema.pre('save', function (next) {
    this.updatedAt = Date.now()
    next()
})

// 索引设置，提高查询效率
resourceSchema.index({
    title: 'text',
    description: 'text',
    highlightContent: 'text',
})
resourceSchema.index({ subject: 1, grade: 1, type: 1 })
resourceSchema.index({ averageRating: -1 })
resourceSchema.index({ enrollCount: -1 })
resourceSchema.index({ createdAt: -1 })

const Resource = mongoose.model('Resource', resourceSchema)

export default Resource
