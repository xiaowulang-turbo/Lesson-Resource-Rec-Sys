import express from 'express'
import {
    getAllBookings,
    getBooking,
    createBooking,
    updateBooking,
    deleteBooking,
    updateBookingStatus,
} from '../controllers/bookingController.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 所有预订路由都需要认证
router.use(protect)

router
    .route('/')
    .get(restrictTo('admin'), getAllBookings)
    .post(restrictTo('admin', 'teacher'), createBooking)

router
    .route('/:id')
    .get(getBooking)
    .patch(restrictTo('admin', 'teacher'), updateBooking)
    .delete(restrictTo('admin'), deleteBooking)

router
    .route('/:id/status')
    .patch(restrictTo('admin', 'teacher'), updateBookingStatus)

export default router
