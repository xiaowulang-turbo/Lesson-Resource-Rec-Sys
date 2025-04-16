import { DataServiceInterface } from '../interfaces/DataServiceInterface.js'
import User from '../../models/userModel.js'
import Resource from '../../models/resourceModel.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export class MongoDBAdapter extends DataServiceInterface {
    constructor() {
        super()
    }

    // 用户相关
    async createUser(userData) {
        // 移除手动加密逻辑，直接将 userData 传递给 User.create
        // Mongoose 的 pre('save') 中间件会负责加密
        try {
            const user = await User.create(userData)
            return {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        } catch (error) {
            // 捕获并重新抛出 Mongoose 验证错误等
            console.error('Error creating user in adapter:', error)
            throw error // 将错误传递给控制器处理
        }
    }

    async getUserById(id) {
        const user = await User.findById(id)
        if (!user) return null
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
    }

    async getUserByEmail(email) {
        const user = await User.findOne({ email }).select('+password')
        if (!user) return null
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            password: user.password,
        }
    }

    async updateUser(id, userData) {
        const user = await User.findByIdAndUpdate(id, userData, {
            new: true,
            runValidators: true,
        })
        if (!user) return null
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
    }

    async deleteUser(id) {
        const user = await User.findByIdAndDelete(id)
        return !!user
    }

    // 资源相关
    async createResource(resourceData) {
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

    // 认证相关
    async validateCredentials(email, password) {
        const user = await this.getUserByEmail(email)
        if (!user) return false
        return await bcrypt.compare(password, user.password)
    }

    async generateAuthToken(userId) {
        return jwt.sign(
            { id: userId },
            process.env.JWT_SECRET || 'your-temp-secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '90d' }
        )
    }

    async verifyAuthToken(token) {
        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your-temp-secret'
            )
            return decoded
        } catch (error) {
            return null
        }
    }
}
