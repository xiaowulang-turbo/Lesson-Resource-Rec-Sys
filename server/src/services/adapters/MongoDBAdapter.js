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
        // 如果密码已经是加密的，直接使用
        if (userData.password.startsWith('$2a$')) {
            const user = await User.create(userData)
            return {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        }

        // 如果密码是明文，先加密
        const salt = await bcrypt.genSalt(12)
        const hashedPassword = await bcrypt.hash(userData.password, salt)
        const user = await User.create({
            ...userData,
            password: hashedPassword,
        })
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
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
        const query = Resource.find(filters).populate('createdBy', 'name email')
        const resources = await query
        return resources.map((resource) => ({
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
        }))
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
