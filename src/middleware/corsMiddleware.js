// CORS 中间件配置
// 这个文件需要在服务器端使用

/**
 * 配置CORS头部信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const corsMiddleware = (req, res, next) => {
    // 允许的来源
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173') // 前端开发服务器地址

    // 允许的请求方法
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    )

    // 允许的请求头
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )

    // 允许发送凭证
    res.header('Access-Control-Allow-Credentials', 'true')

    // 预检请求的有效期，单位为秒
    res.header('Access-Control-Max-Age', '86400')

    // 处理OPTIONS预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    next()
}

module.exports = corsMiddleware

/*
使用说明：
1. 在后端Node.js服务器（如Express）中引入此中间件
2. 在路由定义之前应用此中间件

示例（Express服务器）:
const express = require('express');
const corsMiddleware = require('./corsMiddleware');
const app = express();

// 应用CORS中间件
app.use(corsMiddleware);

// 其他路由和中间件
app.use('/api', apiRoutes);

app.listen(3000, () => {
    console.log('服务器运行在端口3000');
});
*/
