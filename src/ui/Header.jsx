import styled from 'styled-components'
import HeaderMenu from './HeaderMenu'
import UserAvatar from '../features/authentication/UserAvatar'
import { HiOutlineMenuAlt1, HiOutlineMenuAlt3 } from 'react-icons/hi'
import ButtonIcon from './ButtonIcon'
import { useLayout } from '../context/LayoutContext'
import MainNav from './MainNav'

const StyleHeader = styled.div`
    background-color: var(--color-grey-0);
    padding: 1.2rem 4.8rem;
    border-bottom: 1px solid var(--color-grey-100);

    display: flex;
    gap: 2.4rem;
    align-items: center;
    justify-content: ${(props) =>
        props.showNavInHeader ? 'space-between' : 'flex-end'};
`

const LayoutToggle = styled(ButtonIcon)`
    margin-right: ${(props) => (props.showNavInHeader ? '0' : 'auto')};
`

const NavContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 2.4rem;
`

const RightContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 2.4rem;
`

function Header({ showNavInHeader = false }) {
    const { isNavbarOnTop, toggleNavbarPosition } = useLayout()

    return (
        <StyleHeader showNavInHeader={showNavInHeader}>
            <LayoutToggle
                onClick={toggleNavbarPosition}
                showNavInHeader={showNavInHeader}
            >
                {isNavbarOnTop ? <HiOutlineMenuAlt3 /> : <HiOutlineMenuAlt1 />}
            </LayoutToggle>

            {showNavInHeader && (
                <NavContainer>
                    <MainNav isHorizontal={true} />
                </NavContainer>
            )}

            <RightContainer>
                <UserAvatar />
                <HeaderMenu />
            </RightContainer>
        </StyleHeader>
    )
}

export default Header
