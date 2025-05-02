import { useState, useEffect } from 'react'
import { BASE_URL, ENDPOINTS, apiRequest } from '../services/apiConfig'
import { updateCurrentUser, getCurrentUser } from '../services/apiUsers'

function useUserProfile() {
    const [user, setUser] = useState({
        fullName: '',
        email: '',
        phone: '',
        avatar: null,
        subject: '',
        grade: '',
        experience: '',
        bio: '',
        interests: [],
        notifications: {
            resourceRecommendations: false,
            newFeatures: false,
            communityUpdates: false,
        },
    })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    // 获取存储的认证信息
    const getStoredAuth = () => {
        const auth = localStorage.getItem('auth')
        return auth ? JSON.parse(auth) : null
    }

    // 加载用户数据
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const auth = getStoredAuth()

                console.log(auth.token, 'auth')

                if (auth.token === null) {
                    console.log('未登录')
                    setError('未登录')
                    return
                }

                const userData = await getCurrentUser()

                console.log(userData, 'userData')

                if (userData) {
                    // 将API返回的用户数据映射到表单字段
                    setUser({
                        fullName: userData.name || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        avatar: userData.avatar || null,
                        subject:
                            userData.preferences?.preferredSubjects?.[0] || '',
                        grade: userData.preferences?.preferredGrades?.[0] || '',
                        experience: userData.experience || '',
                        bio: userData.bio || '',
                        interests: userData.interests || [],
                        notifications: {
                            resourceRecommendations:
                                userData.preferences?.notifications
                                    ?.resourceRecommendations || false,
                            newFeatures:
                                userData.preferences?.notifications
                                    ?.newFeatures || false,
                            communityUpdates:
                                userData.preferences?.notifications
                                    ?.communityUpdates || false,
                        },
                    })
                }
            } catch (error) {
                console.error('加载用户资料错误:', error)
                setError(error.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchUserData()
    }, [])

    // 更新用户数据
    const updateUser = async (userData) => {
        try {
            setIsLoading(true)
            setError(null)

            console.log(userData, 'userData')

            const auth = getStoredAuth()
            if (!auth?.token) {
                setError('未登录')
                return false
            }

            // 检查是否包含头像文件上传
            if (userData.avatar instanceof File) {
                // 直接使用新的apiUsers服务处理文件上传
                const result = await updateCurrentUser(userData)

                if (result && result.status === 'success' && result.data.user) {
                    const updatedUser = result.data.user

                    // 更新状态
                    setUser((prev) => ({
                        ...prev,
                        fullName: updatedUser.name || prev.fullName,
                        avatar: updatedUser.avatar || prev.avatar,
                        // 保留其他字段...
                    }))

                    return true
                }
                return false
            }

            // 普通数据更新，将前端表单数据转换为API期望的格式
            const apiData = {
                name: userData.fullName,
                email: userData.email,
                phone: userData.phone,
                bio: userData.bio,
                interests: userData.interests,
                experience: userData.experience,
                preferences: {
                    preferredSubjects: userData.subject
                        ? [userData.subject]
                        : [],
                    preferredGrades: userData.grade ? [userData.grade] : [],
                },
            }

            const result = await updateCurrentUser(apiData)

            if (result && result.status === 'success' && result.data.user) {
                const updatedUser = result.data.user

                // 将API返回的用户数据映射到表单字段
                setUser({
                    fullName: updatedUser.name || '',
                    email: updatedUser.email || '',
                    phone: updatedUser.phone || '',
                    avatar: updatedUser.avatar || null,
                    subject:
                        updatedUser.preferences?.preferredSubjects?.[0] ||
                        updatedUser.subject ||
                        '',
                    grade:
                        updatedUser.preferences?.preferredGrades?.[0] ||
                        updatedUser.grade ||
                        '',
                    experience: updatedUser.experience || '',
                    bio: updatedUser.bio || '',
                    interests: updatedUser.interests || [],
                    notifications: {
                        resourceRecommendations:
                            updatedUser.preferences?.notifications
                                ?.resourceRecommendations || false,
                        newFeatures:
                            updatedUser.preferences?.notifications
                                ?.newFeatures || false,
                        communityUpdates:
                            updatedUser.preferences?.notifications
                                ?.communityUpdates || false,
                    },
                })
                return true
            }
            return false
        } catch (error) {
            console.error('更新用户资料错误:', error)
            setError(error.message)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    // 更新单个字段
    const updateField = (field, value) => {
        setUser((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    return {
        user,
        updateUser,
        updateField,
        isLoading,
        error,
    }
}

export default useUserProfile
