import mongoose from 'mongoose'

// 辅助函数：将带有k/K后缀的字符串转换为数字
function parseEnrollmentCount(str) {
    if (!str) return 0
    str = str.toString().toLowerCase()
    if (str.endsWith('k')) {
        return Math.floor(parseFloat(str.slice(0, -1)) * 1000)
    }
    return parseInt(str) || 0
}

const courseSchema = new mongoose.Schema(
    {
        course_id: {
            type: String,
            required: [true, '课程ID是必需的'],
            unique: true,
        },
        course_title: {
            type: String,
            required: [true, '课程标题是必需的'],
        },
        course_organization: {
            type: String,
            required: [true, '课程所属机构是必需的'],
        },
        course_Certificate_type: {
            type: String,
            enum: ['COURSE', 'SPECIALIZATION', 'DEGREE'],
            default: 'COURSE',
        },
        course_rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        course_difficulty: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
            required: [true, '课程难度是必需的'],
        },
        course_students_enrolled: {
            type: String,
            default: '0',
        },
        course_students_enrolled_count: {
            type: Number,
            default: 0,
        },
        course_description: {
            type: String,
            required: [true, '课程描述是必需的'],
        },
        course_topics: {
            type: [String],
            default: [],
        },
        course_skills: {
            type: [String],
            default: [],
        },
        course_language: {
            type: String,
            required: [true, '课程语言是必需的'],
        },
        course_prerequisites: {
            type: [String],
            default: [],
        },
        course_format: {
            type: [String],
            default: [],
        },
        course_duration_hours: {
            type: Number,
            required: [true, '课程时长是必需的'],
        },
        course_updated_date: {
            type: Date,
            default: Date.now,
        },
        course_chapters: [
            {
                chapter_id: Number,
                chapter_title: String,
                chapter_duration_hours: Number,
                chapter_description: String,
                learning_objectives: [String],
                resources: [
                    {
                        type: mongoose.Schema.ObjectId,
                        ref: 'Resource',
                    },
                ],
            },
        ],
        targetAudience: {
            grades: [String],
            subjects: [String],
            prerequisites: [String],
        },
        learningOutcomes: [
            {
                type: String,
                trim: true,
            },
        ],
        instructors: [
            {
                instructor_id: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                },
                name: String,
                title: String,
                bio: String,
            },
        ],
        reviews: [
            {
                user: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                },
                rating: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 5,
                },
                review: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        tags: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Tag',
            },
        ],
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft',
        },
        pricing: {
            isFree: {
                type: Boolean,
                default: true,
            },
            price: {
                type: Number,
                default: 0,
            },
            currency: {
                type: String,
                default: 'CNY',
            },
        },
        isRecommended: {
            type: Boolean,
            default: false,
        },
        metadata: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// 虚拟字段：计算平均评分
courseSchema.virtual('averageRating').get(function () {
    if (this.reviews.length === 0) return 0
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / this.reviews.length).toFixed(1)
})

// 添加索引以提高查询性能
courseSchema.index({ course_id: 1 })
courseSchema.index({ course_title: 'text', course_description: 'text' })
courseSchema.index({ course_difficulty: 1 })
courseSchema.index({ isRecommended: 1 })
courseSchema.index({ course_students_enrolled_count: -1 })
courseSchema.index({ status: 1 })
courseSchema.index({ 'pricing.isFree': 1 })
courseSchema.index({ 'targetAudience.grades': 1 })
courseSchema.index({ 'targetAudience.subjects': 1 })
courseSchema.index({ tags: 1 })

// 在保存前自动计算注册人数
courseSchema.pre('save', function (next) {
    if (this.isModified('course_students_enrolled')) {
        this.course_students_enrolled_count = parseEnrollmentCount(
            this.course_students_enrolled
        )
    }
    next()
})

// 更新现有数据的静态方法
courseSchema.statics.updateAllEnrollmentCounts = async function () {
    const courses = await this.find({})
    for (const course of courses) {
        course.course_students_enrolled_count = parseEnrollmentCount(
            course.course_students_enrolled
        )
        await course.save()
    }
}

// 添加新的实例方法
courseSchema.methods.addReview = async function (userId, rating, review) {
    this.reviews.push({
        user: userId,
        rating,
        review,
    })
    await this.save()
}

courseSchema.methods.addTag = async function (tagId) {
    if (!this.tags.includes(tagId)) {
        this.tags.push(tagId)
        await this.save()
    }
}

courseSchema.methods.updateStatus = async function (newStatus) {
    this.status = newStatus
    await this.save()
}

const Course = mongoose.model('Course', courseSchema)

export default Course
