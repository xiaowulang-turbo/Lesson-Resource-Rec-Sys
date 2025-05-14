import React, { createContext, useState, useEffect, useContext } from 'react'
import { getUnreadNotifications } from '../services/notificationService'
import { useAuth } from './AuthContext'

// 创建通知上下文
export const NotificationContext = createContext()

// 通知Provider组件
export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const { user, isAuthenticated } = useAuth()

    // 加载未读通知
    const loadUnreadNotifications = async () => {
        if (!isAuthenticated) return

        try {
            setLoading(true)
            setError(null)
            const result = await getUnreadNotifications()
            setNotifications(result.data.notifications)
            setUnreadCount(result.results)
        } catch (err) {
            console.error('加载未读通知失败:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // 更新未读通知计数
    const updateUnreadCount = (count) => {
        setUnreadCount(count)
    }

    // 重置通知状态
    const resetNotifications = () => {
        setNotifications([])
        setUnreadCount(0)
    }

    // 用户登录后加载通知
    useEffect(() => {
        if (isAuthenticated) {
            loadUnreadNotifications()

            // 设置定时刷新 (每3分钟刷新一次)
            const interval = setInterval(() => {
                loadUnreadNotifications()
            }, 3 * 60 * 1000)

            return () => clearInterval(interval)
        } else {
            resetNotifications()
        }
    }, [isAuthenticated, user?._id])

    // 上下文值
    const value = {
        unreadCount,
        notifications,
        loading,
        error,
        loadUnreadNotifications,
        updateUnreadCount,
        resetNotifications,
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}

// 自定义Hook，用于在组件中使用通知上下文
export const useNotifications = () => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotifications必须在NotificationProvider内部使用')
    }
    return context
}
