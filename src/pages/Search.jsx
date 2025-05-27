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
    searchMoocCourses,
    saveMoocCourses,
} from '../services/apiMooc'
import { useState, useEffect, useCallback } from 'react'
import { debounce } from '../utils/debounce'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Input from '../ui/Input'
import Button from '../ui/Button'

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

// 添加搜索框样式
const SearchContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    padding: 1.6rem;
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-md);
    margin-bottom: 2rem;
`

const SearchOptionsRow = styled.div`
    display: flex;
    gap: 1.2rem;
    margin-bottom: 0.8rem;
`

const SearchInputRow = styled.div`
    display: flex;
    gap: 1.2rem;
    width: 100%;

    input {
        flex-grow: 1;
    }
`

function Search() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'local' // 默认为本地搜索

    const [searchType, setSearchType] = useState(type) // 搜索类型状态
    const [searchQuery, setSearchQuery] = useState(query) // 新增：搜索输入框状态
    const [resources, setResources] = useState([]) // 资源列表状态
    const [isLoading, setIsLoading] = useState(false) // 加载状态
    const [error, setError] = useState(null) // 错误状态
    const [isSaving, setIsSaving] = useState(false) // 保存状态
    const [saveError, setSaveError] = useState(null) // 保存错误状态

    const queryClient = useQueryClient() // 获取 query client 实例
    const { user } = useAuth() // 获取当前用户信息

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

    // 新增：处理搜索提交
    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        // 根据搜索类型导航到不同的搜索页面
        if (searchType === 'local') {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        } else if (searchType === 'mooc') {
            navigate(
                `/search?q=${encodeURIComponent(searchQuery.trim())}&type=mooc`
            )
        } else if (searchType === 'course') {
            navigate(
                `/search?q=${encodeURIComponent(
                    searchQuery.trim()
                )}&type=course`
            )
        }
    }

    // 防抖处理MOOC搜索（教材）
    const debouncedFetchMooc = useCallback(
        debounce(async (searchQuery) => {
            if (!searchQuery || searchType !== 'mooc') return

            setIsLoading(true)
            setError(null)
            setSaveError(null)

            try {
                console.log('开始搜索MOOC资源:', searchQuery)
                const moocResults = await searchMoocCoursesDirectly(searchQuery)
                console.log('获取到MOOC资源数量:', moocResults?.length || 0)

                if (!moocResults || moocResults.length === 0) {
                    setIsLoading(false)
                    return // 如果没有搜索结果，直接返回
                }

                // 确保每个资源都有id字段和必要属性
                const validResources = (moocResults || []).filter(
                    (resource) => {
                        return true // 允许所有资源，MongoDB会自动生成ID
                    }
                )

                console.log('有效的MOOC资源数量:', validResources.length)

                if (validResources.length === 0) {
                    setIsLoading(false)
                    setError('没有找到有效的资源')
                    return
                }

                // 将获取的MOOC资源保存到数据库
                setIsSaving(true)
                try {
                    const savedResults = await saveMoocResources(
                        validResources,
                        user?._id || user?.id // 传递用户ID
                    )
                    console.log('保存的资源数量:', savedResults?.results || 0)

                    if (!savedResults || savedResults.results === 0) {
                        setSaveError('没有资源被成功保存到数据库')
                        setIsSaving(false)
                        return
                    }

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
                    setSaveError(`保存资源失败: ${err.message || '未知错误'}`)
                    toast.error(`保存资源失败: ${err.message || '未知错误'}`)
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
        [searchType, queryClient, setSearchParams, query, user]
    )

    // 新增：防抖处理课程搜索
    const debouncedFetchCourses = useCallback(
        debounce(async (searchQuery) => {
            if (!searchQuery || searchType !== 'course') return

            setIsLoading(true)
            setError(null)
            setSaveError(null)

            try {
                console.log('开始搜索课程资源:', searchQuery)
                const courseResults = await searchMoocCourses(searchQuery)
                console.log('获取到课程资源数量:', courseResults?.length || 0)

                if (!courseResults || courseResults.length === 0) {
                    setIsLoading(false)
                    return
                }

                // 确保每个资源都有id字段和必要属性
                const validResources = (courseResults || []).filter(
                    (resource) => {
                        return true // 允许所有资源，MongoDB会自动生成ID
                    }
                )

                console.log('有效的课程资源数量:', validResources.length)

                if (validResources.length === 0) {
                    setIsLoading(false)
                    setError('没有找到有效的课程资源')
                    return
                }

                console.log('有效的课程资源:', validResources)

                // 将获取的课程资源保存到数据库
                setIsSaving(true)
                try {
                    const savedResults = await saveMoocCourses(
                        validResources,
                        user?._id || user?.id
                    )
                    console.log(
                        '保存的课程资源数量:',
                        savedResults?.results || 0
                    )

                    if (!savedResults || savedResults.results === 0) {
                        setSaveError('没有课程资源被成功保存到数据库')
                        setIsSaving(false)
                        return
                    }

                    // 保存成功后，刷新本地资源缓存
                    queryClient.invalidateQueries(['resources'])
                    toast.success(
                        `已成功保存 ${
                            savedResults?.results || 0
                        } 个课程资源到数据库`
                    )

                    // 保存后切换到本地搜索展示保存的资源
                    setSearchType('local')
                    setSearchParams({
                        q: query,
                        type: 'local',
                    })
                } catch (err) {
                    console.error('保存课程资源失败:', err)
                    setSaveError(
                        `保存课程资源失败: ${err.message || '未知错误'}`
                    )
                    toast.error(
                        `保存课程资源失败: ${err.message || '未知错误'}`
                    )
                } finally {
                    setIsSaving(false)
                }
            } catch (err) {
                console.error('搜索课程失败:', err)
                setError(err.message || '搜索课程资源失败')
            } finally {
                setIsLoading(false)
            }
        }, 500),
        [searchType, queryClient, setSearchParams, query, user]
    )

    // MOOC搜索使用普通fetch
    useEffect(() => {
        if (query && searchType === 'mooc') {
            debouncedFetchMooc(query)
        }
    }, [query, searchType, debouncedFetchMooc])

    // 新增：课程搜索使用普通fetch
    useEffect(() => {
        if (query && searchType === 'course') {
            debouncedFetchCourses(query)
        }
    }, [query, searchType, debouncedFetchCourses])

    // 切换搜索类型 - 防抖处理
    const debouncedSetSearchType = useCallback(
        debounce((type) => {
            setSearchType(type)
            setSaveError(null) // 清除保存错误
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

    // 同步URL查询参数到搜索框状态
    useEffect(() => {
        setSearchQuery(query)
        setSearchType(type)
    }, [query, type])

    // 根据当前搜索类型决定显示的资源和状态
    const currentResources =
        searchType === 'local' ? localResources || [] : resources
    const currentIsLoading = searchType === 'local' ? isLocalLoading : isLoading
    const currentError = searchType === 'local' ? localError : error

    console.log('当前资源类型:', searchType)
    console.log('当前资源数量:', currentResources?.length || 0)

    if (currentResources && currentResources.length > 0) {
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

            {/* 新增：搜索框组件 */}
            <SearchContainer as="form" onSubmit={handleSearchSubmit}>
                {/* <SearchOptionsRow>
                    <SearchTypeButton
                        type="button"
                        active={searchType === 'local'}
                        onClick={() => handleSearchTypeChange('local')}
                    >
                        搜本地
                    </SearchTypeButton>
                    <SearchTypeButton
                        type="button"
                        active={searchType === 'mooc'}
                        onClick={() => handleSearchTypeChange('mooc')}
                    >
                        搜教材
                    </SearchTypeButton>
                    <SearchTypeButton
                        type="button"
                        active={searchType === 'course'}
                        onClick={() => handleSearchTypeChange('course')}
                    >
                        搜课程
                    </SearchTypeButton>
                </SearchOptionsRow> */}
                <SearchInputRow>
                    <Input
                        type="search"
                        placeholder="快速搜索资源..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        id="search-input"
                    />
                    <Button type="submit">搜索</Button>
                </SearchInputRow>
            </SearchContainer>

            {/* --- 根据状态显示内容 --- */}
            {(currentIsLoading || isSaving) && <Spinner />}

            {/* 显示错误信息 */}
            {currentError && !currentIsLoading && !isSaving && (
                <Empty
                    resource={`搜索 "${query}" 时出错: ${
                        currentError.message || currentError
                    }`}
                />
            )}

            {/* 显示保存错误信息 */}
            {saveError && !currentIsLoading && !isSaving && (
                <Empty resource={saveError} />
            )}

            {/* 显示资源列表 */}
            {!currentIsLoading &&
                !isSaving &&
                !currentError &&
                !saveError &&
                query &&
                currentResources &&
                currentResources.length > 0 && (
                    <ResourceList resources={currentResources} />
                )}

            {/* 没有找到资源 */}
            {!currentIsLoading &&
                !isSaving &&
                !currentError &&
                !saveError &&
                query &&
                (!currentResources || currentResources.length === 0) && (
                    <Empty
                        resource={`没有找到与 "${query}" 相关的${
                            searchType === 'local'
                                ? '本地'
                                : searchType === 'mooc'
                                ? 'MOOC'
                                : '课程'
                        }资源`}
                    />
                )}

            {/* 初始状态 */}
            {!currentIsLoading &&
                !isSaving &&
                !currentError &&
                !saveError &&
                !query && <Empty resource="请输入关键词开始搜索资源" />}
        </SearchPageLayout>
    )
}

export default Search
