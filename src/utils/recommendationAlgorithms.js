/**
 * 推荐算法工具函数 - 实现协同过滤算法
 */

/**
 * 计算两个向量的余弦相似度
 * @param {Array} vectorA - 第一个向量
 * @param {Array} vectorB - 第二个向量
 * @returns {Number} - 两个向量的余弦相似度 (0~1)
 */
export function calculateCosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
        throw new Error('向量长度不匹配')
    }

    // 计算点积
    let dotProduct = 0
    // 计算向量模长
    let magnitudeA = 0
    let magnitudeB = 0

    for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i]
        magnitudeA += vectorA[i] * vectorA[i]
        magnitudeB += vectorB[i] * vectorB[i]
    }

    magnitudeA = Math.sqrt(magnitudeA)
    magnitudeB = Math.sqrt(magnitudeB)

    // 避免除以零
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0
    }

    return dotProduct / (magnitudeA * magnitudeB)
}

/**
 * 计算皮尔逊相关系数
 * @param {Array} vectorA - 第一个向量
 * @param {Array} vectorB - 第二个向量
 * @returns {Number} - 皮尔逊相关系数 (-1~1)
 */
export function calculatePearsonCorrelation(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
        throw new Error('向量长度不匹配')
    }

    // 计算平均值
    const sumA = vectorA.reduce((acc, val) => acc + val, 0)
    const sumB = vectorB.reduce((acc, val) => acc + val, 0)
    const meanA = sumA / vectorA.length
    const meanB = sumB / vectorB.length

    // 计算皮尔逊相关系数的分子和分母
    let numerator = 0
    let denominatorA = 0
    let denominatorB = 0

    for (let i = 0; i < vectorA.length; i++) {
        const diffA = vectorA[i] - meanA
        const diffB = vectorB[i] - meanB
        numerator += diffA * diffB
        denominatorA += diffA * diffA
        denominatorB += diffB * diffB
    }

    // 避免除以零
    if (denominatorA === 0 || denominatorB === 0) {
        return 0
    }

    return numerator / (Math.sqrt(denominatorA) * Math.sqrt(denominatorB))
}

/**
 * 基于用户的协同过滤算法
 * @param {Array} userRatingsMatrix - 用户评分矩阵 [用户ID][物品ID] = 评分
 * @param {String} targetUserId - 目标用户ID
 * @param {Number} neighborCount - 相似用户数量
 * @returns {Object} - 推荐结果: {itemId: predictedRating, ...}
 */
export function userBasedCollaborativeFiltering(
    userRatingsMatrix,
    targetUserId,
    neighborCount = 5
) {
    const targetUserRatings = userRatingsMatrix[targetUserId] || {}
    const targetUserRatedItems = Object.keys(targetUserRatings)

    // 计算目标用户与其他用户的相似度
    const userSimilarities = {}
    for (const userId in userRatingsMatrix) {
        if (userId === targetUserId) continue

        const otherUserRatings = userRatingsMatrix[userId]

        // 构建向量 (只考虑两个用户都评价过的物品)
        const commonItems = targetUserRatedItems.filter(
            (itemId) => otherUserRatings[itemId] !== undefined
        )

        // 如果没有共同评价的物品，跳过
        if (commonItems.length === 0) continue

        const targetVector = commonItems.map(
            (itemId) => targetUserRatings[itemId]
        )
        const otherVector = commonItems.map(
            (itemId) => otherUserRatings[itemId]
        )

        // 计算相似度 (使用余弦相似度)
        userSimilarities[userId] = calculateCosineSimilarity(
            targetVector,
            otherVector
        )
    }

    // 选择最相似的N个用户
    const similarUsers = Object.keys(userSimilarities)
        .sort((a, b) => userSimilarities[b] - userSimilarities[a])
        .slice(0, neighborCount)

    // 预测目标用户对未评价物品的评分
    const predictions = {}

    // 获取所有物品ID
    const allItemIds = new Set()
    for (const userId in userRatingsMatrix) {
        for (const itemId in userRatingsMatrix[userId]) {
            allItemIds.add(itemId)
        }
    }

    // 对目标用户未评价的物品进行评分预测
    allItemIds.forEach((itemId) => {
        // 如果用户已经评价过该物品，跳过
        if (targetUserRatings[itemId] !== undefined) return

        let weightedSum = 0
        let similaritySum = 0

        // 计算加权平均评分
        for (const similarUserId of similarUsers) {
            const similarity = userSimilarities[similarUserId]
            const rating = userRatingsMatrix[similarUserId][itemId]

            // 如果相似用户没有评价过该物品，跳过
            if (rating === undefined) continue

            weightedSum += similarity * rating
            similaritySum += Math.abs(similarity)
        }

        // 如果没有相似用户评价过该物品，跳过
        if (similaritySum === 0) return

        // 预测评分
        predictions[itemId] = weightedSum / similaritySum
    })

    return predictions
}

/**
 * 基于物品的协同过滤算法
 * @param {Array} userRatingsMatrix - 用户评分矩阵 [用户ID][物品ID] = 评分
 * @param {String} targetUserId - 目标用户ID
 * @param {Number} similarItemCount - 相似物品数量
 * @returns {Object} - 推荐结果: {itemId: predictedRating, ...}
 */
export function itemBasedCollaborativeFiltering(
    userRatingsMatrix,
    targetUserId,
    similarItemCount = 10
) {
    const targetUserRatings = userRatingsMatrix[targetUserId] || {}
    const targetUserRatedItems = Object.keys(targetUserRatings)

    // 计算物品之间的相似度矩阵
    const itemSimilarityMatrix =
        calculateItemSimilarityMatrix(userRatingsMatrix)

    // 获取所有物品ID
    const allItemIds = new Set()
    for (const userId in userRatingsMatrix) {
        for (const itemId in userRatingsMatrix[userId]) {
            allItemIds.add(itemId)
        }
    }

    // 预测目标用户对未评价物品的评分
    const predictions = {}

    // 对目标用户未评价的物品进行评分预测
    allItemIds.forEach((itemId) => {
        // 如果用户已经评价过该物品，跳过
        if (targetUserRatings[itemId] !== undefined) return

        let weightedSum = 0
        let similaritySum = 0

        // 基于用户已评价的物品预测新物品的评分
        for (const ratedItemId of targetUserRatedItems) {
            // 获取两个物品之间的相似度
            const similarity =
                (itemSimilarityMatrix[itemId] &&
                    itemSimilarityMatrix[itemId][ratedItemId]) ||
                0

            // 如果相似度太低，跳过
            if (Math.abs(similarity) < 0.1) continue

            const rating = targetUserRatings[ratedItemId]

            weightedSum += similarity * rating
            similaritySum += Math.abs(similarity)
        }

        // 如果没有足够的相似物品，跳过
        if (similaritySum === 0) return

        // 预测评分
        predictions[itemId] = weightedSum / similaritySum
    })

    return predictions
}

/**
 * 计算物品之间的相似度矩阵
 * @param {Object} userRatingsMatrix - 用户评分矩阵
 * @returns {Object} - 物品相似度矩阵 [物品ID1][物品ID2] = 相似度
 */
function calculateItemSimilarityMatrix(userRatingsMatrix) {
    // 创建物品-用户矩阵 (转置)
    const itemUserMatrix = {}

    // 填充物品-用户矩阵
    for (const userId in userRatingsMatrix) {
        for (const itemId in userRatingsMatrix[userId]) {
            if (!itemUserMatrix[itemId]) {
                itemUserMatrix[itemId] = {}
            }
            itemUserMatrix[itemId][userId] = userRatingsMatrix[userId][itemId]
        }
    }

    // 计算物品之间的相似度
    const itemSimilarityMatrix = {}
    const itemIds = Object.keys(itemUserMatrix)

    for (let i = 0; i < itemIds.length; i++) {
        const itemId1 = itemIds[i]
        itemSimilarityMatrix[itemId1] = {}

        for (let j = 0; j < itemIds.length; j++) {
            const itemId2 = itemIds[j]

            // 跳过自身
            if (itemId1 === itemId2) {
                itemSimilarityMatrix[itemId1][itemId2] = 1
                continue
            }

            // 如果已经计算过，跳过
            if (
                itemSimilarityMatrix[itemId2] &&
                itemSimilarityMatrix[itemId2][itemId1] !== undefined
            ) {
                itemSimilarityMatrix[itemId1][itemId2] =
                    itemSimilarityMatrix[itemId2][itemId1]
                continue
            }

            // 构建向量 (只考虑同时给这两个物品评分的用户)
            const item1Users = Object.keys(itemUserMatrix[itemId1])
            const item2Users = Object.keys(itemUserMatrix[itemId2])
            const commonUsers = item1Users.filter((userId) =>
                item2Users.includes(userId)
            )

            // 如果没有共同的用户，相似度为0
            if (commonUsers.length === 0) {
                itemSimilarityMatrix[itemId1][itemId2] = 0
                continue
            }

            // 构建评分向量
            const vector1 = commonUsers.map(
                (userId) => itemUserMatrix[itemId1][userId]
            )
            const vector2 = commonUsers.map(
                (userId) => itemUserMatrix[itemId2][userId]
            )

            // 计算相似度 (使用余弦相似度)
            itemSimilarityMatrix[itemId1][itemId2] = calculateCosineSimilarity(
                vector1,
                vector2
            )
        }
    }

    return itemSimilarityMatrix
}

/**
 * 混合推荐算法 - 结合基于用户和基于物品的协同过滤
 * @param {Object} userRatingsMatrix - 用户评分矩阵
 * @param {String} targetUserId - 目标用户ID
 * @param {Number} userNeighborCount - 相似用户数量
 * @param {Number} similarItemCount - 相似物品数量
 * @param {Number} userWeight - 用户协同过滤权重 (0-1)
 * @returns {Object} - 混合推荐结果: {itemId: predictedRating, ...}
 */
export function hybridCollaborativeFiltering(
    userRatingsMatrix,
    targetUserId,
    userNeighborCount = 5,
    similarItemCount = 10,
    userWeight = 0.5
) {
    // 基于用户的协同过滤
    const userBasedPredictions = userBasedCollaborativeFiltering(
        userRatingsMatrix,
        targetUserId,
        userNeighborCount
    )

    // 基于物品的协同过滤
    const itemBasedPredictions = itemBasedCollaborativeFiltering(
        userRatingsMatrix,
        targetUserId,
        similarItemCount
    )

    // 混合结果
    const hybridPredictions = {}

    // 合并两种方法的结果
    const allItemIds = new Set([
        ...Object.keys(userBasedPredictions),
        ...Object.keys(itemBasedPredictions),
    ])

    allItemIds.forEach((itemId) => {
        const userPrediction = userBasedPredictions[itemId] || 0
        const itemPrediction = itemBasedPredictions[itemId] || 0

        // 如果某个方法没有预测结果，使用另一个方法的结果
        if (userPrediction === 0) {
            hybridPredictions[itemId] = itemPrediction
        } else if (itemPrediction === 0) {
            hybridPredictions[itemId] = userPrediction
        } else {
            // 加权平均
            hybridPredictions[itemId] =
                userWeight * userPrediction + (1 - userWeight) * itemPrediction
        }
    })

    return hybridPredictions
}

/**
 * 准备用户-物品评分矩阵，将用户行为数据转化为评分数据
 * @param {Array} userInteractions - 用户交互记录
 * @returns {Object} 评分矩阵 [用户ID][物品ID] = 评分
 */
export function prepareRatingMatrix(userInteractions) {
    const ratingMatrix = {}

    userInteractions.forEach((interaction) => {
        const { userId, resourceId, interactionType, value } = interaction

        // 初始化用户的评分记录
        if (!ratingMatrix[userId]) {
            ratingMatrix[userId] = {}
        }

        // 根据交互类型计算评分
        let rating = 0
        switch (interactionType) {
            case 'view':
                rating = 1
                break
            case 'like':
                rating = 5
                break
            case 'download':
                rating = 4
                break
            case 'collection':
                rating = 4.5
                break
            case 'rating':
                // 如果是直接评分，使用实际评分值 (通常为1-5)
                rating = value
                break
            default:
                rating = 0
        }

        // 记录或更新评分 (如果有多次交互，取最高评分)
        if (
            !ratingMatrix[userId][resourceId] ||
            rating > ratingMatrix[userId][resourceId]
        ) {
            ratingMatrix[userId][resourceId] = rating
        }
    })

    return ratingMatrix
}

/**
 * 根据相似度寻找相似资源
 * @param {String} resourceId - 目标资源ID
 * @param {Object} itemSimilarityMatrix - 物品相似度矩阵
 * @param {Array} allResources - 全部资源数据
 * @param {Number} limit - 返回结果数量限制
 * @returns {Array} 相似资源数组
 */
export function findSimilarResources(
    resourceId,
    itemSimilarityMatrix,
    allResources,
    limit = 5
) {
    // 如果没有该资源的相似度数据，返回空数组
    if (!itemSimilarityMatrix[resourceId]) {
        return []
    }

    // 获取相似度排序
    const similarities = Object.entries(itemSimilarityMatrix[resourceId])
        .filter(([id, _]) => id !== resourceId) // 排除自身
        .sort((a, b) => b[1] - a[1]) // 按相似度降序排序
        .slice(0, limit) // 取前N个

    // 获取相似资源的完整信息
    return similarities
        .map(([id, score]) => {
            const resource = allResources.find(
                (r) => r.id.toString() === id.toString()
            )
            if (!resource) return null

            return {
                ...resource,
                similarityScore: score,
                recommendationReason: `相似度评分: ${(score * 100).toFixed(
                    0
                )}%`,
            }
        })
        .filter((item) => item !== null)
}
