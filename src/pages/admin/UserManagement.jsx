import Heading from '../../ui/Heading'
import Row from '../../ui/Row'
import UserTable from '../../features/users/UserTable'

function UserManagement() {
    return (
        <Row type="vertical">
            <Row
                type="horizontal"
                style={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Heading as="h1">用户管理</Heading>
                {/* 可能需要添加操作按钮，例如添加用户 */}
            </Row>

            <Row>
                <UserTable />
            </Row>
        </Row>
    )
}

export default UserManagement
