import express from 'express'
import { searchResources } from '../controllers/searchController.js'

const router = express.Router()

// 搜索资源
router.get('/', searchResources)

export default router
