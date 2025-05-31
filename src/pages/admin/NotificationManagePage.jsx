import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import {
    getUserNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    publishNotification,
    archiveNotification,
} from '../../services/notificationService'
import Spinner from '../../ui/Spinner'
import toast from 'react-hot-toast'
import Pagination from '../../ui/Pagination'
import { useNavigate } from 'react-router-dom'
import Modal from '../../ui/SimpleModal'

const NotificationManagePage = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formMode, setFormMode] = useState('create') // 'create' or 'edit'
    const [selectedNotification, setSelectedNotification] = useState(null)
    const [formValues, setFormValues] = useState({
        title: '',
        content: '',
        type: 'announcement',
        priority: 'medium',
        targetAudience: 'all',
        expiresAt: '',
    })

    const navigate = useNavigate()

    // 加载通知列表
    const loadNotifications = async (page = 1) => {
        try {
            setLoading(true)
            setError(null)
            // 这里使用与普通用户相同的接口，后续可以考虑添加管理员专用接口
            const result = await getUserNotifications({ page, limit: 10 })
            setNotifications(result.data.notifications)
            setTotalPages(result.data.pagination.pages)
            setCurrentPage(page)
        } catch (err) {
            console.error('加载通知失败:', err)
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

    // 打开创建通知模态框
    const handleOpenCreateModal = () => {
        setFormMode('create')
        resetForm()
        setIsModalOpen(true)
    }

    // 打开编辑通知模态框
    const handleOpenEditModal = (notification) => {
        setFormMode('edit')
        setSelectedNotification(notification)

        // 转换日期格式
        const expiresDate = notification.expiresAt
            ? new Date(notification.expiresAt).toISOString().split('T')[0]
            : ''

        setFormValues({
            title: notification.title || '',
            content: notification.content || '',
            type: notification.type || 'announcement',
            priority: notification.priority || 'medium',
            targetAudience: notification.targetAudience || 'all',
            expiresAt: expiresDate,
        })

        setIsModalOpen(true)
    }

    // 关闭模态框
    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    // 重置表单
    const resetForm = () => {
        setFormValues({
            title: '',
            content: '',
            type: 'announcement',
            priority: 'medium',
            targetAudience: 'all',
            expiresAt: '',
        })
    }

    // 表单输入处理
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormValues({
            ...formValues,
            [name]: value,
        })
    }

    // 提交表单
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            // 准备提交数据
            const notificationData = {
                ...formValues,
            }

            // 处理日期转换
            if (formValues.expiresAt) {
                notificationData.expiresAt = new Date(formValues.expiresAt)
            }

            if (formMode === 'create') {
                // 创建新通知
                const result = await createNotification(notificationData)
                toast.success('通知创建成功')
                setIsModalOpen(false)
                loadNotifications(currentPage)
            } else {
                // 更新通知
                const result = await updateNotification(
                    selectedNotification._id,
                    notificationData
                )
                toast.success('通知更新成功')
                setIsModalOpen(false)
                loadNotifications(currentPage)
            }
        } catch (err) {
            console.error('保存通知失败:', err)
            toast.error(`保存通知失败: ${err.message}`)
        }
    }

    // 删除通知
    const handleDelete = async (id) => {
        if (!window.confirm('确定要删除这条通知吗？此操作不可撤销。')) {
            return
        }

        try {
            await deleteNotification(id)
            toast.success('通知已删除')
            loadNotifications(currentPage)
        } catch (err) {
            console.error('删除通知失败:', err)
            toast.error(`删除通知失败: ${err.message}`)
        }
    }

    // 发布通知
    const handlePublish = async (id) => {
        try {
            await publishNotification(id)
            toast.success('通知已发布')
            loadNotifications(currentPage)
        } catch (err) {
            console.error('发布通知失败:', err)
            toast.error(`发布通知失败: ${err.message}`)
        }
    }

    // 归档通知
    const handleArchive = async (id) => {
        try {
            await archiveNotification(id)
            toast.success('通知已归档')
            loadNotifications(currentPage)
        } catch (err) {
            console.error('归档通知失败:', err)
            toast.error(`归档通知失败: ${err.message}`)
        }
    }

    // 状态标签渲染
    const renderStatusBadge = (status) => {
        let color
        let text

        switch (status) {
            case 'draft':
                color = '#94a3b8'
                text = '草稿'
                break
            case 'published':
                color = '#22c55e'
                text = '已发布'
                break
            case 'archived':
                color = '#64748b'
                text = '已归档'
                break
            default:
                color = '#94a3b8'
                text = '未知'
        }

        return <StatusBadge color={color}>{text}</StatusBadge>
    }

    // 目标受众渲染
    const renderAudience = (audience) => {
        switch (audience) {
            case 'all':
                return '所有用户'
            case 'students':
                return '学生'
            case 'teachers':
                return '教师'
            case 'admins':
                return '管理员'
            default:
                return '未知'
        }
    }

    // 格式化日期
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch (err) {
            return '未知时间'
        }
    }

    return (
        <Container>
            <Header>
                <Title>通知管理</Title>
                <CreateButton onClick={handleOpenCreateModal}>
                    创建新通知
                </CreateButton>
            </Header>

            {loading ? (
                <LoadingContainer>
                    <Spinner />
                </LoadingContainer>
            ) : error ? (
                <ErrorMessage>{error}</ErrorMessage>
            ) : notifications.length === 0 ? (
                <EmptyState>
                    <EmptyText>
                        暂无通知，点击"创建新通知"添加第一条通知
                    </EmptyText>
                </EmptyState>
            ) : (
                <>
                    <Table>
                        <TableHead>
                            <tr>
                                <th>标题</th>
                                <th>状态</th>
                                <th>类型</th>
                                <th>优先级</th>
                                <th>目标受众</th>
                                <th>创建时间</th>
                                <th>过期时间</th>
                                <th>操作</th>
                            </tr>
                        </TableHead>
                        <TableBody>
                            {notifications.map((notification) => (
                                <TableRow key={notification._id}>
                                    <td className="title">
                                        {notification?.title}
                                    </td>
                                    <td>
                                        {renderStatusBadge(
                                            notification?.status
                                        )}
                                    </td>
                                    <td>{notification?.type}</td>
                                    <td>
                                        <PriorityCell
                                            priority={notification?.priority}
                                        >
                                            {notification?.priority === 'high'
                                                ? '高'
                                                : notification?.priority ===
                                                  'medium'
                                                ? '中'
                                                : '低'}
                                        </PriorityCell>
                                    </td>
                                    <td>
                                        {renderAudience(
                                            notification?.targetAudience
                                        )}
                                    </td>
                                    <td>
                                        {formatDate(notification?.createdAt)}
                                    </td>
                                    <td>
                                        {formatDate(notification?.expiresAt)}
                                    </td>
                                    <td>
                                        <ActionButtons>
                                            {notification?.status ===
                                                'draft' && (
                                                <>
                                                    <ActionButton
                                                        className="edit"
                                                        onClick={() =>
                                                            handleOpenEditModal(
                                                                notification
                                                            )
                                                        }
                                                    >
                                                        编辑
                                                    </ActionButton>
                                                </>
                                            )}
                                            {notification?.status ===
                                                'published' && (
                                                <ActionButton
                                                    className="archive"
                                                    onClick={() =>
                                                        handleArchive(
                                                            notification?._id
                                                        )
                                                    }
                                                >
                                                    归档
                                                </ActionButton>
                                            )}
                                            <ActionButton
                                                className="delete"
                                                onClick={() =>
                                                    handleDelete(
                                                        notification?._id
                                                    )
                                                }
                                            >
                                                删除
                                            </ActionButton>
                                        </ActionButtons>
                                    </td>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

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

            {/* 创建/编辑通知模态框 */}
            <Modal
                title={formMode === 'create' ? '创建新通知' : '编辑通知'}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                width="600px"
            >
                <NotificationForm onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label htmlFor="title">标题*</Label>
                        <Input
                            type="text"
                            id="title"
                            name="title"
                            value={formValues.title}
                            onChange={handleInputChange}
                            placeholder="请输入通知标题"
                            required
                            maxLength={100}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label htmlFor="content">内容*</Label>
                        <TextArea
                            id="content"
                            name="content"
                            value={formValues.content}
                            onChange={handleInputChange}
                            placeholder="请输入通知内容"
                            required
                            rows={5}
                        />
                    </FormGroup>

                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="type">类型</Label>
                            <Select
                                id="type"
                                name="type"
                                value={formValues.type}
                                onChange={handleInputChange}
                            >
                                <option value="announcement">公告</option>
                                <option value="system">系统</option>
                                <option value="resource">资源</option>
                                <option value="course">课程</option>
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="priority">优先级</Label>
                            <Select
                                id="priority"
                                name="priority"
                                value={formValues.priority}
                                onChange={handleInputChange}
                            >
                                <option value="low">低</option>
                                <option value="medium">中</option>
                                <option value="high">高</option>
                            </Select>
                        </FormGroup>
                    </FormRow>

                    <FormRow>
                        <FormGroup>
                            <Label htmlFor="targetAudience">目标受众</Label>
                            <Select
                                id="targetAudience"
                                name="targetAudience"
                                value={formValues.targetAudience}
                                onChange={handleInputChange}
                            >
                                <option value="all">所有用户</option>
                                <option value="students">学生</option>
                                <option value="teachers">教师</option>
                                <option value="admins">管理员</option>
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="expiresAt">过期时间</Label>
                            <Input
                                type="date"
                                id="expiresAt"
                                name="expiresAt"
                                value={formValues.expiresAt}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </FormGroup>
                    </FormRow>

                    <ButtonGroup>
                        <CancelButton type="button" onClick={handleCloseModal}>
                            取消
                        </CancelButton>
                        <SubmitButton type="submit">
                            {formMode === 'create' ? '创建' : '更新'}
                        </SubmitButton>
                    </ButtonGroup>
                </NotificationForm>
            </Modal>
        </Container>
    )
}

// 样式
const Container = styled.div`
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
`

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
`

const Title = styled.h1`
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
`

const CreateButton = styled.button`
    background-color: #4f46e5;
    color: white;
    border: none;
    padding: 0.625rem 1.25rem;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #4338ca;
    }
`

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
`

const TableHead = styled.thead`
    background-color: #f9fafb;

    th {
        padding: 0.75rem 1rem;
        text-align: left;
        font-weight: 500;
        color: #4b5563;
        border-bottom: 1px solid #e5e7eb;
    }
`

const TableBody = styled.tbody`
    td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #e5e7eb;
    }

    td.title {
        font-weight: 500;
        color: #1f2937;
    }
`

const TableRow = styled.tr`
    &:hover {
        background-color: #f9fafb;
    }
`

const StatusBadge = styled.span`
    display: inline-block;
    background-color: ${(props) => props.color};
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
`

const PriorityCell = styled.div`
    color: ${(props) =>
        props.priority === 'high'
            ? '#ef4444'
            : props.priority === 'medium'
            ? '#f59e0b'
            : '#64748b'};
    font-weight: 500;
`

const ActionButtons = styled.div`
    display: flex;
    gap: 0.5rem;
`

const ActionButton = styled.button`
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;

    &.edit {
        background-color: #e0f2fe;
        color: #0284c7;

        &:hover {
            background-color: #bae6fd;
        }
    }

    &.archive {
        background-color: #f3f4f6;
        color: #4b5563;

        &:hover {
            background-color: #e5e7eb;
        }
    }

    &.delete {
        background-color: #fee2e2;
        color: #b91c1c;

        &:hover {
            background-color: #fecaca;
        }
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
    justify-content: center;
    align-items: center;
    padding: 4rem 0;
    background-color: #f9fafb;
    border-radius: 0.5rem;
    border: 1px dashed #d1d5db;
`

const EmptyText = styled.p`
    color: #6b7280;
    font-size: 0.9375rem;
`

const PaginationContainer = styled.div`
    margin-top: 2rem;
    display: flex;
    justify-content: center;
`

const NotificationForm = styled.form`
    width: 100%;
`

const FormGroup = styled.div`
    margin-bottom: 1.25rem;
    width: 100%;
`

const FormRow = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 1.25rem;

    ${FormGroup} {
        margin-bottom: 0;
        flex: 1;
    }
`

const Label = styled.label`
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
    margin-bottom: 0.5rem;
`

const Input = styled.input`
    width: 100%;
    padding: 0.625rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.9375rem;

    &:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
    }
`

const TextArea = styled.textarea`
    width: 100%;
    padding: 0.625rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.9375rem;
    font-family: inherit;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
    }
`

const Select = styled.select`
    width: 100%;
    padding: 0.625rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.9375rem;
    background-color: white;

    &:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
    }
`

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
`

const Button = styled.button`
    padding: 0.625rem 1.25rem;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
`

const CancelButton = styled(Button)`
    background-color: white;
    color: #4b5563;
    border: 1px solid #d1d5db;

    &:hover {
        background-color: #f9fafb;
    }
`

const SubmitButton = styled(Button)`
    background-color: #4f46e5;
    color: white;
    border: none;

    &:hover {
        background-color: #4338ca;
    }
`

export default NotificationManagePage
