import mongoose from 'mongoose'

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

const Course = mongoose.model('Course', courseSchema)

export default Course
