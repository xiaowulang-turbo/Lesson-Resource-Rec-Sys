import styled from 'styled-components'
import HeaderMenu from './HeaderMenu'
import UserAvatar from '../features/authentication/UserAvatar'
import {
    HiOutlineMenuAlt1,
    HiOutlineMenuAlt3,
    HiOutlineAcademicCap,
    HiOutlineSearch,
} from 'react-icons/hi'
import ButtonIcon from './ButtonIcon'
import { useLayout } from '../context/LayoutContext'
import MainNav from './MainNav'
import Logo from './Logo'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const StyleHeader = styled.div`
    background-color: var(--color-grey-0);
    padding: ${(props) =>
        props.$showNavInHeader ? '1.6rem 4.8rem' : '1.2rem 4.8rem'};
    border-bottom: 1px solid var(--color-grey-100);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    display: flex;
    gap: 2.4rem;
    align-items: center;
    justify-content: ${(props) =>
        props.$showNavInHeader ? 'space-between' : 'flex-end'};
`

const LayoutToggle = styled(ButtonIcon)`
    margin-right: ${(props) => (props.$showNavInHeader ? '0' : 'auto')};
`

const NavContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 3.2rem;
    flex-grow: 1;
    justify-content: center;
`

const SearchContainer = styled.form`
    display: flex;
    align-items: center;
    background-color: var(--color-grey-100);
    border-radius: var(--border-radius-sm);
    padding: 0.6rem 1.2rem;
    transition: all 0.3s;
    width: 250px;

    &:focus-within {
        background-color: var(--color-grey-0);
        outline: 2px solid var(--color-brand-600);
        box-shadow: 0 0 0 3px var(--color-brand-100);
        width: 300px;
    }
`

const SearchInput = styled.input`
    border: none;
    background: none;
    color: var(--color-grey-700);
    font-size: 1.4rem;
    width: 100%;

    &::placeholder {
        color: var(--color-grey-500);
    }

    &:focus {
        outline: none;
    }
`

const SearchIcon = styled(HiOutlineSearch)`
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-grey-500);
    margin-right: 0.8rem;
`

const RightContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1.6rem;
`

const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1.2rem;

    & h1 {
        font-size: 2rem;
        font-weight: 600;
        color: var(--color-brand-600);
        margin: 0;
    }
`

const LogoImage = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;

    & svg {
        width: 3.2rem;
        height: 3.2rem;
        color: var(--color-brand-600);
    }
`

function Header({ showNavInHeader = false }) {
    const { isNavbarOnTop, toggleNavbarPosition } = useLayout()
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }

    return (
        <StyleHeader $showNavInHeader={showNavInHeader}>
            <LogoContainer>
                <LogoImage>
                    <HiOutlineAcademicCap />
                </LogoImage>
                {showNavInHeader && <h1>教学资源推荐系统</h1>}
            </LogoContainer>

            <LayoutToggle
                onClick={toggleNavbarPosition}
                $showNavInHeader={showNavInHeader}
            >
                {isNavbarOnTop ? <HiOutlineMenuAlt3 /> : <HiOutlineMenuAlt1 />}
            </LayoutToggle>

            {showNavInHeader && (
                <NavContainer>
                    <MainNav isHorizontal={true} />
                </NavContainer>
            )}

            <RightContainer>
                <SearchContainer onSubmit={handleSearchSubmit}>
                    <SearchIcon />
                    <SearchInput
                        type="text"
                        placeholder="搜索资源..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </SearchContainer>

                <UserAvatar />
                <HeaderMenu />
            </RightContainer>
        </StyleHeader>
    )
}

export default Header
