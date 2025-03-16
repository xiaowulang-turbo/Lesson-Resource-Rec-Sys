import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
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
    duration: {
        type: Number,
        required: true,
    },
    participantsCount: {
        type: Number,
        required: true,
    },
    totalPoints: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'in-progress', 'completed', 'canceled'],
        default: 'pending',
    },
    includesMaterials: {
        type: Boolean,
        default: false,
    },
    notes: String,
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
bookingSchema.index({ resourceId: 1, startDate: 1, endDate: 1 })
bookingSchema.index({ userId: 1, status: 1 })

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking
