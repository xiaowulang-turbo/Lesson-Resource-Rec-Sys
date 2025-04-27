import styled from 'styled-components'
import { useEffect, useState } from 'react'
import Heading from './Heading'
import ResourceCard from './ResourceCard'
import Spinner from './Spinner'
import Empty from './Empty'
import { fetchSimilarResources } from '../services/apiRecommendations'

const StyledList = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.6rem;
    margin-bottom: 2.4rem;
`

const Message = styled.p`
    color: var(--color-grey-500);
    font-size: 1.4rem;
    text-align: center;
    margin: 2.4rem 0;
`

const GridList = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.6rem;
    margin-top: 1.6rem;
`

function SimilarResourceList({ resourceId }) {
    const [similarResources, setSimilarResources] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchData() {
            if (!resourceId) return

            try {
                setIsLoading(true)
                setError(null)
                const data = await fetchSimilarResources(resourceId)
                setSimilarResources(data)
            } catch (err) {
                console.error('获取相似资源失败:', err)
                setError('无法加载相似资源推荐')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [resourceId])

    // 加载状态
    if (isLoading) return <Spinner />

    // 错误状态
    if (error) return <Message>{error}</Message>

    // 无数据状态
    if (!similarResources || similarResources.length === 0) {
        return <Empty resourceName="相似资源" />
    }

    return (
        <StyledList>
            <Heading as="h3">相似资源推荐</Heading>
            <GridList>
                {similarResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                ))}
            </GridList>
        </StyledList>
    )
}

export default SimilarResourceList
