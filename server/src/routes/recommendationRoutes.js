import express from 'express'
import * as recommendationController from '../controllers/recommendationController.js'
// Import authentication middleware if needed (e.g., protect, protectOptional)
// import { protectOptional } from '../controllers/authController.js'; // Assuming protectOptional exists

const router = express.Router()

// Route for homepage recommendations
// If protectOptional middleware exists and is appropriate, insert it before the controller:
// router.get('/homepage', protectOptional, recommendationController.getHomepageRecommendations);
router.get('/homepage', recommendationController.getHomepageRecommendations)

// 根据用户ID获取推荐路由
router.get('/user/:userId', recommendationController.getRecommendationsByUserId)

// 获取与特定资源相似的资源推荐
router.get('/similar/:resourceId', recommendationController.getSimilarResources)

// 缓存控制路由
router.get('/cache/clear', recommendationController.clearRecommendationCache)
router.get('/cache/stats', recommendationController.getCacheStats)

// Add other recommendation-related routes here

export default router
