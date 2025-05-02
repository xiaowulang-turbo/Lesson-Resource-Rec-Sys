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

// 推荐系统相关标签
const recommendationTags = [
    // 算法相关标签
    {
        name: '协同过滤',
        type: 'topic',
        description: '基于用户行为数据分析用户偏好的算法方法',
        category: 'function',
    },
    {
        name: '基于内容推荐',
        type: 'topic',
        description: '根据内容特征推荐相似内容的算法',
        category: 'function',
    },
    {
        name: '混合推荐',
        type: 'topic',
        description: '结合多种推荐方法的混合算法',
        category: 'function',
    },
    {
        name: '矩阵分解',
        type: 'topic',
        description: '使用矩阵分解技术进行推荐的方法',
        category: 'function',
    },
    {
        name: '深度学习推荐',
        type: 'topic',
        description: '使用深度学习技术的推荐算法',
        category: 'function',
    },
    {
        name: '基于图的推荐',
        type: 'topic',
        description: '利用图结构进行推荐的算法',
        category: 'function',
    },
    {
        name: '基于知识的推荐',
        type: 'topic',
        description: '利用领域知识进行推荐的算法',
        category: 'function',
    },
    {
        name: '上下文感知推荐',
        type: 'topic',
        description: '考虑用户上下文信息的推荐算法',
        category: 'function',
    },
    {
        name: '序列推荐',
        type: 'topic',
        description: '基于用户行为序列的推荐算法',
        category: 'function',
    },
    {
        name: '强化学习推荐',
        type: 'topic',
        description: '使用强化学习技术的推荐算法',
        category: 'function',
    },

    // 技能相关标签
    {
        name: 'Python推荐系统',
        type: 'skill',
        description: '使用Python构建推荐系统的技术',
        category: 'function',
    },
    {
        name: 'TensorFlow推荐',
        type: 'skill',
        description: '使用TensorFlow框架构建推荐系统',
        category: 'function',
    },
    {
        name: 'scikit-learn推荐',
        type: 'skill',
        description: '使用scikit-learn库实现推荐算法',
        category: 'function',
    },
    {
        name: 'Spark MLlib',
        type: 'skill',
        description: '使用Spark MLlib构建大规模推荐系统',
        category: 'function',
    },

    // 兴趣相关标签
    {
        name: '个性化推荐',
        type: 'interest',
        description: '关注个性化推荐系统的研究和应用',
        category: 'function',
    },
    {
        name: '推荐系统评估',
        type: 'interest',
        description: '推荐系统效果评估方法研究',
        category: 'function',
    },
    {
        name: '冷启动问题',
        type: 'interest',
        description: '推荐系统冷启动问题研究',
        category: 'function',
    },

    // 教育领域标签
    {
        name: '教育资源推荐',
        type: 'topic',
        description: '针对教育领域的资源推荐方法',
        category: 'teaching',
    },
    {
        name: '学习路径推荐',
        type: 'topic',
        description: '根据学习目标推荐学习路径的方法',
        category: 'teaching',
    },
    {
        name: '课程推荐',
        type: 'topic',
        description: '针对学生特点推荐合适课程的方法',
        category: 'teaching',
    },
    {
        name: '知识图谱推荐',
        type: 'topic',
        description: '基于知识图谱的教育资源推荐',
        category: 'teaching',
    },
    {
        name: '个性化学习',
        type: 'interest',
        description: '根据学生特点定制个性化学习内容',
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
const importData = async () => {
    try {
        // 先删除已有的推荐系统相关标签
        await Tag.deleteMany({
            $or: [
                { category: 'function' },
                { name: { $in: recommendationTags.map((tag) => tag.name) } },
            ],
        })

        // 导入新标签
        await Tag.insertMany(recommendationTags)

        console.log('推荐系统标签导入成功')
        process.exit()
    } catch (error) {
        console.error('导入失败:', error)
        process.exit(1)
    }
}

// 执行导入
importData()
