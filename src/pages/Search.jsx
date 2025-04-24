import { useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import Spinner from '../ui/Spinner'
import ResourceList from '../components/ResourceList'
import Empty from '../ui/Empty'
// import Filter from '../ui/Filter';
import { useQuery } from '@tanstack/react-query'
import { searchResources } from '../services/apiSearch'
import { searchMoocCoursesDirectly } from '../services/apiMooc'
import { useState, useEffect } from 'react'

const SearchPageLayout = styled.div`
    padding: 3.2rem 4.8rem;
`

const SearchType = styled.div`
    display: flex;
    gap: 1.6rem;
    margin-bottom: 2rem;
`

const SearchTypeButton = styled.button`
    background: ${(props) =>
        props.active ? 'var(--color-brand-600)' : 'var(--color-grey-200)'};
    color: ${(props) => (props.active ? 'white' : 'var(--color-grey-700)')};
    border: none;
    padding: 0.8rem 1.6rem;
    border-radius: var(--border-radius-sm);
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: ${(props) =>
            props.active ? 'var(--color-brand-700)' : 'var(--color-grey-300)'};
    }
`

function Search() {
    const [searchParams, setSearchParams] = useSearchParams()
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'local' // 默认为本地搜索

    const [searchType, setSearchType] = useState(type) // 搜索类型状态
    const [resources, setResources] = useState([]) // 资源列表状态
    const [isLoading, setIsLoading] = useState(false) // 加载状态
    const [error, setError] = useState(null) // 错误状态

    // 本地搜索使用React Query
    const {
        isLoading: isLocalLoading,
        data: localResources,
        error: localError,
    } = useQuery({
        queryKey: ['search', query, searchType],
        queryFn: () => searchResources(query),
        // 只有当需要本地搜索且query不为空时执行查询
        enabled: !!query && searchType === 'local',
    })

    // MOOC搜索使用普通fetch
    useEffect(() => {
        async function fetchMoocResults() {
            if (!query || searchType !== 'mooc') return

            setIsLoading(true)
            setError(null)

            try {
                console.log('开始搜索MOOC资源:', query)
                const moocResults = await searchMoocCoursesDirectly(query)
                console.log('获取到MOOC资源数量:', moocResults?.length || 0)

                // 确保每个资源都有id字段和必要属性
                const validResources = (moocResults || []).filter(
                    (resource) => {
                        // 必须有ID
                        if (!resource.id) return false

                        // 处理各字段
                        if (!resource.title) resource.title = '未知课程'
                        if (!resource.organization)
                            resource.organization = '中国大学MOOC'
                        if (!resource.description)
                            resource.description = '无描述'

                        return true
                    }
                )

                console.log('有效的MOOC资源数量:', validResources.length)

                if (validResources.length !== (moocResults || []).length) {
                    console.warn('存在没有ID的资源，这些资源将被过滤掉')
                }

                setResources(validResources)
            } catch (err) {
                console.error('搜索MOOC失败:', err)
                setError(err.message || '搜索MOOC资源失败')
            } finally {
                setIsLoading(false)
            }
        }

        fetchMoocResults()
    }, [query, searchType])

    // 切换搜索类型
    const handleSearchTypeChange = (type) => {
        setSearchType(type)
        setSearchParams({
            q: query,
            type,
        })
    }

    // 根据当前搜索类型决定显示的资源和状态
    const currentResources =
        searchType === 'local' ? localResources || [] : resources
    const currentIsLoading = searchType === 'local' ? isLocalLoading : isLoading
    const currentError = searchType === 'local' ? localError : error

    console.log('当前资源类型:', searchType)
    console.log('当前资源数量:', currentResources?.length || 0)

    if (currentResources && currentResources.length > 0) {
        console.log('第一个资源示例:', currentResources[0])
        // 确认资源是否有必要的字段
        const firstResource = currentResources[0]
        const missingFields = []
        ;['id', 'title', 'description', 'organization', 'cover'].forEach(
            (field) => {
                if (!firstResource[field]) missingFields.push(field)
            }
        )

        if (missingFields.length > 0) {
            console.warn('资源缺少必要字段:', missingFields.join(', '))
        }
    }

    return (
        <SearchPageLayout>
            <Row
                type="horizontal"
                style={{
                    marginBottom: '1.6rem',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Heading as="h1">
                    {query ? `搜索结果: "${query}"` : '请输入关键词搜索'}
                </Heading>
            </Row>

            <SearchType>
                <SearchTypeButton
                    active={searchType === 'local'}
                    onClick={() => handleSearchTypeChange('local')}
                >
                    搜本地
                </SearchTypeButton>
                <SearchTypeButton
                    active={searchType === 'mooc'}
                    onClick={() => handleSearchTypeChange('mooc')}
                >
                    搜全网
                </SearchTypeButton>
            </SearchType>

            {/* --- 根据状态显示内容 --- */}
            {currentIsLoading && <Spinner />}
            {currentError && (
                <Empty
                    resource={`搜索 "${query}" 时出错: ${
                        currentError.message || currentError
                    }`}
                />
            )}
            {!currentIsLoading &&
                !currentError &&
                query &&
                currentResources &&
                currentResources.length > 0 && (
                    <ResourceList resources={currentResources} />
                )}
            {!currentIsLoading &&
                !currentError &&
                query &&
                (!currentResources || currentResources.length === 0) && (
                    <Empty
                        resource={`没有找到与 "${query}" 相关的${
                            searchType === 'local' ? '本地' : 'MOOC'
                        }资源`}
                    />
                )}
            {!currentIsLoading && !currentError && !query && (
                <Empty resource="请输入关键词开始搜索资源" />
            )}
        </SearchPageLayout>
    )
}

export default Search
