import { useState, useEffect } from 'react'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import styled from 'styled-components'
import Button from '../ui/Button'
import Tag from '../ui/Tag'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Spinner from '../ui/Spinner'
import Empty from '../ui/Empty'
import { useQuery } from '@tanstack/react-query'
import { getPublicUserProfile } from '../services/apiUsers' // 使用新的公开API
import { getResourcesByUser } from '../services/apiResources' // 假设有这个API
import useUser from '../features/authentication/useUser' // 用于检查当前登录用户
import toast from 'react-hot-toast'
import {
    HiOutlineUserCircle,
    HiOutlineUpload,
    HiOutlineBookmark,
    HiOutlineHeart,
    HiOutlineEye,
} from 'react-icons/hi'

const StyledProfile = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3.2rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`

const ProfileSection = styled.div`
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

const UserInfoGrid = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 3.2rem;
    margin-bottom: 2.4rem;

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
        justify-items: center;
        text-align: center;
    }
`

const UserAvatar = styled.div`
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

const UserDetails = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1.2rem;
`

const UserName = styled.h3`
    font-size: 2.4rem;
    font-weight: 600;
    color: var(--color-grey-700);
`

const UserMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 1.2rem;
    color: var(--color-grey-500);
    font-size: 1.4rem;

    @media (max-width: 480px) {
        flex-direction: column;
        gap: 0.5rem;
    }
`

const ResourceGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.6rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`

const ResourceCard = styled.div`
    padding: 1.6rem;
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-grey-100);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
`

const ResourceCardTitle = styled.h4`
    font-size: 1.6rem;
    font-weight: 500;
    margin-bottom: 0.8rem;
    color: var(--color-grey-700);
`

const ResourceCardMeta = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.2rem;
    color: var(--color-grey-500);
`

const StatGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.6rem;
    margin-bottom: 2.4rem;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
`

const StatCard = styled.div`
    padding: 1.6rem;
    border-radius: var(--border-radius-sm);
    background-color: var(--color-grey-50);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`

const StatNumber = styled.p`
    font-size: 3.2rem;
    font-weight: 700;
    color: var(--color-brand-600);
    margin-bottom: 0.8rem;
`

const StatLabel = styled.p`
    font-size: 1.4rem;
    color: var(--color-grey-500);
    text-align: center;
`

const TagContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-bottom: 1.6rem;
`

const FollowButton = styled(Button)`
    margin-top: 1.6rem;
`

const TabContainer = styled.div`
    display: flex;
    gap: 1.2rem;
    margin-bottom: 2rem;
`

function PublicProfile() {
    const { userId } = useParams() // 从URL中获取用户ID
    const navigate = useNavigate()
    const { user: currentUser } = useUser() // 获取当前登录用户
    const [activeTab, setActiveTab] = useState('uploads')

    // 判断是否是查看自己的主页 - 确保类型一致的比较
    const isSelfProfile =
        currentUser &&
        currentUser.id &&
        userId &&
        currentUser.id.toString() === userId.toString()

    // 获取用户信息 - 使用公开接口
    const {
        data: profileUser,
        isLoading: isLoadingUser,
        error: userError,
    } = useQuery({
        queryKey: ['publicUser', userId],
        queryFn: () => getPublicUserProfile(userId),
        retry: false,
    })

    // 获取用户上传的资源
    const {
        data: userResources,
        isLoading: isLoadingResources,
        error: resourcesError,
    } = useQuery({
        queryKey: ['userResources', userId, activeTab],
        queryFn: () => getResourcesByUser(userId, activeTab),
        enabled: !!userId,
    })

    if (isLoadingUser || isLoadingResources) return <Spinner />

    if (userError) return <Empty resourceName={`用户 (ID: ${userId})`} />
    if (!profileUser) return <Empty resourceName="用户" />

    const handleResourceClick = (resourceId) => {
        navigate(`/resources/${resourceId}`)
    }

    const handleFollowUser = () => {
        // 这里应该调用关注用户的API
        toast.success(`你已关注 ${profileUser.name}`)
    }

    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">{profileUser.name} 的个人主页</Heading>
                {!isSelfProfile && (
                    <FollowButton onClick={handleFollowUser}>
                        关注用户
                    </FollowButton>
                )}
            </Row>

            <StyledProfile>
                <div>
                    {/* 个人资料区 */}
                    <ProfileSection>
                        <SectionHeader>
                            <SectionIcon>
                                <HiOutlineUserCircle />
                                <h2>个人资料</h2>
                            </SectionIcon>
                            {isSelfProfile && (
                                <Button
                                    size="small"
                                    variation="secondary"
                                    onClick={() => navigate('/account')}
                                >
                                    编辑资料
                                </Button>
                            )}
                        </SectionHeader>

                        <UserInfoGrid>
                            <UserAvatar>
                                {profileUser.avatar ? (
                                    <img
                                        src={profileUser.avatar}
                                        alt={profileUser.name}
                                    />
                                ) : (
                                    <HiOutlineUserCircle />
                                )}
                            </UserAvatar>
                            <UserDetails>
                                <UserName>{profileUser.name}</UserName>
                                <UserMeta>
                                    {profileUser.subject && (
                                        <span>
                                            教学科目: {profileUser.subject}
                                        </span>
                                    )}
                                    {profileUser.subject &&
                                        profileUser.grade && <span>•</span>}
                                    {profileUser.grade && (
                                        <span>
                                            教学年级: {profileUser.grade}
                                        </span>
                                    )}
                                </UserMeta>
                                {profileUser.experience && (
                                    <UserMeta>
                                        <span>
                                            教龄: {profileUser.experience}
                                        </span>
                                    </UserMeta>
                                )}
                                {profileUser.interests &&
                                    profileUser.interests.length > 0 && (
                                        <TagContainer>
                                            {profileUser.interests.map(
                                                (interest) => (
                                                    <Tag key={interest}>
                                                        {interest}
                                                    </Tag>
                                                )
                                            )}
                                        </TagContainer>
                                    )}
                                {profileUser.bio && (
                                    <p
                                        style={{
                                            marginTop: '1.2rem',
                                            color: 'var(--color-grey-600)',
                                        }}
                                    >
                                        {profileUser.bio}
                                    </p>
                                )}
                            </UserDetails>
                        </UserInfoGrid>

                        <StatGrid>
                            <StatCard>
                                <StatNumber>
                                    {profileUser.uploads || 0}
                                </StatNumber>
                                <StatLabel>资源上传</StatLabel>
                            </StatCard>
                            <StatCard>
                                <StatNumber>
                                    {profileUser.collections || 0}
                                </StatNumber>
                                <StatLabel>收藏资源</StatLabel>
                            </StatCard>
                            <StatCard>
                                <StatNumber>
                                    {profileUser.likes || 0}
                                </StatNumber>
                                <StatLabel>获赞</StatLabel>
                            </StatCard>
                            <StatCard>
                                <StatNumber>
                                    {profileUser.views || 0}
                                </StatNumber>
                                <StatLabel>资源浏览</StatLabel>
                            </StatCard>
                        </StatGrid>
                    </ProfileSection>
                </div>

                <div>
                    {/* 资源管理区 */}
                    <ProfileSection>
                        <SectionHeader>
                            <SectionIcon>
                                <HiOutlineUpload />
                                <h2>
                                    {isSelfProfile
                                        ? '我的资源'
                                        : `${profileUser.name} 的资源`}
                                </h2>
                            </SectionIcon>
                            <TabContainer>
                                <Button
                                    size="small"
                                    variation={
                                        activeTab === 'uploads'
                                            ? 'primary'
                                            : 'secondary'
                                    }
                                    onClick={() => setActiveTab('uploads')}
                                >
                                    <HiOutlineUpload /> 上传
                                </Button>
                                {isSelfProfile && (
                                    <Button
                                        size="small"
                                        variation={
                                            activeTab === 'collections'
                                                ? 'primary'
                                                : 'secondary'
                                        }
                                        onClick={() =>
                                            setActiveTab('collections')
                                        }
                                    >
                                        <HiOutlineBookmark /> 收藏
                                    </Button>
                                )}
                                <Button
                                    size="small"
                                    variation={
                                        activeTab === 'liked'
                                            ? 'primary'
                                            : 'secondary'
                                    }
                                    onClick={() => setActiveTab('liked')}
                                >
                                    <HiOutlineHeart /> 点赞
                                </Button>
                            </TabContainer>
                        </SectionHeader>

                        {userResources && userResources.length > 0 ? (
                            <ResourceGrid>
                                {userResources.map((resource) => (
                                    <ResourceCard
                                        key={resource.id}
                                        onClick={() =>
                                            handleResourceClick(resource.id)
                                        }
                                    >
                                        <ResourceCardTitle>
                                            {resource.title}
                                        </ResourceCardTitle>
                                        <ResourceCardMeta>
                                            <span>{resource.type}</span>
                                            <span>
                                                <HiOutlineEye
                                                    style={{
                                                        verticalAlign: 'middle',
                                                    }}
                                                />{' '}
                                                {resource.stats?.views || 0}
                                            </span>
                                        </ResourceCardMeta>
                                        <ResourceCardMeta>
                                            <span>{resource.subject}</span>
                                            <span>
                                                <HiOutlineHeart
                                                    style={{
                                                        verticalAlign: 'middle',
                                                    }}
                                                />{' '}
                                                {resource.stats?.likes || 0}
                                            </span>
                                        </ResourceCardMeta>
                                    </ResourceCard>
                                ))}
                            </ResourceGrid>
                        ) : (
                            <p
                                style={{
                                    textAlign: 'center',
                                    marginTop: '2rem',
                                    color: 'var(--color-grey-500)',
                                }}
                            >
                                {activeTab === 'uploads'
                                    ? '暂无上传的资源'
                                    : activeTab === 'collections'
                                    ? '暂无收藏的资源'
                                    : '暂无点赞的资源'}
                            </p>
                        )}
                    </ProfileSection>
                </div>
            </StyledProfile>
        </>
    )
}

export default PublicProfile
