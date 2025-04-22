# 推荐系统从 JSON 文件迁移到 MongoDB 数据库的方案

## 1. 问题背景

当前推荐系统使用本地 JSON 文件作为数据源，这导致以下问题：

1. 用户交互数据无法实时保存和更新
2. 不同用户获得相同的推荐，个性化效果差
3. 系统扩展性受限，难以处理大量数据
4. 每次服务器重启都需要重新加载数据

## 2. 迁移目标

将系统从 JSON 文件存储迁移到 MongoDB 数据库，实现：

1. 实时保存和更新用户交互数据
2. 提高推荐算法的个性化程度
3. 增强系统的可扩展性
4. 数据持久化与一致性

## 3. 数据模型设计

### 用户集合 (Users)

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (加密),
  role: String,
  preferred_subjects: Array,
  preferred_difficulty: Number,
  preferred_resource_types: Array,
  interests: Array,
  created_at: Date,
  updated_at: Date
}
```

### 资源集合 (Resources)

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  contentType: String,
  format: String,
  subject: String,
  grade: String,
  difficulty: Number,
  url: String,
  cover: String,
  price: Number,
  authors: String,
  publisher: String,
  tags: Array,
  enrollCount: Number,
  averageRating: Number,
  created_at: Date,
  updated_at: Date
}
```

### 用户交互集合 (Interactions)

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (关联到Users),
  resource_id: ObjectId (关联到Resources),
  rating: Number,
  completion_percentage: Number,
  favorite: Boolean,
  watch_time_minutes: Number,
  notes: String,
  date_completed: Date,
  created_at: Date,
  updated_at: Date
}
```

### 资源关系集合 (ResourceRelationships)

```javascript
{
  _id: ObjectId,
  resource_id: ObjectId (关联到Resources),
  similar_resources: [
    {
      resource_id: ObjectId,
      similarity_score: Number,
      common_topics: Array
    }
  ],
  co_enrolled_with: [
    {
      resource_id: ObjectId,
      co_enrollment_count: Number,
      co_enrollment_percentage: Number
    }
  ],
  recommended_sequence: [ObjectId]
}
```

## 4. 迁移步骤

### 4.1 环境准备

1. 安装 MongoDB 和 Mongoose：

    ```bash
    npm install mongoose --save
    ```

2. 配置环境变量：
    ```
    MONGODB_URI=mongodb://localhost:27017/lesson-resource-db
    ```

### 4.2 创建数据模型

1. 创建 Mongoose 模型文件：

```javascript
// models/userModel.js
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, '请提供用户名'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, '请提供邮箱'],
            unique: true,
            lowercase: true,
        },
        // ...其他字段
    },
    { timestamps: true }
)

// 密码加密中间件
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

const User = mongoose.model('User', userSchema)
export default User
```

2. 类似地创建其他模型：
    - `resourceModel.js`
    - `interactionModel.js`
    - `resourceRelationshipModel.js`

### 4.3 数据迁移脚本

创建脚本将 JSON 数据导入 MongoDB：

```javascript
// scripts/migrateData.js
import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import User from '../models/userModel.js'
import Resource from '../models/resourceModel.js'
import Interaction from '../models/interactionModel.js'
import ResourceRelationship from '../models/resourceRelationshipModel.js'

// 连接MongoDB
mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB连接成功'))
    .catch((err) => console.error('MongoDB连接失败:', err))

// 导入用户数据
async function importUsers() {
    try {
        const usersData = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../data/accounts.json'),
                'utf8'
            )
        )
        // 清空现有集合
        await User.deleteMany({})

        const users = await User.insertMany(
            usersData.map((user) => ({
                name: user.name,
                email: user.email,
                password: user.password, // 注意：密码已经加密
                role: user.role,
                preferred_subjects: user.preferred_subjects,
                preferred_difficulty: user.preferred_difficulty,
                preferred_resource_types: user.preferred_resource_types,
                interests: user.interests,
            }))
        )

        console.log(`成功导入 ${users.length} 个用户`)
        return users
    } catch (error) {
        console.error('导入用户数据失败:', error)
        throw error
    }
}

// 导入资源数据
async function importResources() {
    try {
        const resourcesData = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../data/resources.json'),
                'utf8'
            )
        )
        // 清空现有集合
        await Resource.deleteMany({})

        const resources = await Resource.insertMany(
            resourcesData.map((resource) => ({
                title: resource.title,
                description: resource.description,
                contentType: resource.contentType,
                format: resource.format,
                subject: resource.subject,
                grade: resource.grade,
                difficulty: resource.difficulty,
                url: resource.url,
                cover: resource.cover,
                price: resource.price,
                authors: resource.authors,
                publisher: resource.publisher,
                tags: resource.tags,
                enrollCount: resource.enrollCount,
                averageRating: resource.averageRating,
            }))
        )

        console.log(`成功导入 ${resources.length} 个资源`)
        return resources
    } catch (error) {
        console.error('导入资源数据失败:', error)
        throw error
    }
}

// 导入用户交互数据
async function importInteractions(users, resources) {
    // 创建用户ID和资源ID的映射
    const userMap = new Map(users.map((user) => [user.email, user._id]))
    const resourceMap = new Map(
        resources.map((resource) => [resource.title, resource._id])
    )

    try {
        // 从users.json获取交互数据
        const usersData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf8')
        )

        // 清空现有集合
        await Interaction.deleteMany({})

        let interactions = []

        for (const userData of usersData) {
            if (
                userData.course_interactions &&
                userData.course_interactions.length > 0
            ) {
                // 根据email查找用户ID
                const user = await User.findOne({
                    email: userData.username + '@example.com',
                })

                if (user) {
                    const userInteractions = userData.course_interactions
                        .map((interaction) => {
                            // 通过课程ID查找资源
                            const resource = resources.find(
                                (r) => r.id === interaction.course_id
                            )

                            if (resource) {
                                return {
                                    user_id: user._id,
                                    resource_id: resource._id,
                                    rating: interaction.rating,
                                    completion_percentage:
                                        interaction.completion_percentage,
                                    favorite: interaction.favorite,
                                    watch_time_minutes:
                                        interaction.watch_time_minutes,
                                    notes: interaction.notes,
                                    date_completed: interaction.date_completed
                                        ? new Date(interaction.date_completed)
                                        : null,
                                }
                            }
                            return null
                        })
                        .filter(Boolean)

                    interactions = interactions.concat(userInteractions)
                }
            }
        }

        // 从accounts.json获取交互数据
        const accountsData = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../data/accounts.json'),
                'utf8'
            )
        )

        for (const account of accountsData) {
            if (
                account.course_interactions &&
                account.course_interactions.length > 0
            ) {
                const user = await User.findOne({ email: account.email })

                if (user) {
                    const accountInteractions = account.course_interactions
                        .map((interaction) => {
                            const resource = resources.find(
                                (r) => r.id === parseInt(interaction.course_id)
                            )

                            if (resource) {
                                return {
                                    user_id: user._id,
                                    resource_id: resource._id,
                                    rating: interaction.rating,
                                    completion_percentage:
                                        interaction.completion_percentage,
                                    favorite: interaction.favorite,
                                    date_completed: interaction.date_completed
                                        ? new Date(interaction.date_completed)
                                        : null,
                                }
                            }
                            return null
                        })
                        .filter(Boolean)

                    interactions = interactions.concat(accountInteractions)
                }
            }
        }

        const savedInteractions = await Interaction.insertMany(interactions)
        console.log(`成功导入 ${savedInteractions.length} 条交互记录`)
    } catch (error) {
        console.error('导入交互数据失败:', error)
        throw error
    }
}

// 导入资源关系数据
async function importResourceRelationships(resources) {
    try {
        const relationshipsData = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '../data/course_relationships.json'),
                'utf8'
            )
        )

        // 清空现有集合
        await ResourceRelationship.deleteMany({})

        const resourceIdMap = new Map(
            resources.map((resource) => [resource.id.toString(), resource._id])
        )

        const relationships = await Promise.all(
            relationshipsData.map(async (rel) => {
                // 查找主资源
                const resourceId = resourceIdMap.get(rel.course_id)

                if (!resourceId) return null

                const similar_resources = rel.similar_courses
                    ? rel.similar_courses
                          .map((sim) => {
                              const simResourceId = resourceIdMap.get(
                                  sim.course_id
                              )
                              return simResourceId
                                  ? {
                                        resource_id: simResourceId,
                                        similarity_score: sim.similarity_score,
                                        common_topics: sim.common_topics,
                                    }
                                  : null
                          })
                          .filter(Boolean)
                    : []

                const co_enrolled_with = rel.co_enrolled_with
                    ? rel.co_enrolled_with
                          .map((co) => {
                              const coResourceId = resourceIdMap.get(
                                  co.course_id
                              )
                              return coResourceId
                                  ? {
                                        resource_id: coResourceId,
                                        co_enrollment_count:
                                            co.co_enrollment_count,
                                        co_enrollment_percentage:
                                            co.co_enrollment_percentage,
                                    }
                                  : null
                          })
                          .filter(Boolean)
                    : []

                const recommended_sequence = rel.recommended_sequence
                    ? rel.recommended_sequence
                          .map((id) => resourceIdMap.get(id))
                          .filter(Boolean)
                    : []

                return {
                    resource_id: resourceId,
                    similar_resources,
                    co_enrolled_with,
                    recommended_sequence,
                }
            })
        )

        const savedRelationships = await ResourceRelationship.insertMany(
            relationships.filter(Boolean)
        )
        console.log(`成功导入 ${savedRelationships.length} 条资源关系`)
    } catch (error) {
        console.error('导入资源关系失败:', error)
        throw error
    }
}

// 执行导入
async function runMigration() {
    try {
        const users = await importUsers()
        const resources = await importResources()
        await importInteractions(users, resources)
        await importResourceRelationships(resources)
        console.log('数据迁移完成')
        process.exit(0)
    } catch (error) {
        console.error('迁移失败:', error)
        process.exit(1)
    }
}

runMigration()
```

### 4.4 修改推荐系统中的数据访问方法

将推荐系统中的数据加载方法从文件读取改为数据库查询：

```javascript
// 修改前 - 从文件读取
const loadResourcesData = () => {
    try {
        const jsonData = fs.readFileSync(RESOURCES_PATH, 'utf8')
        return JSON.parse(jsonData)
    } catch (error) {
        console.error('加载资源数据失败:', error)
        return []
    }
}

// 修改后 - 从MongoDB读取
const loadResourcesData = async () => {
    try {
        return await Resource.find().lean()
    } catch (error) {
        console.error('加载资源数据失败:', error)
        return []
    }
}
```

### 4.5 更新推荐算法的接口为异步

由于 MongoDB 查询是异步的，需要将推荐算法的接口也改为异步：

```javascript
// 修改前
export const contentBasedRecommendation = (user, limit = 10) => {
    // 同步代码
}

// 修改后
export const contentBasedRecommendation = async (user, limit = 10) => {
    // 异步代码
    const resources = await loadResourcesData()
    // ...
}
```

## 5. 实时用户交互记录功能

添加 API 端点记录用户与资源的交互：

```javascript
// controllers/interactionController.js
import Interaction from '../models/interactionModel.js'

export const recordInteraction = async (req, res) => {
    try {
        const { resource_id, rating, completion_percentage, favorite } =
            req.body
        const user_id = req.user.id // 从授权中间件获取

        // 查找现有交互或创建新的
        let interaction = await Interaction.findOne({ user_id, resource_id })

        if (interaction) {
            // 更新现有交互
            interaction.rating = rating || interaction.rating
            interaction.completion_percentage =
                completion_percentage || interaction.completion_percentage
            interaction.favorite =
                favorite !== undefined ? favorite : interaction.favorite
            interaction.updated_at = new Date()

            await interaction.save()
        } else {
            // 创建新交互
            interaction = await Interaction.create({
                user_id,
                resource_id,
                rating,
                completion_percentage,
                favorite,
                created_at: new Date(),
                updated_at: new Date(),
            })
        }

        res.status(200).json({
            status: 'success',
            data: { interaction },
        })
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message,
        })
    }
}
```

## 6. 性能优化建议

1. **索引设计**：对常用查询字段创建索引

    ```javascript
    // 在User模型中
    userSchema.index({ email: 1 })

    // 在Interaction模型中
    interactionSchema.index({ user_id: 1, resource_id: 1 })
    ```

2. **缓存**：对热门资源和常用数据使用 Redis 缓存

    ```javascript
    npm install redis
    ```

3. **分页**：大量数据查询使用分页技术

    ```javascript
    const resources = await Resource.find()
        .skip((page - 1) * limit)
        .limit(limit)
    ```

4. **聚合管道优化**：使用 MongoDB 聚合管道进行复杂查询
    ```javascript
    const popularResources = await Resource.aggregate([
        { $sort: { enrollCount: -1 } },
        { $limit: 10 },
    ])
    ```

## 7. 总结

将推荐系统从 JSON 文件迁移到 MongoDB 数据库将带来以下好处：

1. **实时性**：用户交互数据可以实时更新，推荐结果更加及时准确
2. **个性化**：能够根据用户最新的交互记录生成个性化推荐
3. **可扩展性**：支持更大规模的数据和用户
4. **持久性**：数据安全存储，不会因服务器重启而丢失
5. **查询灵活性**：MongoDB 提供强大的查询能力，支持复杂的数据分析

这一迁移需要更新代码的数据访问层，将同步操作转换为异步，并相应地调整 API 接口。完成迁移后，系统的可维护性和性能都将得到显著提升。
