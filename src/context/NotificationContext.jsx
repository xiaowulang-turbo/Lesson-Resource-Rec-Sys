import React, { createContext } from 'react'

// 创建通知上下文（已废弃未读通知相关逻辑）
export const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
    // 只做简单包裹，后续如需扩展可在此实现
    return (
        <NotificationContext.Provider value={{}}>
            {children}
        </NotificationContext.Provider>
    )
}

// 自定义Hook，防止旧代码报错
export const useNotifications = () => {
    return {}
}
