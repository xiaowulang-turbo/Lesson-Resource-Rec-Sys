import User from '../models/userModel.js'
import Account from '../models/accountModel.js'
import Resource from '../models/resourceModel.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

export class DataService {
    // 用户相关方法
    async createUser(userData) {
        const user = await User.create(userData)
        return {
            id: user._id,
            name: user.name,
            preferred_subjects: user.preferred_subjects || [],
            preferred_difficulty: user.preferred_difficulty,
            preferred_resource_types: user.preferred_resource_types || [],
            interests: user.interests || [],
            course_interactions: user.course_interactions || [],
            accountId: user.accountId,
        }
    }

    async getUserById(id) {
        try {
            const user = await User.findById(id).populate('account')
            if (!user) return null

            // 从关联的account获取基本信息
            const account = user.account || {}

            // 同时检查扁平结构和嵌套结构，优先使用扁平结构（来自JSON导入的数据）
            const preferredSubjects =
                user.preferred_subjects ||
                user.preferences?.preferredSubjects ||
                []
            const preferredResourceTypes = user.preferred_resource_types || []
            const interests = user.interests || []
            const courseInteractions = user.course_interactions || []
            const preferredDifficulty =
                user.preferred_difficulty ||
                user.preferences?.preferredDifficulty

            return {
                id: user._id,
                name: user.name || account.name,
                email: account.email,
                role: account.role,
                preferred_subjects: preferredSubjects,
                preferred_difficulty: preferredDifficulty,
                preferred_resource_types: preferredResourceTypes,
                interests: interests,
                course_interactions: courseInteractions,
                // 仍然保留原始字段，以便其他地方使用
                preferences: user.preferences,
                accountId: user.accountId,
            }
        } catch (error) {
            console.error('获取用户失败:', error)
            return null
        }
    }

    async getUserByEmail(email) {
        try {
            // 先通过email查找账户
            const account = await Account.findOne({ email }).select('+password')
            if (!account) {
                console.log(`未找到邮箱为 ${email} 的账户`)
                throw new Error('邮箱或密码错误')
            }

            // 通过accountId查找关联的用户信息
            const user = await User.findOne({ accountId: account._id })
            if (!user) {
                console.log(`找到了账户(${account._id})但未找到关联的用户信息`)
                throw new Error('用户数据不完整，请联系管理员')
            }

            // 合并用户和账户信息
            return {
                id: user._id,
                accountId: account._id,
                name: user.name || account.name,
                email: account.email,
                password: account.password,
                role: account.role,
                preferred_subjects: user.preferred_subjects || [],
                preferred_difficulty: user.preferred_difficulty,
                preferred_resource_types: user.preferred_resource_types || [],
                interests: user.interests || [],
                course_interactions: user.course_interactions || [],
                preferences: user.preferences,
            }
        } catch (error) {
            console.error('通过邮箱获取用户失败:', error)
            throw error // 抛出错误让控制器捕获并处理
        }
    }

    async updateUser(id, userData) {
        try {
            const user = await User.findByIdAndUpdate(id, userData, {
                new: true,
                runValidators: true,
            }).populate('account')

            if (!user) return null

            const account = user.account || {}

            return {
                id: user._id,
                name: user.name || account.name,
                preferred_subjects: user.preferred_subjects || [],
                preferred_difficulty: user.preferred_difficulty,
                preferred_resource_types: user.preferred_resource_types || [],
                interests: user.interests || [],
                course_interactions: user.course_interactions || [],
                preferences: user.preferences,
                accountId: user.accountId,
            }
        } catch (error) {
            console.error('更新用户失败:', error)
            return null
        }
    }

    async deleteUser(id) {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // 获取用户信息，包括关联的账户ID
            const user = await User.findById(id)
            if (!user) {
                await session.abortTransaction()
                session.endSession()
                return false
            }

            // 删除用户
            await User.findByIdAndDelete(id).session(session)

            // 如果有关联的账户，也删除账户
            if (user.accountId) {
                await Account.findByIdAndDelete(user.accountId).session(session)
            }

            await session.commitTransaction()
            session.endSession()
            return true
        } catch (error) {
            await session.abortTransaction()
            session.endSession()
            console.error('删除用户失败:', error)
            return false
        }
    }

    // 账户相关方法
    async createAccount(accountData) {
        try {
            const account = await Account.create(accountData)
            return {
                id: account._id,
                name: account.name,
                email: account.email,
                role: account.role,
            }
        } catch (error) {
            console.error('创建账户失败:', error)
            throw new Error('创建账户失败: ' + error.message)
        }
    }

    async getAccountById(id) {
        try {
            const account = await Account.findById(id)
            if (!account) return null

            return {
                id: account._id,
                name: account.name,
                email: account.email,
                role: account.role,
                avatar: account.avatar,
                lastLogin: account.lastLogin,
            }
        } catch (error) {
            console.error('获取账户失败:', error)
            return null
        }
    }

    async getAccountByEmail(email) {
        try {
            const account = await Account.findOne({ email })
            if (!account) return null

            return {
                id: account._id,
                name: account.name,
                email: account.email,
                role: account.role,
                avatar: account.avatar,
                lastLogin: account.lastLogin,
            }
        } catch (error) {
            console.error('通过邮箱获取账户失败:', error)
            return null
        }
    }

    async updateAccount(id, accountData) {
        try {
            // 不允许直接更新密码
            if (accountData.password) {
                delete accountData.password
            }

            const account = await Account.findByIdAndUpdate(id, accountData, {
                new: true,
                runValidators: true,
            })

            if (!account) return null

            return {
                id: account._id,
                name: account.name,
                email: account.email,
                role: account.role,
                avatar: account.avatar,
                lastLogin: account.lastLogin,
            }
        } catch (error) {
            console.error('更新账户失败:', error)
            return null
        }
    }

    async deleteAccount(id) {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // 获取账户信息
            const account = await Account.findById(id)
            if (!account) {
                await session.abortTransaction()
                session.endSession()
                return false
            }

            // 删除账户
            await Account.findByIdAndDelete(id).session(session)

            // 删除关联的用户
            await User.findOneAndDelete({ accountId: id }).session(session)

            await session.commitTransaction()
            session.endSession()
            return true
        } catch (error) {
            await session.abortTransaction()
            session.endSession()
            console.error('删除账户失败:', error)
            return false
        }
    }

    async createUserWithAccount(userData, accountData) {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // 创建账户
            const hashedPassword = await bcrypt.hash(accountData.password, 12)
            const account = await Account.create(
                [
                    {
                        ...accountData,
                        password: hashedPassword,
                    },
                ],
                { session }
            )

            // 创建用户，关联到账户
            const user = await User.create(
                [
                    {
                        ...userData,
                        accountId: account[0]._id,
                        name: accountData.name, // 初始时复制账户名称
                    },
                ],
                { session }
            )

            await session.commitTransaction()
            session.endSession()

            return {
                user: {
                    id: user[0]._id,
                    name: user[0].name,
                    preferred_subjects: user[0].preferred_subjects || [],
                    preferred_difficulty: user[0].preferred_difficulty,
                    preferred_resource_types:
                        user[0].preferred_resource_types || [],
                    interests: user[0].interests || [],
                },
                account: {
                    id: account[0]._id,
                    email: account[0].email,
                    name: account[0].name,
                    role: account[0].role,
                },
            }
        } catch (error) {
            await session.abortTransaction()
            session.endSession()
            console.error('创建用户和账户失败:', error)
            throw new Error('创建用户和账户失败: ' + error.message)
        }
    }

    // 资源相关
    async createResource(resourceData) {
        // 确保标签是字符串数组
        if (
            resourceData.tags &&
            !Array.isArray(resourceData.tags) &&
            typeof resourceData.tags === 'string'
        ) {
            resourceData.tags = resourceData.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
        }

        const resource = await Resource.create(resourceData)
        return {
            id: resource._id,
            title: resource.title,
            description: resource.description,
            type: resource.type,
            subject: resource.subject,
            grade: resource.grade,
            difficulty: resource.difficulty,
            url: resource.url,
            createdBy: resource.createdBy,
            tags: resource.tags,
            ratings: resource.ratings,
            averageRating: resource.averageRating,
        }
    }

    async getResourceById(id) {
        const resource = await Resource.findById(id).populate(
            'createdBy',
            'name email'
        )
        if (!resource) return null
        return {
            id: resource._id,
            title: resource.title,
            description: resource.description,
            type: resource.type,
            subject: resource.subject,
            grade: resource.grade,
            difficulty: resource.difficulty,
            url: resource.url,
            createdBy: resource.createdBy,
            tags: resource.tags,
            ratings: resource.ratings,
            averageRating: resource.averageRating,
        }
    }

    async getAllResources(filters = {}) {
        try {
            // 提取分页参数
            const page = filters.page ? parseInt(filters.page) : 1
            const limit = filters.limit ? parseInt(filters.limit) : 10
            const skip = (page - 1) * limit

            // 提取除分页参数外的其他过滤条件
            const otherFilters = { ...filters } // 复制 filters 对象
            delete otherFilters.page // 删除 page 属性
            delete otherFilters.limit // 删除 limit 属性

            // 构建查询，计算总记录数
            const query = Resource.find(otherFilters)
            const total = await Resource.countDocuments(otherFilters)

            // 应用分页并关联创建者
            const resources = await query
                .populate('createdBy', 'name email')
                .skip(skip)
                .limit(limit)

            // 返回资源数组和分页信息
            return {
                resources: resources.map((resource) => ({
                    id: resource._id,
                    title: resource.title,
                    description: resource.description,
                    type: resource.type,
                    subject: resource.subject,
                    grade: resource.grade,
                    difficulty: resource.difficulty,
                    url: resource.url,
                    createdBy: resource.createdBy,
                    tags: resource.tags,
                    ratings: resource.ratings,
                    averageRating: resource.averageRating,
                    cover: resource.cover,
                    price: resource.price,
                    originalPrice: resource.originalPrice,
                    authors: resource.authors,
                    publisher: resource.publisher,
                    enrollCount: resource.enrollCount,
                    studyAvatars: resource.studyAvatars,
                    createdAt: resource.createdAt,
                    updatedAt: resource.updatedAt,
                })),
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            }
        } catch (error) {
            console.error('获取资源列表失败:', error)
            throw new Error('获取资源列表失败')
        }
    }

    async updateResource(id, resourceData) {
        // 确保标签是字符串数组
        if (
            resourceData.tags &&
            !Array.isArray(resourceData.tags) &&
            typeof resourceData.tags === 'string'
        ) {
            resourceData.tags = resourceData.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
        }

        const resource = await Resource.findByIdAndUpdate(id, resourceData, {
            new: true,
            runValidators: true,
        }).populate('createdBy', 'name email')
        if (!resource) return null
        return {
            id: resource._id,
            title: resource.title,
            description: resource.description,
            type: resource.type,
            subject: resource.subject,
            grade: resource.grade,
            difficulty: resource.difficulty,
            url: resource.url,
            createdBy: resource.createdBy,
            tags: resource.tags,
            ratings: resource.ratings,
            averageRating: resource.averageRating,
        }
    }

    async deleteResource(id) {
        const resource = await Resource.findByIdAndDelete(id)
        return !!resource
    }

    async addResourceRating(resourceId, ratingData) {
        const resource = await Resource.findById(resourceId)
        if (!resource) return null

        resource.ratings.push(ratingData)
        await resource.save()

        return {
            id: resource._id,
            ratings: resource.ratings,
            averageRating: resource.averageRating,
        }
    }

    // 认证相关方法
    async validateCredentials(email, password) {
        try {
            const account = await Account.findOne({ email }).select('+password')
            if (!account) {
                console.log(`未找到邮箱为 ${email} 的账户`)
                return false
            }

            // 验证密码
            const isValid = await bcrypt.compare(password, account.password)
            return isValid
        } catch (error) {
            console.error('验证凭据失败:', error)
            return false
        }
    }

    async generateAuthToken(userId) {
        // 查找用户
        const user = await User.findById(userId).populate({
            path: 'account',
            select: 'email role',
        })

        if (!user) {
            throw new Error('用户不存在')
        }

        // 获取关联的账户信息
        const account = await Account.findById(user.accountId)
        if (!account) {
            throw new Error('账户不存在')
        }

        // 创建token
        const token = jwt.sign(
            {
                id: user._id,
                accountId: account._id,
                email: account.email,
                role: account.role,
            },
            process.env.JWT_SECRET || 'your-secret-key',
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '90d',
            }
        )

        // 更新账户最后登录时间
        await Account.findByIdAndUpdate(account._id, {
            lastLogin: Date.now(),
        })

        return token
    }

    async verifyAuthToken(token) {
        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your-secret-key'
            )

            // 检查密码是否在签发token后更改
            const account = await Account.findById(decoded.accountId)
            if (!account) return null

            // 如果密码在token签发后更改，则token无效
            if (account.passwordChangedAt) {
                const changedTimestamp = parseInt(
                    account.passwordChangedAt.getTime() / 1000,
                    10
                )
                if (decoded.iat < changedTimestamp) {
                    return null
                }
            }

            return decoded
        } catch (error) {
            console.error('验证token失败:', error)
            return null
        }
    }
}
