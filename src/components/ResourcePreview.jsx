import React from 'react'
import styled from 'styled-components'
import VideoPlayer from './VideoPlayer'
import AudioPlayer from './AudioPlayer'

const PreviewContainer = styled.div`
    width: 100%;
    margin: 2rem 0;
    border-radius: var(--border-radius-md);
    overflow: hidden;
    background-color: var(--color-grey-100);
    box-shadow: var(--shadow-sm);
`

const ImagePreview = styled.img`
    width: 100%;
    max-height: 600px;
    object-fit: contain;
    display: block;
`

const DocumentPreview = styled.div`
    width: 100%;
    height: 600px;
    border: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    iframe {
        width: 100%;
        height: 100%;
        border: none;
    }

    .document-fallback {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;

        svg {
            font-size: 5rem;
            margin-bottom: 1rem;
            color: var(--color-grey-500);
        }

        p {
            color: var(--color-grey-700);
            margin-bottom: 1.5rem;
        }
    }
`

const PreviewUnavailable = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    background-color: var(--color-grey-100);
    border-radius: var(--border-radius-md);

    svg {
        font-size: 5rem;
        margin-bottom: 1.5rem;
        color: var(--color-grey-500);
    }

    h3 {
        font-size: 1.8rem;
        color: var(--color-grey-700);
        margin-bottom: 1rem;
    }

    p {
        color: var(--color-grey-500);
        margin-bottom: 2rem;
    }
`

// 文档图标组件
const DocumentIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
)

// 预览不可用图标
const PreviewUnavailableIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
    </svg>
)

// API基础URL
const API_BASE_URL = 'http://localhost:3000'

// 根据文件扩展名判断资源类型
const getResourceType = (extension) => {
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov']
    const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac']
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
    const documentExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt']

    extension = extension.toLowerCase()

    if (videoExtensions.includes(extension)) return 'video'
    if (audioExtensions.includes(extension)) return 'audio'
    if (imageExtensions.includes(extension)) return 'image'
    if (documentExtensions.includes(extension)) return 'document'
    return 'other'
}

function ResourcePreview({ resource }) {
    console.log(resource, 'resource')
    if (!resource || !resource.url) {
        return (
            <PreviewUnavailable>
                <PreviewUnavailableIcon />
                <h3>无法预览</h3>
                <p>此资源不包含可预览的内容</p>
            </PreviewUnavailable>
        )
    }

    const { type, url, title, description, createdBy } = resource

    // 判断是否是远程URL
    const isRemoteUrl = url.startsWith('http')

    // 获取资源的完整URL
    const fullUrl = isRemoteUrl ? url : `${API_BASE_URL}/${url}`

    // 获取文件扩展名
    const getFileExtension = (url) => {
        // 去除URL参数
        const cleanUrl = url.split('?')[0]
        // 获取最后一个点号之后的部分
        console.log(cleanUrl, 'cleanUrl')
        return cleanUrl.split('.').pop().toLowerCase()
    }

    const fileExtension = getFileExtension(url)

    // 根据文件扩展名判断资源类型并提供不同的预览
    const resourceType = getResourceType(fileExtension)

    switch (resourceType) {
        case 'video':
            return (
                <VideoPlayer
                    src={fullUrl}
                    poster={resource.cover}
                    type={`video/${fileExtension}`}
                />
            )

        case 'audio':
            return (
                <AudioPlayer
                    src={fullUrl}
                    title={title || '未知音频'}
                    artist={createdBy || '未知作者'}
                />
            )

        case 'image':
            return (
                <PreviewContainer>
                    <ImagePreview src={fullUrl} alt={title || '图片预览'} />
                </PreviewContainer>
            )

        case 'document':
            // 对于PDF可以使用iframe预览
            if (fileExtension === 'pdf') {
                return (
                    <PreviewContainer>
                        <DocumentPreview>
                            <iframe
                                src={`${fullUrl}#toolbar=0`}
                                title={title || '文档预览'}
                                allowFullScreen
                            />
                        </DocumentPreview>
                    </PreviewContainer>
                )
            } else {
                // 其他文档类型暂不支持预览
                return (
                    <PreviewContainer>
                        <DocumentPreview>
                            <div className="document-fallback">
                                <DocumentIcon />
                                <p>此文档格式不支持在线预览</p>
                            </div>
                        </DocumentPreview>
                    </PreviewContainer>
                )
            }

        default:
            return (
                <PreviewUnavailable>
                    <PreviewUnavailableIcon />
                    <h3>无法预览</h3>
                    <p>此类型的资源暂不支持预览</p>
                </PreviewUnavailable>
            )
    }
}

export default ResourcePreview
