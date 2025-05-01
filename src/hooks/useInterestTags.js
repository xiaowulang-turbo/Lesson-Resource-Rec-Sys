import { useState, useEffect } from 'react'
import { getAllInterestTags, searchInterestTags } from '../services/apiTags'

function useInterestTags() {
    const [availableInterests, setAvailableInterests] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    // 加载可用标签数据
    useEffect(() => {
        const fetchInterests = async () => {
            try {
                setIsLoading(true)
                setError(null)

                // 这里从localStorage获取缓存的标签
                const cachedInterests =
                    localStorage.getItem('availableInterests')

                if (cachedInterests) {
                    setAvailableInterests(JSON.parse(cachedInterests))

                    // 即使有缓存，也异步获取最新数据
                    try {
                        const freshTags = await getAllInterestTags()
                        if (freshTags && freshTags.length > 0) {
                            const tagNames = freshTags.map((tag) => tag.name)
                            setAvailableInterests(tagNames)
                            localStorage.setItem(
                                'availableInterests',
                                JSON.stringify(tagNames)
                            )
                        }
                    } catch (err) {
                        console.log('使用缓存数据，后台刷新失败:', err)
                    }

                    setIsLoading(false)
                    return
                }

                // 如果没有缓存，从API获取
                const tags = await getAllInterestTags()

                if (tags && tags.length > 0) {
                    const tagNames = tags.map((tag) => tag.name)
                    setAvailableInterests(tagNames)

                    // 缓存到localStorage
                    localStorage.setItem(
                        'availableInterests',
                        JSON.stringify(tagNames)
                    )
                } else {
                    // 如果API返回为空，使用默认标签
                    const defaultInterests = [
                        '几何',
                        '解析几何',
                        '立体几何',
                        '函数',
                        '三角函数',
                        '数列',
                        '微积分',
                        '线性代数',
                        '概率统计',
                        '教学设计',
                        '高考复习',
                        '竞赛数学',
                    ]
                    setAvailableInterests(defaultInterests)

                    // 缓存到localStorage
                    localStorage.setItem(
                        'availableInterests',
                        JSON.stringify(defaultInterests)
                    )
                }
            } catch (error) {
                console.error('获取兴趣标签失败:', error)
                setError(error.message)

                // 使用默认标签作为备选
                const defaultInterests = [
                    '几何',
                    '解析几何',
                    '立体几何',
                    '函数',
                    '三角函数',
                    '数列',
                    '微积分',
                    '线性代数',
                    '概率统计',
                    '教学设计',
                    '高考复习',
                    '竞赛数学',
                ]
                setAvailableInterests(defaultInterests)

                // 缓存到localStorage
                localStorage.setItem(
                    'availableInterests',
                    JSON.stringify(defaultInterests)
                )
            } finally {
                setIsLoading(false)
            }
        }

        fetchInterests()
    }, [])

    // 搜索标签
    const searchTags = async (query) => {
        if (!query) return []

        try {
            // 先检查本地标签
            const localResults = availableInterests.filter((tag) =>
                tag.toLowerCase().includes(query.toLowerCase())
            )

            // 如果本地有5个或更多结果，就返回本地结果
            if (localResults.length >= 5) {
                return localResults.slice(0, 10) // 最多返回10个结果
            }

            // 否则搜索API
            const apiResults = await searchInterestTags(query)

            if (apiResults && apiResults.length > 0) {
                // 合并结果并去重
                const allResults = [
                    ...new Set([
                        ...localResults,
                        ...apiResults.map((tag) => tag.name),
                    ]),
                ]
                return allResults.slice(0, 10) // 最多返回10个结果
            }

            return localResults
        } catch (error) {
            console.error('搜索标签失败:', error)
            return []
        }
    }

    // 获取过滤后的建议
    const getFilteredSuggestions = async (interests, value, userInterests) => {
        if (!value) return []

        try {
            const searchResults = await searchTags(value)
            return searchResults.filter((tag) => !userInterests.includes(tag))
        } catch (error) {
            console.error('过滤标签失败:', error)
            return []
        }
    }

    // 添加新标签到可用列表
    const addToAvailableInterests = (interest) => {
        if (!availableInterests.includes(interest)) {
            const newInterests = [...availableInterests, interest]
            setAvailableInterests(newInterests)

            // 更新localStorage
            localStorage.setItem(
                'availableInterests',
                JSON.stringify(newInterests)
            )
            return true
        }
        return false
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

    // 将兴趣按分类进行分组
    const groupInterestsByCategory = (interests) => {
        return interests.reduce((acc, interest) => {
            const category = getInterestCategory(interest)
            if (!acc[category]) acc[category] = []
            acc[category].push(interest)
            return acc
        }, {})
    }

    // 获取推荐标签
    const getRecommendedTags = (userInterests) => {
        return availableInterests
            .filter((interest) => !userInterests.includes(interest))
            .slice(0, 5)
    }

    // 处理输入值变化
    const handleInputChange = (value) => {
        setInputValue(value)
        setShowSuggestions(true)
        setHighlightedIndex(-1)
    }

    // 处理建议显示/隐藏
    const handleSuggestionsVisibility = (isVisible) => {
        // 延迟关闭下拉菜单，以便点击事件可以先触发
        if (!isVisible) {
            setTimeout(() => setShowSuggestions(false), 200)
        } else {
            setShowSuggestions(true)
        }
    }

    return {
        availableInterests,
        setAvailableInterests,
        inputValue,
        setInputValue,
        showSuggestions,
        setShowSuggestions,
        highlightedIndex,
        setHighlightedIndex,
        isLoading,
        error,
        getFilteredSuggestions,
        addToAvailableInterests,
        getInterestCategory,
        groupInterestsByCategory,
        getRecommendedTags,
        handleInputChange,
        handleSuggestionsVisibility,
    }
}

export default useInterestTags
