import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import Resource from '../models/resourceModel.js'
import dotenv from 'dotenv'

// 配置环境变量
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../../../config.env') })

// 连接数据库
async function connectDB() {
    try {
        await mongoose.connect(process.env.DATABASE_URI)
        console.log('✅ 数据库连接成功')
    } catch (error) {
        console.error('❌ 数据库连接失败:', error)
        process.exit(1)
    }
}

// 支持的文件类型
const SUPPORTED_EXTENSIONS = [
    '.pdf',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
    '.mp4',
    '.avi',
    '.mov',
    '.mp3',
    '.wav',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.txt',
]

// 从文件名解析课程和章节信息
function parseFileInfo(filename) {
    const ext = path.extname(filename).toLowerCase()
    const basename = path.basename(filename, ext)

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
        chapter: chapterInfo.number ? chapterInfo : null,
        originalName: filename,
    }
}

// 复制文件到uploads目录
async function copyFileToUploads(sourcePath, filename) {
    const ext = path.extname(filename).toLowerCase()
    let destDir = 'server/public/uploads/others'

    if (['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'].includes(ext)) {
        destDir = 'server/public/uploads/documents'
    } else if (['.mp4', '.avi', '.mov', '.wmv'].includes(ext)) {
        destDir = 'server/public/uploads/videos'
    } else if (['.mp3', '.wav', '.m4a'].includes(ext)) {
        destDir = 'server/public/uploads/audios'
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext)) {
        destDir = 'server/public/uploads/images'
    }

    // 确保目录存在
    await fs.mkdir(destDir, { recursive: true })

    // 生成唯一文件名
    const timestamp = Date.now()
    const randomNum = Math.round(Math.random() * 1e9)
    const extName = path.extname(filename)
    const basename = path.basename(filename, extName)
    const newFilename = `${basename}-${timestamp}-${randomNum}${extName}`

    const destPath = path.join(destDir, newFilename)

    // 复制文件
    await fs.copyFile(sourcePath, destPath)

    // 返回相对路径
    return destPath.replace(/\\/g, '/').replace('server/', '')
}

// 扫描目录并导入文件
async function scanAndImportDirectory(dirPath, courseInfo, userId) {
    const results = []
    const errors = []

    try {
        const files = await fs.readdir(dirPath, { withFileTypes: true })

        for (const file of files) {
            const filePath = path.join(dirPath, file.name)

            if (file.isDirectory()) {
                // 递归处理子目录
                const subResults = await scanAndImportDirectory(
                    filePath,
                    courseInfo,
                    userId
                )
                results.push(...subResults.results)
                errors.push(...subResults.errors)
            } else if (file.isFile()) {
                const ext = path.extname(file.name).toLowerCase()

                if (SUPPORTED_EXTENSIONS.includes(ext)) {
                    try {
                        // 解析文件信息
                        const fileInfo = parseFileInfo(file.name)

                        // 复制文件到uploads目录
                        const relativePath = await copyFileToUploads(
                            filePath,
                            file.name
                        )

                        // 获取文件统计信息
                        const stats = await fs.stat(filePath)

                        // 创建资源数据
                        const resourceData = {
                            title: fileInfo.title,
                            description: `课程资源：${fileInfo.originalName}`,
                            pedagogicalType: 'courseware',
                            format: fileInfo.format,
                            subject: courseInfo.subject || '计算机科学',
                            grade: courseInfo.grade || '本科',
                            difficulty: courseInfo.difficulty || 2,
                            url: relativePath,

                            course: {
                                id: courseInfo.id,
                                name: courseInfo.name,
                                code: courseInfo.code,
                                semester: courseInfo.semester,
                                instructor: courseInfo.instructor,
                            },

                            chapter: fileInfo.chapter,

                            fileInfo: {
                                size: stats.size,
                                format: fileInfo.format,
                                lastModified: stats.mtime,
                            },

                            createdBy: userId,
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
                            file: file.name,
                            path: filePath,
                            resource: resource._id,
                            chapter: fileInfo.chapter,
                        })

                        console.log(`✅ 成功导入: ${file.name}`)
                    } catch (error) {
                        errors.push({
                            success: false,
                            file: file.name,
                            path: filePath,
                            error: error.message,
                        })

                        console.log(
                            `❌ 导入失败: ${file.name} - ${error.message}`
                        )
                    }
                } else {
                    console.log(`⏭️  跳过不支持的文件: ${file.name}`)
                }
            }
        }
    } catch (error) {
        console.error(`❌ 扫描目录失败: ${dirPath}`, error)
    }

    return { results, errors }
}

// 主函数
async function main() {
    console.log('🚀 开始批量导入课程文件...\n')

    // 连接数据库
    await connectDB()

    // 配置信息（你需要根据实际情况修改这些参数）
    const config = {
        // 要扫描的本地目录路径
        sourceDirectory: 'D:/课程资料/软件工程', // 修改为你的课程文件目录

        // 课程信息
        courseInfo: {
            id: 'CS401_2024_Spring',
            name: '软件工程',
            code: 'CS401',
            semester: '2024春季',
            instructor: '张教授',
            subject: '计算机科学',
            grade: '本科三年级',
            difficulty: 3,
        },

        // 用户ID（你需要提供一个真实的用户ID）
        userId: new mongoose.Types.ObjectId('60d5ecf0fa7fc84d0c5b6d2a'), // 修改为真实的用户ID
    }

    try {
        // 检查源目录是否存在
        await fs.access(config.sourceDirectory)

        console.log(`📁 扫描目录: ${config.sourceDirectory}`)
        console.log(
            `📚 课程信息: ${config.courseInfo.name} (${config.courseInfo.code})\n`
        )

        // 开始扫描和导入
        const result = await scanAndImportDirectory(
            config.sourceDirectory,
            config.courseInfo,
            config.userId
        )

        // 输出结果
        console.log('\n📊 导入结果统计:')
        console.log(`✅ 成功: ${result.results.length} 个文件`)
        console.log(`❌ 失败: ${result.errors.length} 个文件`)

        if (result.errors.length > 0) {
            console.log('\n❌ 失败的文件:')
            result.errors.forEach((error) => {
                console.log(`   - ${error.file}: ${error.error}`)
            })
        }

        console.log('\n🎉 批量导入完成!')
    } catch (error) {
        console.error('❌ 导入过程发生错误:', error)
    } finally {
        // 关闭数据库连接
        await mongoose.connection.close()
        console.log('🔒 数据库连接已关闭')
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error)
}

export { scanAndImportDirectory, parseFileInfo, copyFileToUploads }
