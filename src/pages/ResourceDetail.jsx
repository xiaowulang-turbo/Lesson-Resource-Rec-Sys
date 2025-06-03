import React, { useState, useContext, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import styled from 'styled-components'
import { getResourceById } from '../services/apiResources'
import { addFavorite, removeFavorite } from '../services/apiUsers'
import { AuthContext } from '../context/AuthContext'
import Heading from '../ui/Heading'
import Spinner from '../ui/Spinner'
import Row from '../ui/Row'
import Tag from '../ui/Tag'
import Button from '../ui/Button'
import Empty from '../ui/Empty'
import SimilarResourceList from '../ui/SimilarResourceList'
import ResourcePreview from '../components/ResourcePreview'
import toast from 'react-hot-toast'
import defaultCover from '../public/default-resource.jpg'

// --- 样式化组件 ---
const DetailLayout = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 3.2rem;
    padding: 3.2rem 4.8rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`

const MainContent = styled.div`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem 3.2rem;
`

const Sidebar = styled.aside`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem;
`

const ResourceInfo = styled.section`
    margin-bottom: 2.4rem;
    padding-bottom: 2.4rem;
    border-bottom: 1px solid var(--color-grey-100);

    p {
        margin-bottom: 1.2rem;
        line-height: 1.6;
        color: var(--color-grey-600);
    }

    strong {
        color: var(--color-grey-700);
    }
`

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: nowrap;
    gap: 0.6rem;
    overflow-x: auto;

    /* 美化滚动条 */
    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-track {
        background: var(--color-grey-100);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: var(--color-grey-300);
        border-radius: 4px;
    }
`

const ActionsContainer = styled.section`
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;
    margin-top: 2.4rem;
    padding-top: 2.4rem;
    border-top: 1px solid var(--color-grey-100);
`

// 修改封面图片布局为并排布局
const ResourceHeader = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2.4rem;
    padding-bottom: 2.4rem;
    border-bottom: 1px solid var(--color-grey-100);

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`

const TitleContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;

    h1 {
        margin-bottom: 1.5rem;
    }

    .resource-subtitle {
        color: var(--color-grey-500);
        font-size: 1.4rem;
        margin-bottom: 1rem;
    }

    .resource-price {
        font-size: 1.8rem;
        font-weight: 600;
        color: var(--color-brand-600);
        margin-bottom: 1.5rem;
    }
`

// 修改封面图片容器样式
const CoverImageContainer = styled.div`
    border-radius: var(--border-radius-md);
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: var(--color-grey-100);
    height: 340px;
    display: flex;
    justify-content: center;
    align-items: center;
    order: 2;

    @media (max-width: 768px) {
        order: 1;
        height: 280px;
        margin-bottom: 1.6rem;
    }
`

const CoverImage = styled.img`
    min-width: 85%;
    border-radius: var(--border-radius-md);
    object-fit: fill;
`

// 添加链接样式
const AuthorLink = styled(Link)`
    color: var(--color-brand-600);
    text-decoration: none;
    transition: all 0.3s;

    &:hover {
        color: var(--color-brand-700);
        text-decoration: underline;
    }
`

// 为预览和资源访问添加新的部分
const ResourcePreviewSection = styled.section`
    margin-bottom: 2.4rem;
    padding-bottom: 2.4rem;
    border-bottom: 1px solid var(--color-grey-100);
`

const ResourceAccessSection = styled.section`
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
`

// 添加选项卡控件
const TabsContainer = styled.div`
    display: flex;
    border-bottom: 1px solid var(--color-grey-200);
    margin-bottom: 2rem;
`

const Tab = styled.button`
    padding: 1rem 2rem;
    background: none;
    border: none;
    border-bottom: 3px solid
        ${(props) =>
            props.active ? 'var(--color-primary-600)' : 'transparent'};
    color: ${(props) =>
        props.active ? 'var(--color-primary-700)' : 'var(--color-grey-500)'};
    font-weight: ${(props) => (props.active ? '600' : '400')};
    font-size: 1.6rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        color: ${(props) =>
            props.active
                ? 'var(--color-primary-700)'
                : 'var(--color-grey-700)'};
    }
`

function ResourceDetail() {
    const { id: resourceId } = useParams()
    const queryClient = useQueryClient()
    const { user: currentUser, isAuthenticated } = useContext(AuthContext)
    // 添加选项卡状态
    const [activeTab, setActiveTab] = useState('info')

    const {
        data: resource,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['resource', resourceId],
        queryFn: () => getResourceById(resourceId),
        retry: false,
    })

    const [isFavorited, setIsFavorited] = useState(false)

    // Effect to update isFavorited when user or resourceId changes
    useEffect(() => {
        if (!isAuthenticated || !currentUser?.favoriteResources) {
            setIsFavorited(false)
        } else {
            setIsFavorited(currentUser.favoriteResources.includes(resourceId))
        }
    }, [currentUser, isAuthenticated, resourceId])

    const { mutate: addFavMutate, isLoading: isAddingFavorite } = useMutation({
        mutationFn: () => addFavorite(currentUser.id, resourceId),
        onSuccess: (data) => {
            toast.success('已添加到收藏夹！')
            setIsFavorited(true)
            queryClient.setQueryData(['user', currentUser.id], (oldData) => {
                return {
                    ...oldData,
                    favoriteResources: data.favoriteResources,
                }
            })
            queryClient.invalidateQueries(['resource', resourceId])
        },
        onError: (err) => {
            toast.error(`添加收藏失败: ${err.message}`)
        },
    })

    const { mutate: removeFavMutate, isLoading: isRemovingFavorite } =
        useMutation({
            mutationFn: () => removeFavorite(currentUser.id, resourceId),
            onSuccess: (data) => {
                toast.success('已从收藏夹移除')
                setIsFavorited(false)
                queryClient.setQueryData(
                    ['user', currentUser.id],
                    (oldData) => {
                        return {
                            ...oldData,
                            favoriteResources: data.favoriteResources,
                        }
                    }
                )
                queryClient.invalidateQueries(['resource', resourceId])
            },
            onError: (err) => {
                toast.error(`移除收藏失败: ${err.message}`)
            },
        })

    // 根据资源类型获取默认封面图片
    // 根据文件类型获取默认封面图片
    const getDefaultCoverImage = (type) => {
        // 定义文件类型与封面图片的映射关系
        const typeMap = {
            1: '/images/covers/document.png',
            2: '/images/covers/video.png',
            3: '/images/covers/audio.png',
            4: '/images/covers/image.png',
            5: '/images/covers/other.png',
        }
        // 返回对应类型的封面图片，如果没有对应类型则返回默认封面图片
        return typeMap[type] || '/images/covers/default.png'
    }

    const handleToggleFavorite = () => {
        if (!isAuthenticated) {
            toast.error('请先登录才能收藏资源')
            return
        }

        if (isFavorited) {
            removeFavMutate()
        } else {
            addFavMutate()
        }
    }

    if (isLoading) return <Spinner />
    if (error)
        return (
            <Empty
                icon="❌"
                message="资源加载失败"
                subtext={`无法加载资源 (ID: ${resourceId})，请检查资源是否存在或稍后重试`}
            />
        )
    if (!resource)
        return (
            <Empty
                icon="🔍"
                message="资源不存在"
                subtext="请检查资源链接是否正确"
            />
        )

    // 格式化日期等 (可选)
    const formattedDate = new Date(resource.createdAt).toLocaleDateString(
        'zh-CN'
    )

    // 假设 type 有对应的文本映射
    const resourceTypeMap = {
        1: '文档',
        2: '视频',
        3: '音频',
        4: '图片',
        5: '其他',
    }
    const difficultyMap = {
        1: '入门',
        2: '初级',
        3: '中级',
        4: '高级',
        5: '专家',
    }

    // 获取资源类型显示文本，如果无效则返回null
    const getResourceTypeText = (type) => {
        return resourceTypeMap[type] || null
    }

    // 获取难度显示文本，如果无效则返回null
    const getDifficultyText = (difficulty) => {
        return difficultyMap[difficulty] || null
    }

    // 构建副标题数组，只包含有效信息
    const buildSubtitle = () => {
        const parts = []

        const typeText = getResourceTypeText(resource.type)
        if (typeText) parts.push(typeText)

        if (resource.subject) parts.push(resource.subject)

        const difficultyText = getDifficultyText(resource.difficulty)
        if (difficultyText) parts.push(difficultyText)

        return parts.length > 0 ? parts.join(' | ') : '资源详情'
    }

    // 获取上传者显示文本
    const getUploaderText = () => {
        if (resource.createdBy) return resource.createdBy
        if (resource.organization) return resource.organization
        if (resource.publisher) return resource.publisher
        return null // 返回null而不是"未知用户"
    }

    // 获取封面图片 URL (优先使用资源的coverImage字段，如果没有则使用默认图片)
    const coverImageUrl =
        resource.cover || defaultCover || getDefaultCoverImage(resource.type)

    return (
        <DetailLayout>
            <MainContent>
                {/* 修改为标题和图片并排布局 */}
                <ResourceHeader>
                    <TitleContainer>
                        <Heading as="h1">{resource.title}</Heading>
                        <div className="resource-subtitle">
                            {buildSubtitle()}
                        </div>
                        <div className="resource-price">
                            {resource.price > 0
                                ? `¥${resource.price.toFixed(2)}`
                                : '免费'}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '1rem',
                            }}
                        >
                            <Button
                                variation={
                                    isFavorited ? 'primary' : 'secondary'
                                }
                                size="small"
                                onClick={handleToggleFavorite}
                                disabled={
                                    isAddingFavorite || isRemovingFavorite
                                }
                            >
                                {isFavorited ? '★ 已收藏' : '⭐ 收藏'} (
                                {resource.stats?.favorites || 0})
                            </Button>
                        </div>
                    </TitleContainer>

                    {/* 封面图片 */}
                    <CoverImageContainer>
                        <CoverImage
                            src={coverImageUrl}
                            alt={`${resource.title}的封面图片`}
                            onError={(e) => {
                                e.target.src =
                                    defaultCover ||
                                    getDefaultCoverImage(resource.type)
                            }}
                        />
                    </CoverImageContainer>
                </ResourceHeader>

                {/* 添加选项卡 */}
                <TabsContainer>
                    <Tab
                        active={activeTab === 'info'}
                        onClick={() => setActiveTab('info')}
                    >
                        详细信息
                    </Tab>
                    <Tab
                        active={activeTab === 'preview'}
                        onClick={() => setActiveTab('preview')}
                    >
                        预览
                    </Tab>
                </TabsContainer>

                {/* 根据选项卡状态显示不同内容 */}
                {activeTab === 'preview' ? (
                    <ResourcePreviewSection>
                        <ResourcePreview resource={resource} />

                        <ResourceAccessSection>
                            {resource.url && resource.url.startsWith('http') ? (
                                <Button
                                    as="a"
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    size="large"
                                >
                                    访问完整资源 ↗
                                </Button>
                            ) : resource.url ? (
                                <Button
                                    as="a"
                                    href={`http://localhost:3000/${resource.url}`}
                                    download
                                    size="large"
                                >
                                    下载完整资源 ↓
                                </Button>
                            ) : (
                                <p>无可用文件或链接。</p>
                            )}
                        </ResourceAccessSection>
                    </ResourcePreviewSection>
                ) : (
                    <ResourceInfo>
                        <Heading as="h3" style={{ marginBottom: '1.6rem' }}>
                            基本信息
                        </Heading>
                        <p>
                            <strong>描述：</strong> {resource.description}
                        </p>
                        {/* 只有当有有效上传者信息时才显示 */}
                        {getUploaderText() && (
                            <p>
                                <strong>上传者：</strong> {getUploaderText()}
                            </p>
                        )}
                        <p>
                            <strong>上传时间：</strong> {formattedDate}
                        </p>
                        {resource.tags && resource.tags.length > 0 && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <strong>标签：</strong>
                                <TagsContainer>
                                    {resource.tags.map((tag, index) => (
                                        <Tag key={index} type="blue">
                                            {tag}
                                        </Tag>
                                    ))}
                                </TagsContainer>
                            </div>
                        )}

                        {/* 文件/链接部分 */}
                        <div style={{ marginTop: '2rem' }}>
                            <Heading as="h3" style={{ marginBottom: '1.6rem' }}>
                                资源内容
                            </Heading>
                            {resource.url && resource.url.startsWith('http') ? (
                                <Button
                                    as="a"
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    访问资源 ↗
                                </Button>
                            ) : resource.url ? (
                                <Button
                                    as="a"
                                    href={`http://localhost:3000/${resource.url}`}
                                    download
                                >
                                    下载文件 ↓
                                </Button>
                            ) : (
                                <p>无可用文件或链接。</p>
                            )}
                        </div>
                    </ResourceInfo>
                )}
            </MainContent>

            <Sidebar>
                <SimilarResourceList resourceId={resourceId} />
            </Sidebar>
        </DetailLayout>
    )
}

export default ResourceDetail
