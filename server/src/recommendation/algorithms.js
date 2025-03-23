const fs = require('fs')
const path = require('path')

// 加载数据
const loadData = () => {
    try {
        const coursesData = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../data/courses.json'),
                'utf8'
            )
        )
        const usersData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf8')
        )
        const relationshipsData = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../data/course_relationships.json'),
                'utf8'
            )
        )

        return { coursesData, usersData, relationshipsData }
    } catch (error) {
        console.error('加载数据失败:', error)
        return { coursesData: [], usersData: [], relationshipsData: [] }
    }
}

/**
 * 基于内容的推荐算法
 * 根据课程的主题、技能等内容特征推荐相似课程
 */
const contentBasedRecommendation = (targetCourseId, limit = 5) => {
    const { coursesData, relationshipsData } = loadData()

    // 查找目标课程
    const targetCourse = coursesData.find(
        (course) => course.course_id === targetCourseId
    )
    if (!targetCourse) {
        return {
            success: false,
            message: `未找到ID为 ${targetCourseId} 的课程`,
            recommendations: [],
        }
    }

    // 查找课程关系数据
    const courseRelationship = relationshipsData.find(
        (relation) => relation.course_id === targetCourseId
    )

    // 如果有预先计算的相似课程数据，直接使用
    if (courseRelationship && courseRelationship.similar_courses) {
        const recommendations = courseRelationship.similar_courses
            .sort((a, b) => b.similarity_score - a.similarity_score)
            .slice(0, limit)
            .map((similarCourse) => {
                const courseDetails = coursesData.find(
                    (course) => course.course_id === similarCourse.course_id
                )
                return {
                    ...courseDetails,
                    similarity_score: similarCourse.similarity_score,
                    common_topics: similarCourse.common_topics,
                    common_skills: similarCourse.common_skills,
                    recommendation_reason: `与《${targetCourse.course_title}》有${similarCourse.common_topics.length}个共同主题和${similarCourse.common_skills.length}个共同技能`,
                }
            })

        return {
            success: true,
            message: `基于《${targetCourse.course_title}》内容特征的推荐`,
            recommendations,
        }
    }

    // 如果没有预先计算的数据，则计算相似度
    // 这里简化实现，实际应用中可以使用更复杂的相似度计算方法如余弦相似度、TF-IDF等
    const calculateSimilarity = (courseA, courseB) => {
        let score = 0
        const commonTopics = []
        const commonSkills = []

        // 比较主题
        if (courseA.course_topics && courseB.course_topics) {
            courseA.course_topics.forEach((topic) => {
                if (courseB.course_topics.includes(topic)) {
                    commonTopics.push(topic)
                    score += 0.2
                }
            })
        }

        // 比较技能
        if (courseA.course_skills && courseB.course_skills) {
            courseA.course_skills.forEach((skill) => {
                if (courseB.course_skills.includes(skill)) {
                    commonSkills.push(skill)
                    score += 0.3
                }
            })
        }

        // 比较难度
        if (courseA.course_difficulty === courseB.course_difficulty) {
            score += 0.15
        }

        // 比较组织/机构
        if (courseA.course_organization === courseB.course_organization) {
            score += 0.1
        }

        // 比较证书类型
        if (
            courseA.course_Certificate_type === courseB.course_Certificate_type
        ) {
            score += 0.05
        }

        return {
            course_id: courseB.course_id,
            similarity_score: Math.min(score, 1), // 确保分数不超过1
            common_topics: commonTopics,
            common_skills: commonSkills,
        }
    }

    // 计算所有课程的相似度
    const similarities = coursesData
        .filter((course) => course.course_id !== targetCourseId) // 排除目标课程自身
        .map((course) => calculateSimilarity(targetCourse, course))
        .filter((similarity) => similarity.similarity_score > 0) // 只保留有相似度的课程
        .sort((a, b) => b.similarity_score - a.similarity_score) // 按相似度降序排序
        .slice(0, limit) // 取指定数量的推荐

    // 获取推荐课程的完整信息
    const recommendations = similarities.map((similarity) => {
        const courseDetails = coursesData.find(
            (course) => course.course_id === similarity.course_id
        )
        return {
            ...courseDetails,
            similarity_score: similarity.similarity_score,
            common_topics: similarity.common_topics,
            common_skills: similarity.common_skills,
            recommendation_reason: `与《${targetCourse.course_title}》有${similarity.common_topics.length}个共同主题和${similarity.common_skills.length}个共同技能`,
        }
    })

    return {
        success: true,
        message: `基于《${targetCourse.course_title}》内容特征的推荐`,
        recommendations,
    }
}

/**
 * 协同过滤推荐算法
 * 基于用户行为和评分数据推荐课程
 */
const collaborativeFilteringRecommendation = (userId, limit = 5) => {
    const { coursesData, usersData, relationshipsData } = loadData()

    // 查找目标用户
    const targetUser = usersData.find((user) => user.user_id === userId)
    if (!targetUser) {
        return {
            success: false,
            message: `未找到ID为 ${userId} 的用户`,
            recommendations: [],
        }
    }

    // 获取用户已学习的课程ID列表
    const userCourseIds = targetUser.course_interactions.map(
        (interaction) => interaction.course_id
    )

    // 寻找相似用户（具有相似兴趣或已学课程的用户）
    const findSimilarUsers = () => {
        return usersData
            .filter((user) => user.user_id !== userId) // 排除目标用户自身
            .map((user) => {
                // 计算共同兴趣
                const commonInterests = targetUser.interests.filter(
                    (interest) => user.interests.includes(interest)
                )

                // 计算共同课程
                const userCoursesSet = new Set(userCourseIds)
                const otherUserCourseIds = user.course_interactions.map(
                    (interaction) => interaction.course_id
                )
                const commonCourses = otherUserCourseIds.filter((courseId) =>
                    userCoursesSet.has(courseId)
                )

                // 相似度分数：共同兴趣权重0.4，共同课程权重0.6
                const interestScore =
                    (commonInterests.length /
                        Math.max(
                            targetUser.interests.length,
                            user.interests.length
                        )) *
                    0.4
                const courseScore =
                    (commonCourses.length /
                        Math.max(
                            userCourseIds.length,
                            otherUserCourseIds.length
                        )) *
                    0.6
                const similarity = interestScore + courseScore

                return {
                    user,
                    similarity,
                    commonInterests,
                    commonCourses,
                }
            })
            .filter((result) => result.similarity > 0) // 只保留有相似度的用户
            .sort((a, b) => b.similarity - a.similarity) // 按相似度降序排序
    }

    const similarUsers = findSimilarUsers()

    // 如果没有相似用户，返回基于内容的推荐
    if (similarUsers.length === 0) {
        // 随机选择用户已学课程中的一个作为种子课程
        if (userCourseIds.length > 0) {
            const randomIndex = Math.floor(Math.random() * userCourseIds.length)
            const randomCourseId = userCourseIds[randomIndex]
            const contentRecommendations = contentBasedRecommendation(
                randomCourseId,
                limit
            )

            return {
                success: contentRecommendations.success,
                message: `未找到相似用户，${contentRecommendations.message}`,
                recommendations: contentRecommendations.recommendations,
            }
        }

        return {
            success: false,
            message: '未找到相似用户，且用户尚未学习任何课程',
            recommendations: [],
        }
    }

    // 获取相似用户喜欢的课程（从未被目标用户学习过的）
    const candidateCourses = new Map()

    similarUsers.forEach(({ user, similarity }) => {
        user.course_interactions
            .filter(
                (interaction) =>
                    !userCourseIds.includes(interaction.course_id) &&
                    interaction.rating >= 4
            )
            .forEach((interaction) => {
                // 如果课程已经在候选列表中，更新其分数
                if (candidateCourses.has(interaction.course_id)) {
                    const currentScore = candidateCourses.get(
                        interaction.course_id
                    )
                    candidateCourses.set(
                        interaction.course_id,
                        currentScore + similarity * interaction.rating
                    )
                } else {
                    // 否则，将课程添加到候选列表
                    candidateCourses.set(
                        interaction.course_id,
                        similarity * interaction.rating
                    )
                }
            })
    })

    // 将候选课程转换为数组并排序
    const rankedCandidates = [...candidateCourses.entries()]
        .map(([courseId, score]) => ({ courseId, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    // 获取推荐课程的完整信息
    const recommendations = rankedCandidates.map((candidate) => {
        const courseDetails = coursesData.find(
            (course) => course.course_id === candidate.courseId
        )

        // 找出哪些相似用户高评分了这门课
        const recommendingUsers = similarUsers
            .filter(({ user }) =>
                user.course_interactions.some(
                    (interaction) =>
                        interaction.course_id === candidate.courseId &&
                        interaction.rating >= 4
                )
            )
            .map(({ user }) => user.username)

        return {
            ...courseDetails,
            score: candidate.score,
            recommendation_reason: `${
                recommendingUsers.length
            }个与你相似的用户（${recommendingUsers.join('、')}）喜欢这门课程`,
        }
    })

    return {
        success: true,
        message: `基于与你相似的用户学习行为的推荐`,
        recommendations,
    }
}

/**
 * 混合推荐算法
 * 综合基于内容和协同过滤的推荐结果
 */
const hybridRecommendation = (userId, limit = 8) => {
    const { coursesData, usersData } = loadData()

    // 查找目标用户
    const targetUser = usersData.find((user) => user.user_id === userId)
    if (!targetUser) {
        return {
            success: false,
            message: `未找到ID为 ${userId} 的用户`,
            recommendations: [],
        }
    }

    // 获取用户已完成学习的课程ID列表（完成率≥90%）
    const completedCourseIds = targetUser.course_interactions
        .filter((interaction) => interaction.completion_percentage >= 90)
        .map((interaction) => interaction.course_id)

    // 如果用户没有完成的课程，返回热门课程推荐
    if (completedCourseIds.length === 0) {
        const popularCourses = coursesData
            .sort((a, b) => {
                const enrollmentA =
                    parseInt(
                        a.course_students_enrolled.replace(/[^0-9]/g, '')
                    ) || 0
                const enrollmentB =
                    parseInt(
                        b.course_students_enrolled.replace(/[^0-9]/g, '')
                    ) || 0
                return enrollmentB - enrollmentA
            })
            .slice(0, limit)
            .map((course) => ({
                ...course,
                recommendation_reason: '热门课程，很多学习者都在学习',
            }))

        return {
            success: true,
            message: '你还没有完成任何课程，这里是一些热门课程',
            recommendations: popularCourses,
        }
    }

    // 获取最近完成的课程
    const latestCompletedCourse = targetUser.course_interactions
        .filter(
            (interaction) =>
                interaction.completion_percentage >= 90 &&
                interaction.date_completed
        )
        .sort(
            (a, b) => new Date(b.date_completed) - new Date(a.date_completed)
        )[0]

    // 获取协同过滤推荐
    const cfRecommendations = collaborativeFilteringRecommendation(
        userId,
        Math.floor(limit * 0.6)
    ).recommendations

    // 获取基于内容的推荐（基于最近完成的课程）
    let cbRecommendations = []
    if (latestCompletedCourse) {
        cbRecommendations = contentBasedRecommendation(
            latestCompletedCourse.course_id,
            Math.ceil(limit * 0.4)
        ).recommendations
    } else if (completedCourseIds.length > 0) {
        // 如果没有日期信息，随机选择一个完成的课程
        const randomIndex = Math.floor(
            Math.random() * completedCourseIds.length
        )
        cbRecommendations = contentBasedRecommendation(
            completedCourseIds[randomIndex],
            Math.ceil(limit * 0.4)
        ).recommendations
    }

    // 合并两种推荐结果，移除重复项
    const cfCourseIds = new Set(
        cfRecommendations.map((course) => course.course_id)
    )
    const uniqueCbRecommendations = cbRecommendations.filter(
        (course) => !cfCourseIds.has(course.course_id)
    )

    // 最终推荐结果
    const recommendations = [
        ...cfRecommendations,
        ...uniqueCbRecommendations,
    ].slice(0, limit)

    return {
        success: true,
        message: '基于您的学习历史和相似用户的混合推荐',
        recommendations,
    }
}

/**
 * 为备课教师推荐教育资源
 * 根据教师教学科目、年级和兴趣推荐课程
 */
const teacherResourceRecommendation = (userId, limit = 5) => {
    const { coursesData, usersData } = loadData()

    // 查找目标用户
    const targetUser = usersData.find((user) => user.user_id === userId)
    if (!targetUser) {
        return {
            success: false,
            message: `未找到ID为 ${userId} 的用户`,
            recommendations: [],
        }
    }

    // 获取用户已学习的课程ID列表
    const userCourseIds = targetUser.course_interactions.map(
        (interaction) => interaction.course_id
    )

    // 根据教师教学科目、年级和兴趣为教师推荐课程
    const subjectKeywords = getSubjectKeywords(targetUser.teaching_subject)
    const interestKeywords = targetUser.interests

    // 为每门课程计算匹配分数
    const scoredCourses = coursesData
        .filter((course) => !userCourseIds.includes(course.course_id)) // 排除已学习的课程
        .map((course) => {
            let score = 0
            let matchedSubjectKeywords = []
            let matchedInterestKeywords = []

            // 检查课程标题和描述是否包含学科关键词
            subjectKeywords.forEach((keyword) => {
                if (
                    course.course_title
                        .toLowerCase()
                        .includes(keyword.toLowerCase()) ||
                    (course.course_description &&
                        course.course_description
                            .toLowerCase()
                            .includes(keyword.toLowerCase()))
                ) {
                    matchedSubjectKeywords.push(keyword)
                    score += 0.3
                }
            })

            // 检查课程主题是否与教师兴趣匹配
            if (course.course_topics) {
                interestKeywords.forEach((interest) => {
                    if (
                        course.course_topics.some((topic) =>
                            topic.toLowerCase().includes(interest.toLowerCase())
                        )
                    ) {
                        matchedInterestKeywords.push(interest)
                        score += 0.4
                    }
                })
            }

            // 根据课程难度调整分数（对教师来说，中级和混合难度可能更合适）
            if (
                course.course_difficulty === 'Intermediate' ||
                course.course_difficulty === 'Mixed'
            ) {
                score += 0.2
            }

            // 考虑教师偏好的学习风格
            if (
                targetUser.preferred_learning_style &&
                course.course_format &&
                course.course_format.some((format) =>
                    format
                        .toLowerCase()
                        .includes(
                            targetUser.preferred_learning_style.toLowerCase()
                        )
                )
            ) {
                score += 0.1
            }

            // 考虑语言偏好
            if (
                targetUser.preferred_language &&
                course.course_language &&
                course.course_language.toLowerCase() ===
                    targetUser.preferred_language.toLowerCase()
            ) {
                score += 0.2
            }

            return {
                ...course,
                score,
                matchedSubjectKeywords,
                matchedInterestKeywords,
            }
        })
        .filter((course) => course.score > 0) // 只保留有匹配度的课程
        .sort((a, b) => b.score - a.score) // 按分数降序排序
        .slice(0, limit) // 取指定数量的推荐

    // 为每门课程添加推荐原因
    const recommendations = scoredCourses.map((course) => {
        let reason = ''

        if (course.matchedSubjectKeywords.length > 0) {
            reason += `与您的教学科目 "${
                targetUser.teaching_subject
            }" 相关: ${course.matchedSubjectKeywords.join('、')}. `
        }

        if (course.matchedInterestKeywords.length > 0) {
            reason += `匹配您的兴趣: ${course.matchedInterestKeywords.join(
                '、'
            )}. `
        }

        if (
            course.course_language &&
            course.course_language.toLowerCase() ===
                targetUser.preferred_language.toLowerCase()
        ) {
            reason += `使用您偏好的 ${targetUser.preferred_language} 语言. `
        }

        return {
            ...course,
            recommendation_reason: reason.trim(),
        }
    })

    return {
        success: true,
        message: `针对${targetUser.username}的教学需求推荐的资源`,
        recommendations,
    }
}

// 辅助函数：根据教学科目获取关键词
const getSubjectKeywords = (subject) => {
    const baseKeywords = [subject]

    // 为不同学科添加相关关键词
    const subjectMap = {
        计算机科学: ['编程', '算法', '数据', '人工智能', '计算机'],
        数学: ['统计', '数据', '分析', '几何', '代数'],
        英语: ['语言', '写作', '阅读', '语法', '文化'],
        医学基础: ['健康', '医疗', '生物', '诊断', '治疗'],
        物理: ['力学', '电磁', '热学', '光学', '物理'],
        历史: ['文化', '历史', '社会', '政治', '世界观'],
        化学: ['物质', '反应', '元素', '化学', '实验'],
        生物: ['生命', '医学', '健康', '生物', '生态'],
        地理: ['环境', '地理', '气候', '地形', '可持续'],
        音乐: ['艺术', '创意', '表达', '音乐', '文化'],
    }

    if (subjectMap[subject]) {
        return [...baseKeywords, ...subjectMap[subject]]
    }

    return baseKeywords
}

module.exports = {
    contentBasedRecommendation,
    collaborativeFilteringRecommendation,
    hybridRecommendation,
    teacherResourceRecommendation,
}
