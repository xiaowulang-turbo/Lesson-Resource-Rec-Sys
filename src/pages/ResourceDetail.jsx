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
    max-width: 100%;
    max-height: 340px;
    object-fit: contain;
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

function ResourceDetail() {
    const { id: resourceId } = useParams()
    const queryClient = useQueryClient()
    const { user: currentUser, isAuthenticated } = useContext(AuthContext)

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
    const getDefaultCoverImage = (type) => {
        const typeMap = {
            1: '/images/covers/document.png',
            2: '/images/covers/video.png',
            3: '/images/covers/audio.png',
            4: '/images/covers/image.png',
            5: '/images/covers/other.png',
        }
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
    if (error) return <Empty resourceName={`资源 (ID: ${resourceId})`} />
    if (!resource) return <Empty resourceName="资源" />

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

    // 获取封面图片 URL (优先使用资源的coverImage字段，如果没有则使用默认图片)
    const coverImageUrl = resource.cover || getDefaultCoverImage(resource.type)

    return (
        <DetailLayout>
            <MainContent>
                {/* 修改为标题和图片并排布局 */}
                <ResourceHeader>
                    <TitleContainer>
                        <Heading as="h1">{resource.title}</Heading>
                        <div className="resource-subtitle">
                            {resourceTypeMap[resource.type] || '未知'} |{' '}
                            {resource.subject} |{' '}
                            {difficultyMap[resource.difficulty] || '未知'}
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

                <ResourceInfo>
                    <Heading as="h3" style={{ marginBottom: '1.6rem' }}>
                        基本信息
                    </Heading>
                    <p>
                        <strong>描述：</strong> {resource.description}
                    </p>
                    <p>
                        <strong>上传者：</strong>{' '}
                        {resource.createdBy || '未知用户'}
                    </p>
                    <p>
                        <strong>上传时间：</strong> {formattedDate}
                    </p>
                    {resource.tags && resource.tags.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
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
                </ResourceInfo>

                {/* 文件/链接部分 */}
                <ResourceInfo>
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
                            查看链接
                        </Button>
                    ) : resource.url ? (
                        <Button
                            as="a"
                            href={`http://localhost:3000/${resource.url}`}
                            download
                        >
                            下载文件
                        </Button>
                    ) : (
                        <p>无可用文件或链接。</p>
                    )}
                </ResourceInfo>
            </MainContent>

            <Sidebar>
                <SimilarResourceList resourceId={resourceId} />
            </Sidebar>
        </DetailLayout>
    )
}

export default ResourceDetail
