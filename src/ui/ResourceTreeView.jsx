import { useState } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import {
    HiChevronRight,
    HiChevronDown,
    HiOutlineBookOpen,
    HiOutlineDocumentText,
    HiOutlineVideoCamera,
    HiOutlinePhotograph,
    HiOutlineLink,
    HiOutlineArchive,
    HiOutlineDocument,
    HiOutlineEye,
    HiOutlineHeart,
    HiOutlineDownload,
} from 'react-icons/hi'
import { Link } from 'react-router-dom'

const TreeContainer = styled.div`
    font-family: inherit;
    background-color: var(--color-grey-0);
    border-radius: var(--border-radius-md);
    overflow: hidden;
`

const TreeControls = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--color-grey-200);
    background-color: var(--color-grey-50);
`

const ControlGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`

const SortSelect = styled.select`
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    background-color: var(--color-grey-0);
    font-size: 1.2rem;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: var(--color-brand-600);
    }
`

const ExpandAllButton = styled.button`
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    background-color: var(--color-grey-0);
    color: var(--color-grey-700);
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: var(--color-grey-100);
        border-color: var(--color-grey-400);
    }
`

const ResourceCount = styled.span`
    font-size: 1.2rem;
    color: var(--color-grey-500);
    font-weight: 500;
`

const TreeContent = styled.div`
    padding: 1rem;
`

const TreeNode = styled.div`
    margin-bottom: 0.5rem;
`

const NodeHeader = styled.div`
    display: flex;
    align-items: center;
    padding: 1rem;
    cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
    background-color: ${(props) =>
        props.level === 0
            ? 'var(--color-grey-50)'
            : props.level === 1
            ? 'var(--color-grey-25)'
            : 'var(--color-grey-0)'};
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-sm);
    margin-bottom: ${(props) => (props.hasChildren ? '0.5rem' : '0')};
    margin-left: ${(props) => props.level * 2}rem;
    transition: all 0.2s;

    &:hover {
        background-color: ${(props) =>
            props.clickable ? 'var(--color-grey-100)' : 'inherit'};
    }
`

const ExpandIcon = styled.div`
    margin-right: 0.8rem;
    color: var(--color-grey-500);

    svg {
        width: 1.6rem;
        height: 1.6rem;
    }
`

const NodeIcon = styled.div`
    margin-right: 1rem;
    color: ${(props) =>
        props.type === 'course'
            ? 'var(--color-blue-600)'
            : props.type === 'chapter'
            ? 'var(--color-green-600)'
            : 'var(--color-grey-600)'};

    svg {
        width: 1.8rem;
        height: 1.8rem;
    }
`

const NodeContent = styled.div`
    flex: 1;
    min-width: 0;
`

const NodeTitle = styled.h4`
    font-size: ${(props) =>
        props.level === 0 ? '1.6rem' : props.level === 1 ? '1.4rem' : '1.3rem'};
    font-weight: ${(props) =>
        props.level === 0 ? '600' : props.level === 1 ? '500' : '400'};
    color: var(--color-grey-800);
    margin: 0 0 0.4rem 0;
    word-break: break-word;
`

const NodeMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.2rem;
    color: var(--color-grey-500);
    flex-wrap: wrap;
`

const MetaItem = styled.span`
    display: flex;
    align-items: center;
    gap: 0.4rem;

    svg {
        width: 1.2rem;
        height: 1.2rem;
    }
`

const ResourceLink = styled(Link)`
    text-decoration: none;
    color: inherit;
    display: block;

    &:hover ${NodeTitle} {
        color: var(--color-brand-600);
    }
`

const NodeDescription = styled.p`
    font-size: 1.2rem;
    color: var(--color-grey-600);
    margin: 0.4rem 0 0 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`

const ChildrenContainer = styled.div`
    margin-left: 1rem;
    border-left: 2px solid var(--color-grey-200);
    padding-left: 1rem;
`

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem 2rem;
    color: var(--color-grey-500);
    font-size: 1.4rem;
`

// 获取资源格式对应的图标
const getResourceIcon = (format) => {
    const iconMap = {
        video: HiOutlineVideoCamera,
        pdf: HiOutlineDocument,
        docx: HiOutlineDocumentText,
        pptx: HiOutlineDocumentText,
        image: HiOutlinePhotograph,
        zip: HiOutlineArchive,
        url: HiOutlineLink,
        file: HiOutlineDocument,
    }
    return iconMap[format] || HiOutlineDocument
}

// 构建树形结构
const buildTreeStructure = (resources) => {
    const courseMap = new Map()
    const standaloneResources = []

    // 按课程分组
    resources.forEach((resource) => {
        if (
            resource.courseStructure?.parentCourse &&
            resource.contentType === 'resource'
        ) {
            // 处理parentCourse，可能是ObjectId字符串或已填充的对象
            const parentCourseInfo = resource.courseStructure.parentCourse
            const courseId =
                typeof parentCourseInfo === 'string'
                    ? parentCourseInfo
                    : parentCourseInfo._id || parentCourseInfo.id

            if (!courseMap.has(courseId)) {
                courseMap.set(courseId, {
                    type: 'course',
                    id: courseId,
                    title:
                        typeof parentCourseInfo === 'object' &&
                        parentCourseInfo.title
                            ? parentCourseInfo.title
                            : '未知课程', // 如果有课程信息则使用，否则使用默认标题
                    chapters: new Map(),
                    resources: [],
                })
            }

            const course = courseMap.get(courseId)

            // 如果parentCourse已经填充且有标题，更新课程标题
            if (
                typeof parentCourseInfo === 'object' &&
                parentCourseInfo.title &&
                course.title === '未知课程'
            ) {
                course.title = parentCourseInfo.title
                course.description = parentCourseInfo.description
                course.courseData = parentCourseInfo
            }

            const chapterNumber = resource.courseStructure.chapter?.number

            if (chapterNumber) {
                if (!course.chapters.has(chapterNumber)) {
                    course.chapters.set(chapterNumber, {
                        type: 'chapter',
                        number: chapterNumber,
                        title:
                            resource.courseStructure.chapter.title ||
                            `第${chapterNumber}章`,
                        subtitle: resource.courseStructure.chapter.subtitle,
                        level: resource.courseStructure.chapter.level || 1,
                        resources: [],
                    })
                }
                course.chapters.get(chapterNumber).resources.push(resource)
            } else {
                course.resources.push(resource)
            }
        } else if (resource.contentType === 'course') {
            // 如果是课程本身
            if (courseMap.has(resource._id)) {
                const course = courseMap.get(resource._id)
                course.title = resource.title
                course.description = resource.description
                course.courseData = resource
            } else {
                courseMap.set(resource._id, {
                    type: 'course',
                    id: resource._id,
                    title: resource.title,
                    description: resource.description,
                    courseData: resource,
                    chapters: new Map(),
                    resources: [],
                })
            }
        } else {
            // 独立资源（不属于任何课程）
            standaloneResources.push(resource)
        }
    })

    return { courseMap, standaloneResources }
}

// 单个资源节点组件
const ResourceNode = ({ resource, level = 2 }) => {
    const IconComponent = getResourceIcon(resource.format)

    const content = (
        <NodeHeader level={level} clickable={true}>
            <NodeIcon type="resource">
                <IconComponent />
            </NodeIcon>
            <NodeContent>
                <NodeTitle level={level}>{resource.title}</NodeTitle>
                <NodeMeta>
                    <MetaItem>
                        <span>{resource.format?.toUpperCase() || 'FILE'}</span>
                    </MetaItem>
                    <MetaItem>
                        <span>{resource.subject}</span>
                    </MetaItem>
                    <MetaItem>
                        <span>{resource.grade}</span>
                    </MetaItem>
                    {resource.stats?.views > 0 && (
                        <MetaItem>
                            <HiOutlineEye />
                            <span>{resource.stats.views}</span>
                        </MetaItem>
                    )}
                    {resource.stats?.favorites > 0 && (
                        <MetaItem>
                            <HiOutlineHeart />
                            <span>{resource.stats.favorites}</span>
                        </MetaItem>
                    )}
                    {resource.stats?.downloads > 0 && (
                        <MetaItem>
                            <HiOutlineDownload />
                            <span>{resource.stats.downloads}</span>
                        </MetaItem>
                    )}
                </NodeMeta>
                {resource.description && (
                    <NodeDescription>{resource.description}</NodeDescription>
                )}
            </NodeContent>
        </NodeHeader>
    )

    return (
        <TreeNode>
            <ResourceLink to={`/resources/${resource._id}`}>
                {content}
            </ResourceLink>
        </TreeNode>
    )
}

// 章节节点组件
const ChapterNode = ({ chapter, isExpanded, onToggle, level = 1 }) => {
    const hasResources = chapter.resources.length > 0

    return (
        <TreeNode>
            <NodeHeader
                level={level}
                clickable={hasResources}
                hasChildren={hasResources}
                onClick={hasResources ? onToggle : undefined}
            >
                <ExpandIcon>
                    {hasResources &&
                        (isExpanded ? <HiChevronDown /> : <HiChevronRight />)}
                </ExpandIcon>
                <NodeIcon type="chapter">
                    <HiOutlineDocumentText />
                </NodeIcon>
                <NodeContent>
                    <NodeTitle level={level}>
                        {chapter.title}
                        {chapter.subtitle && ` - ${chapter.subtitle}`}
                    </NodeTitle>
                    <NodeMeta>
                        <MetaItem>
                            <span>{chapter.resources.length} 个资源</span>
                        </MetaItem>
                        <MetaItem>
                            <span>第{chapter.level}级章节</span>
                        </MetaItem>
                    </NodeMeta>
                </NodeContent>
            </NodeHeader>

            {isExpanded && hasResources && (
                <ChildrenContainer>
                    {chapter.resources
                        .sort(
                            (a, b) =>
                                (a.courseStructure?.order?.chapterOrder || 0) -
                                (b.courseStructure?.order?.chapterOrder || 0)
                        )
                        .map((resource) => (
                            <ResourceNode
                                key={resource._id}
                                resource={resource}
                                level={level + 1}
                            />
                        ))}
                </ChildrenContainer>
            )}
        </TreeNode>
    )
}

ChapterNode.propTypes = {
    chapter: PropTypes.shape({
        number: PropTypes.number,
        title: PropTypes.string.isRequired,
        subtitle: PropTypes.string,
        level: PropTypes.number,
        resources: PropTypes.array.isRequired,
    }).isRequired,
    isExpanded: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    level: PropTypes.number,
}

// 课程节点组件
const CourseNode = ({ course, isExpanded, onToggle }) => {
    const totalResources =
        course.resources.length +
        Array.from(course.chapters.values()).reduce(
            (sum, chapter) => sum + chapter.resources.length,
            0
        )
    const hasContent = totalResources > 0

    return (
        <TreeNode>
            <NodeHeader
                level={0}
                clickable={hasContent}
                hasChildren={hasContent}
                onClick={hasContent ? onToggle : undefined}
            >
                <ExpandIcon>
                    {hasContent &&
                        (isExpanded ? <HiChevronDown /> : <HiChevronRight />)}
                </ExpandIcon>
                <NodeIcon type="course">
                    <HiOutlineBookOpen />
                </NodeIcon>
                <NodeContent>
                    <NodeTitle level={0}>{course.title}</NodeTitle>
                    <NodeMeta>
                        <MetaItem>
                            <span>{totalResources} 个资源</span>
                        </MetaItem>
                        <MetaItem>
                            <span>{course.chapters.size} 个章节</span>
                        </MetaItem>
                        {course.courseData?.subject && (
                            <MetaItem>
                                <span>{course.courseData.subject}</span>
                            </MetaItem>
                        )}
                        {course.courseData?.grade && (
                            <MetaItem>
                                <span>{course.courseData.grade}</span>
                            </MetaItem>
                        )}
                        {/* 添加一个单独的链接按钮用于查看课程详情 */}
                        {course.courseData && (
                            <MetaItem>
                                <ResourceLink
                                    to={`/resources/${course.courseData._id}`}
                                >
                                    <span
                                        style={{
                                            color: 'var(--color-brand-600)',
                                            textDecoration: 'underline',
                                        }}
                                    >
                                        查看详情
                                    </span>
                                </ResourceLink>
                            </MetaItem>
                        )}
                    </NodeMeta>
                    {course.description && (
                        <NodeDescription>{course.description}</NodeDescription>
                    )}
                </NodeContent>
            </NodeHeader>

            {isExpanded && hasContent && (
                <ChildrenContainer>
                    {/* 直接在课程下的资源 */}
                    {course.resources
                        .sort(
                            (a, b) =>
                                (a.courseStructure?.order?.courseOrder || 0) -
                                (b.courseStructure?.order?.courseOrder || 0)
                        )
                        .map((resource) => (
                            <ResourceNode
                                key={resource._id}
                                resource={resource}
                                level={1}
                            />
                        ))}

                    {/* 章节 */}
                    {Array.from(course.chapters.entries())
                        .sort(([a], [b]) => a - b)
                        .map(([chapterNumber, chapter]) => (
                            <ChapterNode
                                key={chapterNumber}
                                chapter={chapter}
                                isExpanded={isExpanded}
                                onToggle={() => {}} // 章节暂不支持单独折叠
                                level={1}
                            />
                        ))}
                </ChildrenContainer>
            )}
        </TreeNode>
    )
}

CourseNode.propTypes = {
    course: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        chapters: PropTypes.object.isRequired,
        resources: PropTypes.array.isRequired,
        courseData: PropTypes.object,
    }).isRequired,
    isExpanded: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
}

// 主要的ResourceTreeView组件
const ResourceTreeView = ({ resources = [] }) => {
    const [expandedNodes, setExpandedNodes] = useState(new Set())
    const [sortBy, setSortBy] = useState('newest')

    // 错误处理
    if (!Array.isArray(resources)) {
        console.warn('ResourceTreeView: resources应该是一个数组')
        return (
            <TreeContainer>
                <EmptyState>数据格式错误</EmptyState>
            </TreeContainer>
        )
    }

    if (resources.length === 0) {
        return (
            <TreeContainer>
                <EmptyState>暂无资源</EmptyState>
            </TreeContainer>
        )
    }

    // 排序资源
    const sortedResources = [...resources].sort((a, b) => {
        try {
            switch (sortBy) {
                case 'newest':
                    return (
                        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                    )
                case 'oldest':
                    return (
                        new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
                    )
                case 'title':
                    return (a.title || '').localeCompare(b.title || '', 'zh-CN')
                case 'popularity':
                    return (b.stats?.views || 0) - (a.stats?.views || 0)
                case 'course': {
                    // 按课程结构排序
                    const aOrder = a.courseStructure?.order?.courseOrder || 999
                    const bOrder = b.courseStructure?.order?.courseOrder || 999
                    return aOrder - bOrder
                }
                default:
                    return 0
            }
        } catch (error) {
            console.warn('排序时出错:', error)
            return 0
        }
    })

    let courseMap, standaloneResources
    try {
        const result = buildTreeStructure(sortedResources)
        courseMap = result.courseMap
        standaloneResources = result.standaloneResources
    } catch (error) {
        console.error('构建树形结构时出错:', error)
        return (
            <TreeContainer>
                <EmptyState>处理数据时出错</EmptyState>
            </TreeContainer>
        )
    }

    const toggleNode = (nodeId) => {
        const newExpanded = new Set(expandedNodes)
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId)
        } else {
            newExpanded.add(nodeId)
        }
        setExpandedNodes(newExpanded)
    }

    const expandAll = () => {
        const allNodeIds = new Set()
        courseMap.forEach((course) => {
            allNodeIds.add(course.id)
        })
        setExpandedNodes(allNodeIds)
    }

    const collapseAll = () => {
        setExpandedNodes(new Set())
    }

    const totalCourses = courseMap.size
    const totalStandaloneResources = standaloneResources.length
    const totalResources = resources.filter(
        (r) => r.contentType === 'resource'
    ).length

    return (
        <TreeContainer>
            <TreeControls>
                <ControlGroup>
                    <ResourceCount>
                        {totalResources} 个资源 | {totalCourses} 个课程 |{' '}
                        {totalStandaloneResources} 个独立资源
                    </ResourceCount>
                </ControlGroup>
                <ControlGroup>
                    <SortSelect
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">最新创建</option>
                        <option value="oldest">最早创建</option>
                        <option value="title">标题排序</option>
                        <option value="popularity">热度排序</option>
                        <option value="course">课程顺序</option>
                    </SortSelect>
                    <ExpandAllButton
                        onClick={
                            expandedNodes.size > 0 ? collapseAll : expandAll
                        }
                    >
                        {expandedNodes.size > 0 ? '收起全部' : '展开全部'}
                    </ExpandAllButton>
                </ControlGroup>
            </TreeControls>

            <TreeContent>
                {/* 课程 */}
                {Array.from(courseMap.values()).map((course) => (
                    <CourseNode
                        key={course.id}
                        course={course}
                        isExpanded={expandedNodes.has(course.id)}
                        onToggle={() => toggleNode(course.id)}
                    />
                ))}

                {/* 独立资源 */}
                {standaloneResources.length > 0 && (
                    <div>
                        {standaloneResources.map((resource) => (
                            <ResourceNode
                                key={resource._id}
                                resource={resource}
                                level={0}
                            />
                        ))}
                    </div>
                )}
            </TreeContent>
        </TreeContainer>
    )
}

ResourceTreeView.propTypes = {
    resources: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string,
            format: PropTypes.string,
            subject: PropTypes.string,
            grade: PropTypes.string,
            createdAt: PropTypes.string,
            stats: PropTypes.object,
            courseStructure: PropTypes.object,
            contentType: PropTypes.string,
        })
    ),
}

export default ResourceTreeView
