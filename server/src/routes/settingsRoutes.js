import express from 'express'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 这里应该引入settingsController，但由于我们没有该文件，先创建临时处理函数
const getSettings = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            settings: {
                darkMode: false,
                language: 'zh',
                notifications: true,
            },
        },
    })
}

const updateSettings = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            settings: {
                ...req.body,
            },
        },
    })
}

router.route('/').get(protect, getSettings).patch(protect, updateSettings)

export default router
