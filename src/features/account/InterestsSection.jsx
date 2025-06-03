import { useRef, useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import Button from '../../ui/Button'
import FormRow from '../../ui/FormRow'
import Input from '../../ui/Input'
import {
    HiOutlineHeart,
    HiOutlinePlusCircle,
    HiOutlineMinusCircle,
    HiOutlineStar,
    HiOutlineChartBar,
    HiOutlineBookOpen,
    HiOutlineLightBulb,
} from 'react-icons/hi2'
import { HiOutlineSearch } from 'react-icons/hi'
import Tag from '../../ui/Tag'
import useInterestTags from '../../hooks/useInterestTags'
import { debounce } from '../../utils/debounce'

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
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 2rem;
`

const CategoryBox = styled.div`
    border: 1px solid var(--color-grey-200);
    border-radius: var(--border-radius-md);
    padding: 1.2rem;
    background-color: ${(props) =>
        props.category === 'geometry'
            ? 'var(--color-indigo-100)'
            : props.category === 'function'
            ? 'var(--color-blue-100)'
            : props.category === 'statistics'
            ? 'var(--color-green-100)'
            : props.category === 'teaching'
            ? 'var(--color-yellow-100)'
            : 'var(--color-grey-50)'};
`

const CategoryTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 0.8rem;
    color: var(--color-grey-700);
`

const EmptyTagsMessage = styled.div`
    text-align: center;
    color: var(--color-grey-500);
    padding: 2rem;
    font-size: 1.6rem;
`

const NewInterestSection = styled.div`
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-grey-200);
`

const SectionSubTitle = styled.h3`
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 1.2rem;
    color: var(--color-grey-700);
`

const AutocompleteContainer = styled.div`
    position: relative;
    flex-grow: 1;
`

const InputWithIcon = styled.div`
    position: relative;

    svg {
        position: absolute;
        top: 50%;
        left: 1rem;
        transform: translateY(-50%);
        color: var(--color-grey-500);
        width: 2rem;
        height: 2rem;
    }

    input {
        padding-left: 3.6rem;
    }

    .search-loading {
        position: absolute;
        top: 50%;
        right: 1rem;
        transform: translateY(-50%);
        width: 1.6rem;
        height: 1.6rem;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: translateY(-50%) rotate(0deg);
        }
        100% {
            transform: translateY(-50%) rotate(360deg);
        }
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
    z-index: 10;
`

const SuggestionItem = styled.div`
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    background-color: ${(props) =>
        props.highlighted ? 'var(--color-brand-100)' : 'transparent'};

    &:hover {
        background-color: var(--color-brand-100);
    }
`

const NoResults = styled.div`
    padding: 1rem;
    color: var(--color-grey-500);
    text-align: center;
    font-style: italic;
`

const QuickAddTags = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 1.2rem;
`

const QuickAddTag = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1rem;
    background-color: var(--color-grey-100);
    color: var(--color-grey-700);
    border-radius: var(--border-radius-sm);
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: var(--color-brand-100);
        transform: translateY(-1px);
    }

    svg {
        width: 1.6rem;
        height: 1.6rem;
    }
`

function InterestsSection({ user, onUpdate }) {
    const inputRef = useRef(null)
    const interestTags = useInterestTags()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filteredSuggestions, setFilteredSuggestions] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [localInputValue, setLocalInputValue] = useState('')

    const {
        inputValue,
        setInputValue,
        showSuggestions,
        highlightedIndex,
        setHighlightedIndex,
        handleInputChange,
        handleSuggestionsVisibility,
        getInterestCategory,
        groupInterestsByCategory,
        getRecommendedTags,
        getFilteredSuggestions,
    } = interestTags

    // 防抖处理搜索输入
    const debouncedHandleSearch = useCallback(
        debounce((value) => {
            if (!value) {
                setFilteredSuggestions([])
                return
            }

            try {
                setIsSearching(true)
                getFilteredSuggestions(
                    interestTags.availableInterests,
                    value,
                    user?.interests || []
                )
                    .then((suggestions) => {
                        setFilteredSuggestions(suggestions)
                        setIsSearching(false)
                    })
                    .catch((err) => {
                        console.error('获取建议标签失败:', err)
                        setFilteredSuggestions([])
                        setIsSearching(false)
                    })
            } catch (err) {
                console.error('处理搜索输入时出错:', err)
                setFilteredSuggestions([])
                setIsSearching(false)
            }
        }, 300),
        [
            getFilteredSuggestions,
            interestTags.availableInterests,
            user?.interests,
        ]
    )

    // 处理输入变化
    const handleLocalInputChange = (e) => {
        const value = e.target.value
        setLocalInputValue(value)
        setInputValue(value)
        debouncedHandleSearch(value)
    }

    useEffect(() => {
        // 当用户数据加载完成后
        if (user && user.interests) {
            setIsLoading(false)
        } else {
            // 如果没有user数据，尝试从API获取
            const fetchUserData = async () => {
                try {
                    setIsLoading(true)
                    setError(null)
                    // 这里可以根据实际API调用获取用户数据
                    // 示例：const userData = await getCurrentUser();
                    // 等待数据加载完成
                    setIsLoading(false)
                } catch (err) {
                    console.error('加载用户数据时出错:', err)
                    setError('加载用户数据失败，请稍后再试')
                    setIsLoading(false)
                }
            }

            fetchUserData()
        }
    }, [user])

    // 添加组件卸载时的清理逻辑
    useEffect(() => {
        // 组件挂载时初始化
        if (localInputValue === '' && inputValue !== '') {
            setLocalInputValue(inputValue)
        }

        // 组件卸载时清理
        return () => {
            // 取消任何正在进行的防抖搜索
            debouncedHandleSearch.cancel && debouncedHandleSearch.cancel()
        }
    }, [inputValue, localInputValue, debouncedHandleSearch])

    // 处理添加兴趣
    const handleAddInterest = useCallback(() => {
        const interestToAdd = localInputValue.trim()
        if (
            interestToAdd &&
            user?.interests &&
            !user.interests.includes(interestToAdd)
        ) {
            // 如果输入的兴趣不在可用列表中，添加到可用列表
            interestTags.addToAvailableInterests(interestToAdd)

            // 直接更新interests数组
            const updatedInterests = [...(user.interests || []), interestToAdd]
            onUpdate({
                interests: updatedInterests,
            })

            setLocalInputValue('')
            setInputValue('')
            handleSuggestionsVisibility(false)
            setHighlightedIndex(-1)
        }
    }, [
        localInputValue,
        user?.interests,
        interestTags,
        onUpdate,
        setLocalInputValue,
        setInputValue,
        handleSuggestionsVisibility,
        setHighlightedIndex,
    ])

    // 处理键盘导航
    const handleKeyDown = useCallback(
        (e) => {
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
                        setLocalInputValue(
                            filteredSuggestions[highlightedIndex]
                        )
                        setInputValue(filteredSuggestions[highlightedIndex])
                        setTimeout(() => {
                            const interestToAdd =
                                filteredSuggestions[highlightedIndex]
                            if (
                                interestToAdd &&
                                user?.interests &&
                                !user.interests.includes(interestToAdd)
                            ) {
                                onUpdate({
                                    interests: [
                                        ...user.interests,
                                        interestToAdd,
                                    ],
                                })
                                setLocalInputValue('')
                                setInputValue('')
                            }
                        }, 0)
                    } else {
                        handleAddInterest()
                    }
                    handleSuggestionsVisibility(false)
                    setHighlightedIndex(-1)
                    break
                case 'Escape':
                    handleSuggestionsVisibility(false)
                    setHighlightedIndex(-1)
                    break
                default:
                    break
            }
        },
        [
            showSuggestions,
            filteredSuggestions,
            highlightedIndex,
            user?.interests,
            handleAddInterest,
            handleSuggestionsVisibility,
            setHighlightedIndex,
            setLocalInputValue,
            setInputValue,
            onUpdate,
        ]
    )

    // 点击建议项
    const handleSuggestionClick = useCallback(
        (suggestion) => {
            setLocalInputValue(suggestion)
            setInputValue(suggestion)
            setTimeout(() => {
                if (
                    suggestion &&
                    user?.interests &&
                    !user.interests.includes(suggestion)
                ) {
                    onUpdate({
                        interests: [...user.interests, suggestion],
                    })
                    setLocalInputValue('')
                    setInputValue('')
                }
            }, 0)
            handleSuggestionsVisibility(false)
        },
        [
            user?.interests,
            onUpdate,
            setLocalInputValue,
            setInputValue,
            handleSuggestionsVisibility,
        ]
    )

    // 处理快速添加标签
    const handleQuickAddTag = useCallback(
        (tag) => {
            if (user?.interests && !user.interests.includes(tag)) {
                // 直接更新interests数组
                const updatedInterests = [...user.interests, tag]
                onUpdate({
                    interests: updatedInterests,
                })
                setLocalInputValue('')
                setInputValue('')
            }
        },
        [user?.interests, onUpdate, setLocalInputValue, setInputValue]
    )

    // 处理移除兴趣
    const handleRemoveInterest = useCallback(
        (interest) => {
            if (user?.interests) {
                // 直接更新interests数组
                const updatedInterests = user.interests.filter(
                    (item) => item !== interest
                )
                onUpdate({
                    interests: updatedInterests,
                })
            }
        },
        [user?.interests, onUpdate]
    )

    // 根据分类获取图标
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'computer':
                return <HiOutlineLightBulb />
            case 'mathematics':
                return <HiOutlineChartBar />
            case 'geometry':
                return <HiOutlineStar />
            case 'analysis':
                return <HiOutlineChartBar />
            case 'physics':
                return <HiOutlineLightBulb />
            case 'chemistry':
                return <HiOutlineLightBulb />
            case 'biology':
                return <HiOutlineHeart />
            case 'engineering':
                return <HiOutlineLightBulb />
            case 'economics':
                return <HiOutlineChartBar />
            case 'humanities':
                return <HiOutlineBookOpen />
            case 'teaching':
                return <HiOutlineBookOpen />
            case 'language':
                return <HiOutlineBookOpen />
            case 'arts':
                return <HiOutlineHeart />
            case 'sports':
                return <HiOutlineHeart />
            default:
                return <HiOutlineLightBulb />
        }
    }

    // 获取分类名称
    const getCategoryName = (category) => {
        switch (category) {
            case 'computer':
                return '💻 计算机科学'
            case 'mathematics':
                return '🔢 数学'
            case 'geometry':
                return '📐 几何学'
            case 'analysis':
                return '📈 函数分析'
            case 'physics':
                return '⚛️ 物理学'
            case 'chemistry':
                return '🧪 化学'
            case 'biology':
                return '🧬 生物学'
            case 'engineering':
                return '⚙️ 工程技术'
            case 'economics':
                return '💰 经济管理'
            case 'humanities':
                return '📚 人文社科'
            case 'teaching':
                return '👨‍🏫 教学教育'
            case 'language':
                return '🌐 语言学习'
            case 'arts':
                return '🎨 艺术创作'
            case 'sports':
                return '🏃‍♂️ 体育运动'
            default:
                return '🔖 其他'
        }
    }

    // 将兴趣按分类进行分组
    const groupedInterests =
        user?.interests?.length > 0
            ? groupInterestsByCategory(user.interests)
            : {}

    if (isLoading) {
        return <EmptyTagsMessage>正在加载兴趣标签数据...</EmptyTagsMessage>
    }

    if (error) {
        return <EmptyTagsMessage>{error}</EmptyTagsMessage>
    }

    return (
        <AccountSection>
            <SectionHeader>
                <SectionIcon>
                    <HiOutlineHeart />
                    <h2>兴趣与专长</h2>
                </SectionIcon>
            </SectionHeader>

            {/* 分类显示兴趣标签 */}
            {user?.interests && user.interests.length > 0 ? (
                <InterestCategories>
                    {Object.entries(groupedInterests).map(
                        ([category, interests]) => (
                            <CategoryBox key={category} category={category}>
                                <CategoryTitle>
                                    {getCategoryIcon(category)}
                                    {getCategoryName(category)}
                                </CategoryTitle>
                                <TagsContainer>
                                    {interests.map((interest) => (
                                        <TagItem key={interest}>
                                            <InterestTag category={category}>
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
                                    ))}
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
                <SectionSubTitle>添加新兴趣和专长</SectionSubTitle>
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
                                    value={localInputValue}
                                    onChange={handleLocalInputChange}
                                    onFocus={() =>
                                        handleSuggestionsVisibility(true)
                                    }
                                    onBlur={() =>
                                        handleSuggestionsVisibility(false)
                                    }
                                    onKeyDown={handleKeyDown}
                                />
                                {isSearching && (
                                    <div className="search-loading">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"
                                                stroke="var(--color-brand-600)"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </InputWithIcon>

                            {showSuggestions && (
                                <AutocompleteDropdown>
                                    {isSearching ? (
                                        <NoResults>正在搜索标签...</NoResults>
                                    ) : filteredSuggestions.length > 0 ? (
                                        filteredSuggestions.map(
                                            (suggestion, index) => (
                                                <SuggestionItem
                                                    key={suggestion}
                                                    highlighted={
                                                        index ===
                                                        highlightedIndex
                                                    }
                                                    onMouseDown={() =>
                                                        handleSuggestionClick(
                                                            suggestion
                                                        )
                                                    }
                                                >
                                                    {suggestion}
                                                </SuggestionItem>
                                            )
                                        )
                                    ) : (
                                        <NoResults>
                                            {localInputValue
                                                ? `没有找到匹配"${localInputValue}"的标签，按回车创建新标签`
                                                : '输入关键词搜索标签'}
                                        </NoResults>
                                    )}
                                </AutocompleteDropdown>
                            )}
                        </AutocompleteContainer>

                        <Button
                            onClick={handleAddInterest}
                            disabled={!localInputValue.trim()}
                        >
                            <HiOutlinePlusCircle /> 添加
                        </Button>
                    </div>
                </FormRow>

                {/* 快速添加推荐标签 */}
                <SectionSubTitle>推荐标签</SectionSubTitle>
                <QuickAddTags>
                    {getRecommendedTags(user?.interests || []).map((tag) => (
                        <QuickAddTag
                            key={tag}
                            onClick={() => handleQuickAddTag(tag)}
                        >
                            <HiOutlinePlusCircle /> {tag}
                        </QuickAddTag>
                    ))}
                </QuickAddTags>
            </NewInterestSection>
        </AccountSection>
    )
}

export default InterestsSection
