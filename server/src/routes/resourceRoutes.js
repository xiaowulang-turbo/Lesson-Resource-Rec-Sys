import express from 'express'
import {
    getAllResources,
    getResource,
    createResource,
    updateResource,
    deleteResource,
    addRating,
} from '../controllers/resourceController.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// --- Multer 配置 ---
// 使用 import.meta.url 获取当前文件的 URL
const __filename = fileURLToPath(import.meta.url)
// 使用 path.dirname 获取当前文件的目录
const __dirname = path.dirname(__filename)

// 定义上传目录 (public/uploads)
const uploadsDir = path.join(__dirname, '../..', 'public/uploads')

// 确保上传目录存在
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
        // 创建一个唯一的文件名：字段名-时间戳-原始文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(
            null,
            file.fieldname +
                '-' +
                uniqueSuffix +
                path.extname(file.originalname)
        )
    },
})

// 文件过滤器 (可选)
const fileFilter = (req, file, cb) => {
    // 这里可以添加逻辑来只接受特定类型的文件
    // if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    //     cb(null, true);
    // } else {
    //     cb(new Error('仅支持 JPEG 或 PNG 图片!'), false);
    // }
    cb(null, true) // 暂时接受所有文件
}

const upload = multer({
    storage: storage,
    fileFilter:
        fileFilter /*, limits: { fileSize: 1024 * 1024 * 5 } // 可选：限制文件大小 */,
})
// --- Multer 配置结束 ---

const router = express.Router()

// 公开路由
router.get('/', getAllResources)
router.get('/:id', getResource)

// 保护后续所有路由
router.use(protect)

// 评分路由
router.post('/:id/ratings', addRating)

// 限制创建、更新、删除资源的权限
router.use(restrictTo('admin', 'teacher'))

router.post('/', upload.single('resourceFile'), createResource)
router.patch('/:id', updateResource)
router.delete('/:id', deleteResource)

export default router
