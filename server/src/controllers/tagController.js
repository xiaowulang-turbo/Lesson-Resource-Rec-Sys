import Tag from '../models/tagModel.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'

// 获取所有标签
export const getAllTags = catchAsync(async (req, res, next) => {
    const tags = await Tag.find({})

    res.status(200).json({
        status: 'success',
        results: tags.length,
        data: {
            tags,
        },
    })
})

// 按类型获取标签
export const getTagsByType = catchAsync(async (req, res, next) => {
    const { type } = req.params

    const tags = await Tag.find({ type })

    res.status(200).json({
        status: 'success',
        results: tags.length,
        data: {
            tags,
        },
    })
})

// 搜索标签
export const searchTags = catchAsync(async (req, res, next) => {
    const { query, type } = req.query

    let searchCondition = {}

    // 如果提供了查询字符串，添加模糊匹配
    if (query) {
        searchCondition.name = { $regex: query, $options: 'i' }
    }

    // 如果提供了类型，添加类型过滤
    if (type) {
        searchCondition.type = type
    }

    const tags = await Tag.find(searchCondition)

    res.status(200).json({
        status: 'success',
        results: tags.length,
        data: {
            tags,
        },
    })
})

// 创建新标签
export const createTag = catchAsync(async (req, res, next) => {
    const { name, type, description } = req.body

    // 检查标签是否已存在
    const existingTag = await Tag.findOne({ name, type })
    if (existingTag) {
        return next(new AppError('标签已存在', 400))
    }

    const newTag = await Tag.create({
        name,
        type,
        description,
    })

    res.status(201).json({
        status: 'success',
        data: {
            tag: newTag,
        },
    })
})

// 获取用户兴趣标签
export const getUserInterestTags = catchAsync(async (req, res, next) => {
    const interestTags = await Tag.find({ type: 'interest' })

    res.status(200).json({
        status: 'success',
        results: interestTags.length,
        data: {
            tags: interestTags,
        },
    })
})

// 删除标签
export const deleteTag = catchAsync(async (req, res, next) => {
    const { id } = req.params

    const tag = await Tag.findByIdAndDelete(id)

    if (!tag) {
        return next(new AppError('未找到此标签', 404))
    }

    res.status(204).json({
        status: 'success',
        data: null,
    })
})

// 批量创建标签
export const createManyTags = catchAsync(async (req, res, next) => {
    const { tags } = req.body

    if (!Array.isArray(tags)) {
        return next(new AppError('请提供标签数组', 400))
    }

    const createdTags = await Tag.insertMany(
        tags.map((tag) => ({
            name: tag.name,
            type: tag.type || 'interest',
            description: tag.description || '',
        })),
        { ordered: false } // 继续处理剩余文档，即使某些文档出错
    )

    res.status(201).json({
        status: 'success',
        results: createdTags.length,
        data: {
            tags: createdTags,
        },
    })
})
