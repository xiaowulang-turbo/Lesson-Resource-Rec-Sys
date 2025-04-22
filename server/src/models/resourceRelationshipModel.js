import mongoose from 'mongoose'

/**
 * 资源关系模型
 * 用于存储资源之间的关系，包括相似资源、共同访问和推荐序列
 */
const resourceRelationshipSchema = new mongoose.Schema(
    {
        resource_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resource',
            required: [true, '必须提供关联资源ID'],
            index: true,
        },
        resource_title: {
            type: String,
            trim: true,
        },
        similar_resources: [
            {
                resource_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Resource',
                },
                similarity_score: {
                    type: Number,
                    min: 0,
                    max: 1,
                    default: 0,
                },
                common_topics: [String],
                common_skills: [String],
            },
        ],
        co_accessed_with: [
            {
                resource_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Resource',
                },
                co_access_count: {
                    type: Number,
                    min: 0,
                    default: 0,
                },
                co_access_percentage: {
                    type: Number,
                    min: 0,
                    max: 100,
                    default: 0,
                },
            },
        ],
        recommended_sequence: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Resource',
            },
        ],
        created_at: {
            type: Date,
            default: Date.now,
        },
        updated_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// 添加索引以加速查询
resourceRelationshipSchema.index({ 'similar_resources.resource_id': 1 })
resourceRelationshipSchema.index({ 'co_accessed_with.resource_id': 1 })

// 前置钩子，更新时间戳
resourceRelationshipSchema.pre('save', function (next) {
    this.updated_at = Date.now()
    next()
})

// 虚拟属性，获取相似资源的数量
resourceRelationshipSchema.virtual('similar_resources_count').get(function () {
    return this.similar_resources ? this.similar_resources.length : 0
})

// 虚拟属性，获取共同访问资源的数量
resourceRelationshipSchema.virtual('co_accessed_count').get(function () {
    return this.co_accessed_with ? this.co_accessed_with.length : 0
})

const ResourceRelationship = mongoose.model(
    'ResourceRelationship',
    resourceRelationshipSchema
)

export default ResourceRelationship
