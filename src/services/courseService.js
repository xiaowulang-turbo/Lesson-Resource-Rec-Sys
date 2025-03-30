import axios from 'axios'

const API_URL = 'http://localhost:3000/api/courses'

// 在开发环境中使用模拟数据
const USE_MOCK_DATA = false

// 添加一些示例数据用于故障排除
const MOCK_COURSE = {
    course_id: 'C001',
    course_title: '高级数学入门',
    course_organization: '数学教育学院',
    course_Certificate_type: 'COURSE',
    course_rating: 4.8,
    course_difficulty: 'Beginner',
    course_students_enrolled: '12,000',
    course_description:
        '这是一门针对高中学生的高级数学入门课程，涵盖了微积分、线性代数等基础内容。',
    course_topics: ['微积分', '线性代数', '概率论'],
    course_skills: ['数学推理', '抽象思维', '问题解决'],
    course_language: '中文',
    course_prerequisites: ['基础数学'],
    course_format: ['视频讲解', '习题练习'],
    course_duration_hours: 40,
    course_updated_date: new Date(),
    course_chapters: [
        {
            chapter_id: 1,
            chapter_title: '函数与极限',
            chapter_duration_hours: 10,
        },
        {
            chapter_id: 2,
            chapter_title: '导数与微分',
            chapter_duration_hours: 10,
        },
    ],
}

// 模拟课程列表数据
const MOCK_COURSES = [
    MOCK_COURSE,
    {
        ...MOCK_COURSE,
        course_id: 'C002',
        course_title: '线性代数进阶',
        course_rating: 4.7,
        course_difficulty: 'Intermediate',
    },
    {
        ...MOCK_COURSE,
        course_id: 'C003',
        course_title: '概率统计基础',
        course_rating: 4.6,
        course_difficulty: 'Beginner',
    },
]

export const getAllCourses = async () => {
    if (USE_MOCK_DATA) {
        console.log('使用模拟课程列表数据')
        await new Promise((resolve) => setTimeout(resolve, 500))
        return MOCK_COURSES
    }

    try {
        console.log('正在获取所有课程...')
        const response = await axios.get(API_URL)
        console.log('获取所有课程成功:', response.data)
        return response.data.data.courses
    } catch (error) {
        console.error('获取课程列表失败:', error)
        throw error
    }
}

export const getRecommendedCourses = async () => {
    if (USE_MOCK_DATA) {
        console.log('使用模拟推荐课程数据')
        await new Promise((resolve) => setTimeout(resolve, 500))
        return MOCK_COURSES.slice(0, 2)
    }

    try {
        console.log('正在获取推荐课程...')
        const response = await axios.get(`${API_URL}/recommended`)
        console.log('获取推荐课程成功:', response.data)
        return response.data.data.courses
    } catch (error) {
        console.error('获取推荐课程失败:', error)
        throw error
    }
}

export const getCourseById = async (id) => {
    if (!id) {
        console.error('getCourseById: 没有提供有效的课程ID')
        throw new Error('没有提供有效的课程ID')
    }

    console.log(`尝试获取课程详情，ID: ${id}`)

    // 在开发过程中使用模拟数据进行测试
    if (USE_MOCK_DATA) {
        console.log('使用模拟数据')

        // 模拟延迟以展示加载状态
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // 根据ID查找模拟课程
        if (id === 'C001' || id === 'C002' || id === 'C003') {
            const mockCourse =
                MOCK_COURSES.find((course) => course.course_id === id) ||
                MOCK_COURSE
            console.log('返回模拟课程数据:', mockCourse)
            return mockCourse
        }

        // 如果没有匹配的ID，直接返回第一个模拟课程
        console.log('未找到匹配ID，返回默认模拟数据:', MOCK_COURSE)
        return MOCK_COURSE
    }

    try {
        console.log(`发送API请求: GET ${API_URL}/${id}`)
        const response = await axios.get(`${API_URL}/${id}`)
        console.log('API响应:', response)

        // 检查响应状态和数据完整性
        if (
            !response.data ||
            !response.data.data ||
            !response.data.data.course
        ) {
            console.error('API响应格式不正确:', response.data)
            throw new Error('服务器返回的数据格式不正确')
        }

        return response.data.data.course
    } catch (error) {
        // 更详细的错误信息
        if (error.response) {
            // 服务器响应了错误状态码
            console.error(
                `获取课程详情失败 (${error.response.status}):`,
                error.response.data
            )
            if (error.response.status === 404) {
                throw new Error(`未找到ID为 ${id} 的课程`)
            } else {
                throw new Error(
                    `服务器错误 (${error.response.status}): ${
                        error.response.data.message || '未知错误'
                    }`
                )
            }
        } else if (error.request) {
            // 请求已发送但没有收到响应
            console.error('获取课程详情失败: 服务器未响应', error.request)
            throw new Error('服务器未响应，请检查API服务是否正常运行')
        } else {
            // 设置请求时发生的错误
            console.error('获取课程详情失败:', error.message)
            throw error
        }
    }
}
