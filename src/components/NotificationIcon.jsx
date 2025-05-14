import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'
import styled from 'styled-components'

/**
 * 通知图标组件 - 显示在导航栏右侧
 */
const NotificationIcon = () => {
    const { unreadCount } = useNotifications()
    const navigate = useNavigate()

    const handleClick = () => {
        navigate('/notifications')
    }

    return (
        <IconContainer onClick={handleClick}>
            <BellIcon className={unreadCount > 0 ? 'active' : ''}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
            </BellIcon>
            {unreadCount > 0 && (
                <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>
            )}
        </IconContainer>
    )
}

// 样式
const IconContainer = styled.div`
    position: relative;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 50%;
    }
`

const BellIcon = styled.div`
    width: 24px;
    height: 24px;

    svg {
        width: 100%;
        height: 100%;
        stroke: #515151;
    }

    &.active svg {
        stroke: #4f46e5;
    }
`

const Badge = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    background-color: #ef4444;
    color: white;
    border-radius: 10px;
    font-size: 0.7rem;
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    font-weight: 600;
`

export default NotificationIcon
