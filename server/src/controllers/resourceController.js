import mongoose from 'mongoose' // Import mongoose
import { DataService } from '../services/DataService.js'
import Resource from '../models/resourceModel.js' // Import the Resource model
import { getFileUrl } from '../middlewares/fileMiddleware.js' // 导入文件URL生成方法
import cacheService from '../services/CacheService.js'

// 创建 DataService 实例
const dataService = new DataService()

export const getAllResources = async (req, res) => {
    try {
        const filters = req.query
        const result = await dataService.getAllResources(filters)

        // console.log('获取资源列表成功:', result)

        res.status(200).json({
            status: 'success',
            // results: result.length,
            total: result.total,
            // pagination: result.pagination,
            data: {
                resources: result.resources,
            },
        })
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message,
        })
    }
}

export const getResource = async (req, res) => {
    try {
        const idParam = req.params.id
        let resource = null

        // 1. Check if it's a valid MongoDB ObjectId and find by _id
        if (mongoose.Types.ObjectId.isValid(idParam)) {
            resource = await Resource.findById(idParam)
        }

        // 2. If not found by ObjectId or if it wasn't a valid ObjectId, try finding by metadata.id (as a number)
        if (!resource) {
            const metadataId = parseInt(idParam, 10)
            if (!isNaN(metadataId)) {
                // Only query if it's a valid number
                resource = await Resource.findOne({ 'metadata.id': metadataId })
            }
        }

        // 3. Handle final result
        if (!resource) {
            // If still not found after checking both ways
            return res.status(404).json({
                status: 'error',
                message: '未找到该资源',
            })
        }

        // Found the resource
        res.status(200).json({
            status: 'success',
            data: {
                resource,
            },
        })
    } catch (err) {
        // General error handling for unexpected issues
        console.error('Error in getResource:', err) // Log the actual error
        res.status(500).json({
            status: 'error',
            message: err.message || '获取资源时发生错误',
        })
    }
}

export const createResource = async (req, res) => {
    try {
        const resourceData = { ...req.body } // Get text fields from body

        // Process tags if they exist (assuming comma-separated string)
        if (resourceData.tags && typeof resourceData.tags === 'string') {
            resourceData.tags = resourceData.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
            // 直接存储字符串数组，符合模型定义和推荐算法的使用方式
        } else if (req.body['tags[]']) {
            // 处理以tags[]形式提交的数组数据
            const tagsArray = Array.isArray(req.body['tags[]'])
                ? req.body['tags[]']
                : [req.body['tags[]']]
            resourceData.tags = tagsArray
                .map((tag) => tag.trim())
                .filter(Boolean)
        }

        // Handle file upload vs link
        if (req.file) {
            // 使用getFileUrl函数生成文件URL
            resourceData.url = getFileUrl(req.file.path)

            // 判断文件类型并设置相应的format字段
            let format = 'other'
            const mimetype = req.file.mimetype

            if (mimetype.startsWith('image/')) format = 'image'
            else if (mimetype.startsWith('video/')) format = 'video'
            else if (mimetype.startsWith('audio/')) format = 'audio'
            else if (mimetype === 'application/pdf') format = 'pdf'
            else if (mimetype.includes('word')) format = 'docx'
            else if (mimetype.includes('presentation')) format = 'pptx'
            else if (mimetype.includes('spreadsheet')) format = 'xlsx'
            else if (mimetype.includes('zip') || mimetype.includes('rar'))
                format = 'zip'

            resourceData.format = format

            // 设置教学类型（如果用户没有指定）
            if (!resourceData.pedagogicalType) {
                if (format === 'pptx')
                    resourceData.pedagogicalType = 'courseware'
                else if (format === 'pdf' || format === 'docx')
                    resourceData.pedagogicalType = 'reference'
                else if (format === 'video')
                    resourceData.pedagogicalType = 'tutorial'
                else resourceData.pedagogicalType = 'other'
            }

            // 设置文件详细信息
            resourceData.fileInfo = {
                size: req.file.size,
                format: req.file.mimetype,
                originalName: req.file.originalname,
                lastModified: new Date(),
            }

            console.log(`文件已上传至: ${resourceData.url}`)
        } else if (resourceData.url) {
            // If a URL was provided in the form (uploadType === 'link')
            resourceData.format = 'url'
            console.log('Using provided URL:', resourceData.url)
        } else {
            // Neither file nor URL provided
            return res.status(400).json({
                status: 'error',
                message: '请上传文件或提供资源链接',
            })
        }

        // Add creator information
        resourceData.createdBy = req.user.id // Assuming protect middleware adds user to req

        // Call data service to create the resource
        const newResource = await dataService.createResource(resourceData)

        res.status(201).json({
            status: 'success',
            data: {
                resource: newResource,
            },
        })
    } catch (err) {
        // Handle potential errors (e.g., validation errors from Mongoose)
        console.error('Error creating resource:', err)
        res.status(400).json({
            status: 'error',
            message: err.message || '创建资源失败',
        })
    }
}

export const updateResource = async (req, res) => {
    try {
        console.log(
            'updateResource: 更新资源，资源ID:',
            req.params.id,
            req.body
        )

        const resource = await dataService.updateResource(
            req.params.id,
            req.body
        )

        if (!resource) {
            return res.status(404).json({
                status: 'error',
                message: '未找到该资源',
            })
        }

        // 清除相关推荐缓存，因为资源内容已更新
        cacheService.clear()
        console.log(`[资源控制器] 资源 ${req.params.id} 已更新，已清除相关缓存`)

        res.status(200).json({
            status: 'success',
            data: {
                resource,
            },
        })
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message,
        })
    }
}

export const deleteResource = async (req, res) => {
    try {
        const success = await dataService.deleteResource(req.params.id)

        if (!success) {
            return res.status(404).json({
                status: 'error',
                message: '未找到该资源',
            })
        }

        // 清除相关推荐缓存，因为资源已被删除
        cacheService.clear()
        console.log(`[资源控制器] 资源 ${req.params.id} 已删除，已清除相关缓存`)

        res.status(204).json({
            status: 'success',
            data: null,
        })
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message,
        })
    }
}

export const addRating = async (req, res) => {
    try {
        const result = await dataService.addResourceRating(req.params.id, {
            user: req.user.id, // 假设通过认证中间件设置了req.user
            rating: req.body.rating,
            review: req.body.review,
        })

        if (!result) {
            return res.status(404).json({
                status: 'error',
                message: '未找到该资源',
            })
        }

        res.status(200).json({
            status: 'success',
            data: result,
        })
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message,
        })
    }
}

// 新增：获取资源文件
export const getResourceFile = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)

        if (!resource) {
            return res.status(404).json({
                status: 'error',
                message: '未找到该资源',
            })
        }

        // 检查权限（如果资源不是公开的）
        /*
        if (!resource.access.isPublic) {
            // 检查用户是否有权限访问
            const userId = req.user?.id
            if (
                !userId ||
                (!resource.access.allowedUsers.includes(userId) &&
                    !resource.access.allowedRoles.some((role) =>
                        req.user?.roles?.includes(role)
                    ))
            ) {
                return res.status(403).json({
                    status: 'error',
                    message: '您没有权限访问此资源',
                })
            }
        }
        */

        // 更新资源访问统计
        resource.stats.views += 1
        resource.stats.lastViewed = new Date()
        await resource.save({ validateBeforeSave: false })

        // 如果是外部链接，重定向到该链接
        if (resource.format === 'url') {
            return res.redirect(resource.url)
        }

        // 对于内部文件，返回文件路径（让静态文件服务处理）
        res.status(200).json({
            status: 'success',
            data: {
                url: resource.url,
                fileInfo: resource.fileInfo,
            },
        })
    } catch (err) {
        console.error('获取资源文件失败:', err)
        res.status(500).json({
            status: 'error',
            message: err.message || '获取资源文件失败',
        })
    }
}

// 新增：下载资源文件（增加下载计数）
export const downloadResourceFile = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)

        if (!resource) {
            return res.status(404).json({
                status: 'error',
                message: '未找到该资源',
            })
        }

        // 检查是否是外部链接
        if (resource.format === 'url') {
            // 更新下载计数
            resource.stats.downloads += 1
            await resource.save({ validateBeforeSave: false })

            return res.redirect(resource.url)
        }

        // 对于内部文件，更新下载计数并返回文件路径
        resource.stats.downloads += 1
        await resource.save({ validateBeforeSave: false })

        res.status(200).json({
            status: 'success',
            data: {
                url: resource.url,
                fileInfo: resource.fileInfo,
                downloadUrl: resource.url + '?download=true',
            },
        })
    } catch (err) {
        console.error('下载资源文件失败:', err)
        res.status(500).json({
            status: 'error',
            message: err.message || '下载资源文件失败',
        })
    }
}

// 保存MOOC资源到数据库
export const saveMoocResources = async (req, res) => {
    try {
        const { resources } = req.body

        if (!resources || !Array.isArray(resources) || resources.length === 0) {
            return res.status(400).json({
                status: 'fail',
                message: '无效的资源数据',
            })
        }

        // 获取用户ID，如果用户未登录，则使用系统默认ID
        const userId =
            req.user?.id ||
            new mongoose.Types.ObjectId('000000000000000000000001')

        // 处理每个资源，将其格式化为符合我们数据库模型的格式
        const formattedResources = resources.map((resource) => {
            // 确保每个资源都有必要的字段
            return {
                title: resource.title || '未知标题',
                description: resource.description || '无描述',
                contentType: resource.contentType || 'course',
                pedagogicalType: resource.pedagogicalType || 'courseware',
                format: resource.format || 'url',
                subject: resource.subject || '未分类',
                grade: resource.grade || '高等教育',
                difficulty: resource.difficulty || 3,
                url: resource.url || '',
                cover: resource.cover || '',
                price: resource.price || 0,
                originalPrice: resource.originalPrice || 0,
                authors: resource.authors || '',
                publisher: resource.publisher || '',
                organization: resource.organization || '',
                school: resource.school || {
                    id: null,
                    name: '',
                    shortName: '',
                    imgUrl: '',
                    supportMooc: false,
                    supportSpoc: false,
                    bgPhoto: '',
                },
                enrollCount: resource.enrollCount || 0,
                studyAvatars: resource.studyAvatars || [],
                tags: resource.tags || [],
                highlightContent: resource.highlightContent || '',
                metadata: resource.metadata || {},
                // 添加必要的创建者字段
                createdBy: userId,
                access: {
                    isPublic: true,
                    allowedUsers: [],
                    allowedRoles: ['user', 'teacher', 'admin'],
                },
            }
        })

        // 使用insertMany批量插入资源
        const savedResources = await Resource.insertMany(formattedResources, {
            // 忽略重复项，以URL作为唯一标识
            ordered: false,
        })

        res.status(201).json({
            status: 'success',
            results: savedResources.length,
            data: {
                resources: savedResources,
            },
        })
    } catch (err) {
        console.error('保存MOOC资源失败:', err)
        res.status(400).json({
            status: 'fail',
            message: err.message || '保存MOOC资源失败',
        })
    }
}
