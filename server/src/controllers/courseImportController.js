import path from 'path'
import fs from 'fs/promises'
import multer from 'multer'
import Resource from '../models/resourceModel.js'
import AppError from '../utils/appError.js'
import catchAsync from '../utils/catchAsync.js'

// 文件存储配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 根据文件类型确定存储目录
        let uploadPath = 'server/public/uploads/others'

        const ext = path.extname(file.originalname).toLowerCase()
        if (['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'].includes(ext)) {
            uploadPath = 'server/public/uploads/documents'
        } else if (['.mp4', '.avi', '.mov', '.wmv'].includes(ext)) {
            uploadPath = 'server/public/uploads/videos'
        } else if (['.mp3', '.wav', '.m4a'].includes(ext)) {
            uploadPath = 'server/public/uploads/audios'
        } else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext)) {
            uploadPath = 'server/public/uploads/images'
        }

        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        // 生成唯一文件名，保留原始文件名
        const timestamp = Date.now()
        const randomNum = Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname)
        const basename = path.basename(file.originalname, ext)

        cb(null, `${basename}-${timestamp}-${randomNum}${ext}`)
    },
})

// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'video/mp4',
        'video/avi',
        'video/quicktime',
        'audio/mpeg',
        'audio/wav',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
    ]

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new AppError('不支持的文件类型', 400), false)
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB 限制
    },
})

// 从文件名解析课程和章节信息
function parseFileInfo(originalname, relativePath) {
    const ext = path.extname(originalname).toLowerCase()
    const basename = path.basename(originalname, ext)

    // 获取文件格式
    const getFormat = (ext) => {
        const formatMap = {
            '.pdf': 'pdf',
            '.doc': 'docx',
            '.docx': 'docx',
            '.ppt': 'pptx',
            '.pptx': 'pptx',
            '.mp4': 'video',
            '.avi': 'video',
            '.mov': 'video',
            '.mp3': 'audio',
            '.wav': 'audio',
            '.jpg': 'image',
            '.jpeg': 'image',
            '.png': 'image',
            '.gif': 'image',
            '.txt': 'file',
        }
        return formatMap[ext] || 'file'
    }

    // 尝试从文件名解析章节信息
    // 支持格式：第1章-软件工程概述-第1节-基本概念.pptx
    // 或者：1-1-软件工程基础.pdf
    // 或者：软件工程-第1章-概述.pptx

    let chapterInfo = {
        number: null,
        title: '',
        section: null,
        sectionTitle: '',
        order: null,
    }

    // 正则表达式匹配不同的命名模式
    const patterns = [
        // 第1章-软件工程概述-第1节-基本概念
        /第(\d+)章[-－]?([^-－第]*?)[-－]?第(\d+)节[-－]?(.+)/,
        // 第1章-软件工程概述
        /第(\d+)章[-－]?(.+)/,
        // 1-1-内容标题
        /^(\d+)[-－](\d+)[-－](.+)/,
        // 1-内容标题
        /^(\d+)[-－](.+)/,
    ]

    for (const pattern of patterns) {
        const match = basename.match(pattern)
        if (match) {
            if (pattern.source.includes('第')) {
                // 中文格式
                chapterInfo.number = parseInt(match[1])
                chapterInfo.title = match[2]?.trim() || ''
                if (match[3]) {
                    chapterInfo.section = parseInt(match[3])
                    chapterInfo.sectionTitle = match[4]?.trim() || ''
                }
            } else {
                // 数字格式
                chapterInfo.number = parseInt(match[1])
                if (match[3]) {
                    // 1-1-标题 格式
                    chapterInfo.section = parseInt(match[2])
                    chapterInfo.title = match[3]?.trim() || ''
                } else {
                    // 1-标题 格式
                    chapterInfo.title = match[2]?.trim() || ''
                }
            }
            break
        }
    }

    return {
        title: chapterInfo.title || basename,
        format: getFormat(ext),
        url: relativePath,
        chapter: chapterInfo.number ? chapterInfo : null,
        originalName: originalname,
    }
}

// 单文件上传
export const uploadSingleFile = upload.single('file')

// 多文件上传
export const uploadMultipleFiles = upload.array('files', 50)

// 单个文件导入到数据库
export const importSingleFile = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('请选择要上传的文件', 400))
    }

    const {
        courseId,
        courseName,
        courseCode,
        semester,
        instructor,
        subject,
        grade,
        difficulty,
    } = req.body

    // 解析文件信息
    const relativePath = req.file.path
        .replace(/\\/g, '/')
        .replace('server/', '')
    const fileInfo = parseFileInfo(req.file.originalname, relativePath)

    // 获取文件统计信息
    const stats = await fs.stat(req.file.path)

    // 创建资源数据
    const resourceData = {
        title: fileInfo.title,
        description:
            req.body.description || `课程资源：${fileInfo.originalName}`,
        pedagogicalType: req.body.pedagogicalType || 'courseware',
        format: fileInfo.format,
        subject: subject || '计算机科学',
        grade: grade || '本科',
        difficulty: parseInt(difficulty) || 2,
        url: fileInfo.url,

        // 课程信息
        course: {
            id: courseId,
            name: courseName,
            code: courseCode,
            semester: semester,
            instructor: instructor,
        },

        // 章节信息
        chapter: fileInfo.chapter,

        // 文件信息
        fileInfo: {
            size: stats.size,
            format: fileInfo.format,
            lastModified: stats.mtime,
        },

        createdBy: req.user._id,
    }

    // 如果解析出了章节信息，设置顺序
    if (fileInfo.chapter?.number) {
        resourceData.chapter.order =
            fileInfo.chapter.number * 100 + (fileInfo.chapter.section || 0)
    }

    const resource = await Resource.create(resourceData)

    res.status(201).json({
        status: 'success',
        data: {
            resource,
            fileInfo: {
                originalName: req.file.originalname,
                savedPath: relativePath,
                size: stats.size,
            },
        },
    })
})

// 批量文件导入
export const importMultipleFiles = catchAsync(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next(new AppError('请选择要上传的文件', 400))
    }

    const {
        courseId,
        courseName,
        courseCode,
        semester,
        instructor,
        subject,
        grade,
        difficulty,
    } = req.body

    const results = []
    const errors = []

    for (const file of req.files) {
        try {
            // 解析文件信息
            const relativePath = file.path
                .replace(/\\/g, '/')
                .replace('server/', '')
            const fileInfo = parseFileInfo(file.originalname, relativePath)

            // 获取文件统计信息
            const stats = await fs.stat(file.path)

            // 创建资源数据
            const resourceData = {
                title: fileInfo.title,
                description: `课程资源：${fileInfo.originalName}`,
                pedagogicalType: 'courseware',
                format: fileInfo.format,
                subject: subject || '计算机科学',
                grade: grade || '本科',
                difficulty: parseInt(difficulty) || 2,
                url: fileInfo.url,

                course: {
                    id: courseId,
                    name: courseName,
                    code: courseCode,
                    semester: semester,
                    instructor: instructor,
                },

                chapter: fileInfo.chapter,

                fileInfo: {
                    size: stats.size,
                    format: fileInfo.format,
                    lastModified: stats.mtime,
                },

                createdBy: req.user._id,
            }

            // 设置章节顺序
            if (fileInfo.chapter?.number) {
                resourceData.chapter.order =
                    fileInfo.chapter.number * 100 +
                    (fileInfo.chapter.section || 0)
            }

            const resource = await Resource.create(resourceData)

            results.push({
                success: true,
                file: file.originalname,
                resource: resource._id,
                chapter: fileInfo.chapter,
            })
        } catch (error) {
            errors.push({
                success: false,
                file: file.originalname,
                error: error.message,
            })
        }
    }

    res.status(201).json({
        status: 'success',
        data: {
            totalFiles: req.files.length,
            successCount: results.length,
            errorCount: errors.length,
            results,
            errors,
        },
    })
})

// 获取课程文件列表（用于预览）
export const previewCourseFiles = catchAsync(async (req, res, next) => {
    const { courseId } = req.params

    const resources = await Resource.findByCourse(courseId)

    res.status(200).json({
        status: 'success',
        data: {
            courseId,
            count: resources.length,
            resources: resources.map((r) => ({
                id: r._id,
                title: r.title,
                format: r.format,
                url: r.url,
                chapter: r.chapter,
                fileSize: r.fileInfo?.size,
                createdAt: r.createdAt,
            })),
        },
    })
})

// 删除课程资源文件
export const deleteCourseResource = catchAsync(async (req, res, next) => {
    const { resourceId } = req.params

    const resource = await Resource.findById(resourceId)
    if (!resource) {
        return next(new AppError('资源不存在', 404))
    }

    // 删除物理文件
    if (resource.url) {
        const filePath = path.join('server', resource.url)
        try {
            await fs.unlink(filePath)
        } catch (error) {
            console.log('文件删除失败:', error.message)
        }
    }

    // 删除数据库记录
    await Resource.findByIdAndDelete(resourceId)

    res.status(204).json({
        status: 'success',
        data: null,
    })
})
