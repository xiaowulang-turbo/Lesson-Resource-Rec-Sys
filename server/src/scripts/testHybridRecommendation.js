/**
 * 混合推荐算法测试脚本
 * 用于测试基于内容的推荐、协同过滤推荐以及混合推荐算法的效果
 */

import {
    contentBasedRecommendation,
    collaborativeFilteringRecommendation,
    hybridRecommendation,
} from '../recommendation/algorithms.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 用户数据文件路径
const USERS_PATH = path.join(__dirname, '../data/users.json')

/**
 * 加载用户数据
 * @returns {Array} 用户数据数组
 */
const loadUsersData = () => {
    try {
        const jsonData = fs.readFileSync(USERS_PATH, 'utf8')
        return JSON.parse(jsonData)
    } catch (error) {
        console.error('加载用户数据失败:', error)
        return []
    }
}

/**
 * 打印推荐结果
 */
const printRecommendations = (result, algorithm = '未指定') => {
    console.log('\n==================================================')
    console.log(`算法: ${algorithm}`)
    console.log(`结果状态: ${result.success ? '成功' : '失败'}`)
    console.log(`消息: ${result.message}`)
    console.log('==================================================')

    if (result.recommendations && result.recommendations.length > 0) {
        console.log('推荐资源:')
        result.recommendations.forEach((resource, index) => {
            console.log(`\n${index + 1}. ${resource.title}`)
            console.log(`   学科: ${resource.subject || '未指定'}`)
            console.log(`   难度: ${resource.difficulty || '未指定'}`)
            console.log(`   评分: ${resource.averageRating || '未评分'}`)
            console.log(`   选课人数: ${resource.enrollCount || 0}`)
            console.log(
                `   推荐得分: ${resource.score?.toFixed(2) || '无得分'}`
            )
            console.log(
                `   推荐原因: ${resource.recommendation_reason || '未提供'}`
            )
        })
    } else {
        console.log('没有找到推荐资源')
    }

    console.log('\n==================================================\n')
}

/**
 * 比较不同算法的推荐结果
 * @param {Object} user 用户对象
 * @param {Number} limit 推荐数量限制
 */
const compareRecommendations = (user, limit = 10) => {
    console.log(
        `\n===== 用户: ${user.username} (${user.teaching_subject}) 的推荐比较 =====\n`
    )

    // 1. 基于内容的推荐
    console.log('===== 基于内容的推荐 =====')
    const contentResult = contentBasedRecommendation(user, limit)
    printRecommendations(contentResult, '基于内容')

    // 2. 协同过滤推荐
    console.log('===== 协同过滤推荐 =====')
    const collaborativeResult = collaborativeFilteringRecommendation(
        user,
        limit
    )
    printRecommendations(collaborativeResult, '协同过滤')

    // 3. 混合推荐 (内容权重大)
    console.log('===== 混合推荐 (内容权重: 0.7, 协同过滤权重: 0.3) =====')
    const hybridResult1 = hybridRecommendation(user, limit, {
        content: 0.7,
        collaborative: 0.3,
    })
    printRecommendations(hybridResult1, '混合(内容偏重)')

    // 4. 混合推荐 (协同过滤权重大)
    console.log('===== 混合推荐 (内容权重: 0.3, 协同过滤权重: 0.7) =====')
    const hybridResult2 = hybridRecommendation(user, limit, {
        content: 0.3,
        collaborative: 0.7,
    })
    printRecommendations(hybridResult2, '混合(协同过滤偏重)')

    // 5. 平衡混合推荐
    console.log('===== 平衡混合推荐 (内容权重: 0.5, 协同过滤权重: 0.5) =====')
    const hybridResult3 = hybridRecommendation(user, limit, {
        content: 0.5,
        collaborative: 0.5,
    })
    printRecommendations(hybridResult3, '混合(平衡)')

    // 分析推荐结果重叠情况
    analyzeRecommendationOverlap(
        contentResult.recommendations,
        collaborativeResult.recommendations,
        hybridResult3.recommendations
    )
}

/**
 * 分析不同推荐结果的重叠情况
 */
const analyzeRecommendationOverlap = (
    contentRecs,
    collaborativeRecs,
    hybridRecs
) => {
    if (!contentRecs || !collaborativeRecs || !hybridRecs) {
        console.log('无法分析重叠情况: 缺少完整推荐结果')
        return
    }

    // 安全地获取资源ID列表
    const safeToString = (val) => {
        if (val === undefined || val === null) return ''
        return val.toString()
    }

    const contentIds = contentRecs.map((r) => safeToString(r.id))
    const collaborativeIds = collaborativeRecs.map((r) => safeToString(r.id))
    const hybridIds = hybridRecs.map((r) => safeToString(r.id))

    // 过滤掉空字符串的ID
    const validContentIds = contentIds.filter((id) => id !== '')
    const validCollaborativeIds = collaborativeIds.filter((id) => id !== '')
    const validHybridIds = hybridIds.filter((id) => id !== '')

    // 计算重叠
    const contentCollaborativeOverlap = validContentIds.filter((id) =>
        validCollaborativeIds.includes(id)
    )
    const contentHybridOverlap = validContentIds.filter((id) =>
        validHybridIds.includes(id)
    )
    const collaborativeHybridOverlap = validCollaborativeIds.filter((id) =>
        validHybridIds.includes(id)
    )
    const allThreeOverlap = validContentIds.filter(
        (id) =>
            validCollaborativeIds.includes(id) && validHybridIds.includes(id)
    )

    console.log('\n===== 推荐结果重叠分析 =====')
    console.log(`基于内容推荐资源数: ${validContentIds.length}`)
    console.log(`协同过滤推荐资源数: ${validCollaborativeIds.length}`)
    console.log(`混合推荐资源数: ${validHybridIds.length}`)
    console.log(
        `基于内容和协同过滤共同推荐: ${contentCollaborativeOverlap.length} 个资源`
    )
    console.log(`基于内容和混合共同推荐: ${contentHybridOverlap.length} 个资源`)
    console.log(
        `协同过滤和混合共同推荐: ${collaborativeHybridOverlap.length} 个资源`
    )
    console.log(`三种算法共同推荐: ${allThreeOverlap.length} 个资源`)

    // 如果混合推荐为空，则跳过分析
    if (validHybridIds.length === 0) {
        console.log('混合推荐为空，跳过组成分析')
        return
    }

    // 混合推荐的组成分析
    const uniqueFromContent = validHybridIds.filter(
        (id) =>
            validContentIds.includes(id) && !validCollaborativeIds.includes(id)
    ).length
    const uniqueFromCollaborative = validHybridIds.filter(
        (id) =>
            !validContentIds.includes(id) && validCollaborativeIds.includes(id)
    ).length

    console.log('\n===== 混合推荐组成分析 =====')
    console.log(`来自基于内容独有推荐: ${uniqueFromContent} 个资源`)
    console.log(`来自协同过滤独有推荐: ${uniqueFromCollaborative} 个资源`)
    console.log(`来自两者共同推荐: ${allThreeOverlap.length} 个资源`)
    console.log(
        `混合算法独有推荐: ${
            validHybridIds.length -
            uniqueFromContent -
            uniqueFromCollaborative -
            allThreeOverlap.length
        } 个资源`
    )
}

// 主函数
const main = () => {
    console.log('===== 混合推荐算法测试 =====')

    // 加载用户数据
    const users = loadUsersData()
    if (!users || users.length === 0) {
        console.error('无法加载用户数据')
        return
    }

    // 选择几个不同类型的用户进行测试
    const testUsers = [
        users.find((u) => u.user_id === '1001'), // 张老师 (计算机科学)
        users.find((u) => u.user_id === '1003'), // 王老师 (英语)
        users.find((u) => u.user_id === '1005'), // 刘老师 (物理)
    ]

    // 为每个测试用户对比不同推荐算法的结果
    testUsers.forEach((user) => {
        if (user) {
            compareRecommendations(user, 5) // 限制为5个推荐，便于对比
        }
    })
}

// 运行测试
main()
