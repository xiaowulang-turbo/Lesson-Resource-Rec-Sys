import { DataService } from '../services/DataService.js'

const dataService = new DataService()

// 保护路由中间件，确保用户已登录
export const protect = async (req, res, next) => {
    try {
        let token

        // 1) 获取token并检查是否存在
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: '您未登录，请登录以获取访问权限',
            })
        }

        // 2) 验证token
        const decoded = await dataService.verifyAuthToken(token)
        if (!decoded) {
            return res.status(401).json({
                status: 'error',
                message: '令牌无效或已过期',
            })
        }

        // 3) 检查用户是否仍然存在
        const currentUser = await dataService.getUserById(decoded.id)
        if (!currentUser) {
            return res.status(401).json({
                status: 'error',
                message: '此令牌对应的用户不再存在',
            })
        }

        // 4) 将用户添加到请求对象中
        req.user = currentUser

        // 打印认证成功信息，用于调试
        console.log(`用户 ${currentUser.name} (ID: ${currentUser.id}) 认证成功`)

        next()
    } catch (error) {
        console.error('认证中间件错误:', error)
        res.status(401).json({
            status: 'error',
            message: '认证失败，请重新登录',
        })
    }
}

// 限制特定角色访问的中间件
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: '您没有执行此操作的权限',
            })
        }
        next()
    }
}
