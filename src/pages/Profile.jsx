import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import styled from 'styled-components'
import Button from '../ui/Button'
import { useNavigate } from 'react-router-dom'
import {
    HiOutlineBookmark,
    HiOutlineClipboardList,
    HiOutlineUpload,
    HiOutlineViewGrid,
    HiOutlineViewList,
} from 'react-icons/hi'
import { getResourcesByUser } from '../services/apiResources'
import useUser from '../features/authentication/useUser'
import Spinner from '../ui/Spinner'
import Empty from '../ui/Empty'
import ResourceTreeView from '../ui/ResourceTreeView'

const StyledProfile = styled.div`
    max-width: 1200px;
    min-width: 800px;
    min-height: 50vh;
    margin: 0 auto;
`

const ProfileSection = styled.div`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem;
    margin-bottom: 2.4rem;
    box-shadow: var(--shadow-sm);
    min-height: 50vh;
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

const TabGroup = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
`

const ViewToggle = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-left: 1rem;
    align-items: center;
`

const ViewButton = styled.button`
    background: ${(props) =>
        props.active ? 'var(--color-brand-600)' : 'var(--color-grey-200)'};
    color: ${(props) =>
        props.active ? 'var(--color-grey-0)' : 'var(--color-grey-600)'};
    border: none;
    border-radius: var(--border-radius-sm);
    padding: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: ${(props) =>
            props.active ? 'var(--color-brand-700)' : 'var(--color-grey-300)'};
    }

    svg {
        width: 1.6rem;
        height: 1.6rem;
    }
`

// 原来的卡片视图样式
const ResourceCardLink = styled.a`
    text-decoration: none;
    color: inherit;
    display: block;
    margin-bottom: 1.6rem;
    cursor: pointer;
`

const ResourceCard = styled.div`
    background-color: var(--color-grey-0);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s;
    display: flex;
    align-items: stretch;
    height: 320px;
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);

    ${ResourceCardLink}:hover & {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
`

const ResourceImage = styled.div`
    overflow: hidden;
    background-color: var(--color-grey-100);
    border-radius: var(--border-radius-md);
    flex: 0 0 240px;
    width: 240px;
    height: auto;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
    }

    ${ResourceCardLink}:hover & img {
        transform: scale(1.05);
    }
`

const ResourceContent = styled.div`
    padding: 1.6rem 2rem;
    flex: 1;
    overflow: hidden;

    p {
        font-size: 1.4rem;
        color: var(--color-grey-600);
        margin-top: 0.8rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.5;
        height: calc(1.5em * 2);
    }
`

const ResourceTitle = styled.h3`
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 0.8rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 3.2em;
    line-height: 1.6em;
`

const ResourceInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-bottom: 0.8rem;
    font-size: 1.4rem;
    color: var(--color-grey-500);
`

const Label = styled.span`
    font-size: 1.2rem;
    font-weight: 600;
    padding: 0.4rem 0.8rem;
    border-radius: var(--border-radius-sm);
    background-color: var(--color-grey-100);
    color: var(--color-grey-700);
    display: flex;
    align-items: center;
    gap: 0.4rem;
`

// 卡片视图组件
const CardView = ({ resources, navigate }) => {
    const PLACEHOLDER_IMAGE = '../public/default-resource.jpg'

    return (
        <div>
            {resources.map((resource) => (
                <ResourceCardLink
                    key={resource._id}
                    onClick={() => navigate(`/resources/${resource._id}`)}
                >
                    <ResourceCard>
                        <ResourceImage>
                            <img
                                src={resource.cover}
                                alt={resource.title}
                                onError={(e) => {
                                    e.target.src = PLACEHOLDER_IMAGE
                                }}
                            />
                        </ResourceImage>
                        <ResourceContent>
                            <ResourceTitle>{resource.title}</ResourceTitle>
                            <ResourceInfo>
                                <Label>
                                    {resource.format || resource.type}
                                </Label>
                                <Label>
                                    {resource.stats?.views || 0} 次浏览
                                </Label>
                                <Label>
                                    {resource.stats?.favorites || 0} 收藏
                                </Label>
                            </ResourceInfo>
                            <p>{resource.description}</p>
                            <ResourceInfo>
                                <span>
                                    上传时间:{' '}
                                    {new Date(
                                        resource.createdAt
                                    ).toLocaleDateString('zh-CN')}
                                </span>
                            </ResourceInfo>
                        </ResourceContent>
                    </ResourceCard>
                </ResourceCardLink>
            ))}
        </div>
    )
}

function Profile() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('uploads')
    const [viewMode, setViewMode] = useState('tree') // 'tree' 或 'card'
    const { user, isLoading: isLoadingUser } = useUser()

    // 使用 React Query 获取用户上传的资源
    const {
        data: uploadsData,
        isLoading: isLoadingUploads,
        error: uploadsError,
    } = useQuery({
        queryKey: ['userUploads', user?.id],
        queryFn: () => getResourcesByUser(user.id, 'uploads'),
        enabled: !!user && !isLoadingUser, // 只有在 user 存在时才启用查询
    })

    // 使用 React Query 获取收藏的资源
    const {
        data: collectionsData,
        isLoading: isLoadingCollections,
        error: collectionsError,
    } = useQuery({
        // 当用户信息加载完成且用户存在时才执行查询
        queryKey: ['userCollections', user?.id],
        queryFn: () => getResourcesByUser(user.id, 'collections'),
        enabled: !!user && !isLoadingUser, // 只有在 user 存在时才启用查询
    })

    const collections = collectionsData || [] // 如果数据未加载，则为空数组
    const uploads = uploadsData || [] // 如果数据未加载，则为空数组

    // 如果用户信息还在加载，显示 Spinner
    if (isLoadingUser) return <Spinner />

    const renderContent = (resources, isLoading, error, resourceType) => {
        if (isLoading) return <Spinner />
        if (error)
            return (
                <p>
                    加载{resourceType}失败: {error.message}
                </p>
            )
        if (resources.length === 0) {
            const config =
                resourceType === '上传资源'
                    ? {
                          icon: '📤',
                          message: '暂无上传的资源',
                          subtext:
                              '您还没有上传任何资源，点击上传按钮开始分享您的资源吧！',
                      }
                    : {
                          icon: '⭐',
                          message: '暂无收藏的资源',
                          subtext:
                              '您还没有收藏任何资源，浏览资源时可以点击收藏按钮保存喜欢的内容',
                      }

            return <Empty resourceName={resourceType} {...config} />
        }

        return viewMode === 'tree' ? (
            <ResourceTreeView resources={resources} />
        ) : (
            <CardView resources={resources} navigate={navigate} />
        )
    }

    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">我的资源</Heading>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button
                        size="medium"
                        variation="primary"
                        onClick={() => navigate('/upload')}
                    >
                        <HiOutlineUpload /> 上传资源
                    </Button>
                </div>
            </Row>

            <StyledProfile>
                {/* 资源管理区 */}
                <ProfileSection>
                    <SectionHeader>
                        <SectionIcon>
                            <HiOutlineClipboardList />
                            <h2>我的资源列表</h2>
                        </SectionIcon>
                        <TabGroup>
                            <Button
                                size="small"
                                variation={
                                    activeTab === 'uploads'
                                        ? 'primary'
                                        : 'secondary'
                                }
                                onClick={() => setActiveTab('uploads')}
                            >
                                <HiOutlineUpload /> 上传资源
                            </Button>
                            <Button
                                size="small"
                                variation={
                                    activeTab === 'collections'
                                        ? 'primary'
                                        : 'secondary'
                                }
                                onClick={() => setActiveTab('collections')}
                            >
                                <HiOutlineBookmark /> 收藏资源
                            </Button>
                            <ViewToggle>
                                <ViewButton
                                    active={viewMode === 'tree'}
                                    onClick={() => setViewMode('tree')}
                                    title="树形视图"
                                >
                                    <HiOutlineViewList />
                                </ViewButton>
                                <ViewButton
                                    active={viewMode === 'card'}
                                    onClick={() => setViewMode('card')}
                                    title="卡片视图"
                                >
                                    <HiOutlineViewGrid />
                                </ViewButton>
                            </ViewToggle>
                        </TabGroup>
                    </SectionHeader>

                    {activeTab === 'uploads'
                        ? renderContent(
                              uploads,
                              isLoadingUploads,
                              uploadsError,
                              '上传资源'
                          )
                        : renderContent(
                              collections,
                              isLoadingCollections,
                              collectionsError,
                              '收藏资源'
                          )}
                </ProfileSection>
            </StyledProfile>
        </>
    )
}

export default Profile
