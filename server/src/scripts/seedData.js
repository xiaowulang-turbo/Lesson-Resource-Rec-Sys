import mongoose from 'mongoose'
import Tag from '../models/tagModel.js'
import Collection from '../models/collectionModel.js'
import UserResourceInteraction from '../models/userResourceInteractionModel.js'
import CourseRelationship from '../models/courseRelationshipModel.js'
import User from '../models/userModel.js'
import Course from '../models/courseModel.js'
import Resource from '../models/resourceModel.js'
import dotenv from 'dotenv'

dotenv.config()

const seedData = async () => {
    try {
        // 连接数据库
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to MongoDB')

        // 清除现有数据
        await Promise.all([
            Tag.deleteMany({}),
            Collection.deleteMany({}),
            UserResourceInteraction.deleteMany({}),
            CourseRelationship.deleteMany({}),
        ])

        // 创建示例标签
        const tags = await Tag.create([
            { name: '语文', type: 'subject', description: '语文学科' },
            { name: '数学', type: 'subject', description: '数学学科' },
            { name: '初级', type: 'difficulty', description: '适合入门学习' },
            { name: '中级', type: 'difficulty', description: '需要一定基础' },
            { name: '高级', type: 'difficulty', description: '适合深入学习' },
            { name: '小学', type: 'grade', description: '小学教育阶段' },
            { name: '初中', type: 'grade', description: '初中教育阶段' },
            { name: '写作', type: 'skill', description: '写作能力培养' },
            { name: '阅读理解', type: 'skill', description: '阅读理解能力' },
            { name: '数学思维', type: 'skill', description: '数学思维训练' },
        ])

        // 获取一些现有用户和课程
        const users = await User.find().limit(2)
        const courses = await Course.find().limit(4)
        const resources = await Resource.find().limit(4)

        if (
            users.length === 0 ||
            courses.length === 0 ||
            resources.length === 0
        ) {
            throw new Error('请先确保存在用户、课程和资源数据')
        }

        // 创建示例收藏
        const collections = await Collection.create([
            {
                userId: users[0]._id,
                contentType: 'course',
                contentId: courses[0]._id,
                notes: '这是一个很好的课程',
                folders: ['我的收藏', '重要课程'],
            },
            {
                userId: users[0]._id,
                contentType: 'resource',
                contentId: resources[0]._id,
                notes: '很有用的资源',
                folders: ['教学资源'],
            },
        ])

        // 创建示例用户资源交互
        const interactions = await UserResourceInteraction.create([
            {
                userId: users[0]._id,
                resourceId: resources[0]._id,
                interactionType: 'view',
                duration: 300,
            },
            {
                userId: users[0]._id,
                resourceId: resources[0]._id,
                interactionType: 'rate',
                rating: 5,
                comment: '非常实用的资源',
            },
        ])

        // 创建示例课程关系
        const relationships = await CourseRelationship.create([
            {
                sourceCourseId: courses[0]._id,
                targetCourseId: courses[1]._id,
                relationshipType: 'prerequisite',
                strength: 0.8,
                metadata: {
                    commonTags: [tags[0]._id, tags[2]._id],
                    commonStudents: 50,
                    similarityScore: 0.75,
                },
            },
            {
                sourceCourseId: courses[1]._id,
                targetCourseId: courses[2]._id,
                relationshipType: 'successor',
                strength: 0.9,
                metadata: {
                    commonTags: [tags[1]._id, tags[3]._id],
                    commonStudents: 30,
                    similarityScore: 0.85,
                },
            },
        ])

        console.log('示例数据创建成功！')
        console.log(`创建了 ${tags.length} 个标签`)
        console.log(`创建了 ${collections.length} 个收藏`)
        console.log(`创建了 ${interactions.length} 个用户交互记录`)
        console.log(`创建了 ${relationships.length} 个课程关系`)
    } catch (error) {
        console.error('数据填充失败:', error)
    } finally {
        await mongoose.connection.close()
        console.log('数据库连接已关闭')
    }
}

// 运行数据填充脚本
seedData()
