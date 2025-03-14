import Booking from '../models/bookingModel.js'
import { catchAsync } from '../utils/catchAsync.js'
import AppError from '../utils/AppError.js'

// 获取所有预订
export const getAllBookings = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find()
        .populate('cabinId', 'name maxCapacity regularPrice')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })

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
        .populate('cabinId', 'name maxCapacity regularPrice')
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
        .populate('cabinId', 'name maxCapacity regularPrice')
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
        .populate('cabinId', 'name maxCapacity regularPrice')
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
        .populate('cabinId', 'name maxCapacity regularPrice')
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
