import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import validator from 'validator'

const userSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

// 密码加密中间件
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

// 验证密码方法
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

const User = mongoose.model('User', userSchema)

export default User
