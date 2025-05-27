# 课程章节结构功能指南

## 概述

该资源模型已经完善，现在支持相同资源不同章节的存储方式，可以有效管理课程的层级结构。这个功能特别适用于处理课程的不同章节、课件资源的组织等场景。

## 核心功能

### 1. 课程层级结构

新的资源模型支持以下层级结构：

-   **课程 (Course)**: 顶级容器，包含多个章节
-   **章节 (Chapter)**: 课程的主要分组，可以有多个层级
-   **资源 (Resource)**: 具体的学习材料，属于某个章节

### 2. 主要字段说明

#### `courseStructure` 字段

```javascript
courseStructure: {
    // 父课程ID - 如果此资源属于某个课程
    parentCourse: ObjectId,

    // 章节信息
    chapter: {
        number: Number,        // 章节号，如 1, 2, 3
        title: String,         // 章节标题，如 "第一章：入门基础"
        subtitle: String,      // 章节副标题
        level: Number,         // 章节层级，1为主章节，2为小节，3为子小节
        parentChapter: Number, // 父章节号，用于多级章节结构
    },

    // 顺序和位置信息
    order: {
        courseOrder: Number,   // 在整个课程中的顺序
        chapterOrder: Number,  // 在当前章节中的顺序
        sectionOrder: Number,  // 在当前小节中的顺序
    },

    // 学习路径信息
    learningPath: {
        isRequired: Boolean,           // 是否为必修内容
        prerequisites: [ObjectId],     // 前置资源ID
        estimatedDuration: Number,     // 预计学习时长（分钟）
        difficultyProgression: Number, // 在课程中的难度递进位置
    },

    // 完成状态（用于学习者）
    completion: {
        isCompleted: Boolean,
        completedBy: [{
            user: ObjectId,
            completedAt: Date,
            progress: Number,  // 0-100
        }],
    },
}
```

## 使用场景

### 场景 1：创建完整的课程结构

```javascript
// 1. 创建主课程
const mainCourse = new Resource({
    title: 'JavaScript从入门到精通',
    contentType: 'course',
    courseStructure: {
        parentCourse: null,
        chapter: { number: 0, title: '课程主页', level: 0 },
    },
})

// 2. 创建第一章的课件
const chapter1Lesson1 = new Resource({
    title: 'JavaScript简介',
    contentType: 'resource',
    pedagogicalType: 'courseware',
    courseStructure: {
        parentCourse: mainCourse._id,
        chapter: {
            number: 1,
            title: '第一章：JavaScript基础',
            level: 1,
        },
        order: {
            courseOrder: 1,
            chapterOrder: 1,
        },
        learningPath: {
            isRequired: true,
            estimatedDuration: 60,
        },
    },
})
```

### 场景 2：设置学习前置条件

```javascript
const chapter1Exercise = new Resource({
    title: '第一章练习',
    courseStructure: {
        parentCourse: mainCourse._id,
        chapter: { number: 1, title: '第一章：JavaScript基础' },
        order: { courseOrder: 3, chapterOrder: 3 },
        learningPath: {
            prerequisites: [chapter1Lesson1._id, chapter1Lesson2._id], // 需要先完成前两个资源
            isRequired: true,
        },
    },
})
```

### 场景 3：多级章节结构

```javascript
// 主章节
const mainChapter = new Resource({
    courseStructure: {
        chapter: {
            number: 2,
            title: '第二章：高级特性',
            level: 1, // 主章节
        },
    },
})

// 子章节
const subChapter = new Resource({
    courseStructure: {
        chapter: {
            number: 21,
            title: '2.1 异步编程',
            level: 2, // 子章节
            parentChapter: 2,
        },
    },
})
```

## API 方法

### 静态方法

#### 1. `findByCourse(courseId, options)`

获取课程的所有资源，按顺序排列

```javascript
const resources = await Resource.findByCourse(courseId, {
    includeOptional: true, // 是否包含选修内容
    userId: userId, // 用户ID，用于获取完成状态
})
```

#### 2. `findByChapter(courseId, chapterNumber, options)`

获取特定章节的资源

```javascript
const chapterResources = await Resource.findByChapter(courseId, 1, {
    level: 1, // 章节层级
    sortBy: 'order', // 排序方式: 'order', 'title', 'difficulty', 'created'
})
```

#### 3. `getCourseStructure(courseId)`

获取课程的完整目录结构

```javascript
const structure = await Resource.getCourseStructure(courseId)
// 返回层级化的章节和资源结构
```

#### 4. `getNextResource(currentResourceId, userId)`

获取学习路径中的下一个资源

```javascript
const nextInfo = await Resource.getNextResource(currentResourceId, userId)
// 返回: { resource, canAccess, missingPrerequisites }
```

#### 5. `getCourseProgress(courseId, userId)`

获取用户在课程中的学习进度

```javascript
const progress = await Resource.getCourseProgress(courseId, userId)
// 返回整体进度和各章节进度
```

### 实例方法

#### 1. `markCompleted(userId, progress)`

标记资源为已完成

```javascript
await resource.markCompleted(userId, 100)
```

#### 2. `updateProgress(userId, progress)`

更新学习进度

```javascript
await resource.updateProgress(userId, 75)
```

#### 3. `canUserAccess(userId)`

检查用户是否可以访问此资源

```javascript
const accessInfo = await resource.canUserAccess(userId)
// 返回: { canAccess, missingPrerequisites, completedPrerequisites, totalPrerequisites }
```

#### 4. `getPositionInCourse()`

获取资源在课程中的位置信息

```javascript
const position = await resource.getPositionInCourse()
// 返回: { currentPosition, totalResources, progressPercentage, previousResource, nextResource }
```

#### 5. `copyToChapter(targetCourseId, chapterInfo, orderInfo, userId)`

复制资源到新的课程/章节

```javascript
const copiedResource = await resource.copyToChapter(
    targetCourseId,
    { number: 3, title: '第三章' },
    { courseOrder: 10, chapterOrder: 1 },
    userId
)
```

## 数据库索引

为了优化查询性能，已添加以下索引：

```javascript
// 课程结构相关索引
resourceSchema.index({ 'courseStructure.parentCourse': 1 })
resourceSchema.index({ 'courseStructure.chapter.number': 1 })
resourceSchema.index({ 'courseStructure.chapter.level': 1 })
resourceSchema.index({ 'courseStructure.order.courseOrder': 1 })
resourceSchema.index({ 'courseStructure.order.chapterOrder': 1 })

// 复合索引用于复杂查询
resourceSchema.index({
    'courseStructure.parentCourse': 1,
    'courseStructure.order.courseOrder': 1,
})
resourceSchema.index({
    'courseStructure.parentCourse': 1,
    'courseStructure.chapter.number': 1,
    'courseStructure.order.chapterOrder': 1,
})
```

## 最佳实践

### 1. 课程结构设计

-   主课程使用 `contentType: 'course'` 和 `parentCourse: null`
-   资源使用 `contentType: 'resource'` 并指定 `parentCourse`
-   章节编号建议使用连续的整数
-   合理设置 `courseOrder` 确保资源的正确顺序

### 2. 学习路径设计

-   设置合理的前置条件，避免循环依赖
-   预估准确的学习时长
-   区分必修和选修内容

### 3. 性能优化

-   使用复合索引进行高效查询
-   分页查询大量资源
-   适当使用 `populate` 减少查询次数

### 4. 数据一致性

-   删除课程时需要处理关联的资源
-   更新章节信息时保持数据一致性
-   定期清理孤立的资源记录

## 示例代码

完整的使用示例请参考：`server/src/examples/courseStructureExample.js`

该文件包含了创建课程、查询结构、管理进度等功能的完整示例代码。

## 注意事项

1. 删除课程时需要同时处理所有关联的资源
2. 修改章节结构可能影响现有的学习进度
3. 前置条件的设置需要避免循环依赖
4. 大型课程建议分批加载资源以提高性能
5. 定期备份重要的课程结构数据

通过这个完善的资源模型，你现在可以有效地管理复杂的课程结构，支持章节化的学习内容组织，并提供完整的学习进度跟踪功能。
