import styled from 'styled-components'
import Empty from '../ui/Empty'
import { useState } from 'react'
import { Link } from 'react-router-dom'

// 更换为可用的占位图片URL
const PLACEHOLDER_IMAGE = 'https://picsum.photos/400/180?blur=2'

const ResourceGrid = styled.div`
    display: grid;
    grid-template-columns: ${({ layout }) =>
        layout === 'grid' ? 'repeat(auto-fill, minmax(400px, 1fr))' : '1fr'};
    gap: 2.4rem;
    margin-bottom: 2.4rem;
`

const ResourceCardLink = styled(Link)`
    text-decoration: none;
    color: inherit;
    display: block;
`

const ResourceCard = styled.div`
    background-color: var(--color-grey-0);
    border-radius: var(--border-radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s;
    display: ${({ layout }) => (layout === 'list' ? 'flex' : 'block')};
    align-items: ${({ layout }) => (layout === 'list' ? 'center' : 'stretch')};

    ${ResourceCardLink}:hover & {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
`

const ResourceImage = styled.div`
    height: 180px;
    overflow: hidden;
    ${({ layout }) => {
        if (layout === 'list') {
            return `
                flex: 0 0 320px;
                width: 320px;
            `
        }
        return ''
    }}

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
    }

    ${ResourceCardLink}:hover & img {
        transform: scale(1.05);
    }
`

const ResourceContent = styled.div`
    padding: 1.6rem 2rem;
    ${({ layout }) =>
        layout === 'list' &&
        `
        flex: 1;
        overflow: hidden;
    `}
`

const ResourceTitle = styled.h3`
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 0.8rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 3.2em;
`

const ResourcePublisher = styled.p`
    font-size: 1.4rem;
    color: var(--color-grey-500);
    margin-bottom: 0.8rem;
`

const ResourceInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-bottom: 1.2rem;
`

const Rating = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`

const ResourceRating = styled.span`
    font-size: 1.4rem;
    font-weight: 600;
`

const Label = styled.span`
    font-size: 1.2rem;
    font-weight: 600;
    padding: 0.4rem 0.8rem;
    border-radius: var(--border-radius-sm);
    text-transform: uppercase;

    ${(props) =>
        props.type === 'difficulty' &&
        props.value <= 2 &&
        `
      background-color: var(--color-green-100);
      color: var(--color-green-700);
    `}

    ${(props) =>
        props.type === 'difficulty' &&
        props.value > 2 &&
        props.value <= 4 &&
        `
      background-color: var(--color-blue-100);
      color: var(--color-blue-700);
    `}
    
    ${(props) =>
        props.type === 'difficulty' &&
        props.value > 4 &&
        `
      background-color: var(--color-yellow-100);
      color: var(--color-yellow-700);
    `}
  
    ${(props) =>
        props.type === 'students' &&
        `
      background-color: var(--color-grey-100);
      color: var(--color-grey-700);
    `}
    
    ${(props) =>
        props.type === 'price' &&
        `
      background-color: var(--color-indigo-100);
      color: var(--color-indigo-700);
    `}
`

const Description = styled.p`
    font-size: 1.4rem;
    margin-bottom: 1.6rem;
    color: var(--color-grey-700);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 4.2em;
`

const TagContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
`

const Tag = styled.span`
    font-size: 1.2rem;
    padding: 0.2rem 0.8rem;
    border-radius: var(--border-radius-sm);
    background-color: var(--color-grey-100);
    color: var(--color-grey-600);
`

const LayoutToggle = styled.button`
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-md);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    z-index: 1000;
    transition: all 0.3s;

    &:hover {
        background-color: var(--color-grey-50);
    }
`

function ResourceList({ resources }) {
    const [layout, setLayout] = useState('grid') // 'grid' 或 'list'

    const toggleLayout = () => {
        setLayout((prev) => (prev === 'grid' ? 'list' : 'grid'))
    }

    if (!resources.length) return <Empty resource={'resources'} />

    // 资源类型映射
    const getResourceType = (type) => {
        const typeMap = {
            308: '电子教材',
            310: '实践项目',
            311: '练习题库',
            312: '参考资料',
        }
        return typeMap[type] || '其他资源'
    }

    // 难度等级映射
    const getDifficultyLabel = (level) => {
        const difficultyMap = {
            1: '入门',
            2: '初级',
            3: '中级',
            4: '高级',
            5: '专家',
        }
        return difficultyMap[level] || `${level}级`
    }

    return (
        <>
            <ResourceGrid layout={layout}>
                {resources.map((resource) => {
                    const resourceId =
                        resource._id || resource.id || resource.metadata?.id
                    if (!resourceId) {
                        console.warn('Resource missing ID:', resource)
                        return null
                    }
                    return (
                        <ResourceCardLink
                            key={resourceId}
                            to={`/resources/${resourceId}`}
                        >
                            <ResourceCard layout={layout}>
                                <ResourceImage layout={layout}>
                                    <img
                                        src={
                                            resource.coverImage ||
                                            resource.url ||
                                            PLACEHOLDER_IMAGE
                                        }
                                        alt={resource.title}
                                        onError={(e) => {
                                            e.target.src = PLACEHOLDER_IMAGE
                                        }}
                                    />
                                </ResourceImage>
                                <ResourceContent layout={layout}>
                                    <ResourceTitle>
                                        {resource.title}
                                    </ResourceTitle>
                                    <ResourcePublisher>
                                        {resource.createdBy?.name ||
                                            resource.publisher ||
                                            '未知发布者'}
                                    </ResourcePublisher>

                                    <ResourceInfo>
                                        <Rating>
                                            <ResourceRating>
                                                {(
                                                    resource.averageRating || 0
                                                ).toFixed(1)}
                                            </ResourceRating>
                                            <span>
                                                ({resource.ratingsCount || 0}{' '}
                                                评分)
                                            </span>
                                        </Rating>
                                    </ResourceInfo>

                                    <ResourceInfo>
                                        <Label
                                            type="difficulty"
                                            value={resource.difficulty}
                                        >
                                            {getDifficultyLabel(
                                                resource.difficulty
                                            )}
                                        </Label>
                                        <Label type="price">
                                            {resource.price > 0
                                                ? `¥${resource.price.toFixed(
                                                      2
                                                  )}`
                                                : '免费'}
                                        </Label>
                                    </ResourceInfo>

                                    <Description>
                                        {resource.description}
                                    </Description>

                                    {resource.tags &&
                                        resource.tags.length > 0 && (
                                            <TagContainer>
                                                {resource.tags
                                                    .slice(0, 5)
                                                    .map((tag, index) => (
                                                        <Tag key={index}>
                                                            {tag}
                                                        </Tag>
                                                    ))}
                                                {resource.tags.length > 5 && (
                                                    <Tag>...</Tag>
                                                )}
                                            </TagContainer>
                                        )}
                                </ResourceContent>
                            </ResourceCard>
                        </ResourceCardLink>
                    )
                })}
            </ResourceGrid>

            <LayoutToggle onClick={toggleLayout}>
                切换为 {layout === 'grid' ? '列表' : '网格'} 视图
            </LayoutToggle>
        </>
    )
}

export default ResourceList
