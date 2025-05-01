import { useState } from 'react'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import styled from 'styled-components'
import Button from '../ui/Button'
import { useNavigate, Link } from 'react-router-dom'
import {
    HiOutlineBookmark,
    HiOutlineClipboardList,
    HiOutlineHeart,
    HiOutlineUpload,
    HiOutlineEye,
} from 'react-icons/hi'

// 使用本地默认资源图片替代在线服务
const PLACEHOLDER_IMAGE = '../public/default-resource.jpg'

const StyledProfile = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`

const ProfileSection = styled.div`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem;
    margin-bottom: 2.4rem;
    box-shadow: var(--shadow-sm);
`

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;

    & h2 {
        font-size: 2rem;
        font-weight: 600;
    }
`

const SectionIcon = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--color-brand-600);

    & svg {
        width: 2.4rem;
        height: 2.4rem;
    }
`

const ResourceCardLink = styled(Link)`
    text-decoration: none;
    color: inherit;
    display: block;
    margin-bottom: 1.6rem;
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
    background-color: var(--color-grey-100);
    flex: 0 0 160px;
    width: 160px;
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
    line-height: 1.6em;
`

const ResourceInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-bottom: 0.8rem;
    font-size: 1.4rem;
    color: var(--color-grey-500);
`

const Label = styled.span`
    font-size: 1.2rem;
    font-weight: 600;
    padding: 0.4rem 0.8rem;
    border-radius: var(--border-radius-sm);
    background-color: var(--color-grey-100);
    color: var(--color-grey-700);
    display: flex;
    align-items: center;
    gap: 0.4rem;
`

function Profile() {
    const navigate = useNavigate()
    // 示例数据，实际应该从API获取
    const [activeTab, setActiveTab] = useState('uploads')

    const mockUploads = [
        {
            id: 101,
            title: '二次函数教学设计',
            type: '教案',
            views: 156,
            likes: 42,
            cover: PLACEHOLDER_IMAGE,
            description:
                '针对高一学生的二次函数教学设计，包括课程目标、教学重点难点、教学过程和课后作业。',
            createdAt: '2023-05-15',
        },
        {
            id: 102,
            title: '几何证明教学课件',
            type: '课件',
            views: 234,
            likes: 78,
            cover: PLACEHOLDER_IMAGE,
            description:
                '高中几何证明方法总结，包括直接证明、反证法、待定系数法等多种证明方法的案例。',
            createdAt: '2023-06-20',
        },
        {
            id: 103,
            title: '数学思维训练题集',
            type: '试题',
            views: 198,
            likes: 45,
            cover: PLACEHOLDER_IMAGE,
            description:
                '精选高中数学思维训练题，培养学生的逻辑思维和解题能力。',
            createdAt: '2023-07-05',
        },
        {
            id: 104,
            title: '概率初步教学案例',
            type: '教案',
            views: 178,
            likes: 39,
            cover: PLACEHOLDER_IMAGE,
            description:
                '高二概率统计单元教学案例，包含丰富的生活实例和互动环节。',
            createdAt: '2023-08-12',
        },
    ]

    const mockCollections = [
        {
            id: 201,
            title: '高考数学重点题型',
            type: '试题',
            author: '高考研究中心',
            rating: 4.8,
            cover: PLACEHOLDER_IMAGE,
            description:
                '精选近五年高考数学真题中的重点题型，包含详细解析和解题技巧。',
        },
        {
            id: 202,
            title: '数学竞赛题解析',
            type: '教学资源',
            author: '奥数研究所',
            rating: 4.9,
            cover: PLACEHOLDER_IMAGE,
            description:
                '各类数学竞赛题目的详细解析，适合培养学生的数学思维和竞赛能力。',
        },
        {
            id: 203,
            title: '数学思维导图集',
            type: '课件',
            author: '思维教育研究所',
            rating: 4.7,
            cover: PLACEHOLDER_IMAGE,
            description: '高中数学各章节知识点思维导图，帮助学生构建知识体系。',
        },
        {
            id: 204,
            title: '趣味数学案例',
            type: '教案',
            author: '数学教育专家组',
            rating: 4.6,
            cover: PLACEHOLDER_IMAGE,
            description:
                '将数学知识与生活实际相结合的趣味教学案例，提高学生学习兴趣。',
        },
    ]

    const handleResourceClick = (resourceId, type) => {
        // 在实际应用中，这里应该跳转到资源详情页
        console.log(`查看${type}资源: ${resourceId}`)
        // 示例跳转 - 实际项目中应替换为真实路由
        // navigate(`/resources/${resourceId}`);
        alert(`您点击了ID为${resourceId}的${type}资源`)
    }

    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">我的资源</Heading>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button
                        size="medium"
                        variation="primary"
                        onClick={() => navigate('/upload')}
                    >
                        <HiOutlineUpload /> 上传资源
                    </Button>
                </div>
            </Row>

            <StyledProfile>
                {/* 资源管理区 */}
                <ProfileSection>
                    <SectionHeader>
                        <SectionIcon>
                            <HiOutlineClipboardList />
                            <h2>我的资源列表</h2>
                        </SectionIcon>
                        <div>
                            <Button
                                size="small"
                                variation={
                                    activeTab === 'uploads'
                                        ? 'primary'
                                        : 'secondary'
                                }
                                onClick={() => setActiveTab('uploads')}
                            >
                                <HiOutlineUpload /> 上传
                            </Button>
                            <Button
                                size="small"
                                variation={
                                    activeTab === 'collections'
                                        ? 'primary'
                                        : 'secondary'
                                }
                                onClick={() => setActiveTab('collections')}
                            >
                                <HiOutlineBookmark /> 收藏
                            </Button>
                        </div>
                    </SectionHeader>

                    {activeTab === 'uploads'
                        ? mockUploads.map((resource) => (
                              <ResourceCardLink
                                  key={resource.id}
                                  to={`/resources/${resource.id}`}
                                  onClick={(e) => {
                                      e.preventDefault()
                                      handleResourceClick(resource.id, '上传')
                                  }}
                              >
                                  <ResourceCard>
                                      <ResourceImage>
                                          <img
                                              src={resource.cover}
                                              alt={resource.title}
                                              onError={(e) => {
                                                  e.target.src =
                                                      PLACEHOLDER_IMAGE
                                              }}
                                          />
                                      </ResourceImage>
                                      <ResourceContent>
                                          <ResourceTitle>
                                              {resource.title}
                                          </ResourceTitle>
                                          <ResourceInfo>
                                              <Label>{resource.type}</Label>
                                              <Label>
                                                  <HiOutlineEye />
                                                  {resource.views} 次浏览
                                              </Label>
                                              <Label>
                                                  <HiOutlineHeart />
                                                  {resource.likes} 获赞
                                              </Label>
                                          </ResourceInfo>
                                          <p>{resource.description}</p>
                                          <ResourceInfo>
                                              <span>
                                                  上传时间: {resource.createdAt}
                                              </span>
                                          </ResourceInfo>
                                      </ResourceContent>
                                  </ResourceCard>
                              </ResourceCardLink>
                          ))
                        : mockCollections.map((resource) => (
                              <ResourceCardLink
                                  key={resource.id}
                                  to={`/resources/${resource.id}`}
                                  onClick={(e) => {
                                      e.preventDefault()
                                      handleResourceClick(resource.id, '收藏')
                                  }}
                              >
                                  <ResourceCard>
                                      <ResourceImage>
                                          <img
                                              src={resource.cover}
                                              alt={resource.title}
                                              onError={(e) => {
                                                  e.target.src =
                                                      PLACEHOLDER_IMAGE
                                              }}
                                          />
                                      </ResourceImage>
                                      <ResourceContent>
                                          <ResourceTitle>
                                              {resource.title}
                                          </ResourceTitle>
                                          <ResourceInfo>
                                              <Label>{resource.type}</Label>
                                              <Label>
                                                  评分: {resource.rating}
                                              </Label>
                                          </ResourceInfo>
                                          <p>{resource.description}</p>
                                          <ResourceInfo>
                                              <span>
                                                  作者: {resource.author}
                                              </span>
                                          </ResourceInfo>
                                      </ResourceContent>
                                  </ResourceCard>
                              </ResourceCardLink>
                          ))}
                </ProfileSection>
            </StyledProfile>
        </>
    )
}

export default Profile
