# 课程章节功能说明

## 概述

我们已经成功扩展了资源模型，现在支持存储"相同课程，不同章节"的资源，例如软件工程课程的多个章节课件。

## 新增字段

### 1. 课程信息 (`course`)

```javascript
course: {
    id: String,          // 课程唯一标识符，如"CS401_2024_Spring"
    name: String,        // 课程名称，如"软件工程"
    code: String,        // 课程编码，如"CS401"
    semester: String,    // 学期信息，如"2024春季"
    instructor: String   // 授课教师
}
```

### 2. 章节信息 (`chapter`)

```javascript
chapter: {
    number: Number,      // 章节号，用于排序
    title: String,       // 章节标题
    section: Number,     // 小节号
    sectionTitle: String,// 小节标题
    order: Number,       // 章节在课程中的顺序
    parentChapter: Number // 父章节号，用于多级章节结构
}
```

## 新增索引

为了提高查询性能，我们添加了以下索引：

```javascript
// 课程相关索引
resourceSchema.index({ 'course.id': 1 })
resourceSchema.index({ 'course.name': 1 })
resourceSchema.index({ 'course.code': 1 })

// 章节相关索引
resourceSchema.index({ 'course.id': 1, 'chapter.order': 1 })
resourceSchema.index({
    'course.id': 1,
    'chapter.number': 1,
    'chapter.section': 1,
})
resourceSchema.index({ 'chapter.number': 1, 'chapter.section': 1 })
```

## 新增查询方法

### 1. `findByCourse(courseId, options)`

查询特定课程的所有资源，按章节排序。

```javascript
const resources = await Resource.findByCourse('CS401_2024_Spring', {
    sort: 'chapter', // 按章节排序
    page: 1,
    limit: 50,
})
```

### 2. `findByChapter(courseId, chapterNumber, sectionNumber)`

查询特定章节的资源。

```javascript
// 查询第1章所有资源
const chapter1 = await Resource.findByChapter('CS401_2024_Spring', 1)

// 查询第1章第2节资源
const section2 = await Resource.findByChapter('CS401_2024_Spring', 1, 2)
```

### 3. `getCourseStructure(courseId)`

获取课程的完整结构（章节树状结构）。

```javascript
const structure = await Resource.getCourseStructure('CS401_2024_Spring')
// 返回:
// {
//   courseId: 'CS401_2024_Spring',
//   courseName: '软件工程',
//   chapters: [
//     {
//       number: 1,
//       title: '软件工程概述',
//       sections: [...]
//     }
//   ]
// }
```

### 4. `findCoursesByInstructor(instructor, options)`

查询特定教师的所有课程。

```javascript
const courses = await Resource.findCoursesByInstructor('张教授', {
    page: 1,
    limit: 10,
})
```

## 使用示例

### 创建课程资源

```javascript
const courseResource = {
    title: '软件工程概述-课件',
    description: '介绍软件工程的基本概念和发展历程',
    pedagogicalType: 'courseware',
    format: 'pptx',
    subject: '计算机科学',
    grade: '本科三年级',
    difficulty: 2,

    // 课程信息
    course: {
        id: 'CS401_2024_Spring',
        name: '软件工程',
        code: 'CS401',
        semester: '2024春季',
        instructor: '张教授',
    },

    // 章节信息
    chapter: {
        number: 1,
        title: '软件工程概述',
        section: 1,
        sectionTitle: '软件工程基本概念',
        order: 1,
    },

    createdBy: userId,
    url: 'path/to/chapter1_section1.pptx',
}

const resource = await Resource.create(courseResource)
```

### 查询课程资源

```javascript
// 查询整个课程的资源
const courseResources = await Resource.findByCourse('CS401_2024_Spring')

// 查询特定章节
const chapter1Resources = await Resource.findByChapter('CS401_2024_Spring', 1)

// 获取课程结构
const structure = await Resource.getCourseStructure('CS401_2024_Spring')
```

## 典型应用场景

1. **课程管理**：教师可以将同一门课程的不同章节资源进行系统化管理
2. **学习路径**：学生可以按照章节顺序学习课程内容
3. **内容组织**：系统可以自动生成课程目录和导航
4. **进度跟踪**：可以跟踪学生在特定课程中的学习进度
5. **资源共享**：教师可以分享整个课程或特定章节的资源

## 数据示例

### 软件工程课程结构

```
软件工程 (CS401_2024_Spring)
├── 第1章 软件工程概述
│   ├── 第1节 软件工程基本概念
│   │   └── 软件工程概述-课件.pptx
│   └── 第2节 软件危机与解决方案
│       └── 软件危机与解决方案.pptx
├── 第2章 软件生命周期
│   ├── 第1节 生命周期模型
│   │   └── 软件生命周期模型.pptx
│   └── 第2节 敏捷开发
│       └── 敏捷开发方法.mp4
└── ...更多章节
```

## 迁移注意事项

1. **现有数据**：现有的资源数据不会受到影响，新字段都有默认值
2. **兼容性**：所有现有的查询方法仍然可以正常使用
3. **性能**：新增的索引会提高课程章节相关查询的性能
4. **扩展性**：设计支持多级章节结构，可以适应不同的课程组织需求

## 总结

通过这次扩展，我们的资源模型现在完全支持"相同课程，不同章节"的资源存储和管理，能够满足教育系统中复杂的课程结构需求。
