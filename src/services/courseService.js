import axios from 'axios'

const API_URL = 'http://localhost:3000/api/courses'

export const getAllCourses = async () => {
    try {
        const response = await axios.get(API_URL)
        return response.data.data.courses
    } catch (error) {
        console.error('获取课程列表失败:', error)
        throw error
    }
}

export const getRecommendedCourses = async () => {
    try {
        const response = await axios.get(`${API_URL}/recommended`)
        return response.data.data.courses
    } catch (error) {
        console.error('获取推荐课程失败:', error)
        throw error
    }
}

export const getCourseById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`)
        return response.data.data.course
    } catch (error) {
        console.error('获取课程详情失败:', error)
        throw error
    }
}
