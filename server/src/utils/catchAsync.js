/**
 * 用于包装异步控制器函数的工具函数
 * 自动捕获异步函数中的错误并传递给Express的错误处理中间件
 * @param {Function} fn - 要包装的异步控制器函数
 * @returns {Function} 包装后的中间件函数
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next)
    }
}

export default catchAsync
