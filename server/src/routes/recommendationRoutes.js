import express from 'express'
import * as recommendationController from '../controllers/recommendationController.js'
// Import authentication middleware if needed (e.g., protect, protectOptional)
// import { protectOptional } from '../controllers/authController.js'; // Assuming protectOptional exists

const router = express.Router()

// Route for homepage recommendations
// If protectOptional middleware exists and is appropriate, insert it before the controller:
// router.get('/homepage', protectOptional, recommendationController.getHomepageRecommendations);
router.get('/homepage', recommendationController.getHomepageRecommendations)

// Add other recommendation-related routes here

export default router
