import mongoose from 'mongoose'
import User from '../models/userModel.js'
import dotenv from 'dotenv'

dotenv.config({ path: './config.env' })

// 连接到数据库
mongoose
    .connect(
        process.env.DATABASE_URL ||
            'mongodb://localhost:27017/resource-recommender'
    )
    .then(() => console.log('数据库连接成功'))
    .catch((err) => console.log('数据库连接失败', err))

/**
 * 数据迁移脚本 - 将扁平结构的用户属性迁移到嵌套结构
 *
 * 此脚本将迁移以下字段:
 * - preferred_subjects -> preferences.preferredSubjects
 * - preferred_difficulty -> preferences.preferredDifficulty (需要转换数字到字符串)
 * - interests -> 保留扁平结构 (preferences.learningStyle只存储学习风格)
 * - preferred_resource_types -> 保留扁平结构 (模型中没有对应的嵌套字段)
 */
const migrateUserData = async () => {
    try {
        // 获取所有用户
        const users = await User.find({})

        console.log(`开始迁移 ${users.length} 个用户数据...`)

        // 依次处理每个用户
        for (const user of users) {
            // 初始化或获取偏好对象
            user.preferences = user.preferences || {}

            // 迁移 preferred_subjects -> preferences.preferredSubjects
            if (user.preferred_subjects && user.preferred_subjects.length > 0) {
                user.preferences.preferredSubjects = user.preferred_subjects
                console.log(
                    `用户 ${user.name} - 迁移学科偏好: ${user.preferred_subjects}`
                )
            }

            // 迁移 preferred_difficulty -> preferences.preferredDifficulty
            if (user.preferred_difficulty) {
                // 转换数字难度到字符串难度
                let difficultyMap = {
                    1: '初级',
                    2: '初级',
                    3: '中级',
                    4: '高级',
                    5: '高级',
                }
                user.preferences.preferredDifficulty =
                    difficultyMap[user.preferred_difficulty] || '中级'
                console.log(
                    `用户 ${user.name} - 迁移难度偏好: ${user.preferred_difficulty} -> ${user.preferences.preferredDifficulty}`
                )
            }

            // 保存更新后的用户
            await user.save()
            console.log(`用户 ${user.name} 数据迁移完成`)
        }

        console.log('所有用户数据迁移完成')
    } catch (error) {
        console.error('数据迁移过程中出错:', error)
    } finally {
        // 关闭数据库连接
        mongoose.connection.close()
        console.log('数据库连接已关闭')
    }
}

// 执行迁移
migrateUserData()
