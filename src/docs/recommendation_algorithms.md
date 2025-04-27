# 相似资源推荐算法实现文档

## 概述

本文档描述了系统中实现的相似资源推荐算法，主要包括三种推荐方法：

1. **基于协同过滤的推荐**：根据用户行为数据，计算资源之间的相似性
2. **基于显式关系的推荐**：使用预先定义的资源关系图谱
3. **基于内容的过滤推荐**：通过分析资源的内容特征进行匹配

系统会优先使用协同过滤的结果，然后补充显式定义的相似资源，最后使用基于内容的过滤结果进行补充，确保推荐结果的数量和质量。

## 协同过滤算法

协同过滤算法是一种广泛使用的推荐算法，它主要依赖用户与物品之间的交互数据进行推荐，而不需要依赖物品的内容特征。

### 基本原理

协同过滤主要分为两类：

-   **基于用户的协同过滤**：寻找与目标用户相似的用户，推荐这些相似用户喜欢的物品
-   **基于物品的协同过滤**：寻找与用户已喜欢物品相似的物品进行推荐

在我们的系统中，主要实现了**基于物品的协同过滤**，其基本思路是：

1. 收集用户与资源的交互数据（如浏览、收藏、下载、评分等）
2. 根据交互数据，构建用户-资源评分矩阵
3. 基于评分矩阵，计算资源之间的相似度
4. 当用户访问某个资源时，推荐与该资源相似度高的其他资源

### 实现细节

#### 1. 相似度计算

在物品协同过滤中，相似度计算是关键。我们主要使用了余弦相似度：

```javascript
// 计算两个向量的余弦相似度
function calculateCosineSimilarity(vectorA, vectorB) {
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
```

#### 2. 行为数据转换为评分

我们需要将用户的各种行为转换为评分数据：

```javascript
function prepareRatingMatrix(userInteractions) {
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
                rating = value
                break
            default:
                rating = 0
        }

        // 记录或更新评分 (取最高评分)
        if (
            !ratingMatrix[userId][resourceId] ||
            rating > ratingMatrix[userId][resourceId]
        ) {
            ratingMatrix[userId][resourceId] = rating
        }
    })

    return ratingMatrix
}
```

#### 3. 物品相似度矩阵计算

基于用户评分矩阵，我们可以计算物品之间的相似度：

```javascript
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
```

## 基于内容的过滤推荐

当协同过滤和显式关系推荐不足时，系统会使用基于内容的过滤方法补充推荐结果。

### 基本原理

基于内容的过滤主要分析资源本身的属性和特征，找出与目标资源在内容上相似的其他资源。比较的特征包括：

-   学科/主题
-   难度级别
-   标签/关键词
-   年级/适用对象
-   热门程度

### 实现细节

我们为每个资源与当前资源计算相似度分数：

```javascript
const contentBasedFiltering = (
    currentResource,
    allResources,
    limit,
    excludeIds = []
) => {
    // 为每个资源计算与当前资源的相似度分数
    const scoredResources = allResources
        .filter((r) => {
            // 排除当前资源和已经在推荐列表中的资源
            return (
                r.id.toString() !== currentResource.id.toString() &&
                !excludeIds.includes(r.id.toString())
            )
        })
        .map((resource) => {
            let score = 0

            // 相同主题加分
            if (resource.subject === currentResource.subject) {
                score += 5
            }

            // 难度接近加分
            if (resource.difficulty && currentResource.difficulty) {
                const diffDelta = Math.abs(
                    resource.difficulty - currentResource.difficulty
                )
                if (diffDelta === 0) {
                    score += 3 // 完全匹配难度
                } else if (diffDelta === 1) {
                    score += 1 // 难度接近
                }
            }

            // 标签重叠加分
            if (resource.tags && currentResource.tags) {
                const commonTags = resource.tags.filter((tag) =>
                    currentResource.tags.includes(tag)
                )
                score += commonTags.length * 2 // 每个匹配的标签得分
            }

            // 相同年级加分
            if (resource.grade === currentResource.grade) {
                score += 2
            }

            return {
                ...resource,
                similarityScore: score,
                recommendationReason: generateRecommendationReason(
                    resource,
                    currentResource
                ),
            }
        })
        .filter((r) => r.similarityScore > 3) // 只保留相似度较高的
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit)

    return scoredResources
}
```

## 组合推荐策略

我们的相似资源推荐采用了多层次的组合策略：

1. 首先使用协同过滤算法尝试推荐，协同过滤能够捕捉用户行为模式，对于活跃用户效果更好
2. 如果协同过滤的结果不足，使用显式定义的资源关系图谱补充
3. 如果前两种方法仍然不足，使用基于内容的过滤方法补充

这种组合策略能够有效提高推荐的覆盖率和准确性，解决冷启动问题。

## 结论

相似资源推荐算法是学习资源推荐系统的重要组成部分。通过结合协同过滤、显式关系和基于内容的过滤三种方法，我们能够为用户提供更加准确和多样化的推荐结果。

未来可以继续优化的方向：

1. 引入更多用户行为数据，改进协同过滤的准确性
2. 添加基于深度学习的内容特征提取，改进基于内容的过滤
3. 加入时间衰减因子，使推荐结果更加注重近期用户行为
4. 考虑用户的上下文信息，如当前学习目标、历史学习轨迹等
