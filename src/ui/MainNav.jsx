/* eslint-disable no-unused-vars */
import {
    HiOutlineCog6Tooth,
    HiOutlineHome,
    HiOutlineHomeModern,
    HiOutlineUsers,
    HiOutlineAcademicCap,
    HiOutlineBookOpen,
    HiOutlineUserCircle,
} from 'react-icons/hi2'
import { HiOutlineCalendar } from 'react-icons/hi2'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

const VerticalNavList = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`

const HorizontalNavList = styled.ul`
    display: flex;
    flex-direction: row;
    gap: 2.4rem;
    align-items: center;
    margin: 0;
    padding: 0;
`

const StyledNavLink = styled(NavLink)`
    &:link,
    &:visited {
        display: flex;
        align-items: center;
        gap: 1.2rem;
        color: var(--color-grey-600);
        font-size: 1.6rem;
        font-weight: 500;
        padding: ${(props) =>
            props.isHorizontal ? '0.4rem 0.8rem' : '1.2rem 2.4rem'};
        transition: all 0.3s;
    }

    /* This works because react-router places the active class on the active NavLink */
    &:hover,
    &:active,
    &.active:link,
    &.active:visited {
        color: var(--color-grey-800);
        background-color: ${(props) =>
            props.isHorizontal ? 'transparent' : 'var(--color-grey-50)'};
        border-radius: var(--border-radius-sm);
    }

    & svg {
        width: 2.4rem;
        height: 2.4rem;
        color: var(--color-grey-400);
        transition: all 0.3s;
    }

    &:hover svg,
    &:active svg,
    &.active:link svg,
    &.active:visited svg {
        color: var(--color-brand-600);
    }
`

function MainNav({ isHorizontal = false }) {
    const NavList = isHorizontal ? HorizontalNavList : VerticalNavList

    return (
        <nav>
            <NavList>
                <li>
                    <StyledNavLink to="/home" isHorizontal={isHorizontal}>
                        <HiOutlineHome />
                        首页
                    </StyledNavLink>
                </li>
                {/* <li>
                    <StyledNavLink to="/dashboard" isHorizontal={isHorizontal}>
                        <HiOutlineHome />
                        Home
                    </StyledNavLink>
                </li>
                <li>
                    <StyledNavLink to="/bookings" isHorizontal={isHorizontal}>
                        <HiOutlineCalendar />
                        Bookings
                    </StyledNavLink>
                </li>
                <li>
                    <StyledNavLink to="/cabins" isHorizontal={isHorizontal}>
                        <HiOutlineHomeModern />
                        cabins
                    </StyledNavLink>
                </li> */}
                <li>
                    <StyledNavLink to="/courses" isHorizontal={isHorizontal}>
                        <HiOutlineAcademicCap />
                        课程
                    </StyledNavLink>
                </li>
                <li>
                    <StyledNavLink to="/resources" isHorizontal={isHorizontal}>
                        <HiOutlineBookOpen />
                        学习资源
                    </StyledNavLink>
                </li>
                <li>
                    <StyledNavLink to="/profile" isHorizontal={isHorizontal}>
                        <HiOutlineUserCircle />
                        个人中心
                    </StyledNavLink>
                </li>
                {/* <li>
                    <StyledNavLink to="/users" isHorizontal={isHorizontal}>
                        <HiOutlineUsers />
                        users
                    </StyledNavLink>
                </li>
                <li>
                    <StyledNavLink to="/settings" isHorizontal={isHorizontal}>
                        <HiOutlineCog6Tooth />
                        settings
                    </StyledNavLink>
                </li> */}
            </NavList>
        </nav>
    )
}

export default MainNav
