import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'
import Empty from '../ui/Empty'
import ResourceList from '../components/ResourceList'
// import { getRecommendedResources } from '../services/apiResources'
import { fetchHomepageRecommendations } from '../services/apiRecommendations'
import { useAuth } from '../context/AuthContext'

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

function Dashboard() {
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()

    const [recommendedResources, setRecommendedResources] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function loadRecommendations() {
            try {
                setIsLoading(true)
                setError(null)
                console.log('Fetching recommendations...')
                const recommendations = await fetchHomepageRecommendations(8)
                console.log('Recommendations received:', recommendations)
                setRecommendedResources(recommendations)
            } catch (err) {
                console.error('获取推荐数据失败:', err)
                setError(err.message || '无法加载推荐数据，请稍后再试。')
            } finally {
                setIsLoading(false)
            }
        }

        loadRecommendations()
    }, [isAuthenticated])

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }

    const recommendationTitle = isAuthenticated
        ? `${user?.name || '用户'}，为你推荐`
        : '为你推荐'

    console.log('[Dashboard] Rendering - isLoading:', isLoading)
    console.log('[Dashboard] Rendering - error:', error)
    console.log(
        '[Dashboard] Rendering - recommendedResources:',
        recommendedResources
    )

    return (
        <StyledDashboard>
            <Row type="horizontal" style={{ justifyContent: 'space-between' }}>
                {/* <Heading as="h1">首页仪表盘</Heading> */}
            </Row>

            <SearchContainer as="form" onSubmit={handleSearchSubmit}>
                <Input
                    type="search"
                    placeholder="快速搜索资源..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    id="dashboard-search"
                />
                <Button type="submit">搜索</Button>
            </SearchContainer>

            <RecommendationsContainer>
                <Heading as="h2" style={{ marginBottom: '1.6rem' }}>
                    {recommendationTitle}
                </Heading>
                {isLoading ? (
                    <Spinner />
                ) : error ? (
                    <p
                        style={{
                            color: 'var(--color-red-700)',
                            textAlign: 'center',
                        }}
                    >{`加载推荐失败：${error}`}</p>
                ) : recommendedResources && recommendedResources.length > 0 ? (
                    <ResourceList resources={recommendedResources} />
                ) : (
                    <Empty resourceName="推荐资源">暂无推荐内容。</Empty>
                )}
            </RecommendationsContainer>
        </StyledDashboard>
    )
}

export default Dashboard
