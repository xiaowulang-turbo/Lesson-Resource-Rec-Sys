import { useState, useEffect } from 'react'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import styled from 'styled-components'
import ResourceList from '../components/ResourceList'
import { getAllResources } from '../services/apiResources'
import Spinner from '../ui/Spinner'
import Pagination from '../ui/Pagination'
import { PAGE_SIZE } from '../utils/constants'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import { HiCloudArrowUp, HiMagnifyingGlass } from 'react-icons/hi2'
import Input from '../ui/Input'

const StyledResources = styled.div`
    padding: 2.4rem;
`

const Description = styled.p`
    font-size: 1.6rem;
    color: var(--color-grey-500);
    margin-bottom: 2.4rem;
`

const SearchForm = styled.form`
    display: flex;
    width: 100%;
    max-width: 60rem;
    margin-bottom: 3rem;
    align-items: center;
    gap: 1rem;
`

const SearchContainer = styled.div`
    position: relative;
    flex: 1;
`

const SearchInput = styled(Input)`
    padding: 1.2rem 1.2rem 1.2rem 4rem;
    width: 100%;
    border-radius: 0.6rem;
    font-size: 1.6rem;
    border: 1px solid var(--color-grey-300);

    &:focus {
        border-color: var(--color-brand-600);
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    &::placeholder {
        color: var(--color-grey-400);
    }
`

const SearchIcon = styled.div`
    position: absolute;
    left: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-grey-500);
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    pointer-events: none;
`

const SearchButton = styled(Button)`
    padding: 1.2rem 2.4rem;
    font-size: 1.6rem;
    border-radius: 0.6rem;
`

function Resources() {
    const navigate = useNavigate()
    const [resources, setResources] = useState([])
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: PAGE_SIZE,
        pages: 1,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchParams, setSearchParams] = useSearchParams()
    const [searchQuery, setSearchQuery] = useState('')

    // 获取当前页码
    const currentPage = parseInt(searchParams.get('page') || 1)

    // 当页码变化时重新获取数据
    useEffect(() => {
        const fetchResources = async () => {
            try {
                setLoading(true)
                // 添加页码、每页数量参数到请求
                const result = await getAllResources({
                    page: currentPage,
                    limit: PAGE_SIZE,
                })

                console.log('[Resources] Rendering - result:', result)

                setResources(result.resources)
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

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }

    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">资源中心</Heading>
                <Button
                    size="medium"
                    variation="primary"
                    onClick={() => navigate('/upload')}
                >
                    <HiCloudArrowUp />
                    <span style={{ marginLeft: '0.6rem' }}>上传资源</span>
                </Button>
            </Row>

            <StyledResources>
                <Description>
                    在这里查找和浏览各类教学资源。您可以通过搜索找到所需的备课资源。
                </Description>

                <SearchForm onSubmit={handleSearchSubmit}>
                    <SearchContainer>
                        <SearchIcon>
                            <HiMagnifyingGlass />
                        </SearchIcon>
                        <SearchInput
                            type="search"
                            placeholder="搜索资源..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </SearchContainer>
                    <SearchButton type="submit" variation="primary">
                        搜索
                    </SearchButton>
                </SearchForm>

                {loading ? (
                    <Spinner />
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <>
                        <ResourceList resources={resources} />
                        <Pagination count={pagination.total} />
                    </>
                )}
            </StyledResources>
        </>
    )
}

export default Resources
