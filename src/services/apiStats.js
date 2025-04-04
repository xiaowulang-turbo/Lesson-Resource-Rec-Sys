import { BASE_URL } from './apiConfig'
import { getAllCourses } from './apiCourses'
import { getAllResources } from './apiResources'

const STATS_ENDPOINT = `${BASE_URL}/stats`

// 生成模拟统计数据
async function generateMockStats() {
    try {
        // 尝试获取真实的课程和资源数据
        const courses = await getAllCourses().catch(() => [])
        const resources = await getAllResources().catch(() => [])

        return {
            courseCount:
                courses.length || Math.floor(Math.random() * 500) + 200,
            resourceCount:
                resources.length || Math.floor(Math.random() * 1000) + 500,
            userCount: Math.floor(Math.random() * 10000) + 2000,
            onlineCount: Math.floor(Math.random() * 300) + 50,
            totalViews: Math.floor(Math.random() * 1000000) + 100000,
            completionRate: Math.floor(Math.random() * 30) + 65,
            monthlyActiveUsers: Array.from(
                { length: 12 },
                () => Math.floor(Math.random() * 5000) + 1000
            ),
            resourceDistribution: [
                {
                    name: '电子教材',
                    value: Math.floor(Math.random() * 100) + 100,
                },
                {
                    name: '实践项目',
                    value: Math.floor(Math.random() * 100) + 80,
                },
                {
                    name: '练习题库',
                    value: Math.floor(Math.random() * 100) + 120,
                },
                {
                    name: '参考资料',
                    value: Math.floor(Math.random() * 100) + 150,
                },
                {
                    name: '其他资源',
                    value: Math.floor(Math.random() * 100) + 50,
                },
            ],
            difficultyDistribution: [
                { name: '入门', value: Math.floor(Math.random() * 100) + 150 },
                { name: '初级', value: Math.floor(Math.random() * 100) + 200 },
                { name: '中级', value: Math.floor(Math.random() * 100) + 150 },
                { name: '高级', value: Math.floor(Math.random() * 100) + 100 },
                { name: '专家', value: Math.floor(Math.random() * 100) + 50 },
            ],
            topCourses: Array.from({ length: 5 }, (_, i) => ({
                id: `course-${i + 1}`,
                title: `热门课程 ${i + 1}`,
                enrollCount: Math.floor(Math.random() * 10000) + 1000,
                rating: (Math.random() * 2 + 3).toFixed(1),
            })),
        }
    } catch (error) {
        console.error('生成模拟数据失败:', error)
        // 如果获取真实数据失败，返回完全模拟的数据
        return {
            courseCount: Math.floor(Math.random() * 500) + 200,
            resourceCount: Math.floor(Math.random() * 1000) + 500,
            userCount: Math.floor(Math.random() * 10000) + 2000,
            onlineCount: Math.floor(Math.random() * 300) + 50,
            totalViews: Math.floor(Math.random() * 1000000) + 100000,
            completionRate: Math.floor(Math.random() * 30) + 65,
            monthlyActiveUsers: Array.from(
                { length: 12 },
                () => Math.floor(Math.random() * 5000) + 1000
            ),
            resourceDistribution: [
                {
                    name: '电子教材',
                    value: Math.floor(Math.random() * 100) + 100,
                },
                {
                    name: '实践项目',
                    value: Math.floor(Math.random() * 100) + 80,
                },
                {
                    name: '练习题库',
                    value: Math.floor(Math.random() * 100) + 120,
                },
                {
                    name: '参考资料',
                    value: Math.floor(Math.random() * 100) + 150,
                },
                {
                    name: '其他资源',
                    value: Math.floor(Math.random() * 100) + 50,
                },
            ],
            difficultyDistribution: [
                { name: '入门', value: Math.floor(Math.random() * 100) + 150 },
                { name: '初级', value: Math.floor(Math.random() * 100) + 200 },
                { name: '中级', value: Math.floor(Math.random() * 100) + 150 },
                { name: '高级', value: Math.floor(Math.random() * 100) + 100 },
                { name: '专家', value: Math.floor(Math.random() * 100) + 50 },
            ],
            topCourses: Array.from({ length: 5 }, (_, i) => ({
                id: `course-${i + 1}`,
                title: `热门课程 ${i + 1}`,
                enrollCount: Math.floor(Math.random() * 10000) + 1000,
                rating: (Math.random() * 2 + 3).toFixed(1),
            })),
        }
    }
}

// 获取系统统计数据
export async function getSystemStats() {
    // 由于后端API未实现，直接使用模拟数据
    console.log('使用模拟统计数据')
    return generateMockStats()

    // 下面的代码注释掉，避免404错误
    /*
    try {
        const res = await fetch(STATS_ENDPOINT)
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || '获取系统统计数据失败')
        
        return data.data
    } catch (error) {
        console.error('获取系统统计数据失败:', error)
        // 如果后端接口不存在，我们在前端模拟一些数据
        return generateMockStats()
    }
    */
}
