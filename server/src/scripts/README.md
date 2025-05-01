# 脚本文件目录

本目录包含各种用于系统维护、数据管理和测试的脚本文件。

## 主要脚本文件

### 1. dataMigration.js

用户数据迁移脚本，用于批量导入用户数据。

使用方法：

```bash
npm run migrate:users
```

### 2. updateEnrollmentCounts.js

更新资源的报名/使用计数的脚本。

使用方法：

```bash
npm run update-enrollment
```

### 3. seedResourceRelationships.js

填充资源关系数据的脚本，用于在资源间建立相似关系、共同访问关系和推荐序列。

使用方法：

```bash
npm run seed:resource-relationships
```

该脚本会：

-   为每个资源创建与其他资源的相似度关系
-   基于学科、年级、教学类型和难度计算相似度
-   生成随机的共同访问数据
-   为每个资源创建推荐序列
-   输出详细的统计信息

### 4. convertTempResources.js

临时资源转换脚本，用于将旧格式资源转换为新格式。

### 5. initMockData.js

初始化模拟数据的脚本，用于开发和测试环境。

### 6. seedData.js

填充基础示例数据的脚本，包括标签、收藏和用户交互等。

### 7. testHybridRecommendation.js

混合推荐算法测试脚本，用于测试和优化推荐系统。

## 使用注意事项

1. 在执行数据修改脚本前，请确保已备份重要数据
2. 部分脚本可能需要管理员权限执行
3. 生产环境执行脚本前，建议先在测试环境验证
4. 大型数据操作可能需要较长执行时间，请耐心等待

## 数据上传脚本 (uploadData.js)

该脚本用于将 JSON 数据文件上传到 MongoDB 数据库中。它支持上传单个文件或批量上传目录中的所有 JSON 文件。

### 使用方法

#### 基本使用

上传`server/src/data`目录中的所有 JSON 文件到数据库：

```bash
node src/scripts/uploadData.js
```

#### 上传指定文件

上传特定的 JSON 文件到数据库：

```bash
node src/scripts/uploadData.js --file=resources.json --model=Resource
```

参数说明：

-   `--file`: 指定要上传的 JSON 文件名（位于`server/src/data`目录下）
-   `--model`: 指定对应的数据模型名称（可选，如果文件名能够映射到模型则可省略）

#### 清空集合并上传

清空指定集合后再上传数据：

```bash
node src/scripts/uploadData.js --file=resources.json --model=Resource --clear
```

参数说明：

-   `--clear`: 在上传前清空对应的集合

### 支持的数据模型

-   `Account`: 用户账户
-   `User`: 用户信息
-   `Resource`: 教学资源
-   `ResourceRelationship`: 资源关系
-   `UserResourceInteraction`: 用户资源交互
-   `Collection`: 资源集合
-   `Tag`: 标签

### 文件名到模型的默认映射

脚本会自动尝试将文件名映射到对应的数据模型：

| 文件名                      | 对应模型             |
| --------------------------- | -------------------- |
| accounts.json               | Account              |
| users.json                  | User                 |
| resources.json              | Resource             |
| resource_relationships.json | ResourceRelationship |
| newResources.json           | Resource             |

对于其他文件，脚本会尝试根据文件名推断对应的模型。如果无法确定，需要使用`--model`参数指定。

### 注意事项

1. 确保 MongoDB 服务器已启动并且配置了正确的连接字符串
2. 上传前建议备份数据库
3. 使用`--clear`参数会删除集合中的所有数据，请谨慎使用

## 其他脚本

-   `migrateAccounts.js`: 用于迁移账户数据
-   `migrateFromNewFormat.js`: 从新格式迁移数据
