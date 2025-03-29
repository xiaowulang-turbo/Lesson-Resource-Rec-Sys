import styled from 'styled-components'
import Empty from '../ui/Empty'

const ResourceGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2.4rem;
    margin-bottom: 2.4rem;
`

const ResourceCard = styled.div`
    background-color: var(--color-grey-0);
    border-radius: var(--border-radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
`

const ResourceImage = styled.div`
    height: 180px;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
    }

    ${ResourceCard}:hover & img {
        transform: scale(1.05);
    }
`

const ResourceContent = styled.div`
    padding: 1.6rem 2rem;
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

function ResourceList({ resources }) {
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
        <ResourceGrid>
            {resources.map((resource) => (
                <ResourceCard
                    key={resource._id || resource.id || resource.metadata?.id}
                >
                    <ResourceImage>
                        <img src={resource.url} alt={resource.title} />
                    </ResourceImage>
                    <ResourceContent>
                        <ResourceTitle>{resource.title}</ResourceTitle>
                        <ResourcePublisher>
                            {resource.publisher || '未知出版社'} ·{' '}
                            {resource.authors || '未知作者'}
                        </ResourcePublisher>

                        <ResourceInfo>
                            <Rating>
                                <ResourceRating>
                                    {resource.averageRating?.toFixed(1) ||
                                        '暂无'}
                                </ResourceRating>
                                <span>★</span>
                            </Rating>

                            <Label
                                type="difficulty"
                                value={resource.difficulty}
                            >
                                {getDifficultyLabel(resource.difficulty)}
                            </Label>

                            <Label type="students">
                                {resource.enrollCount || 0} 人学习
                            </Label>

                            {resource.price > 0 && (
                                <Label type="price">¥{resource.price}</Label>
                            )}
                        </ResourceInfo>

                        <Description>{resource.description}</Description>

                        <TagContainer>
                            <Tag>{getResourceType(resource.type)}</Tag>
                            {resource.tags &&
                                resource.tags.map((tag) => (
                                    <Tag
                                        key={`${
                                            resource._id ||
                                            resource.id ||
                                            resource.metadata?.id
                                        }-${tag}`}
                                    >
                                        {tag}
                                    </Tag>
                                ))}
                        </TagContainer>
                    </ResourceContent>
                </ResourceCard>
            ))}
        </ResourceGrid>
    )
}

export default ResourceList
