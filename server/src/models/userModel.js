import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import validator from 'validator'

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, '请提供邮箱'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, '请提供有效的邮箱地址'],
        },
        password: {
            type: String,
            required: [true, '请提供密码'],
            minlength: 8,
            select: false,
        },
        name: {
            type: String,
            required: [true, '请提供姓名'],
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'teacher'],
            default: 'user',
        },
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
        avatar: {
            type: String,
            default: 'default.jpg',
        },
        active: {
            type: Boolean,
            default: true,
            select: false,
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

// 密码加密中间件
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

// 更新时间中间件
userSchema.pre('save', function (next) {
    this.updatedAt = Date.now()
    next()
})

// 验证密码方法
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

// 检查用户是否为教师
userSchema.methods.isTeacher = function () {
    return this.role === 'teacher'
}

// 更新用户统计信息的方法
userSchema.methods.updateStats = async function () {
    // 这里可以添加更新用户统计信息的逻辑
    this.stats.lastActive = Date.now()
    await this.save()
}

// 添加索引
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ 'teacherProfile.subjects': 1 })
userSchema.index({ 'teacherProfile.grades': 1 })
userSchema.index({ 'stats.lastActive': -1 })

// 添加新的静态方法
userSchema.statics.findTeachers = async function (query = {}) {
    return this.find({
        role: 'teacher',
        ...query,
    })
        .select('-password')
        .sort({ 'stats.averageRating': -1 })
}

userSchema.statics.findBySubjects = async function (subjects) {
    return this.find({
        role: 'teacher',
        'teacherProfile.subjects': { $in: subjects },
    }).select('-password')
}

userSchema.statics.findActiveTeachers = async function (days = 30) {
    const date = new Date()
    date.setDate(date.getDate() - days)

    return this.find({
        role: 'teacher',
        'stats.lastActive': { $gte: date },
    })
        .select('-password')
        .sort({ 'stats.lastActive': -1 })
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

    return this.find(query).select('-password')
}

// 添加新的实例方法
userSchema.methods.updateProfile = async function (profileData) {
    const allowedFields = ['name', 'avatar', 'teacherProfile', 'preferences']

    allowedFields.forEach((field) => {
        if (profileData[field]) {
            this[field] = profileData[field]
        }
    })

    await this.save()
}

userSchema.methods.updateTeacherProfile = async function (profileData) {
    if (this.role !== 'teacher') {
        throw new Error('只有教师可以更新教师资料')
    }

    Object.assign(this.teacherProfile, profileData)
    await this.save()
}

userSchema.methods.updatePreferences = async function (preferences) {
    Object.assign(this.preferences, preferences)
    await this.save()
}

const User = mongoose.model('User', userSchema)

export default User
