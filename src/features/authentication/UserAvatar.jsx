import styled from 'styled-components'
import useUser from './useUser'
import { useNavigate } from 'react-router-dom'
import { BASE_URL } from '../../services/apiConfig'
import { HiOutlineUserCircle } from 'react-icons/hi2'
import defaultUserAvatar from '../../public/default-user.jpg'

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

const DefaultAvatar = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 50%;
    background-color: var(--color-grey-200);
    color: var(--color-grey-600);
    outline: 2px solid var(--color-grey-100);

    & svg {
        width: 2.4rem;
        height: 2.4rem;
    }
`

export default function UserAvatar() {
    const navigate = useNavigate()
    const { user } = useUser()
    const displayName = user?.name || 'User'

    // 处理用户头像URL
    const getAvatarUrl = () => {
        if (!user?.avatar) return null

        return user.avatar.startsWith('http')
            ? user.avatar
            : `${BASE_URL.replace('/api/v1', '')}${user.avatar}`
    }

    const avatarUrl = getAvatarUrl()

    const handleAvatarClick = () => {
        navigate('/account')
    }

    return (
        <StyledUserAvatar onClick={handleAvatarClick}>
            {avatarUrl ? (
                <Avatar
                    src={avatarUrl}
                    alt={`Avatar of ${displayName}`}
                    onError={(e) => {
                        e.target.src = defaultUserAvatar
                    }}
                />
            ) : (
                <DefaultAvatar>
                    <HiOutlineUserCircle />
                </DefaultAvatar>
            )}
            <span>{displayName}</span>
        </StyledUserAvatar>
    )
}
