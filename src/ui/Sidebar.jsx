import styled from 'styled-components'
import Logo from './Logo'
import MainNav from './MainNav'
// import Uploader from '../data/Uploader'

const StyledVerticalSidebar = styled.div`
    background-color: var(--color-grey-0);
    padding: 3.2rem 2.4rem;
    border-right: 1px solid var(--color-grey-100);

    grid-row: 1 / -1;
    display: flex;
    flex-direction: column;
    gap: 2.4rem;
    justify-content: center;
`

const StyledHorizontalSidebar = styled.div`
    background-color: var(--color-grey-0);
    padding: 1.2rem 2.4rem;
    border-bottom: 1px solid var(--color-grey-100);
    display: flex;
    justify-content: center;
`

function Sidebar({ isHorizontal = false }) {
    if (isHorizontal) {
        return (
            <StyledHorizontalSidebar>
                <MainNav isHorizontal={true} />
            </StyledHorizontalSidebar>
        )
    }

    return (
        <StyledVerticalSidebar>
            {/* <Logo /> */}
            <MainNav isHorizontal={false} />
            {/* <Uploader /> */}
        </StyledVerticalSidebar>
    )
}

export default Sidebar
