# 课程文件快速导入指南

## 🎯 概述

我们提供了多种方式来快速将你电脑中的课程课件存储并上传到数据库中：

1. **网页界面批量上传** - 通过浏览器界面上传文件
2. **脚本批量导入** - 通过命令行脚本直接从本地文件夹导入
3. **API 接口上传** - 通过 API 程序化上传

## 🌐 方法一：网页界面批量上传

### 访问上传页面

1. 打开浏览器，访问：`http://localhost:3000/tools/course-import`
2. 确保已经登录系统

### 使用步骤

1. **填写课程基本信息**

    - 课程 ID（必填）：如 `CS401_2024_Spring`
    - 课程名称（必填）：如 `软件工程`
    - 课程代码：如 `CS401`
    - 学期：如 `2024春季`
    - 授课教师：如 `张教授`

2. **选择课程文件**

    - 点击文件选择区域或拖拽文件
    - 支持多选，最多 50 个文件
    - 支持格式：PDF, DOC, DOCX, PPT, PPTX, MP4, AVI, MOV, MP3, WAV, 图片等

3. **点击上传**
    - 系统会自动：
        - 将文件保存到对应的 uploads 目录
        - 从文件名解析章节信息
        - 将文件信息存储到数据库

### 文件命名规范（推荐）

为了让系统自动识别章节信息，建议按以下格式命名文件：

```
推荐格式：第1章-软件工程概述-第1节-基本概念.pptx
简化格式：第2章-软件生命周期.pdf
数字格式：1-1-软件工程基础.docx
普通格式：软件工程课件.pptx (不会自动识别章节)
```

## 🖥️ 方法二：脚本批量导入

### 配置脚本

编辑 `server/src/scripts/batchImportCourses.js` 文件：

```javascript
const config = {
    // 修改为你的课程文件目录
    sourceDirectory: 'D:/课程资料/软件工程',

    // 课程信息
    courseInfo: {
        id: 'CS401_2024_Spring',
        name: '软件工程',
        code: 'CS401',
        semester: '2024春季',
        instructor: '张教授',
        subject: '计算机科学',
        grade: '本科三年级',
        difficulty: 3,
    },

    // 修改为真实的用户ID
    userId: new mongoose.Types.ObjectId('你的用户ID'),
}
```

### 运行脚本

```bash
cd server
node src/scripts/batchImportCourses.js
```

### 脚本功能

-   ✅ 自动扫描指定目录及子目录
-   ✅ 支持递归处理文件夹结构
-   ✅ 自动复制文件到 uploads 目录
-   ✅ 从文件名解析章节信息
-   ✅ 批量创建数据库记录
-   ✅ 详细的处理结果报告

## 🔌 方法三：API 接口上传

### 单文件上传

```javascript
const formData = new FormData()
formData.append('file', file)
formData.append('courseId', 'CS401_2024_Spring')
formData.append('courseName', '软件工程')
// ... 其他课程信息

fetch('/api/course-import/upload-single', {
    method: 'POST',
    body: formData,
    headers: {
        Authorization: `Bearer ${token}`,
    },
})
```

### 多文件上传

```javascript
const formData = new FormData()
files.forEach((file) => {
    formData.append('files', file)
})
formData.append('courseId', 'CS401_2024_Spring')
// ... 其他信息

fetch('/api/course-import/upload-multiple', {
    method: 'POST',
    body: formData,
    headers: {
        Authorization: `Bearer ${token}`,
    },
})
```

## 📁 文件存储结构

上传的文件会根据类型自动分类存储：

```
server/public/uploads/
├── documents/     # PDF, DOC, DOCX, PPT, PPTX, TXT
├── videos/        # MP4, AVI, MOV, WMV
├── audios/        # MP3, WAV, M4A
├── images/        # JPG, JPEG, PNG, GIF, BMP
└── others/        # 其他格式
```

每个文件都会生成唯一的文件名，格式为：

```
原文件名-时间戳-随机数.扩展名
```

## 🎯 章节信息自动识别

系统支持以下文件命名模式的自动章节识别：

### 中文格式

```
第1章-软件工程概述-第1节-基本概念.pptx
├── 章节号：1
├── 章节标题：软件工程概述
├── 小节号：1
└── 小节标题：基本概念

第2章-软件生命周期.pdf
├── 章节号：2
└── 章节标题：软件生命周期
```

### 数字格式

```
1-1-软件工程基础.docx
├── 章节号：1
├── 小节号：1
└── 标题：软件工程基础

2-项目管理.pptx
├── 章节号：2
└── 标题：项目管理
```

## 📊 数据库存储结构

每个上传的文件会在数据库中创建以下资源记录：

```javascript
{
    title: "软件工程概述",           // 解析出的标题
    description: "课程资源：第1章-软件工程概述.pptx",
    pedagogicalType: "courseware",   // 教学类型
    format: "pptx",                  // 文件格式
    url: "public/uploads/documents/file.pptx", // 文件路径

    // 课程信息
    course: {
        id: "CS401_2024_Spring",
        name: "软件工程",
        code: "CS401",
        semester: "2024春季",
        instructor: "张教授"
    },

    // 章节信息
    chapter: {
        number: 1,                   // 章节号
        title: "软件工程概述",       // 章节标题
        section: 1,                  // 小节号
        sectionTitle: "基本概念",    // 小节标题
        order: 101                   // 排序顺序
    },

    // 文件信息
    fileInfo: {
        size: 1048576,              // 文件大小(字节)
        format: "pptx",             // 文件格式
        lastModified: "2024-01-01"  // 最后修改时间
    }
}
```

## 🔍 查询和管理

### 查询课程资源

```javascript
// 查询整个课程的资源
const resources = await Resource.findByCourse('CS401_2024_Spring')

// 查询特定章节
const chapter1 = await Resource.findByChapter('CS401_2024_Spring', 1)

// 获取课程结构
const structure = await Resource.getCourseStructure('CS401_2024_Spring')
```

### 预览课程文件

访问 API：`GET /api/course-import/preview/:courseId`

### 删除资源

访问 API：`DELETE /api/course-import/resource/:resourceId`

## ⚠️ 注意事项

1. **文件大小限制**：单个文件最大 100MB
2. **用户权限**：需要登录后才能上传
3. **文件命名**：建议使用 UTF-8 编码，避免特殊字符
4. **存储空间**：请确保服务器有足够的存储空间
5. **备份**：重要文件请做好备份

## 🐛 常见问题

### Q: 文件上传失败怎么办？

A: 检查文件格式是否支持、文件大小是否超限、网络连接是否正常

### Q: 章节信息识别不准确？

A: 请按照推荐的文件命名规范重新命名文件

### Q: 如何修改已上传的资源信息？

A: 目前需要通过 API 或数据库直接修改，后续会提供编辑界面

### Q: 可以批量删除资源吗？

A: 可以通过 API 批量删除，或者直接在数据库中操作

## 🚀 最佳实践

1. **文件整理**：上传前先整理好文件夹结构和命名
2. **分批上传**：大量文件建议分批上传，避免超时
3. **定期备份**：定期备份 uploads 目录和数据库
4. **权限管理**：合理设置资源的访问权限
5. **版本控制**：重要课件建议保留版本历史

---

通过以上三种方法，你可以快速将电脑中的课程课件导入到系统中，系统会自动处理文件存储和数据库记录创建。选择最适合你需求的方法开始使用吧！
