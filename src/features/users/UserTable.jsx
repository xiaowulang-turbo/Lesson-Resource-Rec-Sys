import Spinner from '../../ui/Spinner'
import Table from '../../ui/Table'
import Menus from '../../ui/Menus'
import Empty from '../../ui/Empty'
import { useUsers } from './useUsers'
import defaultUser from '../../public/default-user.jpg'
import Modal from '../../ui/SimpleModal'
import ConfirmDelete from '../../ui/ConfirmDelete'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteUser, updateUser } from '../../services/apiUsers'
import { useState } from 'react'
import toast from 'react-hot-toast'
import EditUserForm from './EditUserForm'

function UserTable() {
    const { isLoading, users, error } = useUsers()
    const [deletingUserId, setDeletingUserId] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const queryClient = useQueryClient()
    const [editingUser, setEditingUser] = useState(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const { mutate: deleteMutate, isLoading: isDeleting } = useMutation({
        mutationFn: deleteUser,
        onSuccess: (data) => {
            toast.success(data?.message || '用户已成功删除')
            queryClient.invalidateQueries({ queryKey: ['users'] })
            setIsDeleteModalOpen(false)
        },
        onError: (err) => {
            toast.error(err.message || '删除用户失败')
        },
        onSettled: () => {
            setDeletingUserId(null)
        },
    })

    const { mutate: updateMutate, isLoading: isUpdating } = useMutation({
        mutationFn: ({ userId, userData }) => updateUser(userId, userData),
        onSuccess: () => {
            toast.success('用户信息已更新')
            queryClient.invalidateQueries({ queryKey: ['users'] })
            setIsEditModalOpen(false)
        },
        onError: (err) => {
            toast.error(err.message || '更新用户信息失败')
        },
        onSettled: () => {
            setEditingUser(null)
        },
    })

    const handleOpenDeleteModal = (userId) => {
        setDeletingUserId(userId)
        setIsDeleteModalOpen(true)
    }

    const handleCloseDeleteModal = () => {
        setDeletingUserId(null)
        setIsDeleteModalOpen(false)
    }

    const handleConfirmDelete = () => {
        if (deletingUserId) {
            deleteMutate(deletingUserId)
        }
    }

    const handleOpenEditModal = (user) => {
        setEditingUser(user)
        setIsEditModalOpen(true)
    }

    const handleCloseEditModal = () => {
        setEditingUser(null)
        setIsEditModalOpen(false)
    }

    const handleEditSubmit = (userData) => {
        if (editingUser && editingUser._id) {
            updateMutate({ userId: editingUser._id, userData })
        }
    }

    if (isLoading) return <Spinner />
    if (error) return <p>错误: {error.message}</p>
    if (!users || users.length === 0)
        return (
            <Empty
                icon="👤"
                message="暂无用户"
                subtext="系统中还没有其他用户"
            />
        )

    return (
        <>
            <Menus>
                <Table columns="0.6fr 1.8fr 2.2fr 1fr 1fr 1fr">
                    <Table.Header>
                        <div>头像</div>
                        <div>名称</div>
                        <div>邮箱</div>
                        <div>角色</div>
                        <div>注册时间</div>
                        <div>操作</div>
                    </Table.Header>

                    <Table.Body
                        data={users}
                        render={(user) => (
                            <UserRow
                                user={user}
                                key={user._id}
                                onDelete={handleOpenDeleteModal}
                                onEdit={handleOpenEditModal}
                            />
                        )}
                    />
                </Table>
            </Menus>
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                title="确认删除用户"
                width="500px"
            >
                <ConfirmDelete
                    resourceName="用户"
                    onConfirm={handleConfirmDelete}
                    disabled={isDeleting}
                    onCloseModal={handleCloseDeleteModal}
                />
            </Modal>
            <Modal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                title="编辑用户信息"
                width="400px"
            >
                {editingUser && (
                    <EditUserForm
                        user={editingUser}
                        onSubmit={handleEditSubmit}
                        onCancel={handleCloseEditModal}
                        isLoading={isUpdating}
                    />
                )}
            </Modal>
        </>
    )
}

function UserRow({ user, onDelete, onEdit }) {
    const { _id, name, email, photo, role, createdAt } = user

    return (
        <Table.Row>
            <img
                src={
                    photo && photo.startsWith('http')
                        ? photo
                        : photo
                        ? `http://127.0.0.1:8000/img/users/${photo}`
                        : defaultUser
                }
                onError={(e) => {
                    e.target.src = defaultUser
                }}
                alt={`Avatar of ${name}`}
                style={{
                    display: 'block',
                    width: '3.6rem',
                    height: '3.6rem',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    outline: '2px solid var(--color-grey-100)',
                }}
            />
            <span>{name}</span>
            <span>{email}</span>
            <span>{role}</span>
            <span>{new Date(createdAt).toLocaleDateString()}</span>
            <div>
                <Menus.Menu>
                    <Menus.Toggle id={_id} />
                    <Menus.List id={_id}>
                        <Menus.Button icon={null} onClick={() => onEdit(user)}>
                            编辑
                        </Menus.Button>
                        <Menus.Button icon={null} onClick={() => onDelete(_id)}>
                            删除
                        </Menus.Button>
                    </Menus.List>
                </Menus.Menu>
            </div>
        </Table.Row>
    )
}

export default UserTable
