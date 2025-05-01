import { DataService } from '../services/DataService.js'
import FileUploadUtils from '../utils/fileUploadUtils.js'
import multer from 'multer'
import AppError from '../utils/appError.js'

// 配置multer用于内存存储
const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 限制5MB
})

// 导出multer中间件
export const uploadUserPhoto = upload.single('avatar')

const dataService = new DataService()

export const getAllUsers = async (req, res) => {
    try {
        const users = await dataService.getAllUsers()

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users,
            },
        })
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message,
        })
    }
}

export const getUser = async (req, res) => {
    try {
        console.log(req.params.id, 'req.params.id')
        const user = await dataService.getUserById(req.params.id)

        console.log(user, 'user')

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: '未找到该用户',
            })
        }

        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        })
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message,
        })
    }
}

export const updateUser = async (req, res) => {
    try {
        // 不允许通过此路由更新密码
        if (req.body.password) {
            return res.status(400).json({
                status: 'error',
                message: '此路由不用于密码更新',
            })
        }

        const user = await dataService.updateUser(req.params.id, req.body)

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: '未找到该用户',
            })
        }

        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        })
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message,
        })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const success = await dataService.deleteUser(req.params.id)

        if (!success) {
            return res.status(404).json({
                status: 'error',
                message: '未找到该用户',
            })
        }

        res.status(204).json({
            status: 'success',
            data: null,
        })
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message,
        })
    }
}

// 获取当前用户信息
export const getMe = (req, res, next) => {
    req.params.id = req.user.id

    console.log(req.params.id, 'req.params.id')
    next()
}

// 更新当前用户信息
export const updateMe = async (req, res) => {
    try {
        // 1) 如果用户尝试更新密码，返回错误
        if (req.body.password) {
            return res.status(400).json({
                status: 'error',
                message: '此路由不用于密码更新',
            })
        }

        // 处理文件上传
        if (req.file) {
            try {
                // 上传头像到images文件夹
                const avatarPath = FileUploadUtils.uploadFile(
                    req.file,
                    'images'
                )

                // 将头像路径添加到更新数据中
                req.body.avatar = avatarPath
            } catch (err) {
                return res.status(400).json({
                    status: 'error',
                    message: `头像上传失败: ${err.message}`,
                })
            }
        }

        // 打印接收到的数据，用于调试
        console.log('接收到的更新数据:', req.body)

        // 2) 更新用户文档
        const user = await dataService.updateUser(req.user.id, req.body)

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: '未找到用户或更新失败',
            })
        }

        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        })
    } catch (err) {
        console.error('更新用户时出错:', err)
        res.status(400).json({
            status: 'error',
            message: err.message || '更新用户信息失败',
        })
    }
}

// 删除当前用户（设置为非活动状态）
export const deleteMe = async (req, res) => {
    try {
        await dataService.updateUser(req.user.id, { active: false })

        res.status(204).json({
            status: 'success',
            data: null,
        })
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message,
        })
    }
}
