import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

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

// 针对不同类型资源的子目录
const resourceSubdirs = {
    document: 'documents',
    video: 'videos',
    audio: 'audios',
    image: 'images',
    other: 'others',
}

// 根据文件类型确定存储子目录
const getSubdirByMimetype = (mimetype) => {
    if (mimetype.startsWith('image/')) return resourceSubdirs.image
    if (mimetype.startsWith('video/')) return resourceSubdirs.video
    if (mimetype.startsWith('audio/')) return resourceSubdirs.audio
    if (
        mimetype === 'application/pdf' ||
        mimetype.includes('document') ||
        mimetype.includes('text/')
    )
        return resourceSubdirs.document
    return resourceSubdirs.other
}

// 为每个子目录创建文件夹
Object.values(resourceSubdirs).forEach((subdir) => {
    const subdirPath = path.join(uploadsDir, subdir)
    if (!fs.existsSync(subdirPath)) {
        fs.mkdirSync(subdirPath, { recursive: true })
    }
})

// 配置存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 根据文件类型决定存储的子目录
        const subdir = getSubdirByMimetype(file.mimetype)
        const targetDir = path.join(uploadsDir, subdir)

        // 确保目标目录存在
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true })
        }

        cb(null, targetDir)
    },
    filename: function (req, file, cb) {
        // 创建一个唯一的文件名：时间戳-随机数-原始文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        // 获取文件扩展名
        const fileExt = path.extname(file.originalname)
        // 安全处理原文件名（移除扩展名，替换非法字符）
        const safeName = path
            .basename(file.originalname, fileExt)
            .replace(/[^a-zA-Z0-9-_]/g, '_')
            .substring(0, 30) // 限制长度

        cb(null, `${safeName}-${uniqueSuffix}${fileExt}`)
    },
})

// 文件过滤器 - 限制文件类型
const fileFilter = (req, file, cb) => {
    // 接受的文件类型
    const acceptedTypes = [
        // 文档
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        // 图片
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        // 视频
        'video/mp4',
        'video/webm',
        'video/ogg',
        // 音频
        'audio/mpeg',
        'audio/ogg',
        'audio/wav',
        // 压缩文件
        'application/zip',
        'application/x-rar-compressed',
    ]

    if (acceptedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('不支持的文件类型'), false)
    }
}

// 创建multer上传实例
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB 限制
    },
})

// 处理上传错误的中间件
export const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                status: 'error',
                message: '文件大小超过限制（最大100MB）',
            })
        }
        return res.status(400).json({
            status: 'error',
            message: `文件上传错误: ${err.message}`,
        })
    } else if (err) {
        return res.status(400).json({
            status: 'error',
            message: err.message,
        })
    }
    next()
}

// 导出配置好的上传中间件
export const resourceUpload = upload.single('resourceFile')

// 辅助函数：根据文件路径生成访问URL
export const getFileUrl = (filePath) => {
    // 从文件路径中提取相对于uploads目录的路径
    const relativePath = path.relative(uploadsDir, filePath)
    // 构建URL（确保路径分隔符是正斜杠）
    return `/public/uploads/${relativePath.replace(/\\/g, '/')}`
}
