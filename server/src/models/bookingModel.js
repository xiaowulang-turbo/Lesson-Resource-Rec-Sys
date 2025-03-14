import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
    cabinId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cabin',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    numNights: {
        type: Number,
        required: true,
    },
    numGuests: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['unconfirmed', 'confirmed', 'checked-in', 'checked-out'],
        default: 'unconfirmed',
    },
    hasBreakfast: {
        type: Boolean,
        default: false,
    },
    observations: String,
    isPaid: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

// 添加索引以提高查询性能
bookingSchema.index({ cabinId: 1, startDate: 1, endDate: 1 })
bookingSchema.index({ userId: 1, status: 1 })

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking
