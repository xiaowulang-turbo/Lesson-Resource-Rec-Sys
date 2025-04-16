import { DataServiceFactory } from '../services/DataServiceFactory.js'

const dataService = new DataServiceFactory().getAdapter()

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

        const newUser = await dataService.createUser({
            name,
            email,
            password,
            // role 将由 Mongoose schema 的默认值 'user' 自动设置
        })

        const token = await dataService.generateAuthToken(newUser.id)

        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: newUser,
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

        // 获取用户信息
        const user = await dataService.getUserByEmail(email)
        const token = await dataService.generateAuthToken(user.id)

        res.status(200).json({
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
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err.message,
        })
    }
}
