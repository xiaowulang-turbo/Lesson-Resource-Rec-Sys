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
            },
        ],
        isRecommended: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

// 添加索引以提高查询性能
courseSchema.index({ course_id: 1 })
courseSchema.index({ course_title: 1 })
courseSchema.index({ course_difficulty: 1 })
courseSchema.index({ isRecommended: 1 })
courseSchema.index({ course_students_enrolled_count: -1 }) // 添加注册人数的索引，用于排序

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

const Course = mongoose.model('Course', courseSchema)

export default Course
