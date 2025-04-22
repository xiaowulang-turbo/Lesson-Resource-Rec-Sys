# 课程资源推荐系统 - 混合推荐算法

本项目实现了基于内容的推荐算法、协同过滤推荐算法以及两者的混合推荐算法，用于为用户推荐最合适的教学资源。

## 已实现的推荐算法

### 1. 基于内容的推荐 (Content-Based Recommendation)

根据用户偏好（如学科、兴趣标签、难度等）与资源特征之间的匹配程度进行推荐，主要考虑以下几个方面：

-   学科匹配：用户偏好学科与资源学科的匹配
-   兴趣/标签重叠：用户兴趣与资源标签的交集
-   难度匹配：用户偏好难度与资源难度的接近程度
-   流行度微调：使用资源选课人数作为微小权重调整因子

### 2. 协同过滤推荐 (Collaborative Filtering)

基于用户行为和相似性数据进行推荐，主要利用以下信息：

-   课程相似度：从`course_relationships.json`中获取的课程相似度数据
-   共同选课模式：分析哪些课程经常被一起选择
-   推荐序列：预先计算的课程推荐序列
-   用户评分调整：用户对已学习课程的评分会影响相似课程的推荐强度

### 3. 混合推荐 (Hybrid Recommendation)

结合上述两种方法的优点，同时考虑内容匹配度和用户行为模式：

-   权重可配置：支持动态调整内容推荐和协同过滤的权重比例
-   对互补结果进行合并：从两种算法获取候选资源，并根据权重重新计算得分
-   根据权重调整最终得分：推荐结果可以偏向内容匹配或协同过滤，也可以平衡两者
-   自动降级：在协同过滤数据不足时，会自动降级为基于内容的推荐

## 如何使用

### API 端点

1. **获取首页推荐**

```
GET /api/v1/recommendations/homepage
```

查询参数:

-   `limit`: 推荐数量限制 (默认: 10)
-   `algorithm`: 使用的算法 [content, collaborative, hybrid] (默认: hybrid)
-   `contentWeight`: 内容推荐权重 (默认: 0.5)
-   `collaborativeWeight`: 协同过滤权重 (默认: 0.5)

2. **根据用户 ID 获取推荐**

```
GET /api/v1/recommendations/user/:userId
```

查询参数:

-   `limit`: 推荐数量限制 (默认: 10)
-   `algorithm`: 使用的算法 [content, collaborative, hybrid] (默认: hybrid)
-   `contentWeight`: 内容推荐权重 (默认: 0.5)
-   `collaborativeWeight`: 协同过滤权重 (默认: 0.5)

### 通过代码调用

可以直接导入推荐算法模块并调用相关函数：

```javascript
import {
    contentBasedRecommendation,
    collaborativeFilteringRecommendation,
    hybridRecommendation,
} from '../recommendation/algorithms.js'

// 基于内容推荐
const contentResult = contentBasedRecommendation(userObject, 10)

// 协同过滤推荐
const collaborativeResult = collaborativeFilteringRecommendation(userObject, 10)

// 混合推荐 (权重为 0.7 和 0.3)
const hybridResult = hybridRecommendation(userObject, 10, {
    content: 0.7,
    collaborative: 0.3,
})
```

## 测试工具

系统提供了测试脚本用于比较不同算法的推荐效果：

```
node --experimental-modules src/scripts/testHybridRecommendation.js
```

该脚本会对几个不同类型的用户进行多种算法组合的推荐测试，并分析不同算法推荐结果的重叠情况。

## 改进方向

1. **更精细的相似度计算**：可以引入更多维度的相似度计算，比如考虑资源的语义相似性。
2. **用户行为数据扩充**：收集更多用户行为数据，如浏览历史、完成进度等，增强协同过滤效果。
3. **基于情境的推荐**：考虑用户当前的情境（如备课目标、时间限制等）调整推荐。
4. **冷启动优化**：对新用户和新资源设计特定的推荐策略。
5. **用户反馈机制**：建立用户反馈机制，调整推荐算法参数。
