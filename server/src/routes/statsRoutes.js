import express from 'express'
import { getSystemStats } from '../controllers/statsController.js'

const router = express.Router()

// 获取系统统计数据
router.get('/', getSystemStats)

export default router
