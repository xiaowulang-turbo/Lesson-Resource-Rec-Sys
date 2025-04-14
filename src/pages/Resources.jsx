import { useState, useEffect } from 'react'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import styled from 'styled-components'
import ResourceList from '../components/ResourceList'
import ResourceFilter from '../components/ResourceFilter'
import { getAllResources } from '../services/apiResources'
import Spinner from '../ui/Spinner'
import Pagination from '../ui/Pagination'
import { PAGE_SIZE } from '../utils/constants'
import { useSearchParams } from 'react-router-dom'

const StyledResources = styled.div`
    padding: 2.4rem;
`

const Description = styled.p`
    font-size: 1.6rem;
    color: var(--color-grey-500);
    margin-bottom: 2.4rem;
`

const FilterSection = styled.div`
    margin-bottom: 2rem;
`

function Resources() {
    const [resources, setResources] = useState([])
    const [filteredResources, setFilteredResources] = useState([])
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: PAGE_SIZE,
        pages: 1,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchParams, setSearchParams] = useSearchParams()
    const [filters, setFilters] = useState({
        search: '',
        subject: 'all',
        type: 'all',
        difficulty: 'all',
        sort: 'newest',
    })

    // 获取当前页码
    const currentPage = parseInt(searchParams.get('page') || 1)

    // 当页码变化时重新获取数据
    useEffect(() => {
        const fetchResources = async () => {
            try {
                setLoading(true)
                // 添加页码和每页数量到请求
                const result = await getAllResources({
                    page: currentPage,
                    limit: PAGE_SIZE,
                })

                setResources(result.resources)
                setFilteredResources(result.resources)
                setPagination(result.pagination)
            } catch (err) {
                setError('获取资源列表失败')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchResources()
    }, [currentPage])

    // 当过滤条件改变时，应用客户端过滤
    useEffect(() => {
        if (!resources.length) return

        let result = [...resources]

        // 搜索过滤
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase()
            result = result.filter(
                (resource) =>
                    resource.title.toLowerCase().includes(searchTerm) ||
                    resource.description.toLowerCase().includes(searchTerm) ||
                    (resource.tags &&
                        resource.tags.some((tag) =>
                            tag.toLowerCase().includes(searchTerm)
                        ))
            )
        }

        // 学科过滤
        if (filters.subject !== 'all') {
            result = result.filter(
                (resource) => resource.subject === filters.subject
            )
        }

        // 类型过滤
        if (filters.type !== 'all') {
            result = result.filter(
                (resource) => resource.type.toString() === filters.type
            )
        }

        // 难度过滤
        if (filters.difficulty !== 'all') {
            result = result.filter(
                (resource) =>
                    resource.difficulty.toString() === filters.difficulty
            )
        }

        // 排序
        switch (filters.sort) {
            case 'newest':
                result.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                )
                break
            case 'rating':
                result.sort((a, b) => b.averageRating - a.averageRating)
                break
            case 'popular':
                result.sort((a, b) => b.enrollCount - a.enrollCount)
                break
            case 'price-low':
                result.sort((a, b) => a.price - b.price)
                break
            case 'price-high':
                result.sort((a, b) => b.price - a.price)
                break
            default:
                break
        }

        setFilteredResources(result)
    }, [resources, filters])

    // 当过滤条件变化时，重置到第一页
    useEffect(() => {
        if (currentPage !== 1) {
            searchParams.set('page', 1)
            setSearchParams(searchParams)
        }
    }, [filters])

    const handleFilterChange = (filterChange) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filterChange.type]: filterChange.value,
        }))
    }

    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">资源中心</Heading>
            </Row>

            <StyledResources>
                <Description>
                    在这里查找和浏览各类教学资源。您可以通过筛选和搜索找到所需的备课材料。
                </Description>

                <FilterSection>
                    <ResourceFilter onFilterChange={handleFilterChange} />
                </FilterSection>

                {loading ? (
                    <Spinner />
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <>
                        <ResourceList resources={filteredResources} />
                        <Pagination count={pagination.total} />
                    </>
                )}
            </StyledResources>
        </>
    )
}

export default Resources
