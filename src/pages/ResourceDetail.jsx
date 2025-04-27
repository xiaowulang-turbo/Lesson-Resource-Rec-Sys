import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'
import { getResourceById } from '../services/apiResources' // 确保 API 函数路径正确
import { getPublicUserProfile } from '../services/apiUsers' // 使用公开API
import { getCourseEvaluations } from '../services/apiMooc' // 引入获取评价的API
import Heading from '../ui/Heading'
import Spinner from '../ui/Spinner'
import Row from '../ui/Row'
import Tag from '../ui/Tag' // 假设你有一个 Tag 组件
import Button from '../ui/Button'
import Empty from '../ui/Empty'
// import ResourceCard from '../features/resources/ResourceCard'; // 用于相似资源

// --- 样式化组件 ---
const DetailLayout = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr; // 主内容区和侧边栏（或下方区域）
    gap: 3.2rem;
    padding: 3.2rem 4.8rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr; // 移动端单列显示
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

const CommentsSection = styled.section`
    margin-top: 2.4rem;
    /* 添加评论区样式 */
`

const SimilarResources = styled.section`
    h3 {
        margin-bottom: 1.6rem;
    }
    /* 添加相似资源样式 */
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

// 评论项样式
const ReviewItem = styled.div`
    padding: 1.6rem;
    border-bottom: 1px solid var(--color-grey-100);

    &:last-child {
        border-bottom: none;
    }
`

const ReviewHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 0.8rem;
`

const UserAvatar = styled.img`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    margin-right: 1rem;
    object-fit: cover;
`

const UserInfo = styled.div`
    flex-grow: 1;
`

const UserName = styled.span`
    font-weight: 500;
    color: var(--color-grey-700);
`

const ReviewDate = styled.span`
    color: var(--color-grey-500);
    font-size: 0.8rem;
    margin-left: 0.8rem;
`

const ReviewContent = styled.p`
    line-height: 1.6;
    color: var(--color-grey-700);
    margin: 0.8rem 0;
`

const StarRating = styled.div`
    display: flex;
    color: #f8ce0b;
    margin-top: 0.4rem;
`

const AgreeButton = styled.button`
    background: none;
    border: none;
    display: flex;
    align-items: center;
    color: var(--color-grey-500);
    cursor: pointer;
    padding: 0.4rem;
    font-size: 0.9rem;

    &:hover {
        color: var(--color-brand-600);
    }
`

const RatingSummary = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    background-color: var(--color-grey-50);
    padding: 1.6rem;
    border-radius: var(--border-radius-md);
`

const RatingNumber = styled.div`
    font-size: 4rem;
    font-weight: bold;
    color: var(--color-brand-700);
    line-height: 1;
    margin-right: 2rem;
`

const ReviewStats = styled.div`
    font-size: 1rem;
    color: var(--color-grey-500);
`

const PaginationControls = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 2rem;
    gap: 0.8rem;
`

// 模拟相似资源数据
const mockSimilarResources = [
    // { id: 'mock1', title: '相似资源 A', description: '这是A的描述', type: 1, subject: '模拟学科' },
    // { id: 'mock2', title: '相似资源 B', description: '这是B的描述', type: 2, subject: '模拟学科' },
]

// --- 组件定义 ---
function ResourceDetail() {
    const { id } = useParams()

    const {
        data: resource,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['resource', id],
        queryFn: () => getResourceById(id),
        retry: false, // 如果 ID 无效，则不重试
    })

    console.log(resource, 'resource')

    // 获取上传者信息 - 使用公开接口
    const { data: creatorUser, isLoading: isLoadingCreator } = useQuery({
        queryKey: ['publicUser', resource?.createdBy],
        queryFn: () => getPublicUserProfile(resource.createdBy),
        // 只有当resource存在且有createdBy字段时才发起请求
        enabled: !!resource?.createdBy,
    })

    // 获取课程评价数据
    const {
        data: evaluationData,
        isLoading: isLoadingEvaluations,
        error: evaluationError,
    } = useQuery({
        queryKey: ['evaluation', id],
        queryFn: () => getCourseEvaluations(resource.sourceId || id),
        // 只有当资源是课程资源且有sourceId时才获取评价
        enabled:
            !!resource &&
            (resource.contentType === 'course' ||
                resource.metadata?.mocSourceType === 'icourse163'),
    })

    if (isLoading) return <Spinner />
    if (error) return <Empty resourceName={`资源 (ID: ${id})`} /> // 显示错误或未找到
    if (!resource) return <Empty resourceName="资源" /> // 以防万一

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

    // 评价数据处理
    const reviews = evaluationData?.result?.list || []
    const averageRating =
        reviews.length > 0
            ? (
                  reviews.reduce((sum, review) => sum + review.mark, 0) /
                  reviews.length
              ).toFixed(1)
            : 0
    const totalReviews =
        evaluationData?.result?.query?.totleCount || reviews.length

    // 星星评分组件
    const StarRatingDisplay = ({ rating }) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<span key={i}>★</span>) // 实心星
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<span key={i}>⯨</span>) // 半星（可以用其他符号）
            } else {
                stars.push(<span key={i}>☆</span>) // 空心星
            }
        }

        return <StarRating>{stars}</StarRating>
    }

    // 日期格式化
    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        })
    }

    return (
        <DetailLayout>
            <MainContent>
                <Heading as="h1" style={{ marginBottom: '2.4rem' }}>
                    {resource.title}
                </Heading>

                <ResourceInfo>
                    <Heading as="h3" style={{ marginBottom: '1.6rem' }}>
                        基本信息
                    </Heading>
                    <p>
                        <strong>描述：</strong> {resource.description}
                    </p>
                    <p>
                        <strong>类型：</strong>{' '}
                        {resourceTypeMap[resource.type] || '未知'}
                    </p>
                    <p>
                        <strong>学科：</strong> {resource.subject}
                    </p>
                    <p>
                        <strong>年级：</strong> {resource.grade}
                    </p>
                    <p>
                        <strong>难度：</strong>{' '}
                        {difficultyMap[resource.difficulty] || '未知'}
                    </p>
                    <p>
                        <strong>价格：</strong>{' '}
                        {resource.price > 0
                            ? `¥${resource.price.toFixed(2)}`
                            : '免费'}
                    </p>
                    <p>
                        <strong>上传者：</strong>{' '}
                        {isLoadingCreator ? (
                            '加载中...'
                        ) : resource.createdBy ? (
                            <AuthorLink to={`/users/${resource.createdBy}`}>
                                {creatorUser?.name || '未知用户'}
                            </AuthorLink>
                        ) : (
                            '未知用户'
                        )}
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
                                    </Tag> // 假设 Tag 组件接受 type prop
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
                        // 这里假设 url 是指向 /public/uploads/ 的相对路径
                        // 注意: 需要确保 BASE_URL 正确配置或有其他方式获取后端地址
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

                {/* 交互按钮区域 */}
                <ActionsContainer>
                    <Button variation="secondary" size="small">
                        👍 点赞 ({resource.upvotes || 0})
                    </Button>
                    <Button variation="secondary" size="small">
                        ⭐ 收藏
                    </Button>
                    <Button variation="danger" size="small">
                        举报
                    </Button>
                    {/* 添加评分组件 */}
                </ActionsContainer>

                {/* 评价区 */}
                <CommentsSection>
                    <Heading as="h3" style={{ marginBottom: '1.6rem' }}>
                        评价与评分
                    </Heading>

                    {isLoadingEvaluations ? (
                        <Spinner />
                    ) : evaluationError ? (
                        <p>获取评价数据失败</p>
                    ) : reviews.length > 0 ? (
                        <>
                            {/* 评分概述 */}
                            <RatingSummary>
                                <RatingNumber>{averageRating}</RatingNumber>
                                <div>
                                    <StarRatingDisplay
                                        rating={parseFloat(averageRating)}
                                    />
                                    <ReviewStats>
                                        共 {totalReviews} 条评价
                                    </ReviewStats>
                                </div>
                            </RatingSummary>

                            {/* 评价列表 */}
                            {reviews.map((review) => (
                                <ReviewItem key={review.id}>
                                    <ReviewHeader>
                                        {review.faceUrl && (
                                            <UserAvatar
                                                src={review.faceUrl.replace(
                                                    /&amp;/g,
                                                    '&'
                                                )}
                                                alt={review.userNickName}
                                                onError={(e) => {
                                                    e.target.src =
                                                        'https://via.placeholder.com/36'
                                                }}
                                            />
                                        )}
                                        <UserInfo>
                                            <UserName>
                                                {review.userNickName}
                                            </UserName>
                                            <ReviewDate>
                                                {formatDate(review.gmtModified)}
                                            </ReviewDate>
                                        </UserInfo>
                                        <StarRatingDisplay
                                            rating={review.mark}
                                        />
                                    </ReviewHeader>
                                    <ReviewContent>
                                        {review.content}
                                    </ReviewContent>
                                    <AgreeButton>
                                        👍 有用 ({review.agreeCount})
                                    </AgreeButton>
                                </ReviewItem>
                            ))}

                            {/* 分页控制 */}
                            {totalReviews > reviews.length && (
                                <PaginationControls>
                                    <Button size="small" variation="secondary">
                                        上一页
                                    </Button>
                                    <Button size="small" variation="secondary">
                                        下一页
                                    </Button>
                                </PaginationControls>
                            )}
                        </>
                    ) : (
                        <p>暂无评价数据</p>
                    )}
                </CommentsSection>
            </MainContent>

            <Sidebar>
                <SimilarResources>
                    <Heading as="h3">相似资源</Heading>
                    {mockSimilarResources.length > 0 ? (
                        mockSimilarResources.map((res) => (
                            <p key={res.id}>{res.title}</p> // 稍后替换为 ResourceCard
                            // <ResourceCard key={res.id} resource={res} />
                        ))
                    ) : (
                        <p>暂无相似资源推荐。</p>
                    )}
                </SimilarResources>
            </Sidebar>
        </DetailLayout>
    )
}

export default ResourceDetail
