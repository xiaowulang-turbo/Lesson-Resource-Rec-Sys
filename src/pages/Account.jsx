import { useState, useEffect } from 'react'
import styled from 'styled-components'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import AccountMenu from '../features/account/AccountMenu'
import ProfileSection from '../features/account/ProfileSection'
import AvatarSection from '../features/account/AvatarSection'
import SecuritySection from '../features/account/SecuritySection'
import InterestsSection from '../features/account/InterestsSection'
import useUserProfile from '../hooks/useUserProfile'
import Spinner from '../ui/Spinner'

const StyledAccount = styled.div`
    display: grid;
    grid-template-columns: 24rem 1fr;
    gap: 3.2rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`

const MainContent = styled.div`
    display: flex;
    flex-direction: column;
`

const ErrorMessage = styled.div`
    color: var(--color-red-700);
    background-color: var(--color-red-100);
    padding: 2rem;
    border-radius: var(--border-radius-md);
    margin-bottom: 2rem;
`

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 30rem;
`

function Account() {
    const [activeTab, setActiveTab] = useState('profile')
    const { user, updateUser, updateField, isLoading, error } = useUserProfile()

    // 如果用户未登录，重定向到登录页面
    useEffect(() => {
        // 检查localStorage中是否有auth信息
        const auth = localStorage.getItem('auth')
        if (!auth) {
            // 如果没有认证信息，可以重定向到登录页
            // window.location.href = '/login'
            console.log('未登录状态')
        }
    }, [])

    if (isLoading) {
        return (
            <LoadingContainer>
                <Spinner size="large" />
            </LoadingContainer>
        )
    }

    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">账号设置</Heading>
            </Row>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <StyledAccount>
                <AccountMenu activeTab={activeTab} onTabChange={setActiveTab} />

                <MainContent>
                    {activeTab === 'profile' && (
                        <>
                            <ProfileSection user={user} onUpdate={updateUser} />
                            <AvatarSection user={user} onUpdate={updateUser} />
                        </>
                    )}
                    {activeTab === 'security' && <SecuritySection />}
                    {activeTab === 'preferences' && (
                        <InterestsSection user={user} onUpdate={updateUser} />
                    )}
                </MainContent>
            </StyledAccount>
        </>
    )
}

export default Account
