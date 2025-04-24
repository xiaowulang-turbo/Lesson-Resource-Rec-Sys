import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 读取temp.json文件
const tempDataPath = path.join(__dirname, '../data/temp.json')
const tempData = JSON.parse(fs.readFileSync(tempDataPath, 'utf8'))

// 提取资源列表
const resources = tempData.result.list

// 转换函数：将网易云课堂资源转换为我们的资源模型
function convertToResourceModel(resource) {
    const textbookInfo = resource.mocTextbookVo

    // 随机生成MongoDB ObjectId
    const generateObjectId = () => new mongoose.Types.ObjectId()

    // 根据资源类型确定pedagogicalType
    let pedagogicalType = 'courseware'
    if (resource.type === 308) {
        pedagogicalType = 'reference' // 教材类型设为参考资料
    }

    // 根据资源格式确定format
    let format = 'pdf'

    // 提取学科信息 (简单处理)
    const subject = '通用'

    // 提取年级信息 (简单处理)
    const grade = '大学'

    // 计算平均评分
    let averageRating = 0
    if (
        textbookInfo.mocEvaluateStatDto &&
        textbookInfo.mocEvaluateStatDto.avgMark
    ) {
        averageRating = textbookInfo.mocEvaluateStatDto.avgMark
    }

    // 创建新的资源对象
    return {
        _id: generateObjectId(),
        title: textbookInfo.name,
        description:
            textbookInfo.description || `${textbookInfo.name}的详细描述`,
        pedagogicalType,
        format,
        contentType: 'resource',
        subject,
        grade,
        difficulty: Math.floor(Math.random() * 5) + 1, // 1-5的随机难度
        url: textbookInfo.linkUrl || '',
        cover: textbookInfo.cover || '',
        fileInfo: {
            size: 0,
            format,
            duration: 0,
            resolution: '',
            lastModified: new Date(),
        },
        price: textbookInfo.price || 0,
        originalPrice: textbookInfo.originalPrice || 0,
        authors: textbookInfo.editorInChief || '',
        publisher: resource.highlightUniversity || '高等教育出版社',
        organization: resource.highlightUniversity || '高等教育出版社',
        createdBy: generateObjectId(), // 随机创建者ID
        createdAt: new Date(textbookInfo.gmtCreate) || new Date(),
        updatedAt: new Date(textbookInfo.gmtModified) || new Date(),
        enrollCount: textbookInfo.enrollCount || 0,
        studyAvatars: textbookInfo.studyAvatars || [],
        tags: [],
        highlightContent: resource.highlightContent || '',
        ratings: [],
        averageRating,
        stats: {
            views: Math.floor(Math.random() * 1000),
            downloads: Math.floor(Math.random() * 500),
            shares: Math.floor(Math.random() * 200),
            favorites: Math.floor(Math.random() * 100),
            lastViewed: new Date(),
        },
        access: {
            isPublic: true,
            allowedUsers: [],
            allowedRoles: ['user', 'teacher', 'admin'],
        },
        version: {
            number: '1.0.0',
            history: [
                {
                    version: '1.0.0',
                    changes: '初始版本',
                    updatedBy: generateObjectId(),
                    updatedAt: new Date(),
                },
            ],
        },
        pageInfo: {
            pageSize: 10,
            pageIndex: 1,
            totalCount: 0,
            totalPageCount: 1,
        },
        metadata: {},
    }
}

// 转换所有资源
const convertedResources = resources.map(convertToResourceModel)

// 写入到newResources.json
const outputPath = path.join(__dirname, '../data/newResources.json')
fs.writeFileSync(
    outputPath,
    JSON.stringify(convertedResources, null, 2),
    'utf8'
)

console.log(
    `成功转换 ${convertedResources.length} 条资源数据到 newResources.json`
)
