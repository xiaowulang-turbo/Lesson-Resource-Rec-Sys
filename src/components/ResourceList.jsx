import styled from 'styled-components'
import Empty from '../ui/Empty'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { extractAndConvertMocSearchResults } from '../utils/mocDataAdapter'

// 使用本地默认资源图片替代在线服务
const PLACEHOLDER_IMAGE = '../public/default-resource.jpg'

const ResourceGrid = styled.div`
    display: grid;
    grid-template-columns: ${({ layout }) =>
        layout === 'grid' ? 'repeat(2, 1fr)' : '1fr'};
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
    display: flex;
    align-items: stretch;

    ${ResourceCardLink}:hover & {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
`

const ResourceImage = styled.div`
    overflow: hidden;
    background-color: var(--color-grey-100); // Background for placeholder
    flex: 0 0 240px;
    width: 240px;
    height: auto;

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
    flex: 1;
    overflow: hidden;
    padding-left: 2.4rem;
`

const ResourceTitle = styled.h3`
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 0.8rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 3.2em; // Approx 2 lines
    line-height: 1.6em;
`

const ResourcePublisher = styled.p`
    font-size: 1.4rem;
    color: var(--color-grey-500);
    margin-bottom: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const ResourceInfo = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap; // Allow wrapping if needed
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

// Updated Label component styling logic based on difficulty strings
const Label = styled.span`
    font-size: 1.2rem;
    font-weight: 600;
    padding: 0.4rem 0.8rem;
    border-radius: var(--border-radius-sm);
    text-transform: capitalize; // Capitalize difficulty

    ${(props) =>
        props.type === 'difficulty' &&
        (String(props.value)?.toLowerCase() === 'beginner' ||
            String(props.value)?.toLowerCase() === '入门' ||
            String(props.value)?.toLowerCase() === '初级') &&
        `
      background-color: var(--color-green-100);
      color: var(--color-green-700);
    `}

    ${(props) =>
        props.type === 'difficulty' &&
        (String(props.value)?.toLowerCase() === 'intermediate' ||
            String(props.value)?.toLowerCase() === '中级') &&
        `
      background-color: var(--color-blue-100);
      color: var(--color-blue-700);
    `}

    ${(props) =>
        props.type === 'difficulty' &&
        (String(props.value)?.toLowerCase() === 'advanced' ||
            String(props.value)?.toLowerCase() === '高级') &&
        `
      background-color: var(--color-orange-100);
      color: var(--color-orange-700);
    `}

    ${(props) =>
        props.type === 'difficulty' &&
        (String(props.value)?.toLowerCase() === 'expert' ||
            String(props.value)?.toLowerCase() === '专家' ||
            String(props.value)?.toLowerCase() === 'mixed') && // Treat Mixed as expert for now
        `
      background-color: var(--color-red-100);
      color: var(--color-red-700);
    `}

    // Add other types if needed, like price or students enrolled
    ${(props) =>
        props.type === 'students' &&
        `
        background-color: var(--color-grey-100);
        color: var(--color-grey-700);
      `}
    
    // 为format类型添加样式
    ${(props) =>
        props.type === 'format' &&
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
    height: 4.2em; // Approx 3 lines
    line-height: 1.4em;
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

function ResourceList({ resources: initialResources }) {
    const [layout, setLayout] = useState('grid') // Changed back to 'grid' as default
    const [resources, setResources] = useState(initialResources || [])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    // EDUWEBDEVICE=87cd2566a4df449f80f9a4b14f41f499'                     'Content-Type':
    // 'application/x-www-form-urlencoded;charset=UTF-8',
    useEffect(() => {
        // 如果已有初始资源，则不需要获取额外数据
        if (initialResources && initialResources.length > 0) return

        const fetchMoocResources = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(
                    '/api/course/search?csrfKey=fba6bd9e19744ab0b9092da379ef375d', // 确保带上csrfKey参数
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type':
                                'application/x-www-form-urlencoded;charset=UTF-8',
                            Origin: 'https://www.icourse163.org', // 设置来源
                            Referer: 'https://www.icourse163.org', // 设置引用页
                        },
                        body: 'mocCourseQueryVo={"keyword":"人工智能","pageIndex":1,"highlight":true,"orderBy":0,"stats":30,"pageSize":20,"prodectType":5}',
                    }
                )

                const data = await response.json()
                console.log('原始MOOC数据:', data)

                // 使用适配器转换数据
                const convertedResources =
                    extractAndConvertMocSearchResults(data)
                console.log('转换后的资源数据:', convertedResources)

                // 更新资源列表
                if (convertedResources && convertedResources.length > 0) {
                    setResources((prevResources) => {
                        // 合并现有资源和新资源，避免重复
                        const existingIds = new Set(
                            prevResources.map(
                                (r) => r.metadata?.mocSourceId || r.id
                            )
                        )

                        const newResources = convertedResources.filter(
                            (r) =>
                                r.metadata?.mocSourceId &&
                                !existingIds.has(r.metadata.mocSourceId)
                        )

                        return [...prevResources, ...newResources]
                    })
                }
            } catch (error) {
                console.error('获取MOOC资源失败:', error)
                setError('获取MOOC资源时发生错误')
            } finally {
                setIsLoading(false)
            }
        }

        fetchMoocResources()
    }, [initialResources])

    const toggleLayout = () => {
        setLayout((prev) => (prev === 'grid' ? 'list' : 'grid'))
    }

    if (isLoading) {
        return <div>正在加载资源...</div>
    }

    if (error) {
        return <div>错误: {error}</div>
    }

    if (!resources || !resources.length) {
        console.log('[ResourceList] No resources to display.')
        return <Empty resourceName="推荐内容" />
    }

    // Helper to safely parse rating
    const parseRating = (ratingStr) => {
        const rating = parseFloat(ratingStr)
        return isNaN(rating) ? 0 : rating
    }

    // Difficulty mapping remains useful for display text, but label uses string directly
    const getDifficultyText = (levelString) => {
        // 处理数值型难度等级
        if (typeof levelString === 'number') {
            const difficultyMap = {
                1: '入门',
                2: '初级',
                3: '中级',
                4: '高级',
                5: '专家',
            }
            return difficultyMap[levelString] || '未知'
        }

        // 处理字符串型难度等级
        if (levelString && typeof levelString === 'string') {
            return levelString.charAt(0).toUpperCase() + levelString.slice(1)
        }

        // Fallback for null, undefined, '', false, etc.
        return '未知'
    }

    return (
        <>
            <ResourceGrid layout={layout}>
                {resources.map((resource, index) => {
                    const resourceId = resource.id
                    if (!resourceId) {
                        console.error(
                            'Resource missing a unique identifier (id):',
                            resource
                        )
                        return (
                            <div key={`missing-id-${index}`}>
                                Resource data is incomplete
                            </div>
                        )
                    }

                    // 检查是否是MOOC资源
                    const isMoocResource =
                        resource.metadata?.mocSourceType === 'icourse163'

                    // 确保必要的字段都有值
                    const resourceTitle = resource.title || '未知课程'
                    const resourceOrg =
                        resource.organization ||
                        resource.publisher ||
                        (isMoocResource ? '中国大学MOOC' : '未知机构')
                    const resourceDesc = resource.description || '无描述'
                    const resourceCover = resource.cover || PLACEHOLDER_IMAGE

                    if (isMoocResource) {
                        console.log(
                            `渲染MOOC资源: ${resourceTitle} (ID: ${resourceId}), cover: ${resourceCover.slice(
                                0,
                                50
                            )}, org: ${resourceOrg}`
                        )
                    }

                    const displayRating = parseRating(resource.averageRating)
                    const tagsToDisplay = resource.tags || []

                    return (
                        <ResourceCardLink
                            key={resourceId}
                            to={
                                isMoocResource
                                    ? resource.url
                                    : `/resources/${resourceId}`
                            }
                            target={isMoocResource ? '_blank' : undefined}
                            rel={
                                isMoocResource
                                    ? 'noopener noreferrer'
                                    : undefined
                            }
                        >
                            <ResourceCard>
                                <ResourceImage>
                                    <img
                                        src={resourceCover}
                                        alt={resourceTitle || '课程封面'}
                                        onError={(e) => {
                                            console.warn(
                                                `图片加载失败: ${e.target.src}, 使用占位图`
                                            )
                                            e.target.src = PLACEHOLDER_IMAGE
                                        }}
                                    />
                                </ResourceImage>
                                <ResourceContent>
                                    <ResourceTitle>
                                        {resourceTitle}
                                        {isMoocResource && ' 🌐'}
                                    </ResourceTitle>
                                    <ResourcePublisher>
                                        {resourceOrg}
                                    </ResourcePublisher>

                                    <ResourceInfo>
                                        <Rating>
                                            <ResourceRating>
                                                {displayRating.toFixed(1)}
                                            </ResourceRating>
                                        </Rating>

                                        {resource.difficulty && (
                                            <Label
                                                type="difficulty"
                                                value={resource.difficulty}
                                            >
                                                {getDifficultyText(
                                                    resource.difficulty
                                                )}
                                            </Label>
                                        )}
                                        {resource.enrollCount > 0 && (
                                            <Label type="students">
                                                {resource.enrollCount}
                                            </Label>
                                        )}
                                        {isMoocResource &&
                                            resource.format === 'pdf' && (
                                                <Label type="format">
                                                    教材
                                                </Label>
                                            )}
                                    </ResourceInfo>

                                    <Description>{resourceDesc}</Description>

                                    {tagsToDisplay.length > 0 && (
                                        <TagContainer>
                                            {tagsToDisplay
                                                .slice(0, 4)
                                                .map((tag, index) => (
                                                    <Tag
                                                        key={`${resourceId}-tag-${index}`}
                                                    >
                                                        {tag}
                                                    </Tag>
                                                ))}
                                            {tagsToDisplay.length > 4 && (
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

            {/* Keep Layout Toggle if needed */}
            {/* <LayoutToggle onClick={toggleLayout}>
                切换为 {layout === 'grid' ? '列表' : '网格'} 视图
            </LayoutToggle> */}
        </>
    )
}

export default ResourceList
