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
            const storedAuth = localStorage.getItem('auth') // Read the whole auth object string

            console.log('storedAuth', storedAuth)

            if (storedAuth) {
                const authData = JSON.parse(storedAuth) // Parse the JSON
                if (authData.token && authData.data && authData.data.user) {
                    setToken(authData.token) // Set token state
                    setUser(authData.data.user) // Set user state
                    setIsAuthenticated(true)
                } else {
                    // Handle cases where the stored object might be malformed
                    console.warn(
                        'Stored auth data is missing token or user information.'
                    )
                    localStorage.removeItem('auth') // Clear invalid entry
                }
            }
        } catch (error) {
            console.error('Failed to load auth state from localStorage', error)
            // Clear potentially corrupted storage
            localStorage.removeItem('auth')
            // No longer storing 'user' separately
        } finally {
            setIsLoading(false) // Finished loading initial state
        }
    }, [])

    // 4. 登录函数 - Now accepts the whole auth object
    const login = (authData) => {
        try {
            if (
                !authData ||
                !authData.token ||
                !authData.data ||
                !authData.data.user
            ) {
                console.error(
                    'Invalid authData provided to login function',
                    authData
                )
                return // Exit if data is incomplete
            }
            localStorage.setItem('auth', JSON.stringify(authData)) // Store the whole object
            // No longer storing 'user' separately
            setToken(authData.token)
            setUser(authData.data.user)
            setIsAuthenticated(true)
        } catch (error) {
            console.error('Failed to save auth state to localStorage', error)
        }
    }

    // 5. 登出函数
    const logout = () => {
        try {
            localStorage.removeItem('auth') // Only remove the 'auth' key
            // No longer removing 'user' separately
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
