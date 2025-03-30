import { useState } from 'react'
import UpdatePasswordForm from '../features/authentication/UpdatePasswordForm'
import UpdateUserDataForm from '../features/authentication/UpdateUserDataForm'
import Heading from '../ui/Heading'
import Row from '../ui/Row'
import styled from 'styled-components'
import Button from '../ui/Button'
import Form from '../ui/Form'
import FormRow from '../ui/FormRow'
import Input from '../ui/Input'
import FileInput from '../ui/FileInput'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import Checkbox from '../ui/Checkbox'
import Tag from '../ui/Tag'
import {
    HiOutlineAcademicCap,
    HiOutlineCog6Tooth,
    HiOutlineLockClosed,
    HiOutlineUserCircle,
    HiOutlineHeart,
    HiOutlineBell,
} from 'react-icons/hi2'

const StyledAccount = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3.2rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`

const AccountSection = styled.div`
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

const AvatarContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.6rem;
    margin-bottom: 2.4rem;
`

const AvatarPreview = styled.div`
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

const TagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 1.2rem;
    margin-bottom: 1.6rem;
`

const TagItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
`

function Account() {
    // 模拟用户数据，实际应从API获取
    const [user, setUser] = useState({
        fullName: '李明',
        email: 'liming@teacher.edu.cn',
        phone: '13812345678',
        avatar: null,
        subject: '数学',
        grade: '高中',
        experience: '8年',
        bio: '高中数学教师，有8年教学经验，擅长几何和函数教学。',
        interests: ['几何', '函数', '概率统计', '教学设计'],
        notifications: {
            resourceRecommendations: true,
            newFeatures: true,
            communityUpdates: false,
        },
    })

    const [availableInterests, setAvailableInterests] = useState([
        '几何',
        '函数',
        '概率统计',
        '教学设计',
        '解析几何',
        '立体几何',
        '数列',
        '三角函数',
        '微积分',
        '线性代数',
        '高考复习',
        '竞赛数学',
    ])

    const [selectedInterest, setSelectedInterest] = useState('')
    const [activeTab, setActiveTab] = useState('profile')

    const gradeOptions = [
        { value: '小学', label: '小学' },
        { value: '初中', label: '初中' },
        { value: '高中', label: '高中' },
        { value: '大学', label: '大学' },
    ]

    const subjectOptions = [
        { value: '数学', label: '数学' },
        { value: '语文', label: '语文' },
        { value: '英语', label: '英语' },
        { value: '物理', label: '物理' },
        { value: '化学', label: '化学' },
        { value: '生物', label: '生物' },
        { value: '历史', label: '历史' },
        { value: '地理', label: '地理' },
        { value: '政治', label: '政治' },
    ]

    const handleAddInterest = () => {
        if (selectedInterest && !user.interests.includes(selectedInterest)) {
            setUser({
                ...user,
                interests: [...user.interests, selectedInterest],
            })
            setSelectedInterest('')
        }
    }

    const handleRemoveInterest = (interest) => {
        setUser({
            ...user,
            interests: user.interests.filter((item) => item !== interest),
        })
    }

    const handleUserUpdate = (e) => {
        e.preventDefault()
        // 在实际应用中，这里应该调用API保存用户数据
        console.log('用户数据已更新:', user)
        alert('个人信息已更新!')
    }

    const handleNotificationChange = (key, value) => {
        setUser({
            ...user,
            notifications: {
                ...user.notifications,
                [key]: value,
            },
        })
    }

    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">账号设置</Heading>
            </Row>

            <Row type="horizontal">
                <Button
                    variation={
                        activeTab === 'profile' ? 'primary' : 'secondary'
                    }
                    onClick={() => setActiveTab('profile')}
                >
                    <HiOutlineUserCircle /> 个人信息
                </Button>
                <Button
                    variation={
                        activeTab === 'security' ? 'primary' : 'secondary'
                    }
                    onClick={() => setActiveTab('security')}
                >
                    <HiOutlineLockClosed /> 安全设置
                </Button>
                <Button
                    variation={
                        activeTab === 'preferences' ? 'primary' : 'secondary'
                    }
                    onClick={() => setActiveTab('preferences')}
                >
                    <HiOutlineHeart /> 兴趣喜好
                </Button>
                <Button
                    variation={
                        activeTab === 'notifications' ? 'primary' : 'secondary'
                    }
                    onClick={() => setActiveTab('notifications')}
                >
                    <HiOutlineBell /> 通知设置
                </Button>
            </Row>

            <StyledAccount>
                {activeTab === 'profile' && (
                    <>
                        {/* 个人信息 */}
                        <AccountSection>
                            <SectionHeader>
                                <SectionIcon>
                                    <HiOutlineUserCircle />
                                    <h2>个人资料</h2>
                                </SectionIcon>
                            </SectionHeader>

                            <Form onSubmit={handleUserUpdate}>
                                <FormRow label="姓名">
                                    <Input
                                        type="text"
                                        id="fullName"
                                        value={user.fullName}
                                        onChange={(e) =>
                                            setUser({
                                                ...user,
                                                fullName: e.target.value,
                                            })
                                        }
                                    />
                                </FormRow>
                                <FormRow label="邮箱">
                                    <Input
                                        type="email"
                                        id="email"
                                        value={user.email}
                                        onChange={(e) =>
                                            setUser({
                                                ...user,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                </FormRow>
                                <FormRow label="电话">
                                    <Input
                                        type="tel"
                                        id="phone"
                                        value={user.phone}
                                        onChange={(e) =>
                                            setUser({
                                                ...user,
                                                phone: e.target.value,
                                            })
                                        }
                                    />
                                </FormRow>
                                <FormRow label="教学科目">
                                    <Select
                                        id="subject"
                                        options={subjectOptions}
                                        value={subjectOptions.find(
                                            (option) =>
                                                option.value === user.subject
                                        )}
                                        onChange={(option) =>
                                            setUser({
                                                ...user,
                                                subject: option.value,
                                            })
                                        }
                                    />
                                </FormRow>
                                <FormRow label="教学年级">
                                    <Select
                                        id="grade"
                                        options={gradeOptions}
                                        value={gradeOptions.find(
                                            (option) =>
                                                option.value === user.grade
                                        )}
                                        onChange={(option) =>
                                            setUser({
                                                ...user,
                                                grade: option.value,
                                            })
                                        }
                                    />
                                </FormRow>
                                <FormRow label="教龄">
                                    <Input
                                        type="text"
                                        id="experience"
                                        value={user.experience}
                                        onChange={(e) =>
                                            setUser({
                                                ...user,
                                                experience: e.target.value,
                                            })
                                        }
                                    />
                                </FormRow>
                                <FormRow label="个人简介">
                                    <Textarea
                                        id="bio"
                                        value={user.bio}
                                        onChange={(e) =>
                                            setUser({
                                                ...user,
                                                bio: e.target.value,
                                            })
                                        }
                                    />
                                </FormRow>
                                <FormRow>
                                    <Button type="reset" variation="secondary">
                                        取消
                                    </Button>
                                    <Button type="submit">保存信息</Button>
                                </FormRow>
                            </Form>
                        </AccountSection>

                        {/* 头像设置 */}
                        <AccountSection>
                            <SectionHeader>
                                <SectionIcon>
                                    <HiOutlineUserCircle />
                                    <h2>头像设置</h2>
                                </SectionIcon>
                            </SectionHeader>

                            <AvatarContainer>
                                <AvatarPreview>
                                    {user.avatar ? (
                                        <img
                                            src={URL.createObjectURL(
                                                user.avatar
                                            )}
                                            alt="用户头像"
                                        />
                                    ) : (
                                        <HiOutlineUserCircle />
                                    )}
                                </AvatarPreview>
                                <FileInput
                                    id="avatar"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setUser({
                                            ...user,
                                            avatar: e.target.files[0],
                                        })
                                    }
                                />
                                <Button
                                    size="small"
                                    variation="secondary"
                                    onClick={() =>
                                        setUser({ ...user, avatar: null })
                                    }
                                >
                                    移除头像
                                </Button>
                            </AvatarContainer>
                        </AccountSection>
                    </>
                )}

                {activeTab === 'security' && (
                    <AccountSection>
                        <SectionHeader>
                            <SectionIcon>
                                <HiOutlineLockClosed />
                                <h2>密码修改</h2>
                            </SectionIcon>
                        </SectionHeader>
                        <UpdatePasswordForm />
                    </AccountSection>
                )}

                {activeTab === 'preferences' && (
                    <AccountSection>
                        <SectionHeader>
                            <SectionIcon>
                                <HiOutlineHeart />
                                <h2>兴趣与专长</h2>
                            </SectionIcon>
                        </SectionHeader>

                        <FormRow label="当前兴趣标签">
                            <TagsContainer>
                                {user.interests.map((interest) => (
                                    <TagItem key={interest}>
                                        <Tag>{interest}</Tag>
                                        <Button
                                            size="small"
                                            variation="danger"
                                            onClick={() =>
                                                handleRemoveInterest(interest)
                                            }
                                        >
                                            移除
                                        </Button>
                                    </TagItem>
                                ))}
                            </TagsContainer>
                        </FormRow>

                        <FormRow label="添加新兴趣">
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Select
                                    options={availableInterests
                                        .filter(
                                            (interest) =>
                                                !user.interests.includes(
                                                    interest
                                                )
                                        )
                                        .map((interest) => ({
                                            value: interest,
                                            label: interest,
                                        }))}
                                    value={
                                        selectedInterest
                                            ? {
                                                  value: selectedInterest,
                                                  label: selectedInterest,
                                              }
                                            : null
                                    }
                                    onChange={(option) =>
                                        setSelectedInterest(option?.value || '')
                                    }
                                    placeholder="选择兴趣标签"
                                />
                                <Button
                                    onClick={handleAddInterest}
                                    disabled={
                                        !selectedInterest ||
                                        user.interests.includes(
                                            selectedInterest
                                        )
                                    }
                                >
                                    添加
                                </Button>
                            </div>
                        </FormRow>
                    </AccountSection>
                )}

                {activeTab === 'notifications' && (
                    <AccountSection>
                        <SectionHeader>
                            <SectionIcon>
                                <HiOutlineBell />
                                <h2>通知设置</h2>
                            </SectionIcon>
                        </SectionHeader>

                        <FormRow>
                            <Checkbox
                                id="resourceRecommendations"
                                checked={
                                    user.notifications.resourceRecommendations
                                }
                                onChange={(e) =>
                                    handleNotificationChange(
                                        'resourceRecommendations',
                                        e.target.checked
                                    )
                                }
                            >
                                接收资源推荐通知
                            </Checkbox>
                        </FormRow>
                        <FormRow>
                            <Checkbox
                                id="newFeatures"
                                checked={user.notifications.newFeatures}
                                onChange={(e) =>
                                    handleNotificationChange(
                                        'newFeatures',
                                        e.target.checked
                                    )
                                }
                            >
                                接收新功能通知
                            </Checkbox>
                        </FormRow>
                        <FormRow>
                            <Checkbox
                                id="communityUpdates"
                                checked={user.notifications.communityUpdates}
                                onChange={(e) =>
                                    handleNotificationChange(
                                        'communityUpdates',
                                        e.target.checked
                                    )
                                }
                            >
                                接收社区更新通知
                            </Checkbox>
                        </FormRow>

                        <FormRow>
                            <Button onClick={handleUserUpdate}>保存设置</Button>
                        </FormRow>
                    </AccountSection>
                )}
            </StyledAccount>
        </>
    )
}

export default Account
