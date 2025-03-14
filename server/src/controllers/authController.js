import { DataServiceFactory } from '../services/DataServiceFactory.js'

const dataService = new DataServiceFactory().getAdapter()

export const signup = async (req, res) => {
    try {
        const newUser = await dataService.createUser({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
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
