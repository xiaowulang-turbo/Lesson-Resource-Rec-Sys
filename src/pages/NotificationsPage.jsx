import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { getUserNotifications } from '../services/notificationService'
import Spinner from '../ui/Spinner'
import Pagination from '../ui/Pagination'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const NotificationsPage = () => {
    const [allNotifications, setAllNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // 加载通知列表
    const loadNotifications = async (page = 1) => {
        try {
            setLoading(true)
            setError(null)
            const result = await getUserNotifications({ page, limit: 10 })
            setAllNotifications(result.data.notifications)
            setTotalPages(result.data.pagination.pages)
            setCurrentPage(page)
        } catch (err) {
            setError(err.message)
            toast.error(`加载通知失败: ${err.message}`)
        } finally {
            setLoading(false)
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

    // 格式化日期
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'yyyy-MM-dd HH:mm', {
                locale: zhCN,
            })
        } catch (err) {
            return '未知时间'
        }
    }

    // 将通知类型转换为中文显示
    const getChineseNotificationType = (type) => {
        const typeMap = {
            announcement: '公告',
            notice: '通知',
            alert: '提醒',
            update: '更新',
            maintenance: '维护',
            news: '新闻',
            event: '活动',
            system: '系统',
            warning: '警告',
            info: '信息',
        }

        // 如果已经是中文，直接返回
        if (/[\u4e00-\u9fa5]/.test(type)) {
            return type
        }

        // 转换英文类型为中文
        return typeMap[type] || type
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
                <Title>系统通知</Title>
            </Header>
            {loading ? (
                <LoadingContainer>
                    <Spinner />
                </LoadingContainer>
            ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : allNotifications.filter((item) => item.status === 'published')
                  .length === 0 ? (
                <EmptyState>
                    <EmptyText>暂无通知</EmptyText>
                </EmptyState>
            ) : (
                <>
                    <NotificationList>
                        {allNotifications
                            .filter((item) => item.status === 'published')
                            .map((item) => (
                                <NotificationItem key={item._id}>
                                    <Content>
                                        <NotificationHeader>
                                            <NotificationTitle>
                                                {item.title}
                                            </NotificationTitle>
                                            {renderPriorityBadge(item.priority)}
                                        </NotificationHeader>
                                        <NotificationMessage>
                                            {item.content}
                                        </NotificationMessage>
                                        <NotificationMeta>
                                            <MetaItem>
                                                类型：
                                                {getChineseNotificationType(
                                                    item.type
                                                )}
                                            </MetaItem>
                                            {/* <MetaItem>
                                            受众：{item.targetAudience}
                                        </MetaItem> */}
                                            <MetaItem>
                                                发布时间：
                                                {formatDate(item.createdAt)}
                                            </MetaItem>
                                        </NotificationMeta>
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

// 样式
const Container = styled.div`
    padding: 2rem;
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--color-grey-50);
`
const Header = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 2.5rem;
`
const Title = styled.h1`
    /* font-size: 2rem; */
    font-weight: 700;
    color: var(--color-grey-900);
    letter-spacing: 1px;
    margin-bottom: 0;
`
const NotificationList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    max-width: 540px;
`
const NotificationItem = styled.div`
    display: flex;
    padding: 1.5rem 2rem;
    border-radius: 1rem;
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-200);
    box-shadow: 0 4px 24px 0 rgba(31, 41, 55, 0.08);
    transition: box-shadow 0.2s;
    width: 100%;
    min-width: 320px;
    max-width: 540px;
    margin: 0 auto;
    &:hover {
        box-shadow: 0 8px 32px 0 rgba(31, 41, 55, 0.12);
    }
`
const Content = styled.div`
    flex: 1;
`
const NotificationHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
`
const NotificationTitle = styled.h3`
    /* font-size: 1.25rem; */
    font-weight: 600;
    color: var(--color-grey-900);
    margin: 0;
`
const PriorityBadge = styled.span`
    background-color: ${(props) => props.color};
    color: var(--color-grey-0);
    /* font-size: 0.85rem; */
    padding: 0.2rem 0.8rem;
    border-radius: 0.5rem;
    font-weight: 500;
    margin-left: 0.5rem;
`
const NotificationMessage = styled.p`
    /* font-size: 1.1rem; */
    color: var(--color-grey-700);
    margin: 0.5rem 0 0.75rem 0;
    line-height: 1.7;
`
const NotificationMeta = styled.div`
    display: flex;
    gap: 2rem;
    /* font-size: 0.98rem; */
    color: var(--color-grey-600);
    margin-top: 0.5rem;
    flex-wrap: wrap;
`
const MetaItem = styled.span``
const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3rem 0;
`
const ErrorMessage = styled.div`
    padding: 1rem;
    background-color: var(--color-red-100);
    color: var(--color-red-700);
    border-radius: 0.375rem;
    /* font-size: 1.1rem; */
    margin: 1rem 0;
`
const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
    color: var(--color-grey-600);
`
const EmptyText = styled.p`
    /* font-size: 1.1rem; */
    margin-top: 1rem;
`
const PaginationContainer = styled.div`
    margin-top: 2.5rem;
    display: flex;
    justify-content: center;
`
export default NotificationsPage
