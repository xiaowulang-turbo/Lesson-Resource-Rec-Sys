import mongoose from 'mongoose'

/**
 * 用户模型 - 存储用户偏好、统计和个人资料等信息
 * 账户信息（认证相关）已移至accountModel
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, '请提供姓名'],
        },
        // 添加扁平结构的字段以支持从JSON导入的数据
        preferred_subjects: [String],
        preferred_difficulty: Number,
        preferred_resource_types: [String],
        interests: [String],
        course_interactions: [
            {
                course_id: String,
                rating: Number,
                completion_percentage: Number,
                favorite: Boolean,
                date_completed: Date,
            },
        ],
        // 新增教师特定字段
        teacherProfile: {
            subjects: [
                {
                    type: String,
                    trim: true,
                },
            ],
            grades: [
                {
                    type: String,
                    trim: true,
                },
            ],
            yearsOfExperience: {
                type: Number,
                min: 0,
                default: 0,
            },
            certifications: [
                {
                    name: String,
                    issuer: String,
                    date: Date,
                },
            ],
            specialties: [
                {
                    type: String,
                    trim: true,
                },
            ],
            bio: {
                type: String,
                trim: true,
            },
        },
        // 用户偏好设置
        preferences: {
            preferredSubjects: [
                {
                    type: String,
                    trim: true,
                },
            ],
            preferredGrades: [
                {
                    type: String,
                    trim: true,
                },
            ],
            preferredDifficulty: {
                type: String,
                enum: ['初级', '中级', '高级'],
                default: '中级',
            },
            learningStyle: {
                type: String,
                enum: ['视觉型', '听觉型', '实践型'],
                default: '视觉型',
            },
        },
        // 用户统计
        stats: {
            totalResources: {
                type: Number,
                default: 0,
            },
            totalCourses: {
                type: Number,
                default: 0,
            },
            averageRating: {
                type: Number,
                default: 0,
            },
            lastActive: {
                type: Date,
                default: Date.now,
            },
        },
        favoriteResources: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Resource',
            },
        ],
        avatar: {
            type: String,
            default: 'default.jpg',
        },
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
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
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// 虚拟字段：计算用户的活跃度得分
userSchema.virtual('activityScore').get(function () {
    const now = new Date()
    const lastActiveTime = new Date(this.stats.lastActive)
    const daysSinceLastActive = (now - lastActiveTime) / (1000 * 60 * 60 * 24)

    return Math.max(0, 100 - daysSinceLastActive * 5) // 每天减5分，最低0分
})

// 更新时间中间件
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now()
    next()
})

// 更新用户统计信息的方法
userSchema.methods.updateStats = async function () {
    // 这里可以添加更新用户统计信息的逻辑
    this.stats.lastActive = Date.now()
    await this.save()
}

// 添加索引
userSchema.index({ accountId: 1 }, { unique: true })
userSchema.index({ 'teacherProfile.subjects': 1 })
userSchema.index({ 'teacherProfile.grades': 1 })
userSchema.index({ 'stats.lastActive': -1 })

// 虚拟填充账户信息
userSchema.virtual('account', {
    ref: 'Account',
    localField: 'accountId',
    foreignField: '_id',
    justOne: true,
})

// 添加新的静态方法
userSchema.statics.findTeachers = async function (query = {}) {
    const users = await this.find(query).populate({
        path: 'account',
        match: { role: 'teacher' },
        select: 'name email role',
    })

    // 过滤掉没有匹配account的用户
    return users.filter((user) => user.account)
}

userSchema.statics.findBySubjects = async function (subjects) {
    return this.find({
        'teacherProfile.subjects': { $in: subjects },
    }).populate({
        path: 'account',
        select: 'name email role',
    })
}

userSchema.statics.findActiveTeachers = async function (days = 30) {
    const date = new Date()
    date.setDate(date.getDate() - days)

    const users = await this.find({
        'stats.lastActive': { $gte: date },
    })
        .sort({ 'stats.lastActive': -1 })
        .populate({
            path: 'account',
            match: { role: 'teacher' },
            select: 'name email role',
        })

    // 过滤掉没有匹配account的用户
    return users.filter((user) => user.account)
}

userSchema.statics.findByPreferences = async function (preferences) {
    const query = {}

    if (preferences.subjects) {
        query['preferences.preferredSubjects'] = {
            $in: preferences.subjects,
        }
    }

    if (preferences.grades) {
        query['preferences.preferredGrades'] = {
            $in: preferences.grades,
        }
    }

    if (preferences.difficulty) {
        query['preferences.preferredDifficulty'] = preferences.difficulty
    }

    return this.find(query).populate({
        path: 'account',
        select: 'name email role',
    })
}

// 添加新的实例方法
userSchema.methods.updateProfile = async function (profileData) {
    // 更新用户个人资料的核心字段
    if (profileData.teacherProfile) {
        this.teacherProfile = {
            ...this.teacherProfile,
            ...profileData.teacherProfile,
        }
    }

    if (profileData.preferences) {
        this.preferences = {
            ...this.preferences,
            ...profileData.preferences,
        }
    }

    return this.save()
}

const User = mongoose.model('User', userSchema)

export default User
