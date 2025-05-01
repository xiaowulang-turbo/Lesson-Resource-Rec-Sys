import styled from 'styled-components'
import Button from '../../ui/Button'
import FileInput from '../../ui/FileInput'
import { HiOutlineUserCircle } from 'react-icons/hi2'
import { useState, useEffect } from 'react'
import { API_URL } from '../../utils/constants'

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

const AvatarContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.6rem;
    margin-bottom: 2.4rem;
`

const AvatarPreview = styled.div`
    width: 15rem;
    height: 15rem;
    border-radius: 50%;
    background-color: var(--color-grey-200);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    & svg {
        width: 10rem;
        height: 10rem;
        color: var(--color-grey-500);
    }

    & img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`

function AvatarSection({ user, onUpdate }) {
    const [avatarPreview, setAvatarPreview] = useState(null)

    // 初始化时如果用户有头像，设置预览
    useEffect(() => {
        if (user.avatar && typeof user.avatar === 'string') {
            // 处理头像URL
            const avatarUrl = user.avatar.startsWith('http')
                ? user.avatar
                : `${API_URL.replace('/api/v1', '')}${user.avatar}`

            console.log('头像URL:', avatarUrl)
            setAvatarPreview(avatarUrl)
        }
    }, [user.avatar])

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // 创建本地预览URL
            const previewUrl = URL.createObjectURL(file)
            setAvatarPreview(previewUrl)

            // 传递文件给父组件处理上传
            onUpdate({ avatar: file })
        }
    }

    const handleRemoveAvatar = () => {
        setAvatarPreview(null)
        onUpdate({ avatar: null })
    }

    return (
        <AccountSection>
            <SectionHeader>
                <SectionIcon>
                    <HiOutlineUserCircle />
                    <h2>头像设置</h2>
                </SectionIcon>
            </SectionHeader>

            <AvatarContainer>
                <AvatarPreview>
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="用户头像" />
                    ) : (
                        <HiOutlineUserCircle />
                    )}
                </AvatarPreview>
                <FileInput
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                />
                <Button
                    size="small"
                    variation="secondary"
                    onClick={handleRemoveAvatar}
                >
                    移除头像
                </Button>
            </AvatarContainer>
        </AccountSection>
    )
}

export default AvatarSection
