import { BASE_URL, ENDPOINTS } from './apiConfig'

const COURSES_ENDPOINT = `${BASE_URL}/courses`

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

export async function getAllCourses() {
    if (USE_MOCK_DATA) {
        console.log('使用模拟课程列表数据')
        await new Promise((resolve) => setTimeout(resolve, 500))
        return MOCK_COURSES
    }

    try {
        console.log('正在获取所有课程...')
        const res = await fetch(`${BASE_URL}${ENDPOINTS.COURSES.BASE}`)
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || '获取课程列表失败')

        console.log('获取所有课程成功:', data)
        return data.data.courses
    } catch (error) {
        console.error('获取课程列表失败:', error)
        throw new Error(error.message)
    }
}

export async function getRecommendedCourses() {
    if (USE_MOCK_DATA) {
        console.log('使用模拟推荐课程数据')
        await new Promise((resolve) => setTimeout(resolve, 500))
        return MOCK_COURSES.slice(0, 2)
    }

    try {
        console.log('正在获取推荐课程...')
        const res = await fetch(`${BASE_URL}${ENDPOINTS.COURSES.RECOMMENDED}`)
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || '获取推荐课程失败')

        console.log('获取推荐课程成功:', data)
        return data.data.courses
    } catch (error) {
        console.error('获取推荐课程失败:', error)
        throw new Error(error.message)
    }
}

export async function getCourseById(id) {
    if (!id) {
        console.error('getCourseById: 没有提供有效的课程ID')
        throw new Error('没有提供有效的课程ID')
    }

    console.log(`尝试获取课程详情，ID: ${id}`)

    if (USE_MOCK_DATA) {
        console.log('使用模拟数据')
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (id === 'C001' || id === 'C002' || id === 'C003') {
            const mockCourse =
                MOCK_COURSES.find((course) => course.course_id === id) ||
                MOCK_COURSE
            console.log('返回模拟课程数据:', mockCourse)
            return mockCourse
        }

        console.log('未找到匹配ID，返回默认模拟数据:', MOCK_COURSE)
        return MOCK_COURSE
    }

    try {
        console.log(
            `发送API请求: GET ${BASE_URL}${ENDPOINTS.COURSES.SINGLE(id)}`
        )
        const res = await fetch(`${BASE_URL}${ENDPOINTS.COURSES.SINGLE(id)}`)
        const data = await res.json()

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error(`未找到ID为 ${id} 的课程`)
            }
            throw new Error(data.message || `服务器错误 (${res.status})`)
        }

        if (!data.data?.course) {
            throw new Error('服务器返回的数据格式不正确')
        }

        return data.data.course
    } catch (error) {
        console.error('获取课程详情失败:', error)
        throw new Error(error.message)
    }
}
