import { useRef } from 'react'
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

function InterestsSection({ user, onUpdate }) {
    const inputRef = useRef(null)
    const interestTags = useInterestTags()
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
    } = interestTags

    // 过滤可用的兴趣标签
    const filteredSuggestions = inputValue
        ? interestTags.getFilteredSuggestions(
              interestTags.availableInterests,
              inputValue,
              user.interests
          )
        : []

    // 处理添加兴趣
    const handleAddInterest = () => {
        const interestToAdd = inputValue.trim()
        if (interestToAdd && !user.interests.includes(interestToAdd)) {
            // 如果输入的兴趣不在可用列表中，添加到可用列表
            interestTags.addToAvailableInterests(interestToAdd)

            onUpdate({
                interests: [...user.interests, interestToAdd],
            })
            setInputValue('')
            handleSuggestionsVisibility(false)
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
                            onUpdate({
                                interests: [...user.interests, interestToAdd],
                            })
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
    }

    // 点击建议项
    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion)
        setTimeout(() => {
            if (suggestion && !user.interests.includes(suggestion)) {
                onUpdate({
                    interests: [...user.interests, suggestion],
                })
                setInputValue('')
            }
        }, 0)
        handleSuggestionsVisibility(false)
        setHighlightedIndex(-1)
        inputRef.current?.focus()
    }

    // 处理快速添加标签
    const handleQuickAddClick = (tag) => {
        if (tag && !user.interests.includes(tag)) {
            onUpdate({
                interests: [...user.interests, tag],
            })
        }
    }

    const handleRemoveInterest = (interest) => {
        onUpdate({
            interests: user.interests.filter((item) => item !== interest),
        })
    }

    // 根据分类获取图标
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
    const groupedInterests = groupInterestsByCategory(user.interests)

    return (
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
                                    value={inputValue}
                                    onChange={(e) =>
                                        handleInputChange(e.target.value)
                                    }
                                    onFocus={() =>
                                        handleSuggestionsVisibility(true)
                                    }
                                    onBlur={() =>
                                        handleSuggestionsVisibility(false)
                                    }
                                    onKeyDown={handleKeyDown}
                                />
                            </InputWithIcon>

                            {showSuggestions && (
                                <AutocompleteDropdown>
                                    {filteredSuggestions.length > 0 ? (
                                        filteredSuggestions.map(
                                            (suggestion, index) => (
                                                <AutocompleteItem
                                                    key={suggestion}
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
                    {getRecommendedTags(user.interests).map((tag) => (
                        <QuickAddTag
                            key={tag}
                            onClick={() => handleQuickAddClick(tag)}
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
