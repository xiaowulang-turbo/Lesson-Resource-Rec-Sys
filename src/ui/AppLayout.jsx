import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import styled from 'styled-components'
import { useLayout } from '../context/LayoutContext'

const StyleSidebarLayout = styled.div`
    display: grid;
    height: 100vh;
    grid-template-columns: 26rem 1fr;
    grid-template-rows: auto 1fr;
`

const StyleTopNavLayout = styled.div`
    display: grid;
    height: 100vh;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
`

const Main = styled.main`
    background-color: var(--color-grey-50);
    padding: 4rem 4.8rem 6.4rem;
    overflow: scroll;
`

const Container = styled.div`
    max-width: 120rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 3.2rem;
`

function AppLayout() {
    const { isNavbarOnTop } = useLayout()

    if (isNavbarOnTop) {
        return (
            <StyleTopNavLayout>
                <Header showNavInHeader={true} />
                <Main>
                    <Container>
                        <Outlet />
                    </Container>
                </Main>
            </StyleTopNavLayout>
        )
    }

    return (
        <StyleSidebarLayout>
            <Header showNavInHeader={false} />
            <Sidebar />
            <Main>
                <Container>
                    <Outlet />
                </Container>
            </Main>
        </StyleSidebarLayout>
    )
}

export default AppLayout
