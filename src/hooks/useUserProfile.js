import { useState, useEffect } from 'react'

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

    // 加载用户数据
    useEffect(() => {
        // 模拟API调用
        // const fetchUserData = async () => {
        //     try {
        //         setIsLoading(true)
        //         setError(null)
        //         const response = await fetch('/api/user/profile')
        //         if (!response.ok) throw new Error('获取用户数据失败')
        //         const data = await response.json()
        //         setUser(data)
        //     } catch (error) {
        //         setError(error.message)
        //     } finally {
        //         setIsLoading(false)
        //     }
        // }
        // fetchUserData()
    }, [])

    // 更新用户数据
    const updateUser = async (userData) => {
        // 更新本地状态
        setUser((prevUser) => ({ ...prevUser, ...userData }))

        // 实际应用中应该调用API
        // try {
        //     setIsLoading(true)
        //     setError(null)
        //     const response = await fetch('/api/user/profile', {
        //         method: 'PUT',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify(userData),
        //     })
        //     if (!response.ok) throw new Error('更新用户数据失败')
        // } catch (error) {
        //     setError(error.message)
        //     return false
        // } finally {
        //     setIsLoading(false)
        // }
        return true
    }

    // 更新单个字段
    const updateField = (field, value) => {
        setUser((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    // 更新通知设置
    const updateNotification = (key, value) => {
        setUser((prev) => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: value,
            },
        }))
    }

    return {
        user,
        updateUser,
        updateField,
        updateNotification,
        isLoading,
        error,
    }
}

export default useUserProfile
