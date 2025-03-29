import axios from 'axios'

const API_URL = 'http://localhost:3000/api/v1/resources'

export const getAllResources = async (filters = {}) => {
    try {
        const response = await axios.get(API_URL, { params: filters })
        return response.data.data.resources
    } catch (error) {
        console.error('获取资源列表失败:', error)
        throw error
    }
}

export const getResourceById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`)
        return response.data.data.resource
    } catch (error) {
        console.error('获取资源详情失败:', error)
        throw error
    }
}

export const getRecommendedResources = async () => {
    try {
        const response = await axios.get(`${API_URL}/recommended`)
        return response.data.data.resources
    } catch (error) {
        console.error('获取推荐资源失败:', error)
        throw error
    }
}
