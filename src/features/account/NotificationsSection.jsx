import styled from 'styled-components'
import FormRow from '../../ui/FormRow'
import Button from '../../ui/Button'
import Checkbox from '../../ui/Checkbox'
import { HiOutlineBell } from 'react-icons/hi2'

const AccountSection = styled.div`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem;
    margin-bottom: 2.4rem;
    box-shadow: var(--shadow-sm);
`

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;

    & h2 {
        font-size: 2rem;
        font-weight: 600;
    }
`

const SectionIcon = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--color-brand-600);

    & svg {
        width: 2.4rem;
        height: 2.4rem;
    }
`

function NotificationsSection({ user, onUpdate }) {
    const handleNotificationChange = (key, value) => {
        onUpdate({
            notifications: {
                ...user.notifications,
                [key]: value,
            },
        })
    }

    const handleSubmit = () => {
        onUpdate(user)
    }

    return (
        <AccountSection>
            <SectionHeader>
                <SectionIcon>
                    <HiOutlineBell />
                    <h2>通知设置</h2>
                </SectionIcon>
            </SectionHeader>

            <FormRow>
                <Checkbox
                    id="resourceRecommendations"
                    checked={user.notifications.resourceRecommendations}
                    onChange={(e) =>
                        handleNotificationChange(
                            'resourceRecommendations',
                            e.target.checked
                        )
                    }
                >
                    接收资源推荐通知
                </Checkbox>
            </FormRow>
            <FormRow>
                <Checkbox
                    id="newFeatures"
                    checked={user.notifications.newFeatures}
                    onChange={(e) =>
                        handleNotificationChange(
                            'newFeatures',
                            e.target.checked
                        )
                    }
                >
                    接收新功能通知
                </Checkbox>
            </FormRow>
            <FormRow>
                <Checkbox
                    id="communityUpdates"
                    checked={user.notifications.communityUpdates}
                    onChange={(e) =>
                        handleNotificationChange(
                            'communityUpdates',
                            e.target.checked
                        )
                    }
                >
                    接收社区更新通知
                </Checkbox>
            </FormRow>

            <FormRow>
                <Button onClick={handleSubmit}>保存设置</Button>
            </FormRow>
        </AccountSection>
    )
}

export default NotificationsSection
