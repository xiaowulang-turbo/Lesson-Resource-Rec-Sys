/**
 * 推荐原因生成工具 - 用于生成更人性化的推荐理由
 */

/**
 * 根据协同过滤的相似度生成推荐原因
 * @param {Number} similarityScore - 相似度分数 (0-1)
 * @returns {String} - 人性化的推荐原因
 */
export function generateCollaborativeReason(similarityScore) {
    // 将相似度分数转换为百分比，并四舍五入到整数
    const percentage = Math.round(similarityScore * 100)

    if (percentage >= 90) {
        return `与您当前浏览的资源高度相关，有${percentage}%的匹配度`
    } else if (percentage >= 80) {
        return `很多喜欢此资源的用户也在学习这个，匹配度${percentage}%`
    } else if (percentage >= 70) {
        return `基于${percentage}%的用户行为相似度推荐给您`
    } else if (percentage >= 60) {
        return `与当前资源有${percentage}%的相似度，可能对您有帮助`
    } else {
        return `其他用户的选择，相似度${percentage}%`
    }
}

/**
 * 根据共同访问比例生成推荐原因
 * @param {Number} coAccessPercentage - 共同访问比例
 * @returns {String} - 人性化的推荐原因
 */
export function generateCoAccessReason(coAccessPercentage) {
    if (coAccessPercentage >= 70) {
        return `${coAccessPercentage}%的用户在浏览当前资源后也查看了这个`
    } else if (coAccessPercentage >= 50) {
        return `很多用户（${coAccessPercentage}%）同时学习了这两种资源`
    } else if (coAccessPercentage >= 30) {
        return `${coAccessPercentage}%的用户将这两个资源一起使用`
    } else {
        return `有${coAccessPercentage}%的用户也浏览了此资源`
    }
}

/**
 * 根据共同标签生成推荐原因
 * @param {Array} commonTags - 共同标签数组
 * @param {String} subject - 学科名称
 * @returns {String} - 人性化的推荐原因
 */
export function generateTagBasedReason(commonTags, subject) {
    if (!commonTags || commonTags.length === 0) {
        return subject
            ? `同样是${subject}领域的学习资源`
            : '与当前浏览内容相关的资源'
    }

    if (commonTags.length >= 3) {
        return `包含多个相同主题：${commonTags.slice(0, 3).join('、')}等`
    } else if (commonTags.length === 2) {
        return `包含相同的${commonTags.join('和')}主题`
    } else {
        return `同样涉及"${commonTags[0]}"主题的资源`
    }
}

/**
 * 根据共同难度级别生成推荐原因
 * @param {Number} targetDifficulty - 目标资源难度 (1-5)
 * @param {Number} resourceDifficulty - 推荐资源难度 (1-5)
 * @returns {String} - 人性化的推荐原因
 */
export function generateDifficultyReason(targetDifficulty, resourceDifficulty) {
    const difficultyNames = {
        1: '入门',
        2: '初级',
        3: '中级',
        4: '高级',
        5: '专家',
    }

    const targetLevel = difficultyNames[targetDifficulty] || '未知'
    const resourceLevel = difficultyNames[resourceDifficulty] || '未知'

    if (targetDifficulty === resourceDifficulty) {
        return `与当前资源相同的${targetLevel}难度`
    } else if (resourceDifficulty === targetDifficulty + 1) {
        return `在当前${targetLevel}资源基础上进阶的${resourceLevel}难度资源`
    } else if (resourceDifficulty === targetDifficulty - 1) {
        return `作为${targetLevel}前的${resourceLevel}难度基础学习`
    } else if (resourceDifficulty > targetDifficulty) {
        return `更具挑战性的${resourceLevel}难度资源`
    } else {
        return `更基础的${resourceLevel}难度资料，可巩固知识`
    }
}

/**
 * 智能生成推荐原因
 * @param {Object} resource - 资源对象
 * @param {Object} currentResource - 当前正在查看的资源对象
 * @returns {String} - 人性化的推荐原因
 */
export function generateSmartReason(resource, currentResource) {
    // 如果资源已经有推荐原因，直接返回
    if (resource.recommendationReason) {
        // 协同过滤的情况，优化相似度评分表示
        if (
            resource.recommendationReason.includes('相似度评分') &&
            resource.similarityScore
        ) {
            return generateCollaborativeReason(resource.similarityScore)
        }

        // 共同访问的情况
        if (resource.coAccessPercentage) {
            return generateCoAccessReason(resource.coAccessPercentage)
        }

        return resource.recommendationReason
    }

    // 尝试生成基于标签的原因
    if (resource.tags && currentResource.tags) {
        const commonTags = resource.tags.filter((tag) =>
            currentResource.tags.includes(tag)
        )

        if (commonTags.length > 0) {
            return generateTagBasedReason(commonTags, resource.subject)
        }
    }

    // 尝试生成基于难度的原因
    if (resource.difficulty && currentResource.difficulty) {
        return generateDifficultyReason(
            currentResource.difficulty,
            resource.difficulty
        )
    }

    // 默认原因
    if (resource.subject === currentResource.subject) {
        return `同样是${resource.subject}领域的资源`
    }

    return '可能对您有帮助的相关资源'
}
