import { DataService } from '../services/DataService.js'

const dataService = new DataService()

export const signup = async (req, res) => {
    try {
        console.log('signup', req.body)

        // 只从请求体中获取必要的字段，不再接受 role
        const { name, email, password } = req.body

        console.log('signup', name, email, password)

        // 确保提供了必要的信息 (虽然 Mongoose 会验证，但提前检查更友好)
        if (!name || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: '请提供姓名、邮箱和密码',
            })
        }

        // 分离账户数据和用户偏好/个人资料数据
        const accountData = {
            name,
            email,
            password,
            // role 将由 Mongoose schema 的默认值 'user' 自动设置
        }

        const userData = {
            name,
            // 添加默认的用户偏好
            preferences: {
                preferredSubjects: [],
                preferredGrades: [],
                preferredDifficulty: '中级',
                learningStyle: '视觉型',
            },
            stats: {
                lastActive: Date.now(),
            },
        }

        // 使用新的方法一次性创建用户和账户
        const result = await dataService.createUserWithAccount(
            userData,
            accountData
        )

        // 生成认证令牌，使用用户ID
        const token = await dataService.generateAuthToken(result.user.id)

        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.account.email,
                    role: result.account.role,
                },
            },
        })
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message,
        })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        // 检查是否提供了邮箱和密码
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: '请提供邮箱和密码',
            })
        }

        // 验证凭据
        const isValid = await dataService.validateCredentials(email, password)
        if (!isValid) {
            return res.status(401).json({
                status: 'error',
                message: '邮箱或密码错误',
            })
        }

        try {
            // 获取用户信息
            const user = await dataService.getUserByEmail(email)
            // 生成认证令牌
            const token = await dataService.generateAuthToken(user.id)

            // 更新最后登录时间
            if (user.accountId) {
                await dataService.updateAccount(user.accountId, {
                    lastLogin: Date.now(),
                })
            }

            return res.status(200).json({
                status: 'success',
                token,
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                },
            })
        } catch (userError) {
            console.error('获取用户信息或生成令牌失败:', userError)
            return res.status(500).json({
                status: 'error',
                message: '登录过程中发生错误，请联系管理员',
            })
        }
    } catch (err) {
        console.error('登录失败:', err)
        return res.status(400).json({
            status: 'error',
            message: err.message || '登录失败',
        })
    }
}
