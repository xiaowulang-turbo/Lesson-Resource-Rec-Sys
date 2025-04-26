import AppError from '../utils/appError.js'

// 开发环境错误处理
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    })
}

// 生产环境错误处理
const sendErrorProd = (err, res) => {
    // 可操作的、可信的错误：发送消息给客户端
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    }
    // 编程错误或其他未知错误：不泄露错误详情
    else {
        // 1) 记录错误
        console.error('ERROR 💥', err)

        // 2) 发送通用消息
        res.status(500).json({
            status: 'error',
            message: '出现了一些问题！',
        })
    }
}

// 处理MongoDB重复键错误
const handleDuplicateFieldsDB = (err) => {
    const value = err.keyValue[Object.keys(err.keyValue)[0]]
    const message = `重复的值: ${value}。请使用其他值！`
    return new AppError(message, 400)
}

// 处理MongoDB验证错误
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message)
    const message = `无效的输入数据。${errors.join('. ')}`
    return new AppError(message, 400)
}

// 处理JWT错误
const handleJWTError = () => new AppError('无效的令牌，请重新登录', 401)
const handleJWTExpiredError = () => new AppError('令牌已过期，请重新登录', 401)

/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
    // 默认错误状态和消息
    const statusCode = err.statusCode || 500
    const status = err.status || 'error'

    // 在开发环境中提供更详细的错误信息
    const isDev = process.env.NODE_ENV === 'development'

    // 处理MongoDB重复键错误
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        const value = err.keyValue[field]
        return res.status(400).json({
            status: 'error',
            message: `${field} '${value}' 已存在`,
            error: isDev ? err : {},
        })
    }

    // 处理MongoDB验证错误
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((val) => val.message)
        return res.status(400).json({
            status: 'error',
            message: `验证失败: ${errors.join(', ')}`,
            error: isDev ? err : {},
        })
    }

    // 处理JWT错误
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            message: '无效的令牌，请重新登录',
            error: isDev ? err : {},
        })
    }

    // 处理JWT过期错误
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'error',
            message: '您的登录已过期，请重新登录',
            error: isDev ? err : {},
        })
    }

    // 处理Mongoose CastError (通常是无效ID)
    if (err.name === 'CastError') {
        return res.status(400).json({
            status: 'error',
            message: `无效的 ${err.path}: ${err.value}`,
            error: isDev ? err : {},
        })
    }

    // 默认错误响应
    res.status(statusCode).json({
        status: status,
        message: err.message || '服务器内部错误',
        error: isDev ? err : {},
    })
}

export default errorHandler
