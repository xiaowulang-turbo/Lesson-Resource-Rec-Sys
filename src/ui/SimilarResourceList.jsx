import styled from 'styled-components'
import { useEffect, useState } from 'react'
import Heading from './Heading'
import ResourceCard from './ResourceCard'
import Spinner from './Spinner'
import Empty from './Empty'
import { fetchSimilarResources } from '../services/apiRecommendations'
import { getResourceById } from '../services/apiResources'
import { generateSmartReason } from '../utils/recommendationReasons'

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

const RecommendationReason = styled.div`
    font-size: 1.2rem;
    color: var(--color-grey-600);
    margin-top: 0.8rem;
    padding: 0.6rem;
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-sm);
    border-left: 3px solid var(--color-brand-500);
`

const AlgorithmLabel = styled.span`
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 1.1rem;
    margin-right: 0.6rem;
    background-color: ${(props) =>
        props.type === 'collaborative'
            ? 'var(--color-brand-100)'
            : props.type === 'content'
            ? 'var(--color-blue-100)'
            : 'var(--color-green-100)'};
    color: ${(props) =>
        props.type === 'collaborative'
            ? 'var(--color-brand-700)'
            : props.type === 'content'
            ? 'var(--color-blue-700)'
            : 'var(--color-green-700)'};
    border: 1px solid
        ${(props) =>
            props.type === 'collaborative'
                ? 'var(--color-brand-200)'
                : props.type === 'content'
                ? 'var(--color-blue-200)'
                : 'var(--color-green-200)'};
`

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.2rem;
`

const SubHeading = styled.p`
    font-size: 1.3rem;
    color: var(--color-grey-500);
    margin-top: 0.4rem;
`

function SimilarResourceList({ resourceId }) {
    const [similarResources, setSimilarResources] = useState([])
    const [currentResource, setCurrentResource] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchData() {
            if (!resourceId) return

            try {
                setIsLoading(true)
                setError(null)

                // 获取当前资源
                const current = await getResourceById(resourceId)
                setCurrentResource(current)

                // 获取相似资源
                const data = await fetchSimilarResources(resourceId)

                // 处理推荐原因
                const processedData = data.map((resource) => {
                    // 使用智能推荐原因生成
                    const smartReason = generateSmartReason(resource, current)
                    return {
                        ...resource,
                        recommendationReason: smartReason,
                    }
                })

                setSimilarResources(processedData)
            } catch (err) {
                console.error('获取相似资源失败:', err)
                setError('无法加载相似资源推荐')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [resourceId])

    // 确定推荐算法类型
    const determineAlgorithmType = (resource) => {
        if (
            resource.similarityScore &&
            resource.recommendationReason?.includes('匹配度')
        ) {
            return 'collaborative' // 协同过滤
        } else if (
            resource.coAccessPercentage ||
            resource.recommendationReason?.includes('用户')
        ) {
            return 'behavior' // 行为分析
        } else {
            return 'content' // 内容过滤
        }
    }

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
            <Header>
                <div>
                    <Heading as="h3">相似资源推荐</Heading>
                    <SubHeading>基于您当前查看的资源推荐</SubHeading>
                </div>
            </Header>

            <GridList>
                {similarResources.map((resource) => {
                    // 确定算法类型
                    const algorithmType = determineAlgorithmType(resource)

                    return (
                        <div key={resource.id}>
                            <ResourceCard resource={resource} />

                            {resource.recommendationReason && (
                                <RecommendationReason>
                                    <AlgorithmLabel type={algorithmType}>
                                        {algorithmType === 'collaborative'
                                            ? '协同过滤'
                                            : algorithmType === 'content'
                                            ? '内容匹配'
                                            : '行为分析'}
                                    </AlgorithmLabel>
                                    {resource.recommendationReason}
                                </RecommendationReason>
                            )}
                        </div>
                    )
                })}
            </GridList>
        </StyledList>
    )
}

export default SimilarResourceList
