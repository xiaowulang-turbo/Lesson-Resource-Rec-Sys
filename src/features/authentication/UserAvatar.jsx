import styled from 'styled-components'
import useUser from './useUser'
import { useNavigate } from 'react-router-dom'

const StyledUserAvatar = styled.div`
    display: flex;
    gap: 1.2rem;
    align-items: center;
    font-weight: 500;
    font-size: 1.4rem;
    color: var(--color-grey-600);
    cursor: pointer;
`

const Avatar = styled.img`
    display: block;
    width: 4rem;
    width: 3.6rem;
    aspect-ratio: 1;
    object-fit: cover;
    object-position: center;
    border-radius: 50%;
    outline: 2px solid var(--color-grey-100);
`

export default function UserAvatar() {
    const navigate = useNavigate()
    const { user } = useUser()
    const displayName = user?.name || 'User'
    const avatarSrc = '../../public/default-user.jpg'

    const handleAvatarClick = () => {
        navigate('/account')
    }

    return (
        <StyledUserAvatar onClick={handleAvatarClick}>
            <Avatar src={avatarSrc} alt={`Avatar of ${displayName}`} />
            <span>{displayName}</span>
        </StyledUserAvatar>
    )
}
