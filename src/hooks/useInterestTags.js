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
                        // 计算机科学
                        '人工智能',
                        '机器学习',
                        '深度学习',
                        '软件工程',
                        'Python',
                        'JavaScript',
                        'Web开发',
                        '数据科学',
                        '算法',
                        '数据结构',

                        // 数学
                        '高等数学',
                        '线性代数',
                        '概率统计',
                        '数学建模',
                        '微积分',

                        // 几何
                        '几何',
                        '解析几何',
                        '立体几何',

                        // 函数分析
                        '函数',
                        '三角函数',
                        '数列',

                        // 物理
                        '物理',
                        '力学',
                        '电磁学',
                        '量子力学',

                        // 工程技术
                        '机械工程',
                        '电气工程',
                        '自动化',

                        // 教学教育
                        '教学设计',
                        '课程设计',
                        '教育技术',
                        '高考复习',
                        '竞赛数学',

                        // 语言学习
                        '英语',
                        '日语',
                        '韩语',
                        '翻译',

                        // 经济管理
                        '经济学',
                        '管理学',
                        '金融',
                        '市场营销',

                        // 人文社科
                        '历史',
                        '哲学',
                        '心理学',
                        '文学',

                        // 艺术创作
                        '设计',
                        '摄影',
                        '绘画',
                        '音乐',

                        // 体育运动
                        '体育',
                        '健身',
                        '跑步',
                        '篮球',
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
                    // 计算机科学
                    '人工智能',
                    '机器学习',
                    '深度学习',
                    '软件工程',
                    'Python',
                    'JavaScript',
                    'Web开发',
                    '数据科学',
                    '算法',
                    '数据结构',

                    // 数学
                    '高等数学',
                    '线性代数',
                    '概率统计',
                    '数学建模',
                    '微积分',

                    // 几何
                    '几何',
                    '解析几何',
                    '立体几何',

                    // 函数分析
                    '函数',
                    '三角函数',
                    '数列',

                    // 物理
                    '物理',
                    '力学',
                    '电磁学',
                    '量子力学',

                    // 工程技术
                    '机械工程',
                    '电气工程',
                    '自动化',

                    // 教学教育
                    '教学设计',
                    '课程设计',
                    '教育技术',
                    '高考复习',
                    '竞赛数学',

                    // 语言学习
                    '英语',
                    '日语',
                    '韩语',
                    '翻译',

                    // 经济管理
                    '经济学',
                    '管理学',
                    '金融',
                    '市场营销',

                    // 人文社科
                    '历史',
                    '哲学',
                    '心理学',
                    '文学',

                    // 艺术创作
                    '设计',
                    '摄影',
                    '绘画',
                    '音乐',

                    // 体育运动
                    '体育',
                    '健身',
                    '跑步',
                    '篮球',
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

    // 兴趣分类函数 - 优化版本
    const getInterestCategory = (interest) => {
        const interestLower = interest.toLowerCase()

        // 计算机科学和技术
        const computerScienceTerms = [
            '软件工程',
            '计算机',
            '编程',
            '程序设计',
            'java',
            'python',
            'javascript',
            'web开发',
            '前端',
            '后端',
            '数据库',
            '算法',
            '数据结构',
            'ai',
            '人工智能',
            '机器学习',
            '深度学习',
            '大数据',
            '云计算',
            '网络安全',
            '区块链',
            '物联网',
            'iot',
            '移动开发',
            'app开发',
            '游戏开发',
            '软件测试',
            '运维',
            'devops',
            '架构设计',
            '系统设计',
            '计算机网络',
            '操作系统',
        ]

        // 数学相关
        const mathematicsTerms = [
            '数学',
            '高等数学',
            '线性代数',
            '概率论',
            '数理统计',
            '微积分',
            '离散数学',
            '数值分析',
            '运筹学',
            '数学建模',
            '统计学',
            '概率统计',
            '数论',
            '组合数学',
            '图论',
            '拓扑学',
        ]

        // 几何学
        const geometryTerms = [
            '几何',
            '解析几何',
            '立体几何',
            '平面几何',
            '空间几何',
            '微分几何',
            '代数几何',
            '非欧几何',
            '投影几何',
            '计算几何',
        ]

        // 函数和分析
        const analysisTerms = [
            '函数',
            '三角函数',
            '指数函数',
            '对数函数',
            '反函数',
            '复变函数',
            '实分析',
            '复分析',
            '泛函分析',
            '调和分析',
            '数列',
            '级数',
            '极限',
            '导数',
            '积分',
            '微分方程',
        ]

        // 物理学
        const physicsTerms = [
            '物理',
            '力学',
            '电磁学',
            '光学',
            '热力学',
            '量子力学',
            '相对论',
            '天体物理',
            '凝聚态物理',
            '原子物理',
            '核物理',
            '粒子物理',
            '等离子体物理',
            '生物物理',
            '医学物理',
        ]

        // 化学
        const chemistryTerms = [
            '化学',
            '有机化学',
            '无机化学',
            '物理化学',
            '分析化学',
            '生物化学',
            '材料化学',
            '环境化学',
            '药物化学',
            '化工',
        ]

        // 生物学
        const biologyTerms = [
            '生物',
            '分子生物学',
            '细胞生物学',
            '遗传学',
            '生态学',
            '进化生物学',
            '神经生物学',
            '微生物学',
            '植物学',
            '动物学',
            '生物技术',
            '生物信息学',
            '系统生物学',
            '合成生物学',
        ]

        // 工程技术
        const engineeringTerms = [
            '工程',
            '机械工程',
            '电气工程',
            '电子工程',
            '土木工程',
            '化学工程',
            '材料工程',
            '环境工程',
            '生物工程',
            '航空工程',
            '汽车工程',
            '能源工程',
            '通信工程',
            '控制工程',
            '自动化',
        ]

        // 经济管理
        const economicsTerms = [
            '经济',
            '管理',
            '金融',
            '会计',
            '市场营销',
            '人力资源',
            '运营管理',
            '项目管理',
            '战略管理',
            '供应链',
            '商业分析',
            '投资',
            '银行',
            '保险',
            '国际贸易',
            '电子商务',
        ]

        // 人文社科
        const humanitiesTerms = [
            '文学',
            '历史',
            '哲学',
            '心理学',
            '社会学',
            '政治学',
            '法学',
            '语言学',
            '传播学',
            '新闻学',
            '艺术',
            '设计',
            '音乐',
            '美术',
            '文化',
            '教育学',
            'pedagogy',
        ]

        // 教学和教育
        const teachingTerms = [
            '教学设计',
            '课程设计',
            '教育技术',
            '在线教育',
            '混合式学习',
            '教学方法',
            '教学评估',
            '教育心理',
            '学习理论',
            '教师培训',
            '高考复习',
            '中考复习',
            '竞赛数学',
            '奥数',
            '学科竞赛',
            '课堂管理',
            '学生评价',
            '教育测量',
            '教学研究',
            '教育创新',
        ]

        // 语言学习
        const languageTerms = [
            '英语',
            '日语',
            '韩语',
            '法语',
            '德语',
            '西班牙语',
            '俄语',
            '阿拉伯语',
            '意大利语',
            '葡萄牙语',
            '汉语',
            '中文',
            '语言学习',
            '翻译',
            '口语',
            '听力',
            '阅读',
            '写作',
        ]

        // 艺术创作
        const artsTerms = [
            '绘画',
            '摄影',
            '雕塑',
            '书法',
            '陶艺',
            '手工',
            'diy',
            '创意设计',
            '平面设计',
            'ui设计',
            'ux设计',
            '工业设计',
            '建筑设计',
            '室内设计',
            '服装设计',
            '游戏设计',
        ]

        // 体育运动
        const sportsTerms = [
            '体育',
            '运动',
            '健身',
            '跑步',
            '游泳',
            '篮球',
            '足球',
            '网球',
            '羽毛球',
            '乒乓球',
            '瑜伽',
            '健美',
            '武术',
            '登山',
            '骑行',
            '滑雪',
            '冲浪',
            '马拉松',
        ]

        // 分类匹配逻辑 - 使用包含关系而不是精确匹配
        const checkMatch = (terms) => {
            return terms.some(
                (term) =>
                    interestLower.includes(term.toLowerCase()) ||
                    term.toLowerCase().includes(interestLower)
            )
        }

        if (checkMatch(computerScienceTerms)) return 'computer'
        if (checkMatch(mathematicsTerms)) return 'mathematics'
        if (checkMatch(geometryTerms)) return 'geometry'
        if (checkMatch(analysisTerms)) return 'analysis'
        if (checkMatch(physicsTerms)) return 'physics'
        if (checkMatch(chemistryTerms)) return 'chemistry'
        if (checkMatch(biologyTerms)) return 'biology'
        if (checkMatch(engineeringTerms)) return 'engineering'
        if (checkMatch(economicsTerms)) return 'economics'
        if (checkMatch(humanitiesTerms)) return 'humanities'
        if (checkMatch(teachingTerms)) return 'teaching'
        if (checkMatch(languageTerms)) return 'language'
        if (checkMatch(artsTerms)) return 'arts'
        if (checkMatch(sportsTerms)) return 'sports'

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
