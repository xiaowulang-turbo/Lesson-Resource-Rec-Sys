import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import Tag from '../models/tagModel.js'

// 获取当前文件的目录名
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载环境变量，使用server目录下的.env文件
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// 额外的元数据标签
const metadataTags = [
    // 推荐系统元数据标签
    {
        name: '资源类型',
        type: 'topic',
        description: '资源的类型元数据，用于推荐系统的内容过滤',
        category: 'function',
    },
    {
        name: '时长',
        type: 'topic',
        description: '资源的时长元数据，用于推荐系统的内容过滤',
        category: 'function',
    },
    {
        name: '难度级别',
        type: 'topic',
        description: '资源的难度元数据，用于推荐系统的内容过滤',
        category: 'function',
    },
    {
        name: '创建日期',
        type: 'topic',
        description: '资源的创建日期元数据，用于推荐系统的时间序列分析',
        category: 'function',
    },
    {
        name: '语言',
        type: 'topic',
        description: '资源的语言元数据，用于推荐系统的内容过滤',
        category: 'function',
    },
    {
        name: '格式',
        type: 'topic',
        description: '资源的格式元数据，用于推荐系统的内容过滤',
        category: 'function',
    },
    {
        name: '作者',
        type: 'topic',
        description: '资源的作者元数据，用于推荐系统的作者相似度分析',
        category: 'function',
    },
    {
        name: '评分',
        type: 'topic',
        description: '资源的评分元数据，用于推荐系统的质量过滤',
        category: 'function',
    },
    {
        name: '流行度',
        type: 'topic',
        description: '资源的流行度元数据，用于推荐系统的热门推荐',
        category: 'function',
    },
    {
        name: '关键词',
        type: 'topic',
        description: '资源的关键词元数据，用于推荐系统的内容匹配',
        category: 'function',
    },

    // 教育领域元数据标签
    {
        name: '教育阶段',
        type: 'topic',
        description: '资源适用的教育阶段元数据，用于教育推荐',
        category: 'teaching',
    },
    {
        name: '学科',
        type: 'topic',
        description: '资源所属学科元数据，用于教育推荐',
        category: 'teaching',
    },
    {
        name: '教学目标',
        type: 'topic',
        description: '资源的教学目标元数据，用于教育推荐',
        category: 'teaching',
    },
    {
        name: '授课方式',
        type: 'topic',
        description: '资源适用的授课方式元数据，用于教育推荐',
        category: 'teaching',
    },
    {
        name: '学习风格',
        type: 'topic',
        description: '资源适合的学习风格元数据，用于个性化教育推荐',
        category: 'teaching',
    },
]

// 连接数据库
const DB_URI =
    process.env.DATABASE_URI || 'mongodb://localhost:27017/lessonResourceRecSys'

// 连接到MongoDB
mongoose
    .connect(DB_URI)
    .then(() => console.log('数据库连接成功'))
    .catch((err) => {
        console.error('数据库连接失败:', err)
        process.exit(1)
    })

// 导入数据
const importMetadataTags = async () => {
    try {
        // 检查标签是否已存在，若不存在则添加
        const existingTags = await Tag.find({
            name: { $in: metadataTags.map((tag) => tag.name) },
        })

        const existingTagNames = existingTags.map((tag) => tag.name)

        const newTags = metadataTags.filter(
            (tag) => !existingTagNames.includes(tag.name)
        )

        if (newTags.length > 0) {
            await Tag.insertMany(newTags)
            console.log(`成功添加 ${newTags.length} 个新元数据标签`)
        } else {
            console.log('所有元数据标签已存在，无需添加')
        }

        process.exit()
    } catch (error) {
        console.error('导入失败:', error)
        process.exit(1)
    }
}

// 执行导入
importMetadataTags()
