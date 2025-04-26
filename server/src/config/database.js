import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Account from '../models/accountModel.js'
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 连接数据库
 * 使用环境变量 MONGODB_URI 存储数据库连接字符串
 * 请确保在 .env 文件中设置了 MONGODB_URI
 */
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('未设置 MONGODB_URI 环境变量，请在 .env 文件中配置')
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log(`MongoDB 连接成功: ${conn.connection.host}`)

        // 检查是否需要初始化系统
        await checkAndInitializeSystem()
    } catch (error) {
        console.error(`MongoDB 连接错误: ${error.message}`)
        process.exit(1)
    }
}

/**
 * 检查并初始化系统
 * 如果数据库中没有任何用户账户，则导入初始数据
 */
async function checkAndInitializeSystem() {
    try {
        // 检查是否有账户
        const accountCount = await Account.countDocuments()
        if (accountCount === 0) {
            console.log('系统中没有账户，开始初始化数据...')
            await initializeFromJson()
        } else {
            console.log(`系统中已有 ${accountCount} 个账户`)

            // 检查账户和用户的关联是否完整
            const usersCount = await User.countDocuments()

            if (usersCount < accountCount) {
                console.log(
                    `发现账户数量(${accountCount})与用户数量(${usersCount})不匹配`
                )
                console.log('部分账户可能没有关联用户，请检查数据一致性')
            } else {
                // 检查反向关联
                const orphanUsers = await User.countDocuments({
                    accountId: { $exists: false },
                })

                if (orphanUsers > 0) {
                    console.log(`发现 ${orphanUsers} 个没有关联账户的用户`)
                } else {
                    console.log('账户和用户关联检查通过')
                }
            }
        }
    } catch (error) {
        console.error('检查系统状态失败:', error)
    }
}

/**
 * 从JSON文件导入初始数据
 */
async function initializeFromJson() {
    try {
        // 读取accounts.json文件
        const accountsFilePath = path.join(__dirname, '../data/accounts.json')
        if (!fs.existsSync(accountsFilePath)) {
            console.log('未找到accounts.json文件，跳过初始化')
            return
        }

        const accountsData = fs.readFileSync(accountsFilePath, 'utf8')
        const accounts = JSON.parse(accountsData)

        console.log(`准备导入 ${accounts.length} 个账户数据`)

        // 创建账户和用户
        for (const accountData of accounts) {
            // 哈希密码
            const hashedPassword = await bcrypt.hash(accountData.password, 12)

            // 创建账户
            const account = await Account.create({
                name: accountData.name,
                email: accountData.email,
                password: hashedPassword,
                role: accountData.role || 'user',
            })

            // 创建用户并关联到账户
            const user = await User.create({
                name: accountData.name,
                accountId: account._id,
                preferred_subjects: accountData.preferred_subjects || [],
                preferred_difficulty: accountData.preferred_difficulty || 3,
                preferred_resource_types:
                    accountData.preferred_resource_types || [],
                interests: accountData.interests || [],
                course_interactions: accountData.course_interactions || [],
            })

            console.log(
                `创建了用户: ${accountData.name} (${accountData.email})`
            )
        }

        console.log('初始数据导入完成')
    } catch (error) {
        console.error('初始化数据失败:', error)
    }
}

export default connectDB
