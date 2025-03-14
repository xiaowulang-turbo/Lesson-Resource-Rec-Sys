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
        const newResource = await dataService.createResource({
            ...req.body,
            createdBy: req.user.id, // 假设通过认证中间件设置了req.user
        })

        res.status(201).json({
            status: 'success',
            data: {
                resource: newResource,
            },
        })
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message,
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
