import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import {
    getUserNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    publishNotification,
    archiveNotification,
    getAllNotifications,
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

    // 加载通知列表
    const loadNotifications = async (page = 1) => {
        try {
            setLoading(true)
            setError(null)
            // 管理员专用接口，获取全部通知
            const result = await getAllNotifications({ page, limit: 10 })
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

    // 类型渲染
    const renderType = (type) => {
        switch (type) {
            case 'announcement':
                return '公告'
            case 'system':
                return '系统'
            case 'resource':
                return '资源'
            case 'course':
                return '课程'
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
                                    <td>{renderType(notification?.type)}</td>
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
    padding: 2.5rem 1rem;
    max-width: 1200px;
    margin: 0 auto;
    background: var(--color-grey-50);
    border-radius: 1.2rem;
    box-shadow: 0 4px 32px 0 rgba(31, 41, 55, 0.08);
`

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
`

const Title = styled.h1`
    font-weight: 700;
    color: var(--color-grey-900);
    /* font-size: 2.2rem; */
    letter-spacing: 1px;
`

const CreateButton = styled.button`
    background: linear-gradient(
        90deg,
        var(--color-primary) 60%,
        var(--color-primary-dark) 100%
    );
    color: var(--color-grey-900);
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 0.5rem;
    font-weight: 600;
    /* font-size: 1.1rem; */
    box-shadow: 0 2px 8px 0 rgba(99, 102, 241, 0.08);
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
    &:hover {
        background: linear-gradient(
            90deg,
            var(--color-primary-dark) 60%,
            var(--color-primary) 100%
        );
        box-shadow: 0 4px 16px 0 rgba(99, 102, 241, 0.16);
    }
`

const Table = styled.table`
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: #fff;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(31, 41, 55, 0.06);
`

const TableHead = styled.thead`
    background: var(--color-grey-50);
    th {
        padding: 1rem 1.2rem;
        text-align: left;
        font-weight: 600;
        color: var(--color-grey-700);
        border-bottom: 2px solid var(--color-grey-200);
        /* font-size: 1.05rem; */
    }
`

const TableBody = styled.tbody`
    td {
        padding: 1rem 1.2rem;
        border-bottom: 1px solid var(--color-grey-100);
        vertical-align: middle;
        /* font-size: 1rem; */
    }
    td.title {
        font-weight: 600;
        color: var(--color-grey-900);
        max-width: 220px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`

const TableRow = styled.tr`
    background: var(--color-grey-0);
    &:hover {
        background: var(--color-grey-50);
    }
`

const StatusBadge = styled.span`
    display: inline-block;
    background: ${(props) => props.color};
    color: var(--color-grey-900);
    padding: 0.3rem 0.9rem;
    border-radius: 1rem;
    font-weight: 600;
    /* font-size: 0.98rem; */
    box-shadow: 0 1px 4px 0 rgba(31, 41, 55, 0.08);
`

const PriorityCell = styled.div`
    color: ${(props) =>
        props.priority === 'high'
            ? '#ef4444'
            : props.priority === 'medium'
            ? '#f59e0b'
            : '#64748b'};
    font-weight: 700;
    /* font-size: 1.05rem; */
`

const ActionButtons = styled.div`
    display: flex;
    gap: 0.7rem;
`

const ActionButton = styled.button`
    padding: 0.35rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    /* font-size: 0.98rem; */
    cursor: pointer;
    transition: background 0.18s, color 0.18s;
    &.edit {
        background: var(--color-primary-light);
        color: var(--color-primary);
        &:hover {
            background: var(--color-primary);
            color: #fff;
        }
    }
    &.archive {
        background: var(--color-grey-50);
        color: var(--color-grey-700);
        &:hover {
            background: var(--color-grey-200);
        }
    }
    &.delete {
        background: var(--color-red-50);
        color: var(--color-red-700);
        &:hover {
            background: var(--color-red-700);
            color: #fff;
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
    background-color: var(--color-red-50);
    color: var(--color-red-700);
    border-radius: 0.375rem;
    /* font-size: 0.9375rem; */
    margin: 1rem 0;
`

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 0;
    background: var(--color-grey-50);
    border-radius: 0.7rem;
    border: 1.5px dashed var(--color-grey-200);
    color: var(--color-grey-600);
    /* font-size: 1.1rem; */
`

const EmptyText = styled.p`
    color: var(--color-grey-600);
    /* font-size: 0.9375rem; */
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
    /* font-size: 0.875rem; */
    font-weight: 500;
    color: var(--color-grey-700);
    margin-bottom: 0.5rem;
`

const Input = styled.input`
    width: 100%;
    padding: 0.625rem;
    border: 1px solid var(--color-grey-200);
    border-radius: 0.375rem;
    /* font-size: 0.9375rem; */

    &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
    }
`

const TextArea = styled.textarea`
    width: 100%;
    padding: 0.625rem;
    border: 1px solid var(--color-grey-200);
    border-radius: 0.375rem;
    /* font-size: 0.9375rem; */
    font-family: inherit;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
    }
`

const Select = styled.select`
    width: 100%;
    padding: 0.625rem;
    border: 1px solid var(--color-grey-200);
    border-radius: 0.375rem;
    /* font-size: 0.9375rem; */
    background-color: white;

    &:focus {
        outline: none;
        border-color: var(--color-primary);
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
    color: var(--color-grey-700);
    border: 1px solid var(--color-grey-200);

    &:hover {
        background-color: var(--color-grey-50);
    }
`

const SubmitButton = styled(Button)`
    background-color: var(--color-primary);
    color: var(--color-grey-900);
    border: none;

    &:hover {
        background-color: var(--color-primary-dark);
    }
`

export default NotificationManagePage
