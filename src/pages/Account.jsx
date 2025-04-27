import { useState } from 'react'
import styled from 'styled-components'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import AccountMenu from '../features/account/AccountMenu'
import ProfileSection from '../features/account/ProfileSection'
import AvatarSection from '../features/account/AvatarSection'
import SecuritySection from '../features/account/SecuritySection'
import InterestsSection from '../features/account/InterestsSection'
import NotificationsSection from '../features/account/NotificationsSection'
import useUserProfile from '../hooks/useUserProfile'

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

function Account() {
    const [activeTab, setActiveTab] = useState('profile')
    const { user, updateUser, updateField, updateNotification } =
        useUserProfile()

    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">账号设置</Heading>
            </Row>

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
                    {activeTab === 'notifications' && (
                        <NotificationsSection
                            user={user}
                            onUpdate={updateUser}
                        />
                    )}
                </MainContent>
            </StyledAccount>
        </>
    )
}

export default Account
