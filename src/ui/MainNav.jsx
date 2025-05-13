/* eslint-disable no-unused-vars */
import {
    HiOutlineHome,
    HiOutlineUsers,
    HiOutlineBookOpen,
    HiOutlineUserCircle,
} from 'react-icons/hi2'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../context/AuthContext'

const VerticalNavList = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`

const HorizontalNavList = styled.ul`
    display: flex;
    flex-direction: row;
    gap: 3.2rem;
    align-items: center;
    margin: 0;
    padding: 0;
`

const StyledNavLink = styled(NavLink)`
    &:link,
    &:visited {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        color: var(--color-grey-600);
        font-size: ${(props) => (props.isHorizontal ? '1.7rem' : '1.6rem')};
        font-weight: 500;
        padding: ${(props) =>
            props.isHorizontal ? '0.6rem 1.2rem' : '1.2rem 2.4rem'};
        transition: all 0.3s;
        border-radius: var(--border-radius-sm);
        text-decoration: none;
    }

    /* This works because react-router places the active class on the active NavLink */
    &:hover,
    &:active,
    &.active:link,
    &.active:visited {
        color: ${(props) =>
            props.isHorizontal
                ? 'var(--color-brand-600)'
                : 'var(--color-grey-800)'};
        background-color: ${(props) =>
            props.isHorizontal
                ? 'var(--color-grey-50)'
                : 'var(--color-grey-50)'};
        border-radius: var(--border-radius-sm);
        box-shadow: ${(props) =>
            props.isHorizontal ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'};
    }

    & svg {
        width: ${(props) => (props.isHorizontal ? '2.4rem' : '2.4rem')};
        height: ${(props) => (props.isHorizontal ? '2.4rem' : '2.4rem')};
        color: ${(props) =>
            props.isHorizontal
                ? 'var(--color-brand-600)'
                : 'var(--color-grey-400)'};
        transition: all 0.3s;
    }

    &:hover svg,
    &:active svg,
    &.active:link svg,
    &.active:visited svg {
        color: var(--color-brand-600);
        transform: ${(props) =>
            props.isHorizontal ? 'translateY(-1px)' : 'none'};
    }
`

function MainNav({ isHorizontal = false }) {
    const NavList = isHorizontal ? HorizontalNavList : VerticalNavList
    const { user } = useAuth()
    const isAdmin = user && user.role === 'admin'

    return (
        <nav>
            <NavList>
                {isAdmin ? (
                    <>
                        <li>
                            <StyledNavLink
                                to="/admin/resource-management"
                                isHorizontal={isHorizontal}
                            >
                                <HiOutlineBookOpen />
                                资源管理
                            </StyledNavLink>
                        </li>
                        <li>
                            <StyledNavLink
                                to="/admin/user-management"
                                isHorizontal={isHorizontal}
                            >
                                <HiOutlineUsers />
                                用户管理
                            </StyledNavLink>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <StyledNavLink
                                to="/home"
                                isHorizontal={isHorizontal}
                            >
                                <HiOutlineHome />
                                首页
                            </StyledNavLink>
                        </li>
                        <li>
                            <StyledNavLink
                                to="/resources"
                                isHorizontal={isHorizontal}
                            >
                                <HiOutlineBookOpen />
                                资源中心
                            </StyledNavLink>
                        </li>
                        <li>
                            <StyledNavLink
                                to="/profile"
                                isHorizontal={isHorizontal}
                            >
                                <HiOutlineUserCircle />
                                个人中心
                            </StyledNavLink>
                        </li>
                    </>
                )}
            </NavList>
        </nav>
    )
}

export default MainNav
