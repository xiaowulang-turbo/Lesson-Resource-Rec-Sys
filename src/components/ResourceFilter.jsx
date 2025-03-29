import { useState } from 'react'
import styled from 'styled-components'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Row from '../ui/Row'

const FilterContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1.6rem;
    margin-bottom: 1.6rem;
`

const SearchContainer = styled.div`
    flex: 1;
    min-width: 300px;
`

const FilterGroup = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;
`

const FilterItem = styled.div`
    min-width: 180px;
`

function ResourceFilter({ onFilterChange }) {
    const [searchTerm, setSearchTerm] = useState('')

    // 资源类型选项
    const typeOptions = [
        { value: 'all', label: '所有类型' },
        { value: '308', label: '电子教材' },
        { value: '309', label: '视频课程' },
        { value: '310', label: '实践项目' },
        { value: '311', label: '练习题库' },
        { value: '312', label: '参考资料' },
    ]

    // 学科选项
    const subjectOptions = [
        { value: 'all', label: '所有学科' },
        { value: '计算机科学', label: '计算机科学' },
        { value: '数据科学', label: '数据科学' },
        { value: '航空航天', label: '航空航天' },
        { value: '机械工程', label: '机械工程' },
        { value: '电子工程', label: '电子工程' },
        { value: '数学', label: '数学' },
        { value: '物理', label: '物理' },
        { value: '化学', label: '化学' },
        { value: '生物', label: '生物' },
    ]

    // 难度选项
    const difficultyOptions = [
        { value: 'all', label: '所有难度' },
        { value: '1', label: '入门级' },
        { value: '2', label: '初级' },
        { value: '3', label: '中级' },
        { value: '4', label: '高级' },
        { value: '5', label: '专家级' },
    ]

    // 排序选项
    const sortOptions = [
        { value: 'newest', label: '最新发布' },
        { value: 'rating', label: '评分最高' },
        { value: 'popular', label: '最受欢迎' },
        { value: 'price-low', label: '价格从低到高' },
        { value: 'price-high', label: '价格从高到低' },
    ]

    // 处理搜索输入变化
    const handleSearchChange = (e) => {
        const value = e.target.value
        setSearchTerm(value)
        onFilterChange({ type: 'search', value })
    }

    // 处理筛选器变化
    const handleFilterChange = (type) => (e) => {
        const value = e.target.value
        onFilterChange({ type, value })
    }

    return (
        <>
            <FilterContainer>
                <SearchContainer>
                    <Input
                        type="text"
                        placeholder="搜索资源标题、描述或标签..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </SearchContainer>
            </FilterContainer>

            <Row type="horizontal">
                <FilterGroup>
                    <FilterItem>
                        <Select
                            options={typeOptions}
                            onChange={handleFilterChange('type')}
                            defaultValue="all"
                        />
                    </FilterItem>

                    <FilterItem>
                        <Select
                            options={subjectOptions}
                            onChange={handleFilterChange('subject')}
                            defaultValue="all"
                        />
                    </FilterItem>

                    <FilterItem>
                        <Select
                            options={difficultyOptions}
                            onChange={handleFilterChange('difficulty')}
                            defaultValue="all"
                        />
                    </FilterItem>

                    <FilterItem>
                        <Select
                            options={sortOptions}
                            onChange={handleFilterChange('sort')}
                            defaultValue="newest"
                        />
                    </FilterItem>
                </FilterGroup>
            </Row>
        </>
    )
}

export default ResourceFilter
