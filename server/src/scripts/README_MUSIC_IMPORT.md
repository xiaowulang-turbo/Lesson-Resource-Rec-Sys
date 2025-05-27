# 音乐资源导入工具

这个工具用于将 Pixabay 的音乐数据导入到资源推荐系统中，支持在线和离线两种模式。

## 功能特点

-   **在线模式**：直接连接 MongoDB 数据库导入音乐资源
-   **离线模式**：生成 JSON 文件，支持以后导入
-   **灵活配置**：可指定音乐资源的各种属性
-   **智能分类**：自动根据音乐标签和描述确定学科、年级和难度
-   **重复检测**：避免重复导入相同资源

## 使用方法

### 1. 在线模式

直接将音乐数据导入到连接的 MongoDB 数据库：

```bash
node src/scripts/importMusicResources.js
```

### 2. 离线模式

生成 JSON 文件供以后导入：

```bash
node src/scripts/importMusicResources.js --offline
```

生成的文件将保存在`exports`目录下。

### 3. 从 JSON 文件导入

将之前生成的 JSON 文件导入到数据库：

```bash
node src/scripts/importFromJson.js --file=音乐资源文件名.json
```

## 数据结构

音乐资源将转换为以下结构保存：

```javascript
{
  originalId: "音乐ID",
  title: "音乐标题",
  description: "音乐描述",
  pedagogicalType: "reference", // 参考资料
  format: "audio", // 音频格式
  contentType: "resource",
  subject: "音乐", // 自动判断
  grade: "通用", // 自动判断
  difficulty: 1-5, // 自动判断难度等级
  url: "音乐文件链接", // 关键字段
  fileInfo: {
    format: "mp3",
    duration: 时长(秒),
  },
  // 其他相关字段...
}
```

## 注意事项

1. **数据库连接**：确保`config.env`文件中有正确的 MongoDB 连接字符串
2. **默认用户**：脚本会自动创建或使用现有用户作为资源创建者
3. **网络问题**：如遇网络问题，推荐使用离线模式生成文件

## 常见问题

-   **连接失败**：检查 MongoDB 连接字符串和网络环境
-   **文件未找到**：确认 temp.json 文件存在于 src/data/目录下
-   **导入失败**：检查资源模型的验证规则是否匹配

## 后续开发计划

-   添加批量导入功能
-   支持更多音乐源的导入
-   增加资源预览功能
-   集成更多智能分类算法

---

_注：此工具由课程资源推荐系统团队开发维护。_
