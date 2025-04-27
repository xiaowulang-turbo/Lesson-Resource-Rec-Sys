import { useState, useEffect } from 'react'

function useInterestTags() {
    const [availableInterests, setAvailableInterests] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    // 加载可用标签数据
    useEffect(() => {
        // 实际应用中应该从API获取
        // const fetchInterests = async () => {
        //     try {
        //         setIsLoading(true)
        //         setError(null)
        //         const response = await fetch('/api/interests')
        //         if (!response.ok) throw new Error('获取兴趣标签失败')
        //         const data = await response.json()
        //         setAvailableInterests(data)
        //     } catch (error) {
        //         setError(error.message)
        //     } finally {
        //         setIsLoading(false)
        //     }
        // }
        // fetchInterests()
    }, [])

    // 获取过滤后的建议
    const getFilteredSuggestions = (interests, value, userInterests) => {
        return value
            ? availableInterests.filter(
                  (interest) =>
                      !userInterests.includes(interest) &&
                      interest.toLowerCase().includes(value.toLowerCase())
              )
            : []
    }

    // 添加新标签到可用列表
    const addToAvailableInterests = (interest) => {
        if (!availableInterests.includes(interest)) {
            setAvailableInterests((prev) => [...prev, interest])
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
        inputValue,
        setInputValue,
        showSuggestions,
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
