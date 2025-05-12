import Spinner from '../../ui/Spinner'
import Table from '../../ui/Table'
import Menus from '../../ui/Menus'
import Empty from '../../ui/Empty'
import { useUsers } from './useUsers'

function UserTable() {
    const { isLoading, users, error } = useUsers()

    if (isLoading) return <Spinner />
    if (error) return <p>错误: {error.message}</p>
    if (!users || users.length === 0) return <Empty resourceName="用户" />

    return (
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
                    render={(user) => <UserRow user={user} key={user._id} />}
                />
            </Table>
        </Menus>
    )
}

function UserRow({ user }) {
    const { _id, name, email, photo, role, createdAt } = user

    return (
        <Table.Row>
            <img
                src={
                    photo && photo.startsWith('http')
                        ? photo
                        : photo
                        ? `http://127.0.0.1:8000/img/users/${photo}`
                        : '/default-user.jpg'
                }
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
                        {/* <Menus.Button icon={<HiPencil />}>编辑</Menus.Button> */}
                        {/* <Menus.Button icon={<HiTrash />}>删除</Menus.Button> */}
                    </Menus.List>
                </Menus.Menu>
            </div>
        </Table.Row>
    )
}

export default UserTable
