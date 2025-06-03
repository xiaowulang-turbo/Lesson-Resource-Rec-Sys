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
            favoriteResources: user.favoriteResources,
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
                avatar: user.avatar,
                role: account.role,
                preferred_subjects: preferredSubjects,
                preferred_difficulty: preferredDifficulty,
                preferred_resource_types: preferredResourceTypes,
                interests: interests,
                course_interactions: courseInteractions,
                // 仍然保留原始字段，以便其他地方使用
                preferences: user.preferences,
                accountId: user.accountId,
                favoriteResources: user.favoriteResources,
            }
        } catch (error) {
            console.error('获取用户失败:', error)
            return null
        }
    }

    async getAllUsers() {
        try {
            // 获取所有账户信息
            const accounts = await Account.find().lean() // 使用 lean() 获取普通 JS 对象
            // 获取所有用户信息
            const users = await User.find().lean()

            // 创建 accountId 到 account 的映射
            const accountMap = new Map()
            accounts.forEach((acc) => accountMap.set(acc._id.toString(), acc))

            // 合并用户信息和账户信息
            const combinedUsers = users.map((user) => {
                const account = user.accountId
                    ? accountMap.get(user.accountId.toString())
                    : {}
                return {
                    _id: user._id, // 保留 user 的 _id 作为主键
                    name: user.name || account?.name || '未知',
                    email: account?.email || '未知',
                    role: account?.role || 'user',
                    photo: user.avatar || account?.avatar, // 优先用 user.avatar
                    createdAt: account?.createdAt || user.createdAt, // 使用 account 的注册时间
                    // 可以根据需要添加其他字段
                }
            })

            return combinedUsers
        } catch (error) {
            console.error('获取所有用户失败:', error)
            throw new Error('无法获取用户列表: ' + error.message)
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
            // 如果包含MongoDB操作符，直接透传
            if (Object.keys(userData).some((key) => key.startsWith('$'))) {
                const user = await User.findByIdAndUpdate(id, userData, {
                    new: true,
                    runValidators: true,
                }).populate('account')
                if (!user) return null
                const account = user.account || {}
                return {
                    id: user._id,
                    name: user.name || account.name,
                    email: account.email || '',
                    phone: user.phone || '',
                    avatar: user.avatar || null,
                    subject: user.preferences?.preferredSubjects?.[0] || '',
                    grade: user.preferences?.preferredGrades?.[0] || '',
                    experience: user.experience || '',
                    bio: user.bio || '',
                    preferred_subjects: user.preferred_subjects || [],
                    preferred_difficulty: user.preferred_difficulty,
                    preferred_resource_types:
                        user.preferred_resource_types || [],
                    interests: user.interests || [],
                    course_interactions: user.course_interactions || [],
                    preferences: user.preferences,
                    accountId: user.accountId,
                    favoriteResources: user.favoriteResources,
                }
            }
            // 过滤掉不需要的字段，防止用户更新敏感信息
            const allowedFields = [
                'name',
                'phone',
                'subject',
                'grade',
                'experience',
                'bio',
                'preferred_subjects',
                'preferences',
                'avatar',
                'interests',
                'favoriteResources',
            ]

            const filteredData = {}
            Object.keys(userData).forEach((key) => {
                if (allowedFields.includes(key)) {
                    filteredData[key] = userData[key]
                }
            })

            // 处理前端传过来的分散字段，映射到数据库结构
            if (userData.fullName) {
                filteredData.name = userData.fullName
            }

            if (userData.subject) {
                if (!filteredData.preferences) filteredData.preferences = {}
                filteredData.preferences.preferredSubjects = [userData.subject]
            }

            if (userData.grade) {
                if (!filteredData.preferences) filteredData.preferences = {}
                filteredData.preferences.preferredGrades = [userData.grade]
            }

            // 确保interests是一个数组
            if (userData.interests && !Array.isArray(userData.interests)) {
                filteredData.interests = [userData.interests]
            }

            // console.log('更新用户前的数据:', filteredData)

            const user = await User.findByIdAndUpdate(id, filteredData, {
                new: true,
                runValidators: true,
            }).populate('account')

            if (!user) return null

            const account = user.account || {}

            // 返回更新后的用户信息
            return {
                id: user._id,
                name: user.name || account.name,
                email: account.email || '',
                phone: user.phone || '',
                avatar: user.avatar || null,
                subject: user.preferences?.preferredSubjects?.[0] || '',
                grade: user.preferences?.preferredGrades?.[0] || '',
                experience: user.experience || '',
                bio: user.bio || '',
                preferred_subjects: user.preferred_subjects || [],
                preferred_difficulty: user.preferred_difficulty,
                preferred_resource_types: user.preferred_resource_types || [],
                interests: user.interests || [],
                course_interactions: user.course_interactions || [],
                preferences: user.preferences,
                accountId: user.accountId,
                favoriteResources: user.favoriteResources,
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
        try {
            console.log(`正在获取资源ID: ${id}`)

            // 验证ID格式是否有效
            if (!mongoose.Types.ObjectId.isValid(id)) {
                console.error(`无效的资源ID格式: ${id}`)
                return null
            }

            const resource = await Resource.findById(id).lean()

            if (!resource) {
                console.log(`未找到ID为 ${id} 的资源`)
                return null
            }

            console.log(`成功获取资源: "${resource.title}"`)
            return resource
        } catch (error) {
            console.error(`获取资源(ID: ${id})失败:`, error)
            return null
        }
    }

    // 获取用户上传的资源
    async getUserUploadedResources(userId, options = {}) {
        try {
            console.log(
                `正在获取用户(ID: ${userId})上传的资源，选项:`,
                JSON.stringify(options)
            )

            // 验证ID格式是否有效
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                console.error(`无效的用户ID格式: ${userId}`)
                return { resources: [], total: 0 }
            }

            // 构建查询条件
            const query = { createdBy: userId }

            // 添加可选过滤条件
            if (options.type) {
                query.type = options.type
            }
            if (options.subject) {
                query.subject = options.subject
            }
            if (options.format) {
                query.format = options.format
            }

            // 构建排序选项
            let sortOption = {}
            if (options.sortBy) {
                if (options.sortBy === 'newest') {
                    sortOption = { createdAt: -1 }
                } else if (options.sortBy === 'oldest') {
                    sortOption = { createdAt: 1 }
                } else if (options.sortBy === 'popularity') {
                    sortOption = { 'stats.views': -1 }
                } else if (options.sortBy === 'title') {
                    sortOption = { title: 1 }
                }
            } else {
                // 默认按最新创建时间排序
                sortOption = { createdAt: -1 }
            }

            // 设置分页
            const page = parseInt(options.page) || 1
            const limit = parseInt(options.limit) || 20
            const skip = (page - 1) * limit

            // 执行查询
            const resources = await Resource.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .lean()

            // 获取总数
            const total = await Resource.countDocuments(query)

            console.log(
                `查询到用户(ID: ${userId})上传的 ${resources.length} 个资源，总共有 ${total} 个匹配资源`
            )

            return { resources, total }
        } catch (error) {
            console.error(`获取用户(ID: ${userId})上传的资源失败:`, error)
            return { resources: [], total: 0 }
        }
    }

    async getAllResources(filters = {}) {
        try {
            console.log('正在获取所有资源，过滤条件:', JSON.stringify(filters))

            const query = {}

            // 应用过滤条件
            if (filters.subject) {
                query.subject = filters.subject
            }

            if (filters.grade) {
                query.grade = filters.grade
            }

            if (filters.difficulty) {
                query.difficulty = parseInt(filters.difficulty)
            }

            if (filters.format) {
                query.format = filters.format
            }

            if (filters.pedagogicalType) {
                query.pedagogicalType = filters.pedagogicalType
            }

            if (filters.price === 'free') {
                query.price = 0
            } else if (filters.price === 'paid') {
                query.price = { $gt: 0 }
            }

            if (filters.search) {
                query.$or = [
                    { title: { $regex: filters.search, $options: 'i' } },
                    { description: { $regex: filters.search, $options: 'i' } },
                    { tags: { $regex: filters.search, $options: 'i' } },
                ]
            }

            // 当在getSimilarResources中使用时，不应用任何过滤条件，获取所有资源
            if (filters.forSimilarResources) {
                console.log('为相似资源推荐获取所有资源，不应用过滤条件')
                // 清空所有过滤条件
                Object.keys(query).forEach((key) => delete query[key])
            }

            // 构建排序选项
            let sortOption = {}
            if (filters.sortBy) {
                if (filters.sortBy === 'newest') {
                    sortOption = { createdAt: -1 }
                } else if (filters.sortBy === 'popularity') {
                    sortOption = { enrollCount: -1 }
                } else if (filters.sortBy === 'rating') {
                    sortOption = { 'stats.rating': -1 }
                }
            } else {
                // 默认排序
                sortOption = { createdAt: -1 }
            }

            // 设置分页 - 在获取相似资源时禁用分页
            let page = parseInt(filters.page) || 1
            let limit = parseInt(filters.limit) || 20

            if (filters.forSimilarResources) {
                // 相似资源不应用分页，确保获取所有资源
                page = 1
                limit = 0 // 0表示无限制
            }

            const skip = (page - 1) * limit

            // 执行查询
            let resourcesQuery = Resource.find(query)
                .sort(sortOption)
                .populate({
                    path: 'courseStructure.parentCourse',
                    select: 'title _id',
                    model: 'Resource',
                })

            // 只在需要分页时应用skip和limit
            if (limit > 0) {
                resourcesQuery = resourcesQuery.skip(skip).limit(limit)
            }

            const resources = await resourcesQuery.lean()

            // 获取总数
            const total = await Resource.countDocuments(query)

            console.log(
                `查询到 ${resources.length} 个资源，总共有 ${total} 个匹配资源`
            )

            return { resources, total }
        } catch (error) {
            console.error('获取所有资源失败:', error)
            return []
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

    // 新增：批量删除资源
    async deleteMultipleResources(resourceIds) {
        try {
            // 使用 deleteMany 进行批量删除
            const result = await Resource.deleteMany({
                _id: { $in: resourceIds },
            })

            return {
                deletedCount: result.deletedCount,
                acknowledged: result.acknowledged,
            }
        } catch (error) {
            console.error('批量删除资源失败:', error)
            throw new Error('批量删除资源时发生错误')
        }
    }

    // 更新资源统计信息
    async incrementResourceStat(resourceId, statName, incrementValue) {
        try {
            const validStats = [
                'views',
                'downloads',
                'shares',
                'favorites',
                'upvotes',
            ]
            if (!validStats.includes(statName)) {
                throw new Error(`无效的统计字段: ${statName}`)
            }

            const update = { $inc: {} }
            update.$inc[`stats.${statName}`] = incrementValue

            const resource = await Resource.findByIdAndUpdate(
                resourceId,
                update,
                {
                    new: true,
                }
            )

            if (!resource) {
                console.warn(`尝试更新不存在的资源统计: ${resourceId}`)
                return null
            }
            return resource.stats
        } catch (error) {
            console.error(
                `更新资源统计 (${statName}) 失败 for ${resourceId}:`,
                error
            )
            throw error
        }
    }

    // 添加资源评分
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
            if (!token) {
                console.log('无效的令牌：token为空')
                return null
            }

            // 打印收到的token前几位，便于调试
            console.log(`验证令牌: ${token.substring(0, 10)}...`)

            // 从.env获取JWT_SECRET，如果未定义则使用默认值
            const JWT_SECRET =
                process.env.JWT_SECRET || 'your-default-secret-key-for-jwt'

            const decoded = jwt.verify(token, JWT_SECRET)

            // 验证通过，打印解码后的信息(去除敏感数据)
            // console.log('令牌解码成功:', {
            //     id: decoded.id,
            //     iat: decoded.iat,
            //     exp: decoded.exp,
            // })

            // 检查令牌是否过期
            const now = Math.floor(Date.now() / 1000)
            if (decoded.exp && decoded.exp < now) {
                console.log('令牌已过期')
                return null
            }

            return decoded
        } catch (error) {
            console.error('验证令牌失败:', error.message)
            return null
        }
    }

    async getResourceRelationships() {
        try {
            // 如果有ResourceRelationship模型，则从数据库中获取数据
            if (mongoose.models.ResourceRelationship) {
                const ResourceRelationship =
                    mongoose.models.ResourceRelationship
                const relationships = await ResourceRelationship.find()
                return relationships.map((rel) => ({
                    resource_id: rel.resource_id.toString(),
                    resource_title: rel.resource_title,
                    similar_resources: rel.similar_resources || [],
                    co_accessed_with: rel.co_accessed_with || [],
                    recommended_sequence: rel.recommended_sequence || [],
                }))
            } else {
                // 如果没有模型，则从JSON文件中读取数据
                const path = await import('path')
                const fs = await import('fs/promises')
                const { fileURLToPath } = await import('url')

                const __filename = fileURLToPath(import.meta.url)
                const __dirname = path.dirname(__filename)
                const filePath = path.join(
                    __dirname,
                    '../data/resource_relationships.json'
                )

                try {
                    const data = await fs.readFile(filePath, 'utf8')
                    return JSON.parse(data)
                } catch (fileError) {
                    console.error('从文件读取资源关系数据失败:', fileError)
                    // 返回空数组作为后备
                    return []
                }
            }
        } catch (error) {
            console.error('获取资源关系数据失败:', error)
            return []
        }
    }
}
