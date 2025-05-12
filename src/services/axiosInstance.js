import axios from 'axios'
import { BASE_URL } from './apiConfig'

// 创建 Axios 实例
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // 如果您的后端需要 cookie 或 session 支持
})

// 添加请求拦截器 (可选)
axiosInstance.interceptors.request.use(
    (config) => {
        // 尝试从 localStorage 获取 token (如果使用 token 认证)
        const authData = localStorage.getItem('auth')
        if (authData) {
            const token = JSON.parse(authData).token
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`
            }
        }
        // 可以在这里添加其他通用请求头
        // config.headers['Content-Type'] = 'application/json'; // 通常 axios 会自动处理
        return config
    },
    (error) => {
        // 对请求错误做些什么
        return Promise.reject(error)
    }
)

// 添加响应拦截器 (可选)
axiosInstance.interceptors.response.use(
    (response) => {
        // 对响应数据做点什么 (例如，直接返回 response.data)
        // 注意：直接返回 response.data 会使原始响应 (status, headers 等) 在调用处不可用
        // return response.data;
        return response
    },
    (error) => {
        // 对响应错误做点什么
        // 例如，如果收到 401 Unauthorized，可以重定向到登录页
        if (error.response && error.response.status === 401) {
            // localStorage.removeItem('auth'); // 清除无效的认证信息
            // window.location.href = '/login'; // 重定向到登录页
            console.error('认证失败或令牌过期:', error.response)
            // 可以在这里触发全局的登出逻辑
        }
        return Promise.reject(error)
    }
)

export default axiosInstance
