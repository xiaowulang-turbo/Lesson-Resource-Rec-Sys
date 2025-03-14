import { DataServiceFactory } from '../services/DataServiceFactory.js'

const dataService = new DataServiceFactory().getAdapter()

export const protect = async (req, res, next) => {
    try {
        // 1) 获取token
        let token
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: '您尚未登录，请先登录',
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
        const user = await dataService.getUserById(decoded.id)
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: '此令牌的用户已不存在',
            })
        }

        // 4) 将用户信息附加到请求对象
        req.user = user
        next()
    } catch (err) {
        res.status(401).json({
            status: 'error',
            message: '认证失败',
        })
    }
}

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
