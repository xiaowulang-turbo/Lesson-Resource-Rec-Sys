import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import User from '../models/userModel.js'
import Resource from '../models/resourceModel.js'

// 获取当前文件的目录路径
const __dirname = dirname(fileURLToPath(import.meta.url))

// 加载环境变量
dotenv.config({ path: join(__dirname, '../../.env') })

// 连接数据库
mongoose
    .connect(
        process.env.MONGODB_URI ||
            'mongodb://localhost:27017/lesson-resource-db'
    )
    .then(() => console.log('数据库连接成功'))
    .catch((err) => console.error('数据库连接失败:', err))

// Mock数据
const mockUsers = [
    {
        name: '测试管理员',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
    },
    {
        name: '测试教师',
        email: 'teacher@example.com',
        password: 'password123',
        role: 'teacher',
    },
    {
        name: '测试学生',
        email: 'student@example.com',
        password: 'password123',
        role: 'user',
    },
    {
        name: 'jonas',
        email: 'jonas@example.com',
        password: 'example0987',
        role: 'user',
    },
]

const mockResources = [
    {
        title: '初中数学基础概念',
        description: '涵盖初中数学的基本概念和重要公式',
        type: 'document',
        subject: '数学',
        grade: '初中',
        difficulty: 2,
        url: 'https://example.com/math-basics',
        tags: ['数学', '基础', '公式'],
    },
    {
        title: '高中物理实验视频',
        description: '详细讲解高中物理重要实验步骤',
        type: 'video',
        subject: '物理',
        grade: '高中',
        difficulty: 4,
        url: 'https://example.com/physics-experiments',
        tags: ['物理', '实验', '视频教学'],
    },
    {
        title: '英语语法练习题',
        description: '针对高考英语语法考点的练习题集',
        type: 'exercise',
        subject: '英语',
        grade: '高中',
        difficulty: 3,
        url: 'https://example.com/english-grammar',
        tags: ['英语', '语法', '练习题'],
    },
]

// 清除现有数据并添加mock数据
const initMockData = async () => {
    try {
        // 清除现有数据
        await User.deleteMany({})
        await Resource.deleteMany({})

        // 创建用户
        const users = await User.create(mockUsers)
        console.log('Mock用户创建成功')

        // 为资源添加创建者并创建资源
        const resourcesWithCreator = mockResources.map((resource, index) => ({
            ...resource,
            createdBy: users[index % users.length]._id,
        }))

        await Resource.create(resourcesWithCreator)
        console.log('Mock资源创建成功')

        // 添加一些评分
        for (const resource of await Resource.find()) {
            resource.ratings.push({
                user: users[0]._id,
                rating: 4,
                review: '非常好的学习资源！',
            })
            resource.ratings.push({
                user: users[1]._id,
                rating: 5,
                review: '内容详实，很有帮助。',
            })
            await resource.save()
        }
        console.log('Mock评分添加成功')

        console.log('所有Mock数据初始化完成！')
        console.log('\n测试账号信息：')
        console.log('管理员 - Email: admin@example.com, 密码: password123')
        console.log('教师 - Email: teacher@example.com, 密码: password123')
        console.log('学生 - Email: student@example.com, 密码: password123\n')
    } catch (error) {
        console.error('Mock数据初始化失败:', error)
    } finally {
        mongoose.connection.close()
    }
}

initMockData()
