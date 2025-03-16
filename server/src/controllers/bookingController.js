import Booking from '../models/bookingModel.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/AppError.js'

// 获取所有预订
export const getAllBookings = catchAsync(async (req, res, next) => {
    console.log('getAllBookings called with query:', req.query)

    // 构建查询
    const queryObj = { ...req.query }
    const excludedFields = ['page', 'sort', 'limit', 'fields']
    excludedFields.forEach((el) => delete queryObj[el])

    // 高级筛选（支持大于、小于等操作符）
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    console.log('Parsed query:', JSON.parse(queryStr))

    try {
        let query = Booking.find(JSON.parse(queryStr))
            .populate(
                'resourceId',
                'title description subject grade difficulty'
            )
            .populate('userId', 'name email')

        // 排序
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ')
            query = query.sort(sortBy)
        } else {
            query = query.sort('-createdAt')
        }

        // 分页
        const page = parseInt(req.query.page, 10) || 1
        const limit = parseInt(req.query.limit, 10) || 10
        const skip = (page - 1) * limit

        query = query.skip(skip).limit(limit)

        // 执行查询
        const bookings = await query
        console.log(`Found ${bookings.length} bookings`)

        // 获取总记录数（用于分页）
        const total = await Booking.countDocuments(JSON.parse(queryStr))

        res.status(200).json({
            status: 'success',
            results: bookings.length,
            data: {
                bookings,
                total, // 添加总记录数，用于前端分页
            },
        })
    } catch (error) {
        console.error('Error in getAllBookings:', error)
        return next(new AppError('获取预订列表失败', 500, error))
    }
})

// 获取今日活动（今天入住或退房的预订）
export const getTodayActivity = catchAsync(async (req, res, next) => {
    // 获取今天的日期（开始和结束时间）
    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    // 查询今天开始或结束的预订
    const bookings = await Booking.find({
        $or: [
            { startDate: { $gte: startOfDay, $lte: endOfDay } }, // 今天开始的
            { endDate: { $gte: startOfDay, $lte: endOfDay } }, // 今天结束的
        ],
    })
        .populate('resourceId', 'title description subject grade difficulty')
        .populate('userId', 'name email')
        .sort('startDate')

    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: {
            bookings,
        },
    })
})

// 获取单个预订
export const getBooking = catchAsync(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id)
        .populate('resourceId', 'title description subject grade difficulty')
        .populate('userId', 'name email')

    if (!booking) {
        return next(new AppError('未找到该预订', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            booking,
        },
    })
})

// 创建预订
export const createBooking = catchAsync(async (req, res, next) => {
    const newBooking = await Booking.create(req.body)
    const booking = await Booking.findById(newBooking._id)
        .populate('resourceId', 'title description subject grade difficulty')
        .populate('userId', 'name email')

    res.status(201).json({
        status: 'success',
        data: {
            booking,
        },
    })
})

// 更新预订
export const updateBooking = catchAsync(async (req, res, next) => {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })
        .populate('resourceId', 'title description subject grade difficulty')
        .populate('userId', 'name email')

    if (!booking) {
        return next(new AppError('未找到该预订', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            booking,
        },
    })
})

// 删除预订
export const deleteBooking = catchAsync(async (req, res, next) => {
    const booking = await Booking.findByIdAndDelete(req.params.id)

    if (!booking) {
        return next(new AppError('未找到该预订', 404))
    }

    res.status(204).json({
        status: 'success',
        data: null,
    })
})

// 更新预订状态
export const updateBookingStatus = catchAsync(async (req, res, next) => {
    const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        {
            new: true,
            runValidators: true,
        }
    )
        .populate('resourceId', 'title description subject grade difficulty')
        .populate('userId', 'name email')

    if (!booking) {
        return next(new AppError('未找到该预订', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            booking,
        },
    })
})
