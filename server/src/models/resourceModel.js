import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema(
    {
        // 基本信息
        originalId: {
            type: String,
            default: '',
        },
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
                'file',
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
        // 课程和章节结构 - 新增部分
        courseStructure: {
            // 父课程ID - 如果此资源属于某个课程
            parentCourse: {
                type: mongoose.Schema.ObjectId,
                ref: 'Resource',
                default: null,
            },
            // 章节信息
            chapter: {
                number: {
                    type: Number,
                    default: null, // 章节号，如 1, 2, 3
                },
                title: {
                    type: String,
                    trim: true,
                    default: '', // 章节标题，如 "第一章：入门基础"
                },
                subtitle: {
                    type: String,
                    trim: true,
                    default: '', // 章节副标题
                },
                level: {
                    type: Number,
                    default: 1, // 章节层级，1为主章节，2为小节，3为子小节
                },
                parentChapter: {
                    type: Number,
                    default: null, // 父章节号，用于多级章节结构
                },
            },
            // 顺序和位置信息
            order: {
                courseOrder: {
                    type: Number,
                    default: 0, // 在整个课程中的顺序
                },
                chapterOrder: {
                    type: Number,
                    default: 0, // 在当前章节中的顺序
                },
                sectionOrder: {
                    type: Number,
                    default: 0, // 在当前小节中的顺序
                },
            },
            // 学习路径信息
            learningPath: {
                isRequired: {
                    type: Boolean,
                    default: true, // 是否为必修内容
                },
                prerequisites: [
                    {
                        type: mongoose.Schema.ObjectId,
                        ref: 'Resource', // 前置资源ID
                    },
                ],
                estimatedDuration: {
                    type: Number,
                    default: 0, // 预计学习时长（分钟）
                },
                difficultyProgression: {
                    type: Number,
                    min: 1,
                    max: 10,
                    default: 5, // 在课程中的难度递进位置
                },
            },
            // 完成状态（用于学习者）
            completion: {
                isCompleted: {
                    type: Boolean,
                    default: false,
                },
                completedBy: [
                    {
                        user: {
                            type: mongoose.Schema.ObjectId,
                            ref: 'User',
                        },
                        completedAt: {
                            type: Date,
                        },
                        progress: {
                            type: Number,
                            min: 0,
                            max: 100,
                            default: 0,
                        },
                    },
                ],
            },
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
    if (this.ratings?.length > 0) {
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

// 课程结构相关索引
resourceSchema.index({ 'courseStructure.parentCourse': 1 })
resourceSchema.index({ 'courseStructure.chapter.number': 1 })
resourceSchema.index({ 'courseStructure.chapter.level': 1 })
resourceSchema.index({ 'courseStructure.order.courseOrder': 1 })
resourceSchema.index({ 'courseStructure.order.chapterOrder': 1 })
resourceSchema.index({
    'courseStructure.parentCourse': 1,
    'courseStructure.order.courseOrder': 1,
})
resourceSchema.index({
    'courseStructure.parentCourse': 1,
    'courseStructure.chapter.number': 1,
    'courseStructure.order.chapterOrder': 1,
})
resourceSchema.index({ 'courseStructure.learningPath.prerequisites': 1 })
resourceSchema.index({ 'courseStructure.completion.completedBy.user': 1 })

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

// 课程章节相关的实例方法
// 标记资源为已完成
resourceSchema.methods.markCompleted = async function (userId, progress = 100) {
    const existingCompletion = this.courseStructure.completion.completedBy.find(
        (c) => c.user.toString() === userId.toString()
    )

    if (existingCompletion) {
        existingCompletion.progress = progress
        existingCompletion.completedAt = Date.now()
        existingCompletion.isCompleted = progress >= 100
    } else {
        this.courseStructure.completion.completedBy.push({
            user: userId,
            progress,
            completedAt: Date.now(),
            isCompleted: progress >= 100,
        })
    }

    // 更新整体完成状态
    this.courseStructure.completion.isCompleted = progress >= 100

    await this.save()
    return this
}

// 更新学习进度
resourceSchema.methods.updateProgress = async function (userId, progress) {
    const existingCompletion = this.courseStructure.completion.completedBy.find(
        (c) => c.user.toString() === userId.toString()
    )

    if (existingCompletion) {
        existingCompletion.progress = Math.max(
            existingCompletion.progress,
            progress
        )
        if (progress >= 100) {
            existingCompletion.isCompleted = true
            existingCompletion.completedAt = Date.now()
        }
    } else {
        this.courseStructure.completion.completedBy.push({
            user: userId,
            progress,
            isCompleted: progress >= 100,
            completedAt: progress >= 100 ? Date.now() : null,
        })
    }

    await this.save()
    return this
}

// 检查用户是否可以访问此资源（基于前置条件）
resourceSchema.methods.canUserAccess = async function (userId) {
    if (!this.courseStructure.learningPath.prerequisites?.length) {
        return { canAccess: true, missingPrerequisites: [] }
    }

    const Resource = this.constructor
    const completedPrerequisites = await Resource.find({
        _id: { $in: this.courseStructure.learningPath.prerequisites },
        'courseStructure.completion.completedBy': {
            $elemMatch: {
                user: userId,
                isCompleted: true,
            },
        },
    })

    const missingPrerequisites = await Resource.find({
        _id: {
            $in: this.courseStructure.learningPath.prerequisites.filter(
                (prereq) =>
                    !completedPrerequisites.some(
                        (completed) =>
                            completed._id.toString() === prereq.toString()
                    )
            ),
        },
    }).select('title courseStructure.chapter.title')

    return {
        canAccess: missingPrerequisites.length === 0,
        missingPrerequisites,
        completedPrerequisites: completedPrerequisites.length,
        totalPrerequisites:
            this.courseStructure.learningPath.prerequisites.length,
    }
}

// 获取资源在课程中的位置信息
resourceSchema.methods.getPositionInCourse = async function () {
    if (!this.courseStructure.parentCourse) {
        return null
    }

    const Resource = this.constructor

    // 获取课程中的前一个和后一个资源
    const previousResource = await Resource.findOne({
        'courseStructure.parentCourse': this.courseStructure.parentCourse,
        'courseStructure.order.courseOrder': {
            $lt: this.courseStructure.order.courseOrder,
        },
    })
        .sort({ 'courseStructure.order.courseOrder': -1 })
        .select('title courseStructure')

    const nextResource = await Resource.findOne({
        'courseStructure.parentCourse': this.courseStructure.parentCourse,
        'courseStructure.order.courseOrder': {
            $gt: this.courseStructure.order.courseOrder,
        },
    })
        .sort({ 'courseStructure.order.courseOrder': 1 })
        .select('title courseStructure')

    // 获取总资源数和当前位置
    const totalResources = await Resource.countDocuments({
        'courseStructure.parentCourse': this.courseStructure.parentCourse,
    })

    const currentPosition = await Resource.countDocuments({
        'courseStructure.parentCourse': this.courseStructure.parentCourse,
        'courseStructure.order.courseOrder': {
            $lte: this.courseStructure.order.courseOrder,
        },
    })

    return {
        currentPosition,
        totalResources,
        progressPercentage: (currentPosition / totalResources) * 100,
        previousResource,
        nextResource,
        chapterInfo: {
            number: this.courseStructure.chapter.number,
            title: this.courseStructure.chapter.title,
            level: this.courseStructure.chapter.level,
        },
    }
}

// 复制资源到新的课程/章节
resourceSchema.methods.copyToChapter = async function (
    targetCourseId,
    chapterInfo,
    orderInfo,
    userId
) {
    const Resource = this.constructor

    const resourceData = this.toObject()
    delete resourceData._id
    delete resourceData.createdAt
    delete resourceData.updatedAt
    delete resourceData.__v

    // 更新课程结构信息
    resourceData.courseStructure.parentCourse = targetCourseId
    resourceData.courseStructure.chapter = {
        ...resourceData.courseStructure.chapter,
        ...chapterInfo,
    }
    resourceData.courseStructure.order = {
        ...resourceData.courseStructure.order,
        ...orderInfo,
    }
    resourceData.courseStructure.completion = {
        isCompleted: false,
        completedBy: [],
    }

    // 更新创建者和时间
    resourceData.createdBy = userId
    resourceData.createdAt = Date.now()
    resourceData.updatedAt = Date.now()

    // 重置统计数据
    resourceData.stats = {
        views: 0,
        downloads: 0,
        shares: 0,
        favorites: 0,
        upvotes: 0,
    }

    const newResource = new Resource(resourceData)
    await newResource.save()

    return newResource
}

// 课程章节相关的静态方法
// 根据课程ID获取所有章节资源，按顺序排列
resourceSchema.statics.findByCourse = async function (courseId, options = {}) {
    const { includeOptional = true, userId = null } = options

    const query = {
        'courseStructure.parentCourse': courseId,
        'access.isPublic': true,
    }

    if (!includeOptional) {
        query['courseStructure.learningPath.isRequired'] = true
    }

    const resources = await this.find(query)
        .sort({
            'courseStructure.order.courseOrder': 1,
            'courseStructure.chapter.number': 1,
            'courseStructure.order.chapterOrder': 1,
        })
        .populate('createdBy', 'name avatar')
        .populate('courseStructure.parentCourse', 'title')
        .populate('courseStructure.learningPath.prerequisites', 'title')

    // 如果提供了用户ID，添加完成状态信息
    if (userId) {
        return resources.map((resource) => {
            const completion =
                resource.courseStructure.completion.completedBy.find(
                    (c) => c.user.toString() === userId.toString()
                )
            return {
                ...resource.toObject(),
                userCompletion: completion || {
                    progress: 0,
                    isCompleted: false,
                },
            }
        })
    }

    return resources
}

// 根据章节号获取资源
resourceSchema.statics.findByChapter = async function (
    courseId,
    chapterNumber,
    options = {}
) {
    const { level = 1, sortBy = 'order' } = options

    let sortOptions = {}
    switch (sortBy) {
        case 'title':
            sortOptions = { title: 1 }
            break
        case 'difficulty':
            sortOptions = { difficulty: 1 }
            break
        case 'created':
            sortOptions = { createdAt: -1 }
            break
        default:
            sortOptions = { 'courseStructure.order.chapterOrder': 1 }
    }

    return this.find({
        'courseStructure.parentCourse': courseId,
        'courseStructure.chapter.number': chapterNumber,
        'courseStructure.chapter.level': level,
        'access.isPublic': true,
    })
        .sort(sortOptions)
        .populate('createdBy', 'name avatar')
        .populate('courseStructure.learningPath.prerequisites', 'title')
}

// 获取课程的章节目录结构
resourceSchema.statics.getCourseStructure = async function (courseId) {
    const resources = await this.find({
        'courseStructure.parentCourse': courseId,
        'access.isPublic': true,
    })
        .select('title courseStructure pedagogicalType format stats difficulty')
        .sort({
            'courseStructure.chapter.number': 1,
            'courseStructure.chapter.level': 1,
            'courseStructure.order.chapterOrder': 1,
        })

    // 构建层级结构
    const chapters = {}
    resources.forEach((resource) => {
        const chapterNum = resource.courseStructure.chapter.number
        const level = resource.courseStructure.chapter.level

        if (!chapters[chapterNum]) {
            chapters[chapterNum] = {
                number: chapterNum,
                title: resource.courseStructure.chapter.title,
                subtitle: resource.courseStructure.chapter.subtitle,
                resources: [],
                subChapters: {},
            }
        }

        if (level === 1) {
            chapters[chapterNum].resources.push(resource)
        } else {
            const parentChapter =
                resource.courseStructure.chapter.parentChapter || chapterNum
            if (!chapters[parentChapter].subChapters[chapterNum]) {
                chapters[parentChapter].subChapters[chapterNum] = {
                    number: chapterNum,
                    title: resource.courseStructure.chapter.title,
                    subtitle: resource.courseStructure.chapter.subtitle,
                    resources: [],
                }
            }
            chapters[parentChapter].subChapters[chapterNum].resources.push(
                resource
            )
        }
    })

    return Object.values(chapters).sort((a, b) => a.number - b.number)
}

// 获取学习路径中的下一个资源
resourceSchema.statics.getNextResource = async function (
    currentResourceId,
    userId = null
) {
    const currentResource = await this.findById(currentResourceId)
    if (!currentResource || !currentResource.courseStructure.parentCourse) {
        return null
    }

    const nextResource = await this.findOne({
        'courseStructure.parentCourse':
            currentResource.courseStructure.parentCourse,
        'courseStructure.order.courseOrder': {
            $gt: currentResource.courseStructure.order.courseOrder,
        },
        'access.isPublic': true,
    })
        .sort({ 'courseStructure.order.courseOrder': 1 })
        .populate('createdBy', 'name avatar')

    // 检查前置条件是否满足
    if (
        nextResource &&
        nextResource.courseStructure.learningPath.prerequisites.length > 0
    ) {
        if (userId) {
            const completedPrerequisites = await this.find({
                _id: {
                    $in: nextResource.courseStructure.learningPath
                        .prerequisites,
                },
                'courseStructure.completion.completedBy.user': userId,
            })

            if (
                completedPrerequisites.length !==
                nextResource.courseStructure.learningPath.prerequisites.length
            ) {
                return {
                    resource: nextResource,
                    canAccess: false,
                    missingPrerequisites:
                        nextResource.courseStructure.learningPath.prerequisites
                            .length - completedPrerequisites.length,
                }
            }
        }
    }

    return {
        resource: nextResource,
        canAccess: true,
        missingPrerequisites: 0,
    }
}

// 获取学习进度统计
resourceSchema.statics.getCourseProgress = async function (courseId, userId) {
    const totalResources = await this.countDocuments({
        'courseStructure.parentCourse': courseId,
        'courseStructure.learningPath.isRequired': true,
        'access.isPublic': true,
    })

    const completedResources = await this.countDocuments({
        'courseStructure.parentCourse': courseId,
        'courseStructure.learningPath.isRequired': true,
        'courseStructure.completion.completedBy.user': userId,
        'access.isPublic': true,
    })

    const progressByChapter = await this.aggregate([
        {
            $match: {
                'courseStructure.parentCourse': new mongoose.Types.ObjectId(
                    courseId
                ),
                'courseStructure.learningPath.isRequired': true,
                'access.isPublic': true,
            },
        },
        {
            $group: {
                _id: '$courseStructure.chapter.number',
                chapterTitle: { $first: '$courseStructure.chapter.title' },
                totalResources: { $sum: 1 },
                completedResources: {
                    $sum: {
                        $cond: [
                            {
                                $in: [
                                    new mongoose.Types.ObjectId(userId),
                                    '$courseStructure.completion.completedBy.user',
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
        {
            $addFields: {
                progressPercentage: {
                    $multiply: [
                        { $divide: ['$completedResources', '$totalResources'] },
                        100,
                    ],
                },
            },
        },
        { $sort: { _id: 1 } },
    ])

    return {
        overall: {
            totalResources,
            completedResources,
            progressPercentage:
                totalResources > 0
                    ? (completedResources / totalResources) * 100
                    : 0,
        },
        byChapter: progressByChapter,
    }
}

const Resource = mongoose.model('Resource', resourceSchema)

export default Resource
