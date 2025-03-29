import { useState, useEffect } from 'react'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import styled from 'styled-components'
import ResourceList from '../components/ResourceList'
import ResourceFilter from '../components/ResourceFilter'
import { getAllResources } from '../services/resourceService'
import Spinner from '../ui/Spinner'

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
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filters, setFilters] = useState({
        search: '',
        subject: 'all',
        type: 'all',
        difficulty: 'all',
        sort: 'newest',
    })

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const data = await getAllResources()
                setResources(data)
                setFilteredResources(data)
            } catch (err) {
                setError('获取资源列表失败')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchResources()
    }, [])

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

    const handleFilterChange = (filterChange) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filterChange.type]: filterChange.value,
        }))
    }

    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">学习资源</Heading>
            </Row>

            <StyledResources>
                <Description>
                    这里展示各类学习资源，包括电子教材、实践项目和练习题库等。您可以通过筛选和搜索找到适合您的学习资源。
                </Description>

                <FilterSection>
                    <ResourceFilter onFilterChange={handleFilterChange} />
                </FilterSection>

                {loading ? (
                    <Spinner />
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <ResourceList resources={filteredResources} />
                )}
            </StyledResources>
        </>
    )
}

export default Resources
