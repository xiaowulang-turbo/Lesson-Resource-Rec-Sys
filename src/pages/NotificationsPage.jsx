import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNotifications } from '../context/NotificationContext'
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteUserNotification,
} from '../services/notificationService'
import Spinner from '../ui/Spinner'
import Pagination from '../ui/Pagination'
import toast from 'react-hot-toast'
import { formatDistance } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const NotificationsPage = () => {
    const { loadUnreadNotifications } = useNotifications()
    const [allNotifications, setAllNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)

    // 加载通知列表
    const loadNotifications = async (page = 1) => {
        try {
            setLoading(true)
            setError(null)
            const result = await getUserNotifications({ page, limit: 10 })
            setAllNotifications(result.data.notifications)
            setTotalPages(result.data.pagination.pages)
            setTotalItems(result.data.pagination.total)
            setCurrentPage(page)
        } catch (err) {
            console.error('加载通知失败:', err)
            setError(err.message)
            toast.error(`加载通知失败: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    // 标记单个通知为已读
    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id)
            setAllNotifications(
                allNotifications.map((item) => {
                    if (item.notificationId._id === id) {
                        return { ...item, isRead: true, readAt: new Date() }
                    }
                    return item
                })
            )
            loadUnreadNotifications() // 刷新未读计数
            toast.success('已标记为已读')
        } catch (err) {
            console.error('标记已读失败:', err)
            toast.error(`标记已读失败: ${err.message}`)
        }
    }

    // 标记所有通知为已读
    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead()
            setAllNotifications(
                allNotifications.map((item) => ({
                    ...item,
                    isRead: true,
                    readAt: new Date(),
                }))
            )
            loadUnreadNotifications() // 刷新未读计数
            toast.success('已将所有通知标记为已读')
        } catch (err) {
            console.error('标记所有已读失败:', err)
            toast.error(`标记所有已读失败: ${err.message}`)
        }
    }

    // 删除通知
    const handleDelete = async (id) => {
        try {
            await deleteUserNotification(id)
            setAllNotifications(
                allNotifications.filter(
                    (item) => item.notificationId._id !== id
                )
            )
            loadUnreadNotifications() // 刷新未读计数
            toast.success('通知已删除')
        } catch (err) {
            console.error('删除通知失败:', err)
            toast.error(`删除通知失败: ${err.message}`)
        }
    }

    // 分页处理
    const handlePageChange = (page) => {
        loadNotifications(page)
    }

    // 初始加载
    useEffect(() => {
        loadNotifications()
    }, [])

    // 渲染通知类型图标
    const renderTypeIcon = (type) => {
        switch (type) {
            case 'system':
                return <SystemIcon />
            case 'resource':
                return <ResourceIcon />
            case 'course':
                return <CourseIcon />
            default:
                return <AnnouncementIcon />
        }
    }

    // 格式化日期
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString)
            return formatDistance(date, new Date(), {
                addSuffix: true,
                locale: zhCN,
            })
        } catch (err) {
            return '未知时间'
        }
    }

    // 渲染优先级标识
    const renderPriorityBadge = (priority) => {
        let color
        let label

        switch (priority) {
            case 'high':
                color = '#ef4444'
                label = '高'
                break
            case 'low':
                color = '#64748b'
                label = '低'
                break
            default:
                color = '#f59e0b'
                label = '中'
        }

        return <PriorityBadge color={color}>{label}</PriorityBadge>
    }

    return (
        <Container>
            <Header>
                <Title>我的通知</Title>
                <Actions>
                    <ActionButton onClick={handleMarkAllAsRead}>
                        全部标为已读
                    </ActionButton>
                    <ActionButton
                        onClick={() => loadNotifications(currentPage)}
                    >
                        刷新
                    </ActionButton>
                </Actions>
            </Header>

            {loading ? (
                <LoadingContainer>
                    <Spinner />
                </LoadingContainer>
            ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : allNotifications.length === 0 ? (
                <EmptyState>
                    <EmptyIcon />
                    <EmptyText>暂无通知</EmptyText>
                </EmptyState>
            ) : (
                <>
                    <NotificationList>
                        {allNotifications.map((item) => (
                            <NotificationItem
                                key={item._id}
                                isRead={item.isRead}
                            >
                                <IconWrapper>
                                    {renderTypeIcon(item.notificationId.type)}
                                </IconWrapper>
                                <Content>
                                    <NotificationHeader>
                                        <NotificationTitle>
                                            {item.notificationId.title}
                                        </NotificationTitle>
                                        {renderPriorityBadge(
                                            item.notificationId.priority
                                        )}
                                    </NotificationHeader>
                                    <NotificationMessage>
                                        {item.notificationId.content}
                                    </NotificationMessage>
                                    <NotificationFooter>
                                        <NotificationTime>
                                            {formatDate(
                                                item.notificationId.createdAt
                                            )}
                                        </NotificationTime>
                                        <ButtonGroup>
                                            {!item.isRead && (
                                                <SmallButton
                                                    onClick={() =>
                                                        handleMarkAsRead(
                                                            item.notificationId
                                                                ._id
                                                        )
                                                    }
                                                >
                                                    已读
                                                </SmallButton>
                                            )}
                                            <SmallButton
                                                onClick={() =>
                                                    handleDelete(
                                                        item.notificationId._id
                                                    )
                                                }
                                                className="delete"
                                            >
                                                删除
                                            </SmallButton>
                                        </ButtonGroup>
                                    </NotificationFooter>
                                </Content>
                            </NotificationItem>
                        ))}
                    </NotificationList>

                    {totalPages > 1 && (
                        <PaginationContainer>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </PaginationContainer>
                    )}
                </>
            )}
        </Container>
    )
}

// 图标组件
const SystemIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
)

const ResourceIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
)

const CourseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
)

const AnnouncementIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2">
        <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
)

const EmptyIcon = () => (
    <svg width="120" height="120" viewBox="0 0 184 152" fill="none">
        <g opacity="0.5">
            <path
                d="M92 152C142.81 152 184 142.6 184 131C184 119.4 142.81 110 92 110C41.19 110 0 119.4 0 131C0 142.6 41.19 152 92 152Z"
                fill="#F5F5F5"
            />
            <path
                d="M125.647 30.0229H57.8531V110.023H125.647V30.0229Z"
                fill="white"
            />
            <path
                d="M125.647 30.0229H57.8531V110.023H125.647V30.0229Z"
                stroke="#E4E4E4"
                strokeWidth="4"
            />
            <path
                d="M80.6468 62.0229H103.441"
                stroke="#E4E4E4"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path
                d="M80.6468 81.0229H103.441"
                stroke="#E4E4E4"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path
                d="M137.353 17.0229H46.1468V97.0229H137.353V17.0229Z"
                fill="white"
            />
            <path
                d="M137.353 17.0229H46.1468V97.0229H137.353V17.0229Z"
                stroke="#E4E4E4"
                strokeWidth="4"
            />
            <path
                d="M68.9409 49.0229H91.7351"
                stroke="#E4E4E4"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path
                d="M68.9409 68.0229H91.7351"
                stroke="#E4E4E4"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path
                d="M149.059 6.02295H57.8528V86.0229H149.059V6.02295Z"
                fill="white"
            />
            <path
                d="M149.059 6.02295H57.8528V86.0229H149.059V6.02295Z"
                stroke="#E4E4E4"
                strokeWidth="4"
            />
            <path
                d="M80.647 38.0229H103.441"
                stroke="#E4E4E4"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path
                d="M80.647 57.0229H103.441"
                stroke="#E4E4E4"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </g>
    </svg>
)

// 样式
const Container = styled.div`
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
`

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`

const Title = styled.h1`
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
`

const Actions = styled.div`
    display: flex;
    gap: 0.75rem;
`

const ActionButton = styled.button`
    background-color: #f9fafb;
    color: #4b5563;
    border: 1px solid #e5e7eb;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: #f3f4f6;
        color: #1f2937;
    }
`

const NotificationList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`

const NotificationItem = styled.div`
    display: flex;
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: ${(props) => (props.isRead ? '#f9fafb' : '#fff')};
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    opacity: ${(props) => (props.isRead ? 0.8 : 1)};
    transition: all 0.2s;

    &:hover {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
`

const IconWrapper = styled.div`
    width: 40px;
    height: 40px;
    margin-right: 1rem;
    flex-shrink: 0;

    svg {
        width: 100%;
        height: 100%;
    }
`

const Content = styled.div`
    flex: 1;
`

const NotificationHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
`

const NotificationTitle = styled.h3`
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
`

const PriorityBadge = styled.span`
    background-color: ${(props) => props.color};
    color: white;
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-weight: 500;
`

const NotificationMessage = styled.p`
    font-size: 0.9375rem;
    color: #4b5563;
    margin: 0.5rem 0;
`

const NotificationFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
`

const NotificationTime = styled.span`
    font-size: 0.8125rem;
    color: #6b7280;
`

const ButtonGroup = styled.div`
    display: flex;
    gap: 0.5rem;
`

const SmallButton = styled.button`
    background-color: #f3f4f6;
    color: #4b5563;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: #e5e7eb;
    }

    &.delete:hover {
        background-color: #fee2e2;
        color: #b91c1c;
    }
`

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3rem 0;
`

const ErrorMessage = styled.div`
    padding: 1rem;
    background-color: #fee2e2;
    color: #b91c1c;
    border-radius: 0.375rem;
    font-size: 0.9375rem;
    margin: 1rem 0;
`

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
    color: #9ca3af;
`

const EmptyText = styled.p`
    font-size: 1rem;
    margin-top: 1rem;
`

const PaginationContainer = styled.div`
    margin-top: 2rem;
    display: flex;
    justify-content: center;
`

export default NotificationsPage
