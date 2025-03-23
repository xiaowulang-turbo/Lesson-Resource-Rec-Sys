import mongoose from 'mongoose'

const chapterSchema = new mongoose.Schema({
    chapter_id: {
        type: Number,
        required: true,
    },
    chapter_title: {
        type: String,
        required: true,
    },
    chapter_duration_hours: {
        type: Number,
        required: true,
    },
})

const courseSchema = new mongoose.Schema(
    {
        course_id: {
            type: String,
            required: true,
            unique: true,
        },
        course_title: {
            type: String,
            required: true,
        },
        course_organization: {
            type: String,
            required: true,
        },
        course_Certificate_type: {
            type: String,
            required: true,
            enum: ['COURSE', 'SPECIALIZATION', 'PROFESSIONAL CERTIFICATE'],
        },
        course_rating: {
            type: Number,
            required: true,
        },
        course_difficulty: {
            type: String,
            required: true,
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Mixed'],
        },
        course_students_enrolled: {
            type: String,
            required: true,
        },
        course_description: {
            type: String,
            required: true,
        },
        course_topics: {
            type: [String],
            required: true,
        },
        course_skills: {
            type: [String],
            required: true,
        },
        course_language: {
            type: String,
            required: true,
        },
        course_prerequisites: {
            type: [String],
            required: true,
        },
        course_format: {
            type: [String],
            required: true,
        },
        course_duration_hours: {
            type: Number,
            required: true,
        },
        course_updated_date: {
            type: Date,
            required: true,
        },
        course_chapters: {
            type: [chapterSchema],
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

// 创建索引以提高查询性能
courseSchema.index({ course_title: 'text', course_description: 'text' })
courseSchema.index({ course_organization: 1 })
courseSchema.index({ course_Certificate_type: 1 })
courseSchema.index({ course_difficulty: 1 })
courseSchema.index({ course_language: 1 })

const Course = mongoose.model('Course', courseSchema)

export default Course
