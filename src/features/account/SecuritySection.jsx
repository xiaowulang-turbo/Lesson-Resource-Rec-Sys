import styled from 'styled-components'
import UpdatePasswordForm from '../../features/authentication/UpdatePasswordForm'
import { HiOutlineLockClosed } from 'react-icons/hi2'

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

function SecuritySection() {
    return (
        <AccountSection>
            <SectionHeader>
                <SectionIcon>
                    <HiOutlineLockClosed />
                    <h2>密码修改</h2>
                </SectionIcon>
            </SectionHeader>
            <UpdatePasswordForm />
        </AccountSection>
    )
}

export default SecuritySection
