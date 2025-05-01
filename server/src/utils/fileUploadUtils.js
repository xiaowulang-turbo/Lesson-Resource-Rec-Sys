import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import AppError from './appError.js'

// 获取 __dirname 在 ES Modules 中的等效值
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 文件上传工具类
 */
export default class FileUploadUtils {
    /**
     * 上传单个文件
     * @param {Object} file - 上传的文件对象
     * @param {String} folder - 保存的文件夹，默认为'images'
     * @returns {String} 返回文件的相对路径
     */
    static uploadFile(file, folder = 'images') {
        // 检查文件是否存在
        if (!file) {
            throw new AppError('未提供文件', 400)
        }

        // 验证文件类型
        this.validateFileType(file, folder)

        // 创建文件名 (使用 UUID 避免文件名冲突)
        const filename = `${uuidv4()}-${Date.now()}${path.extname(
            file.originalname
        )}`

        // 确保目录存在
        const uploadDir = path.join(__dirname, '../../public/uploads', folder)
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        // 文件保存路径
        const filePath = path.join(uploadDir, filename)

        // 保存文件
        fs.writeFileSync(filePath, file.buffer)

        // 返回文件的相对路径
        return `/public/uploads/${folder}/${filename}`
    }

    /**
     * 验证文件类型
     * @param {Object} file - 上传的文件对象
     * @param {String} folder - 文件夹类型
     */
    static validateFileType(file, folder) {
        // 定义允许的文件类型
        const allowedTypes = {
            images: [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/svg+xml',
            ],
            videos: ['video/mp4', 'video/webm', 'video/ogg'],
            audios: ['audio/mpeg', 'audio/ogg', 'audio/wav'],
            documents: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
            ],
            others: [], // 其他类型不做限制
        }

        // 检查文件夹是否有效
        if (!allowedTypes[folder] && folder !== 'others') {
            throw new AppError(`无效的文件夹类型: ${folder}`, 400)
        }

        // 如果是 others 文件夹，则不做类型检查
        if (folder === 'others') {
            return true
        }

        // 检查文件类型是否允许
        if (!allowedTypes[folder].includes(file.mimetype)) {
            throw new AppError(
                `不支持的文件类型: ${
                    file.mimetype
                }. 此文件夹只允许: ${allowedTypes[folder].join(', ')}`,
                400
            )
        }

        return true
    }

    /**
     * 删除文件
     * @param {String} filePath - 文件路径
     * @returns {Boolean} 返回是否删除成功
     */
    static deleteFile(filePath) {
        try {
            // 转换为实际文件系统路径
            const absolutePath = path.join(
                __dirname,
                '../..',
                filePath.replace('/public', '')
            )

            // 检查文件是否存在
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath)
                return true
            }
            return false
        } catch (error) {
            console.error('删除文件失败:', error)
            return false
        }
    }
}
