import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Heading from '../../ui/Heading'
import Row from '../../ui/Row'
import Button from '../../ui/Button'
import Table from '../../ui/Table'
import Modal from '../../ui/Modal'
import Menus from '../../ui/Menus'
import Spinner from '../../ui/Spinner'
import Pagination from '../../ui/Pagination'
import Empty from '../../ui/Empty'
import { PAGE_SIZE } from '../../utils/constants'
import {
    getAllResources,
    getResourceById,
    deleteResource,
} from '../../services/apiResources'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { formatDate } from '../../utils/helpers'
import {
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlinePlus,
    HiOutlineDocument,
    HiXMark,
    HiCheck,
    // HiOutlineRefresh,
} from 'react-icons/hi2'
// import ResourceFilter from '../../components/ResourceFilter'
import ConfirmDelete from '../../components/ConfirmDelete'

const StyledResourceManagement = styled.div`
    padding: 2.4rem;
    background-color: var(--color-grey-0);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-md);
`

const StatsRow = styled.div`
    display: flex;
    gap: 1.6rem;
    margin-bottom: 2.4rem;
`

const StatCard = styled.div`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 1.6rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    h3 {
        font-size: 2.4rem;
        font-weight: 600;
        margin-bottom: 0.4rem;
    }

    p {
        font-size: 1.4rem;
        color: var(--color-grey-500);
    }
`

const FilterSection = styled.div`
    margin-bottom: 2.4rem;
`

const Actions = styled.div`
    display: flex;
    gap: 0.8rem;
`

const ResourceType = styled.span`
    padding: 0.4rem 0.8rem;
    border-radius: var(--border-radius-sm);
    font-size: 1.2rem;
    font-weight: 600;
    text-transform: uppercase;
    background-color: var(--color-brand-100);
    color: var(--color-brand-700);
`

const Difficulty = styled.span`
    padding: 0.4rem 0.8rem;
    border-radius: var(--border-radius-sm);
    font-size: 1.2rem;
    font-weight: 600;

    &.easy {
        background-color: var(--color-green-100);
        color: var(--color-green-700);
    }

    &.medium {
        background-color: var(--color-blue-100);
        color: var(--color-blue-700);
    }

    &.hard {
        background-color: var(--color-orange-100);
        color: var(--color-orange-700);
    }

    &.expert {
        background-color: var(--color-red-100);
        color: var(--color-red-700);
    }
`

const StyledModal = styled.div`
    width: 80rem;
    max-width: 90vw;
`

function ResourceManagement() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [resources, setResources] = useState([])
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: PAGE_SIZE,
        pages: 1,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [searchParams, setSearchParams] = useSearchParams()
    const [filters, setFilters] = useState({
        search: '',
        subject: 'all',
        type: 'all',
        difficulty: 'all',
        sort: 'newest',
    })
    const [stats, setStats] = useState({
        total: 0,
        documents: 0,
        videos: 0,
        exercises: 0,
        others: 0,
    })

    // 删除资源相关状态
    const [deletingResourceId, setDeletingResourceId] = useState(null)

    // 删除资源 mutation
    const { mutate: deleteMutate, isLoading: isDeleting } = useMutation({
        mutationFn: deleteResource,
        onSuccess: () => {
            toast.success('资源已成功删除')

            // 刷新资源列表
            queryClient.invalidateQueries({ queryKey: ['resources'] })
            handleRefreshResources()
        },
        onError: (err) => {
            toast.error(err.message || '删除资源失败')
        },
        onSettled: () => {
            setDeletingResourceId(null)
        },
    })

    // 当前页码
    const currentPage = parseInt(searchParams.get('page') || 1)

    // 获取资源数据
    useEffect(() => {
        const fetchResources = async () => {
            try {
                setIsLoading(true)
                const result = await getAllResources({
                    page: currentPage,
                    limit: PAGE_SIZE,
                    sortBy: filters.sort,
                })

                setResources(result.resources)
                setPagination(result.pagination)
                setStats(result.stats)
            } catch (err) {
                console.error('获取资源列表失败', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchResources()
    }, [currentPage, filters.sort])

    // 资源类型映射
    const resourceTypeMap = {
        308: '电子教材',
        310: '实践项目',
        311: '练习题库',
        312: '参考资料',
    }

    // 难度级别映射
    const difficultyClassMap = {
        1: 'easy',
        2: 'easy',
        3: 'medium',
        4: 'hard',
        5: 'expert',
    }

    const difficultyTextMap = {
        1: '入门级',
        2: '初级',
        3: '中级',
        4: '高级',
        5: '专家级',
    }

    // 打开删除资源Modal
    const handleOpenDeleteModal = (resourceId) => {
        setDeletingResourceId(resourceId)
        console.log(`正在删除资源，ID: ${resourceId}`)
    }

    // 关闭删除资源Modal
    const handleCloseDeleteModal = () => {
        setDeletingResourceId(null)
    }

    // 确认删除资源
    const handleConfirmDelete = () => {
        console.log('确认删除:', deletingResourceId)
        if (deletingResourceId) {
            // 单个资源删除
            console.log(`执行资源删除，ID: ${deletingResourceId}`)
            deleteMutate(deletingResourceId)
        }
    }

    // 刷新资源列表
    const handleRefreshResources = async () => {
        try {
            setIsLoading(true)
            const result = await getAllResources({
                page: currentPage,
                limit: PAGE_SIZE,
                sortBy: filters.sort,
            })

            setResources(result.resources)
            setPagination(result.pagination)
            setStats(result.stats)
        } catch (err) {
            console.error('刷新资源列表失败', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">资源管理</Heading>
                <Button
                    size="medium"
                    variation="primary"
                    onClick={() => navigate('/upload')}
                >
                    <HiOutlinePlus />
                    <span>添加资源</span>
                </Button>
            </Row>

            <Modal>
                <StyledResourceManagement>
                    {/* <StatsRow>
                        <StatCard>
                            <h3>{stats?.length}</h3>
                            <p>总资源数</p>
                        </StatCard>
                        <StatCard>
                            <h3>{stats.documents}</h3>
                            <p>电子教材</p>
                        </StatCard>
                        <StatCard>
                            <h3>{stats.videos}</h3>
                            <p>实践项目</p>
                        </StatCard>
                        <StatCard>
                            <h3>{stats.exercises}</h3>
                            <p>练习题库</p>
                        </StatCard>
                    </StatsRow> */}
                    {/* 
                <FilterSection>
                    <ResourceFilter onFilterChange={handleFilterChange} />
                </FilterSection> */}

                    {isLoading ? (
                        <Spinner />
                    ) : resources.length === 0 ? (
                        <Empty resource="资源" />
                    ) : (
                        <Table columns="2fr 0.8fr 0.8fr 1fr 0.8fr 1fr">
                            <Table.Header>
                                <div>标题</div>
                                <div>类型</div>
                                <div>难度</div>
                                <div>上传者</div>
                                <div>上传日期</div>
                                <div>操作</div>
                            </Table.Header>

                            <Table.Body
                                data={resources}
                                render={(resource) => (
                                    <Table.Row key={resource._id}>
                                        <div>{resource.title}</div>
                                        <div>
                                            <ResourceType>
                                                {resourceTypeMap[
                                                    resource.type
                                                ] || resource.type}
                                            </ResourceType>
                                        </div>
                                        <div>
                                            <Difficulty
                                                className={
                                                    difficultyClassMap[
                                                        resource.difficulty
                                                    ] || 'medium'
                                                }
                                            >
                                                {difficultyTextMap[
                                                    resource.difficulty
                                                ] || resource.difficulty}
                                            </Difficulty>
                                        </div>
                                        <div>
                                            {resource.creator?.name ||
                                                '未知用户'}
                                        </div>
                                        <div>
                                            {formatDate(resource.createdAt)}
                                        </div>
                                        <div>
                                            <Menus>
                                                <Menus.Menu>
                                                    <Menus.Toggle
                                                        id={resource._id}
                                                    />
                                                    <Menus.List
                                                        id={resource._id}
                                                    >
                                                        <Menus.Button
                                                            icon={
                                                                <HiOutlineEye />
                                                            }
                                                            onClick={() =>
                                                                navigate(
                                                                    `/resources/${resource._id}`
                                                                )
                                                            }
                                                        >
                                                            查看
                                                        </Menus.Button>
                                                        <Menus.Button
                                                            icon={
                                                                <HiOutlinePencil />
                                                            }
                                                            onClick={() =>
                                                                navigate(
                                                                    `/resources/edit/${resource._id}`
                                                                )
                                                            }
                                                        >
                                                            编辑
                                                        </Menus.Button>
                                                        <Modal.Open opens="delete-resource">
                                                            <Menus.Button
                                                                icon={
                                                                    <HiOutlineTrash />
                                                                }
                                                                onClick={() =>
                                                                    handleOpenDeleteModal(
                                                                        resource._id
                                                                    )
                                                                }
                                                            >
                                                                删除
                                                            </Menus.Button>
                                                        </Modal.Open>
                                                    </Menus.List>
                                                </Menus.Menu>
                                            </Menus>
                                        </div>
                                    </Table.Row>
                                )}
                            />

                            <Table.Footer>
                                <Pagination count={pagination.total} />
                            </Table.Footer>
                        </Table>
                    )}
                </StyledResourceManagement>

                {/* 删除资源Modal */}
                <Modal.Window name="delete-resource">
                    <ConfirmDelete
                        resourceName="资源"
                        disabled={isDeleting}
                        onConfirm={handleConfirmDelete}
                        onCloseModal={handleCloseDeleteModal}
                    />
                </Modal.Window>
            </Modal>
        </>
    )
}

export default ResourceManagement
