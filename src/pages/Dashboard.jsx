import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'
import Empty from '../ui/Empty'
import ResourceList from '../components/ResourceList'
import { getRecommendedResources } from '../services/apiResources'

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

    const {
        data: recommendedResources,
        isLoading: isLoadingRecommendations,
        error: recommendationError,
    } = useQuery({
        queryKey: ['recommendedResources'],
        queryFn: getRecommendedResources,
    })

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        console.log('Searching for:', searchQuery)
    }

    return (
        <StyledDashboard>
            <Row type="horizontal" style={{ justifyContent: 'space-between' }}>
                {/* <Heading as="h1">首页仪表盘</Heading> */}
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
                {isLoadingRecommendations ? (
                    <Spinner />
                ) : recommendationError ? (
                    <Empty resourceName="推荐资源">
                        无法加载推荐，请稍后再试。
                    </Empty>
                ) : recommendedResources && recommendedResources.length > 0 ? (
                    <ResourceList resources={recommendedResources} />
                ) : (
                    <Empty resourceName="推荐资源">
                        暂无个性化推荐，多浏览和评价资源有助于我们了解您的偏好。
                    </Empty>
                )}
            </RecommendationsContainer>
        </StyledDashboard>
    )
}

export default Dashboard
