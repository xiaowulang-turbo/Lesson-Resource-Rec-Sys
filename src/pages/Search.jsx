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

const SearchPageLayout = styled.div`
    padding: 3.2rem 4.8rem;
`

function Search() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''

    // --- 添加筛选状态 (后续使用) ---
    // const filter = searchParams.get('type') || 'all'; // 示例：从 URL 获取筛选条件

    // --- 使用 React Query 获取搜索结果 ---
    const {
        isLoading,
        data: resources,
        error,
    } = useQuery({
        // 查询键：当 query 或筛选条件变化时，重新查询
        queryKey: ['search', query /*, filter*/],
        // 查询函数：调用 API
        queryFn: () => searchResources(query /*, { type: filter } */),
        // 只有当 query 不为空时才执行查询
        enabled: !!query,
    })

    return (
        <SearchPageLayout>
            <Row
                type="horizontal"
                style={{
                    marginBottom: '2.4rem',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Heading as="h1">
                    {query ? `搜索结果: "${query}"` : '请输入关键词搜索'}
                </Heading>
                {/* --- 筛选组件占位符 --- */}
                {/* <div>筛选功能待添加</div> */}
                {/* <Filter 
           filterField='type' 
           options={[
             { value: 'all', label: '全部' }, 
             { value: 'resource', label: '资源' }, 
             // { value: 'course', label: '课程' } // 课程搜索暂未实现
           ]}
         /> */}
            </Row>

            {/* --- 根据状态显示内容 --- */}
            {isLoading && <Spinner />}
            {error && (
                <Empty resource={`搜索 "${query}" 时出错: ${error.message}`} />
            )}
            {!isLoading &&
                !error &&
                query &&
                resources &&
                resources.length > 0 && <ResourceList resources={resources} />}
            {!isLoading &&
                !error &&
                query &&
                resources &&
                resources.length === 0 && (
                    <Empty resource={`没有找到与 "${query}" 相关的资源`} />
                )}
            {!isLoading && !error && !query && (
                <Empty resource="请输入关键词开始搜索资源" />
            )}
        </SearchPageLayout>
    )
}

export default Search
