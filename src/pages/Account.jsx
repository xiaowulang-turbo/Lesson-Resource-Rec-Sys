import { useState, useRef, useEffect } from 'react'
import UpdatePasswordForm from '../features/authentication/UpdatePasswordForm'
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
    HiOutlinePlusCircle,
    HiOutlineMinusCircle,
    HiOutlineStar,
    HiOutlineBookOpen,
    HiOutlineChartBar,
    HiOutlineLightBulb,
} from 'react-icons/hi2'
import { HiOutlineSearch } from 'react-icons/hi'

const StyledAccount = styled.div`
    display: grid;
    grid-template-columns: 24rem 1fr;
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
    gap: 1rem;
    margin-top: 1.2rem;
    margin-bottom: 1.6rem;
`

const TagItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    transition: all 0.2s;

    &:hover {
        transform: translateY(-2px);
    }
`

const InterestTag = styled(Tag)`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.4rem;
    padding: 0.8rem 1.2rem;
    background-color: var(--color-brand-50);
    border: 1px solid var(--color-brand-100);

    ${(props) =>
        props.category === 'geometry' &&
        `
        background-color: #e6f7ff;
        border-color: #91d5ff;
        color: #0050b3;
    `}

    ${(props) =>
        props.category === 'function' &&
        `
        background-color: #f6ffed;
        border-color: #b7eb8f;
        color: #389e0d;
    `}
    
    ${(props) =>
        props.category === 'statistics' &&
        `
        background-color: #fff2e8;
        border-color: #ffbb96;
        color: #d4380d;
    `}
    
    ${(props) =>
        props.category === 'teaching' &&
        `
        background-color: #f9f0ff;
        border-color: #d3adf7;
        color: #531dab;
    `}
    
    ${(props) =>
        props.category === 'other' &&
        `
        background-color: #f0f2ff;
        border-color: #adc6ff;
        color: #1d39c4;
    `}
`

const InterestCategories = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 2rem;
    margin-bottom: 2.4rem;
`

const CategoryBox = styled.div`
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-md);
    padding: 1.6rem;
    border-left: 4px solid;
    transition: all 0.3s;

    ${(props) =>
        props.category === 'geometry' &&
        `
        border-left-color: #0050b3;
    `}

    ${(props) =>
        props.category === 'function' &&
        `
        border-left-color: #389e0d;
    `}
    
    ${(props) =>
        props.category === 'statistics' &&
        `
        border-left-color: #d4380d;
    `}
    
    ${(props) =>
        props.category === 'teaching' &&
        `
        border-left-color: #531dab;
    `}
    
    ${(props) =>
        props.category === 'other' &&
        `
        border-left-color: #1d39c4;
    `}
    
    &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
    }
`

const CategoryTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-weight: 600;
    font-size: 1.6rem;
    margin-bottom: 1.2rem;
    color: var(--color-grey-700);
`

const EmptyTagsMessage = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.6rem;
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-md);
    color: var(--color-grey-500);
    font-style: italic;
`

const NewInterestSection = styled.div`
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-md);
    padding: 2rem;
    margin-top: 2.4rem;
`

const QuickAddTags = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1.6rem;
`

const QuickAddTag = styled.button`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 1.2rem;
    background-color: var(--color-grey-0);
    border: 1px dashed var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    color: var(--color-grey-600);
    font-size: 1.4rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: var(--color-grey-100);
        border-color: var(--color-grey-400);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    & svg {
        color: var(--color-brand-600);
    }
`

const SectionSubTitle = styled.h3`
    font-size: 1.6rem;
    font-weight: 500;
    color: var(--color-grey-700);
    margin-bottom: 1.2rem;
`

const SideMenu = styled.div`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem;
    height: fit-content;
    box-shadow: var(--shadow-sm);
`

const MenuButton = styled.button`
    display: flex;
    align-items: center;
    gap: 1.2rem;
    width: 100%;
    padding: 1.2rem 1.6rem;
    font-size: 1.6rem;
    border: none;
    border-radius: var(--border-radius-sm);
    background-color: ${(props) =>
        props.active ? 'var(--color-brand-600)' : 'transparent'};
    color: ${(props) =>
        props.active ? 'var(--color-grey-0)' : 'var(--color-grey-600)'};
    cursor: pointer;
    transition: all 0.3s;
    text-align: left;
    margin-bottom: 0.8rem;

    &:hover {
        background-color: ${(props) =>
            props.active ? 'var(--color-brand-700)' : 'var(--color-grey-100)'};
    }

    & svg {
        width: 2.4rem;
        height: 2.4rem;
    }
`

const MainContent = styled.div`
    display: flex;
    flex-direction: column;
`

const AutocompleteContainer = styled.div`
    position: relative;
    flex: 1;
`

const InputWithIcon = styled.div`
    position: relative;
    display: flex;
    align-items: center;

    & svg {
        position: absolute;
        left: 1rem;
        color: var(--color-grey-500);
    }

    & input {
        padding-left: 3.6rem;
    }
`

const AutocompleteDropdown = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-200);
    border-radius: var(--border-radius-sm);
    box-shadow: var(--shadow-md);
    max-height: 20rem;
    overflow-y: auto;
    z-index: 100;
    margin-top: 0.4rem;
`

const AutocompleteItem = styled.div`
    padding: 1rem 1.4rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: var(--color-grey-100);
    }

    ${(props) =>
        props.highlighted &&
        `
        background-color: var(--color-brand-50);
    `}
`

const NoResults = styled.div`
    padding: 1rem 1.4rem;
    color: var(--color-grey-500);
    font-style: italic;
`

function Account() {
    const [user, setUser] = useState({
        fullName: '',
        email: '',
        phone: '',
        avatar: null,
        subject: '',
        grade: '',
        experience: '',
        bio: '',
        interests: [],
        notifications: {
            resourceRecommendations: false,
            newFeatures: false,
            communityUpdates: false,
        },
    })

    const [availableInterests, setAvailableInterests] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const [activeTab, setActiveTab] = useState('profile')
    const inputRef = useRef(null)

    // 在实际应用中，应该从API获取用户数据和可用兴趣标签
    useEffect(() => {
        // 获取用户数据的API调用
        // const fetchUserData = async () => {
        //     try {
        //         const response = await fetch('/api/user/profile')
        //         const data = await response.json()
        //         setUser(data)
        //     } catch (error) {
        //         console.error('获取用户数据失败:', error)
        //     }
        // }
        // 获取可用兴趣标签的API调用
        // const fetchInterests = async () => {
        //     try {
        //         const response = await fetch('/api/interests')
        //         const data = await response.json()
        //         setAvailableInterests(data)
        //     } catch (error) {
        //         console.error('获取兴趣标签失败:', error)
        //     }
        // }
        // fetchUserData()
        // fetchInterests()
    }, [])

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

    // 过滤可用的兴趣标签
    const filteredSuggestions = inputValue
        ? availableInterests.filter(
              (interest) =>
                  !user.interests.includes(interest) &&
                  interest.toLowerCase().includes(inputValue.toLowerCase())
          )
        : []

    // 处理添加兴趣
    const handleAddInterest = () => {
        const interestToAdd = inputValue.trim()
        if (interestToAdd && !user.interests.includes(interestToAdd)) {
            // 如果输入的兴趣不在可用列表中，添加到可用列表
            if (!availableInterests.includes(interestToAdd)) {
                setAvailableInterests([...availableInterests, interestToAdd])
            }

            setUser({
                ...user,
                interests: [...user.interests, interestToAdd],
            })
            setInputValue('')
            setShowSuggestions(false)
            setHighlightedIndex(-1)
        }
    }

    // 处理键盘导航
    const handleKeyDown = (e) => {
        if (!showSuggestions) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setHighlightedIndex((prevIndex) =>
                    prevIndex < filteredSuggestions.length - 1
                        ? prevIndex + 1
                        : prevIndex
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setHighlightedIndex((prevIndex) =>
                    prevIndex > 0 ? prevIndex - 1 : prevIndex
                )
                break
            case 'Enter':
                e.preventDefault()
                if (
                    highlightedIndex >= 0 &&
                    highlightedIndex < filteredSuggestions.length
                ) {
                    setInputValue(filteredSuggestions[highlightedIndex])
                    setTimeout(() => {
                        const interestToAdd =
                            filteredSuggestions[highlightedIndex]
                        if (
                            interestToAdd &&
                            !user.interests.includes(interestToAdd)
                        ) {
                            setUser({
                                ...user,
                                interests: [...user.interests, interestToAdd],
                            })
                            setInputValue('')
                        }
                    }, 0)
                } else {
                    handleAddInterest()
                }
                setShowSuggestions(false)
                setHighlightedIndex(-1)
                break
            case 'Escape':
                setShowSuggestions(false)
                setHighlightedIndex(-1)
                break
            default:
                break
        }
    }

    // 点击建议项
    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion)
        setTimeout(() => {
            if (suggestion && !user.interests.includes(suggestion)) {
                setUser({
                    ...user,
                    interests: [...user.interests, suggestion],
                })
                setInputValue('')
            }
        }, 0)
        setShowSuggestions(false)
        setHighlightedIndex(-1)
        inputRef.current?.focus()
    }

    // 处理快速添加标签
    const handleQuickAddClick = (tag) => {
        if (tag && !user.interests.includes(tag)) {
            setUser({
                ...user,
                interests: [...user.interests, tag],
            })
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
        // const updateUser = async () => {
        //     try {
        //         const response = await fetch('/api/user/profile', {
        //             method: 'PUT',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //             },
        //             body: JSON.stringify(user),
        //         })
        //         if (response.ok) {
        //             alert('个人信息已更新!')
        //         }
        //     } catch (error) {
        //         console.error('更新用户数据失败:', error)
        //     }
        // }
        // updateUser()
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

    // 兴趣分类函数
    const getInterestCategory = (interest) => {
        const geometryTerms = ['几何', '解析几何', '立体几何']
        const functionTerms = ['函数', '三角函数', '数列', '微积分', '线性代数']
        const statisticsTerms = ['概率统计']
        const teachingTerms = ['教学设计', '高考复习', '竞赛数学']

        if (geometryTerms.includes(interest)) return 'geometry'
        if (functionTerms.includes(interest)) return 'function'
        if (statisticsTerms.includes(interest)) return 'statistics'
        if (teachingTerms.includes(interest)) return 'teaching'
        return 'other'
    }

    // 获取分类图标
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'geometry':
                return <HiOutlineStar />
            case 'function':
                return <HiOutlineChartBar />
            case 'statistics':
                return <HiOutlineChartBar />
            case 'teaching':
                return <HiOutlineBookOpen />
            default:
                return <HiOutlineLightBulb />
        }
    }

    // 获取分类名称
    const getCategoryName = (category) => {
        switch (category) {
            case 'geometry':
                return '几何'
            case 'function':
                return '函数'
            case 'statistics':
                return '统计'
            case 'teaching':
                return '教学'
            default:
                return '其他'
        }
    }

    // 将兴趣按分类进行分组
    const groupedInterests = user.interests.reduce((acc, interest) => {
        const category = getInterestCategory(interest)
        if (!acc[category]) acc[category] = []
        acc[category].push(interest)
        return acc
    }, {})

    // 获取推荐添加的标签
    const getRecommendedTags = () => {
        return availableInterests
            .filter((interest) => !user.interests.includes(interest))
            .slice(0, 5)
    }

    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">账号设置</Heading>
            </Row>

            <StyledAccount>
                <SideMenu>
                    <MenuButton
                        active={activeTab === 'profile'}
                        onClick={() => setActiveTab('profile')}
                    >
                        <HiOutlineUserCircle /> 个人信息
                    </MenuButton>
                    <MenuButton
                        active={activeTab === 'security'}
                        onClick={() => setActiveTab('security')}
                    >
                        <HiOutlineLockClosed /> 安全设置
                    </MenuButton>
                    <MenuButton
                        active={activeTab === 'preferences'}
                        onClick={() => setActiveTab('preferences')}
                    >
                        <HiOutlineHeart /> 兴趣喜好
                    </MenuButton>
                    <MenuButton
                        active={activeTab === 'notifications'}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <HiOutlineBell /> 通知设置
                    </MenuButton>
                </SideMenu>

                <MainContent>
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
                                                    option.value ===
                                                    user.subject
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
                                        <Button
                                            type="reset"
                                            variation="secondary"
                                        >
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

                            {/* 分类显示兴趣标签 */}
                            {user.interests.length > 0 ? (
                                <InterestCategories>
                                    {Object.entries(groupedInterests).map(
                                        ([category, interests]) => (
                                            <CategoryBox
                                                key={category}
                                                category={category}
                                            >
                                                <CategoryTitle>
                                                    {getCategoryIcon(category)}
                                                    {getCategoryName(category)}
                                                </CategoryTitle>
                                                <TagsContainer>
                                                    {interests.map(
                                                        (interest) => (
                                                            <TagItem
                                                                key={interest}
                                                            >
                                                                <InterestTag
                                                                    category={
                                                                        category
                                                                    }
                                                                >
                                                                    {interest}
                                                                </InterestTag>
                                                                <Button
                                                                    size="small"
                                                                    variation="danger"
                                                                    onClick={() =>
                                                                        handleRemoveInterest(
                                                                            interest
                                                                        )
                                                                    }
                                                                >
                                                                    <HiOutlineMinusCircle />
                                                                </Button>
                                                            </TagItem>
                                                        )
                                                    )}
                                                </TagsContainer>
                                            </CategoryBox>
                                        )
                                    )}
                                </InterestCategories>
                            ) : (
                                <EmptyTagsMessage>
                                    您还没有添加任何兴趣标签，请在下方添加您的兴趣和专长
                                </EmptyTagsMessage>
                            )}

                            {/* 新增兴趣表单 */}
                            <NewInterestSection>
                                <SectionSubTitle>
                                    添加新兴趣和专长
                                </SectionSubTitle>
                                <FormRow>
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '1rem',
                                            width: '100%',
                                        }}
                                    >
                                        <AutocompleteContainer>
                                            <InputWithIcon>
                                                <HiOutlineSearch />
                                                <Input
                                                    ref={inputRef}
                                                    type="text"
                                                    id="newInterest"
                                                    placeholder="输入或搜索兴趣标签"
                                                    value={inputValue}
                                                    onChange={(e) => {
                                                        setInputValue(
                                                            e.target.value
                                                        )
                                                        setShowSuggestions(true)
                                                        setHighlightedIndex(-1)
                                                    }}
                                                    onFocus={() =>
                                                        setShowSuggestions(true)
                                                    }
                                                    onBlur={() => {
                                                        setTimeout(
                                                            () =>
                                                                setShowSuggestions(
                                                                    false
                                                                ),
                                                            200
                                                        )
                                                    }}
                                                    onKeyDown={handleKeyDown}
                                                />
                                            </InputWithIcon>

                                            {showSuggestions && (
                                                <AutocompleteDropdown>
                                                    {filteredSuggestions.length >
                                                    0 ? (
                                                        filteredSuggestions.map(
                                                            (
                                                                suggestion,
                                                                index
                                                            ) => (
                                                                <AutocompleteItem
                                                                    key={
                                                                        suggestion
                                                                    }
                                                                    highlighted={
                                                                        index ===
                                                                        highlightedIndex
                                                                    }
                                                                    onMouseEnter={() =>
                                                                        setHighlightedIndex(
                                                                            index
                                                                        )
                                                                    }
                                                                    onClick={() =>
                                                                        handleSuggestionClick(
                                                                            suggestion
                                                                        )
                                                                    }
                                                                >
                                                                    {suggestion}
                                                                </AutocompleteItem>
                                                            )
                                                        )
                                                    ) : (
                                                        <NoResults>
                                                            {inputValue
                                                                ? '没有找到匹配的标签，按回车创建新标签'
                                                                : '输入关键词搜索标签'}
                                                        </NoResults>
                                                    )}
                                                </AutocompleteDropdown>
                                            )}
                                        </AutocompleteContainer>

                                        <Button
                                            onClick={handleAddInterest}
                                            disabled={!inputValue.trim()}
                                        >
                                            <HiOutlinePlusCircle /> 添加
                                        </Button>
                                    </div>
                                </FormRow>

                                {/* 快速添加推荐标签 */}
                                <SectionSubTitle>推荐标签</SectionSubTitle>
                                <QuickAddTags>
                                    {getRecommendedTags().map((tag) => (
                                        <QuickAddTag
                                            key={tag}
                                            onClick={() =>
                                                handleQuickAddClick(tag)
                                            }
                                        >
                                            <HiOutlinePlusCircle /> {tag}
                                        </QuickAddTag>
                                    ))}
                                </QuickAddTags>
                            </NewInterestSection>
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
                                        user.notifications
                                            .resourceRecommendations
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
                                    checked={
                                        user.notifications.communityUpdates
                                    }
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
                                <Button onClick={handleUserUpdate}>
                                    保存设置
                                </Button>
                            </FormRow>
                        </AccountSection>
                    )}
                </MainContent>
            </StyledAccount>
        </>
    )
}

export default Account
