const {
    contentBasedRecommendation,
    collaborativeFilteringRecommendation,
    hybridRecommendation,
    teacherResourceRecommendation,
} = require('./recommendation/algorithms')

/**
 * 打印推荐结果
 */
const printRecommendations = (result) => {
    console.log('\n==================================================')
    console.log(`结果状态: ${result.success ? '成功' : '失败'}`)
    console.log(`消息: ${result.message}`)
    console.log('==================================================')

    if (result.recommendations && result.recommendations.length > 0) {
        console.log('推荐课程:')
        result.recommendations.forEach((course, index) => {
            console.log(`\n${index + 1}. ${course.course_title}`)
            console.log(`   组织: ${course.course_organization}`)
            console.log(`   难度: ${course.course_difficulty}`)
            console.log(`   评分: ${course.course_rating}`)
            console.log(`   推荐原因: ${course.recommendation_reason}`)
        })
    } else {
        console.log('没有找到推荐课程')
    }

    console.log('\n==================================================\n')
}

// 演示示例
console.log('\n===== 备课资源推荐系统演示 =====\n')

// 基于内容的推荐示例
console.log('===== 基于内容的推荐示例 =====')
const contentBasedResult = contentBasedRecommendation('54') // "AI For Everyone" 课程
printRecommendations(contentBasedResult)

// 协同过滤推荐示例
console.log('===== 协同过滤推荐示例 =====')
const collaborativeResult = collaborativeFilteringRecommendation('1001') // 张老师
printRecommendations(collaborativeResult)

// 混合推荐示例
console.log('===== 混合推荐示例 =====')
const hybridResult = hybridRecommendation('1005') // 刘老师
printRecommendations(hybridResult)

// 教师备课资源推荐示例
console.log('===== 针对教师特定需求的备课资源推荐示例 =====')
const teacherResult = teacherResourceRecommendation('1003') // 王老师（英语教师）
printRecommendations(teacherResult)

// 不同教师类型的推荐比较
console.log('===== 不同学科教师的推荐比较 =====')

// 计算机科学教师
console.log('计算机科学教师 (张老师) 的推荐:')
const csTeacherResult = teacherResourceRecommendation('1001') // 张老师
printRecommendations(csTeacherResult)

// 医学教师
console.log('医学教师 (赵老师) 的推荐:')
const medTeacherResult = teacherResourceRecommendation('1004') // 赵老师
printRecommendations(medTeacherResult)
