import mongoose from 'mongoose'
const { Schema } = mongoose

const courseRelationshipSchema = new Schema(
    {
        sourceCourseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        targetCourseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        relationshipType: {
            type: String,
            required: true,
            enum: ['prerequisite', 'successor', 'similar', 'recommended'],
        },
        strength: {
            type: Number,
            required: true,
            min: 0,
            max: 1,
            default: 0.5,
        },
        metadata: {
            commonTags: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'Tag',
                },
            ],
            commonStudents: Number,
            similarityScore: Number,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
)

// 添加复合索引
courseRelationshipSchema.index(
    { sourceCourseId: 1, targetCourseId: 1, relationshipType: 1 },
    { unique: true }
)
courseRelationshipSchema.index({ sourceCourseId: 1, strength: -1 })
courseRelationshipSchema.index({ targetCourseId: 1, strength: -1 })

const CourseRelationship = mongoose.model(
    'CourseRelationship',
    courseRelationshipSchema
)

export default CourseRelationship
