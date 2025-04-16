import React, { createContext, useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom' // For redirecting on logout

// 1. 创建 Context
export const AuthContext = createContext()

// 2. 创建 Provider 组件
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true) // State to track initial loading
    const navigate = useNavigate()

    // 3. 尝试从 localStorage 加载初始状态
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('jwt')
            const storedUser = localStorage.getItem('user')

            if (storedToken && storedUser) {
                setToken(storedToken)
                setUser(JSON.parse(storedUser))
                setIsAuthenticated(true)
            }
        } catch (error) {
            console.error('Failed to load auth state from localStorage', error)
            // Clear potentially corrupted storage
            localStorage.removeItem('jwt')
            localStorage.removeItem('user')
        } finally {
            setIsLoading(false) // Finished loading initial state
        }
    }, [])

    // 4. 登录函数
    const login = (userData, authToken) => {
        try {
            localStorage.setItem('jwt', authToken)
            localStorage.setItem('user', JSON.stringify(userData))
            setToken(authToken)
            setUser(userData)
            setIsAuthenticated(true)
        } catch (error) {
            console.error('Failed to save auth state to localStorage', error)
        }
    }

    // 5. 登出函数
    const logout = () => {
        try {
            localStorage.removeItem('jwt')
            localStorage.removeItem('user')
            setToken(null)
            setUser(null)
            setIsAuthenticated(false)
            // Redirect to login page after logout
            navigate('/login', { replace: true })
        } catch (error) {
            console.error(
                'Failed to remove auth state from localStorage',
                error
            )
        }
    }

    // 6. 提供 Context 值
    const value = {
        user,
        token,
        isAuthenticated,
        isLoading, // Provide loading state so consumers can wait
        login,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 7. (可选) 创建一个自定义 Hook 以方便使用
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
