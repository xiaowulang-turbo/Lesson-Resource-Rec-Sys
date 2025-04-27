import styled from 'styled-components'
import {
    HiOutlineUserCircle,
    HiOutlineLockClosed,
    HiOutlineHeart,
    HiOutlineBell,
} from 'react-icons/hi2'

const SideMenu = styled.div`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem;
    height: fit-content;
    box-shadow: var(--shadow-sm);
`

const MenuButton = styled.button`
    display: flex;
    align-items: center;
    gap: 1.2rem;
    width: 100%;
    padding: 1.2rem 1.6rem;
    font-size: 1.6rem;
    border: none;
    border-radius: var(--border-radius-sm);
    background-color: ${(props) =>
        props.active ? 'var(--color-brand-600)' : 'transparent'};
    color: ${(props) =>
        props.active ? 'var(--color-grey-0)' : 'var(--color-grey-600)'};
    cursor: pointer;
    transition: all 0.3s;
    text-align: left;
    margin-bottom: 0.8rem;

    &:hover {
        background-color: ${(props) =>
            props.active ? 'var(--color-brand-700)' : 'var(--color-grey-100)'};
    }

    & svg {
        width: 2.4rem;
        height: 2.4rem;
    }
`

function AccountMenu({ activeTab, onTabChange }) {
    const menuItems = [
        { id: 'profile', label: '个人信息', icon: <HiOutlineUserCircle /> },
        { id: 'security', label: '安全设置', icon: <HiOutlineLockClosed /> },
        { id: 'preferences', label: '兴趣喜好', icon: <HiOutlineHeart /> },
        { id: 'notifications', label: '通知设置', icon: <HiOutlineBell /> },
    ]

    return (
        <SideMenu>
            {menuItems.map((item) => (
                <MenuButton
                    key={item.id}
                    active={activeTab === item.id}
                    onClick={() => onTabChange(item.id)}
                >
                    {item.icon} {item.label}
                </MenuButton>
            ))}
        </SideMenu>
    )
}

export default AccountMenu
