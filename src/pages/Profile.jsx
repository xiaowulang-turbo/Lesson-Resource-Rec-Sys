import { useState } from 'react'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import styled from 'styled-components'
import Button from '../ui/Button'
import Tag from '../ui/Tag'
import { useNavigate } from 'react-router-dom'
import {
    HiOutlineAcademicCap,
    HiOutlineBookOpen,
    HiOutlineBookmark,
    HiOutlineClock,
    HiOutlineClipboardList,
    HiOutlineHeart,
    HiOutlineLightningBolt,
    HiOutlineUpload,
    HiOutlineUserCircle,
} from 'react-icons/hi'

const StyledProfile = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3.2rem;
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

const UserInfoGrid = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 3.2rem;
    margin-bottom: 2.4rem;
`

const UserAvatar = styled.div`
    width: 15rem;
    height: 15rem;
    border-radius: 50%;
    background-color: var(--color-grey-200);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    & svg {
        width: 10rem;
        height: 10rem;
        color: var(--color-grey-500);
    }

    & img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`

const UserDetails = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1.2rem;
`

const UserName = styled.h3`
    font-size: 2.4rem;
    font-weight: 600;
    color: var(--color-grey-700);
`

const UserMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 1.2rem;
    color: var(--color-grey-500);
    font-size: 1.4rem;
`

const ResourceGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.6rem;
`

const ResourceCard = styled.div`
    padding: 1.6rem;
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-grey-100);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
`

const ResourceCardTitle = styled.h4`
    font-size: 1.6rem;
    font-weight: 500;
    margin-bottom: 0.8rem;
    color: var(--color-grey-700);
`

const ResourceCardMeta = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.2rem;
    color: var(--color-grey-500);
`

const StatGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.6rem;
    margin-bottom: 2.4rem;
`

const StatCard = styled.div`
    padding: 1.6rem;
    border-radius: var(--border-radius-sm);
    background-color: var(--color-grey-50);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`

const StatNumber = styled.p`
    font-size: 3.2rem;
    font-weight: 700;
    color: var(--color-brand-600);
    margin-bottom: 0.8rem;
`

const StatLabel = styled.p`
    font-size: 1.4rem;
    color: var(--color-grey-500);
    text-align: center;
`

const TagContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-bottom: 1.6rem;
`

function Profile() {
    const navigate = useNavigate()
    // 示例数据，实际应该从API获取
    const [activeTab, setActiveTab] = useState('uploads')
    const mockUser = {
        name: '李明',
        avatar: null,
        subject: '高中数学',
        grade: '高一、高二',
        experience: '8年',
        interests: ['几何', '函数', '概率统计', '教学设计'],
        uploads: 24,
        collections: 56,
        likes: 135,
        views: 287,
    }

    const mockRecommendations = [
        {
            id: 1,
            title: '高中数学函数图像教学设计',
            type: '教案',
            author: '王教授',
            rating: 4.9,
        },
        {
            id: 2,
            title: '概率统计课堂活动资源',
            type: '课件',
            author: '数学教研组',
            rating: 4.7,
        },
        {
            id: 3,
            title: '几何证明题解析与方法',
            type: '教学视频',
            author: '张老师',
            rating: 4.8,
        },
        {
            id: 4,
            title: '高考数学压轴题解析',
            type: '试题',
            author: '高考研究中心',
            rating: 4.6,
        },
    ]

    const mockUploads = [
        {
            id: 101,
            title: '二次函数教学设计',
            type: '教案',
            views: 156,
            likes: 42,
        },
        {
            id: 102,
            title: '几何证明教学课件',
            type: '课件',
            views: 234,
            likes: 78,
        },
        {
            id: 103,
            title: '数学思维训练题集',
            type: '试题',
            views: 198,
            likes: 45,
        },
        {
            id: 104,
            title: '概率初步教学案例',
            type: '教案',
            views: 178,
            likes: 39,
        },
    ]

    const mockCollections = [
        {
            id: 201,
            title: '高考数学重点题型',
            type: '试题',
            author: '高考研究中心',
            rating: 4.8,
        },
        {
            id: 202,
            title: '数学竞赛题解析',
            type: '教学资源',
            author: '奥数研究所',
            rating: 4.9,
        },
        {
            id: 203,
            title: '数学思维导图集',
            type: '课件',
            author: '思维教育研究所',
            rating: 4.7,
        },
        {
            id: 204,
            title: '趣味数学案例',
            type: '教案',
            author: '数学教育专家组',
            rating: 4.6,
        },
    ]

    const handleNavigateToTeachingTools = (tool) => {
        // 这里可以根据工具类型跳转到不同页面或账号设置的不同选项卡
        // 现在先简单实现，统一跳转到账号设置
        navigate('/account')
    }

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
                <Heading as="h1">个人中心</Heading>
            </Row>

            <StyledProfile>
                <div>
                    {/* 个人资料区 */}
                    <ProfileSection>
                        <SectionHeader>
                            <SectionIcon>
                                <HiOutlineUserCircle />
                                <h2>个人资料</h2>
                            </SectionIcon>
                            <Button
                                size="small"
                                variation="secondary"
                                onClick={() => navigate('/account')}
                            >
                                编辑资料
                            </Button>
                        </SectionHeader>

                        <UserInfoGrid>
                            <UserAvatar>
                                {mockUser.avatar ? (
                                    <img
                                        src={mockUser.avatar}
                                        alt={mockUser.name}
                                    />
                                ) : (
                                    <HiOutlineUserCircle />
                                )}
                            </UserAvatar>
                            <UserDetails>
                                <UserName>{mockUser.name}</UserName>
                                <UserMeta>
                                    <span>教学科目: {mockUser.subject}</span>
                                    <span>•</span>
                                    <span>教学年级: {mockUser.grade}</span>
                                </UserMeta>
                                <UserMeta>
                                    <span>教龄: {mockUser.experience}</span>
                                </UserMeta>
                                <TagContainer>
                                    {mockUser.interests.map((interest) => (
                                        <Tag key={interest}>{interest}</Tag>
                                    ))}
                                </TagContainer>
                            </UserDetails>
                        </UserInfoGrid>

                        <StatGrid>
                            <StatCard>
                                <StatNumber>{mockUser.uploads}</StatNumber>
                                <StatLabel>资源上传</StatLabel>
                            </StatCard>
                            <StatCard>
                                <StatNumber>{mockUser.collections}</StatNumber>
                                <StatLabel>收藏资源</StatLabel>
                            </StatCard>
                            <StatCard>
                                <StatNumber>{mockUser.likes}</StatNumber>
                                <StatLabel>获赞</StatLabel>
                            </StatCard>
                            <StatCard>
                                <StatNumber>{mockUser.views}</StatNumber>
                                <StatLabel>资源浏览</StatLabel>
                            </StatCard>
                        </StatGrid>
                    </ProfileSection>

                    {/* 个性化推荐区 */}
                    <ProfileSection>
                        <SectionHeader>
                            <SectionIcon>
                                <HiOutlineLightningBolt />
                                <h2>专属推荐</h2>
                            </SectionIcon>
                            <Button size="small" variation="secondary">
                                刷新推荐
                            </Button>
                        </SectionHeader>

                        <ResourceGrid>
                            {mockRecommendations.map((resource) => (
                                <ResourceCard
                                    key={resource.id}
                                    onClick={() =>
                                        handleResourceClick(resource.id, '推荐')
                                    }
                                >
                                    <ResourceCardTitle>
                                        {resource.title}
                                    </ResourceCardTitle>
                                    <ResourceCardMeta>
                                        <span>{resource.type}</span>
                                        <span>评分: {resource.rating}</span>
                                    </ResourceCardMeta>
                                    <ResourceCardMeta>
                                        <span>作者: {resource.author}</span>
                                    </ResourceCardMeta>
                                </ResourceCard>
                            ))}
                        </ResourceGrid>
                    </ProfileSection>
                </div>

                <div>
                    {/* 资源管理区 */}
                    <ProfileSection>
                        <SectionHeader>
                            <SectionIcon>
                                <HiOutlineClipboardList />
                                <h2>我的资源</h2>
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

                        <ResourceGrid>
                            {activeTab === 'uploads'
                                ? mockUploads.map((resource) => (
                                      <ResourceCard
                                          key={resource.id}
                                          onClick={() =>
                                              handleResourceClick(
                                                  resource.id,
                                                  '上传'
                                              )
                                          }
                                      >
                                          <ResourceCardTitle>
                                              {resource.title}
                                          </ResourceCardTitle>
                                          <ResourceCardMeta>
                                              <span>{resource.type}</span>
                                              <span>
                                                  {resource.views} 次浏览
                                              </span>
                                          </ResourceCardMeta>
                                          <ResourceCardMeta>
                                              <span>
                                                  <HiOutlineHeart />{' '}
                                                  {resource.likes}
                                              </span>
                                          </ResourceCardMeta>
                                      </ResourceCard>
                                  ))
                                : mockCollections.map((resource) => (
                                      <ResourceCard
                                          key={resource.id}
                                          onClick={() =>
                                              handleResourceClick(
                                                  resource.id,
                                                  '收藏'
                                              )
                                          }
                                      >
                                          <ResourceCardTitle>
                                              {resource.title}
                                          </ResourceCardTitle>
                                          <ResourceCardMeta>
                                              <span>{resource.type}</span>
                                              <span>
                                                  评分: {resource.rating}
                                              </span>
                                          </ResourceCardMeta>
                                          <ResourceCardMeta>
                                              <span>
                                                  作者: {resource.author}
                                              </span>
                                          </ResourceCardMeta>
                                      </ResourceCard>
                                  ))}
                        </ResourceGrid>
                    </ProfileSection>

                    {/* 教学助手区 */}
                    <ProfileSection>
                        <SectionHeader>
                            <SectionIcon>
                                <HiOutlineAcademicCap />
                                <h2>教学助手</h2>
                            </SectionIcon>
                        </SectionHeader>

                        <ResourceGrid>
                            <ResourceCard
                                onClick={() =>
                                    handleNavigateToTeachingTools('calendar')
                                }
                            >
                                <ResourceCardTitle>
                                    <HiOutlineBookOpen /> 备课日历
                                </ResourceCardTitle>
                                <ResourceCardMeta>
                                    <span>查看和管理您的备课计划</span>
                                </ResourceCardMeta>
                            </ResourceCard>

                            <ResourceCard
                                onClick={() =>
                                    handleNavigateToTeachingTools('notes')
                                }
                            >
                                <ResourceCardTitle>
                                    <HiOutlineClipboardList /> 备课笔记
                                </ResourceCardTitle>
                                <ResourceCardMeta>
                                    <span>记录和整理您的教学想法</span>
                                </ResourceCardMeta>
                            </ResourceCard>

                            <ResourceCard
                                onClick={() =>
                                    handleNavigateToTeachingTools('recent')
                                }
                            >
                                <ResourceCardTitle>
                                    <HiOutlineClock /> 最近浏览
                                </ResourceCardTitle>
                                <ResourceCardMeta>
                                    <span>快速访问最近查看的资源</span>
                                </ResourceCardMeta>
                            </ResourceCard>

                            <ResourceCard
                                onClick={() =>
                                    handleNavigateToTeachingTools('assistant')
                                }
                            >
                                <ResourceCardTitle>
                                    <HiOutlineLightningBolt /> 智能助手
                                </ResourceCardTitle>
                                <ResourceCardMeta>
                                    <span>AI辅助备课和资源定制</span>
                                </ResourceCardMeta>
                            </ResourceCard>
                        </ResourceGrid>
                    </ProfileSection>
                </div>
            </StyledProfile>
        </>
    )
}

export default Profile
