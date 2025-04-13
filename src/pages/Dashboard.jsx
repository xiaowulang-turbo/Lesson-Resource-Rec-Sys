import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import Input from '../ui/Input'
import Button from '../ui/Button'
// import Spinner from '../ui/Spinner'
import Empty from '../ui/Empty'
import ResourceList from '../components/ResourceList'
// import { getRecommendedResources } from '../services/apiResources'

const StyledDashboard = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2.4rem;
`

const SearchContainer = styled.div`
    display: flex;
    gap: 1.2rem;
    padding: 1.6rem;
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-md);

    input {
        flex-grow: 1;
    }
`

const RecommendationsContainer = styled.section`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem;
`

// --- 模拟推荐数据 ---
const mockRecommendedResources = [
    {
        _id: 'mock1',
        title: '模拟推荐：高效备课技巧',
        description: '探索一系列节省时间、提升课堂效果的备课方法。',
        type: 1, // 文档
        subject: '教学法',
        grade: '通用',
        difficulty: 3, // 中级
        tags: ['备课', '效率', '教学设计'],
        price: 0,
        coverImage: 'https://picsum.photos/seed/mock1/400/180',
        createdBy: { name: '教育专家' },
        averageRating: 4.5,
        ratingsCount: 120,
    },
    {
        _id: 'mock2',
        title: '模拟推荐：互动课堂活动精选',
        description: '包含多种学科的趣味互动活动，激发学生学习兴趣。',
        type: 5, // 其他
        subject: '课堂管理',
        grade: '小学',
        difficulty: 2, // 初级
        tags: ['互动', '课堂活动', '游戏化'],
        price: 10.0,
        coverImage: 'https://picsum.photos/seed/mock2/400/180',
        createdBy: { name: '经验教师' },
        averageRating: 4.8,
        ratingsCount: 95,
    },
    {
        _id: 'mock3',
        title: '模拟推荐：初中数学核心概念解析',
        description: '深入浅出地讲解代数、几何等核心概念，配有练习题。',
        type: 2, // 视频
        subject: '数学',
        grade: '初中',
        difficulty: 3, // 中级
        tags: ['数学', '核心概念', '视频教程'],
        price: 0,
        coverImage: 'https://picsum.photos/seed/mock3/400/180',
        createdBy: { name: '数学名师' },
        averageRating: 4.2,
        ratingsCount: 210,
    },
]
// --- 模拟数据结束 ---

function Dashboard() {
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()

    // // 获取推荐资源 (暂时注释掉)
    // const {
    //     data: recommendedResources,
    //     isLoading: isLoadingRecommendations,
    //     error: recommendationError,
    // } = useQuery({
    //     queryKey: ['recommendedResources'],
    //     queryFn: getRecommendedResources,
    // })

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        // 跳转到搜索页面，并将搜索词作为查询参数
        navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`)
    }

    return (
        <StyledDashboard>
            <Row type="horizontal" style={{ justifyContent: 'space-between' }}>
                <Heading as="h1">首页仪表盘</Heading>
            </Row>

            <SearchContainer as="form" onSubmit={handleSearchSubmit}>
                <Input
                    type="search"
                    placeholder="快速搜索备课资源..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    id="dashboard-search"
                />
                <Button type="submit">搜索</Button>
            </SearchContainer>

            <RecommendationsContainer>
                <Heading as="h2" style={{ marginBottom: '1.6rem' }}>
                    为您推荐
                </Heading>
                {
                    // 直接使用模拟数据
                    mockRecommendedResources &&
                    mockRecommendedResources.length > 0 ? (
                        <ResourceList resources={mockRecommendedResources} />
                    ) : (
                        <Empty resourceName="推荐资源">暂无推荐内容。</Empty>
                    )
                }
            </RecommendationsContainer>
        </StyledDashboard>
    )
}

export default Dashboard
