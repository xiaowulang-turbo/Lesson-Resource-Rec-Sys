import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Tag from './Tag'

const Card = styled(Link)`
    display: flex;
    flex-direction: row;
    border-radius: var(--border-radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s;
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    text-decoration: none;
    color: inherit;

    &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
`

const ImageContainer = styled.div`
    height: 140px;
    width: 120px;
    min-width: 120px;
    overflow: hidden;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 30%;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
    }
`

const Image = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;

    ${Card}:hover & {
        transform: scale(1.05);
    }
`

const NoImage = styled.div`
    width: 100%;
    height: 100%;
    background-color: var(--color-grey-200);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-grey-500);
    font-size: 2rem;
`

const CardBody = styled.div`
    padding: 1.2rem;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: space-between;
`

const Title = styled.h3`
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 0.8rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: var(--color-grey-700);
`

const ResourceInfo = styled.div`
    font-size: 1.2rem;
    color: var(--color-grey-500);
    margin-bottom: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
`

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: auto;
`

// 资源类型图标
const TypeIcon = styled.span`
    font-size: 1.6rem;
`

// 帮助函数：获取资源类型图标
function getTypeIcon(type) {
    const icons = {
        1: '📄', // 文档
        2: '🎬', // 视频
        3: '🎵', // 音频
        4: '🖼️', // 图片
        5: '📦', // 其他
    }
    return icons[type] || '📦'
}

// 帮助函数：获取资源类型文本
function getTypeText(type) {
    const types = {
        1: '文档',
        2: '视频',
        3: '音频',
        4: '图片',
        5: '其他',
    }
    return types[type] || '其他'
}

function ResourceCard({ resource }) {
    // 检查是否有资源数据
    if (!resource) return null

    const { id, title, type, subject, tags, cover } = resource

    // 如果标签是数组，只取前两个标签
    const displayTags = Array.isArray(tags) ? tags.slice(0, 2) : []

    return (
        <Card to={`/resources/${id}`}>
            <ImageContainer>
                {cover ? (
                    <Image src={cover} alt={title} />
                ) : (
                    <NoImage>{getTypeIcon(type)}</NoImage>
                )}
            </ImageContainer>

            <CardBody>
                <Title>{title}</Title>

                <ResourceInfo>
                    <TypeIcon>{getTypeIcon(type)}</TypeIcon>
                    <span>{getTypeText(type)}</span>
                    {subject && <span>• {subject}</span>}
                </ResourceInfo>

                {displayTags.length > 0 && (
                    <TagsContainer>
                        {displayTags.map((tag, index) => (
                            <Tag key={index} type="blue">
                                {tag}
                            </Tag>
                        ))}
                    </TagsContainer>
                )}
            </CardBody>
        </Card>
    )
}

export default ResourceCard
