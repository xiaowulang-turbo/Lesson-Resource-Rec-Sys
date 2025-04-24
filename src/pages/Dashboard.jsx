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
    flex-direction: column;
    gap: 1.2rem;
    padding: 1.6rem;
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-md);
`

const SearchInputRow = styled.div`
    display: flex;
    gap: 1.2rem;
    width: 100%;

    input {
        flex-grow: 1;
    }
`

const SearchOptionsRow = styled.div`
    display: flex;
    gap: 1.2rem;
    margin-top: 0.8rem;
`

const SearchOptionButton = styled.button`
    background: ${(props) =>
        props.active ? 'var(--color-brand-600)' : 'var(--color-grey-200)'};
    color: ${(props) => (props.active ? 'white' : 'var(--color-grey-700)')};
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: var(--border-radius-sm);
    font-size: 1.4rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: ${(props) =>
            props.active ? 'var(--color-brand-700)' : 'var(--color-grey-300)'};
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
    const [searchType, setSearchType] = useState('local') // 'local' 或 'mooc'
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

        // 根据搜索类型导航到不同的搜索页面
        if (searchType === 'local') {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        } else {
            navigate(
                `/search?q=${encodeURIComponent(searchQuery.trim())}&type=mooc`
            )
        }
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
                <SearchInputRow>
                    <Input
                        type="search"
                        placeholder="快速搜索资源..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        id="dashboard-search"
                    />
                    <Button type="submit">搜索</Button>
                </SearchInputRow>
                <SearchOptionsRow>
                    <SearchOptionButton
                        type="button"
                        active={searchType === 'local'}
                        onClick={() => setSearchType('local')}
                    >
                        搜本地
                    </SearchOptionButton>
                    <SearchOptionButton
                        type="button"
                        active={searchType === 'mooc'}
                        onClick={() => setSearchType('mooc')}
                    >
                        搜全网
                    </SearchOptionButton>
                </SearchOptionsRow>
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
