import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import validator from 'validator'

/**
 * 账户模型 - 存储用户认证和基本账户信息
 * 与用户偏好和其他信息分离，提高安全性和可维护性
 */
const accountSchema = new mongoose.Schema(
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
        avatar: {
            type: String,
            default: 'default.jpg',
        },
        active: {
            type: Boolean,
            default: true,
            select: false,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        passwordChangedAt: {
            type: Date,
            default: null,
        },
        passwordResetToken: String,
        passwordResetExpires: Date,
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

// 密码加密中间件
accountSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)

    if (this.isModified('password') && !this.isNew) {
        this.passwordChangedAt = Date.now() - 1000 // 减去1秒是为了确保JWT的时间戳晚于密码更改时间
    }

    next()
})

// 更新时间中间件
accountSchema.pre('save', function (next) {
    this.updatedAt = Date.now()
    next()
})

// 验证密码方法
accountSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

// 检查用户是否为教师或管理员
accountSchema.methods.isTeacher = function () {
    return this.role === 'teacher'
}

accountSchema.methods.isAdmin = function () {
    return this.role === 'admin'
}

// 检查密码是否在指定日期之后更改
accountSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        )
        return JWTTimestamp < changedTimestamp
    }
    return false
}

// 生成密码重置令牌
accountSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    // 设置令牌过期时间为10分钟
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return resetToken
}

// 虚拟字段：获取关联的用户信息
accountSchema.virtual('user', {
    ref: 'User',
    localField: '_id',
    foreignField: 'accountId',
    justOne: true,
})

// 添加索引
accountSchema.index({ email: 1 }, { unique: true })
accountSchema.index({ role: 1 })

const Account = mongoose.model('Account', accountSchema)

export default Account
