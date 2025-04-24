import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), eslint()],
    server: {
        proxy: {
            '/api/course/search': {
                target: 'https://www.icourse163.org/web/j/mocSearchBean.searchCourse.rpc',
                changeOrigin: true,
                rewrite: (path) => {
                    // 保留原始的查询参数，特别是csrfKey
                    const url = new URL(path, 'http://localhost')
                    return url.search // 只返回查询部分，如 ?csrfKey=xxx
                },
                headers: {
                    Origin: 'https://www.icourse163.org',
                    Referer: 'https://www.icourse163.org',
                },
                configure: (proxy, options) => {
                    // 可以在这里添加proxy事件监听器
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        // 确保设置正确的请求方法
                        proxyReq.method = 'POST'

                        proxyReq.setHeader(
                            'Cookie',
                            'NTESSTUDYSI=fba6bd9e19744ab0b9092da379ef375d'
                        )
                    })
                    proxy.on('proxyRes', (proxyRes, req, res) => {
                        // 在这里修改响应头，解决跨域问题
                        proxyRes.headers['Access-Control-Allow-Origin'] = '*'
                        proxyRes.headers['Access-Control-Allow-Methods'] =
                            'GET, POST, OPTIONS'
                        proxyRes.headers['Access-Control-Allow-Headers'] =
                            'Content-Type, Origin, Referer, Cookie'
                    })
                },
            },
        },
    },
})
