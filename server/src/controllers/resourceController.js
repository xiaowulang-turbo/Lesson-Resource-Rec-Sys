import { DataServiceFactory } from '../services/DataServiceFactory.js'

const dataService = new DataServiceFactory().getAdapter()

export const getAllResources = async (req, res) => {
    try {
        const filters = req.query
        const resources = await dataService.getAllResources(filters)

        res.status(200).json({
            status: 'success',
            results: resources.length,
            data: {
                resources,
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
        const resource = await dataService.getResourceById(req.params.id)

        if (!resource) {
            return res.status(404).json({
                status: 'error',
                message: '未找到该资源',
            })
        }

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

export const createResource = async (req, res) => {
    try {
        const resourceData = { ...req.body } // Get text fields from body

        // Process tags if they exist (assuming comma-separated string)
        if (resourceData.tags && typeof resourceData.tags === 'string') {
            resourceData.tags = resourceData.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
            // Note: Ideally, tags should be ObjectIds referencing a Tag collection.
            // This requires frontend changes to send ObjectIds or backend logic to find/create tags.
            // For now, we store them as an array of strings.
        }

        // Handle file upload vs link
        if (req.file) {
            // If file was uploaded by multer, construct its URL
            // Assuming uploads are served statically from /public/uploads
            resourceData.url = `/uploads/${req.file.filename}`
            // Optionally add file info
            resourceData.fileInfo = {
                size: req.file.size,
                format: req.file.mimetype,
                originalName: req.file.originalname,
            }
        } else if (resourceData.url) {
            // If a URL was provided in the form (uploadType === 'link')
            // Keep the provided URL. We might add validation or parsing later.
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
