import { useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import Spinner from '../ui/Spinner'
import ResourceList from '../components/ResourceList'
import Empty from '../ui/Empty'
// import Filter from '../ui/Filter';
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { searchResources } from '../services/apiSearch'
import {
    searchMoocCoursesDirectly,
    saveMoocResources,
} from '../services/apiMooc'
import { useState, useEffect, useCallback } from 'react'
import { debounce } from '../utils/debounce'
import toast from 'react-hot-toast'

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
    const [isSaving, setIsSaving] = useState(false) // 保存状态

    const queryClient = useQueryClient() // 获取 query client 实例

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

    // 防抖处理MOOC搜索
    const debouncedFetchMooc = useCallback(
        debounce(async (searchQuery) => {
            if (!searchQuery || searchType !== 'mooc') return

            setIsLoading(true)
            setError(null)

            try {
                console.log('开始搜索MOOC资源:', searchQuery)
                const moocResults = await searchMoocCoursesDirectly(searchQuery)
                console.log('获取到MOOC资源数量:', moocResults?.length || 0)

                console.log('MOOC资源:', moocResults)

                // 确保每个资源都有id字段和必要属性
                const validResources = (moocResults || []).filter(
                    (resource) => {
                        // console.log('resource', resource)
                        // 必须有ID 或者能自动生成ID
                        const hasId = resource._id || resource.id

                        // resource.title =
                        //     resource.mocTextbookVo?.name || '未知课程'
                        // resource.organization =
                        //     resource.highlightUniversity || '中国大学MOOC'
                        // resource.description =
                        //     resource.mocTextbookVo?.description || '无描述'

                        // 处理各字段
                        // if (!resource.title) resource.title = '未知课程'
                        // if (!resource.organization)
                        //     resource.organization = '中国大学MOOC'
                        // if (!resource.description)
                        //     resource.description = '无描述'

                        return true // 允许所有资源，MongoDB会自动生成ID
                    }
                )

                console.log('有效的MOOC资源数量:', validResources.length)

                if (validResources.length !== (moocResults || []).length) {
                    console.warn('存在没有ID的资源，这些资源将被过滤掉')
                }

                // 将获取的MOOC资源保存到数据库
                setIsSaving(true)
                try {
                    const savedResults = await saveMoocResources(validResources)
                    console.log('保存的资源数量:', savedResults?.results || 0)

                    // 保存成功后，刷新本地资源缓存
                    queryClient.invalidateQueries(['resources'])
                    toast.success(
                        `已成功保存 ${
                            savedResults?.results || 0
                        } 个资源到数据库`
                    )

                    // 保存后切换到本地搜索展示保存的资源
                    setSearchType('local')
                    setSearchParams({
                        q: query,
                        type: 'local',
                    })
                } catch (err) {
                    console.error('保存MOOC资源失败:', err)
                    toast.error(`保存资源失败: ${err.message || '未知错误'}`)
                    // 保存失败仍然显示搜索结果
                    setResources(validResources)
                } finally {
                    setIsSaving(false)
                }
            } catch (err) {
                console.error('搜索MOOC失败:', err)
                setError(err.message || '搜索MOOC资源失败')
            } finally {
                setIsLoading(false)
            }
        }, 500),
        [searchType, queryClient, setSearchParams]
    )

    // MOOC搜索使用普通fetch
    useEffect(() => {
        if (query && searchType === 'mooc') {
            debouncedFetchMooc(query)
        }
    }, [query, searchType, debouncedFetchMooc])

    // 切换搜索类型 - 防抖处理
    const debouncedSetSearchType = useCallback(
        debounce((type) => {
            setSearchType(type)
            setSearchParams({
                q: query,
                type,
            })
        }, 300),
        [query, setSearchParams]
    )

    // 切换搜索类型
    const handleSearchTypeChange = (type) => {
        if (type === searchType) return // 如果类型相同，无需切换
        debouncedSetSearchType(type)
    }

    // 根据当前搜索类型决定显示的资源和状态
    const currentResources =
        searchType === 'local' ? localResources || [] : resources
    const currentIsLoading = searchType === 'local' ? isLocalLoading : isLoading
    const currentError = searchType === 'local' ? localError : error

    console.log('当前资源类型:', searchType)
    console.log('当前资源数量:', currentResources?.length || 0)

    if (currentResources && currentResources.length > 0) {
        // console.log('第一个资源示例:', currentResources[0])
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
            {(currentIsLoading || isSaving) && <Spinner />}
            {currentError && (
                <Empty
                    resource={`搜索 "${query}" 时出错: ${
                        currentError.message || currentError
                    }`}
                />
            )}
            {!currentIsLoading &&
                !isSaving &&
                !currentError &&
                query &&
                currentResources &&
                currentResources.length > 0 && (
                    <ResourceList resources={currentResources} />
                )}
            {!currentIsLoading &&
                !isSaving &&
                !currentError &&
                query &&
                (!currentResources || currentResources.length === 0) && (
                    <Empty
                        resource={`没有找到与 "${query}" 相关的${
                            searchType === 'local' ? '本地' : 'MOOC'
                        }资源`}
                    />
                )}
            {!currentIsLoading && !isSaving && !currentError && !query && (
                <Empty resource="请输入关键词开始搜索资源" />
            )}
        </SearchPageLayout>
    )
}

export default Search
