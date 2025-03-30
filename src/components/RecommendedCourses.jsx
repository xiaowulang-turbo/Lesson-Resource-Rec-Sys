import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { getRecommendedCourses } from '../services/courseService'
import Spinner from '../ui/Spinner'
import Empty from '../ui/Empty'
import Heading from '../ui/Heading'
import Modal from '../ui/Modal'
import CourseDetail from './CourseDetail'

const StyledContainer = styled.div`
    background-color: var(--color-grey-0);
    border-radius: var(--border-radius-lg);
    padding: 2.4rem;
    margin-bottom: 2.4rem;
    box-shadow: var(--shadow-sm);
`

const CourseGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.6rem;
    margin-top: 1.6rem;
`

const CourseCard = styled.div`
    border: 1px solid var(--color-grey-200);
    border-radius: var(--border-radius-md);
    padding: 1.6rem;
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-sm);
    }
`

const CourseTitle = styled.h3`
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 0.8rem;
`

const CourseOrganization = styled.p`
    font-size: 1.4rem;
    color: var(--color-grey-500);
    margin-bottom: 0.8rem;
`

const CourseInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-bottom: 1.2rem;
`

const Rating = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`

const CourseRating = styled.span`
    font-size: 1.4rem;
    font-weight: 600;
`

const Label = styled.span`
    font-size: 1.2rem;
    font-weight: 600;
    padding: 0.4rem 0.8rem;
    border-radius: var(--border-radius-sm);
    text-transform: uppercase;

    ${(props) =>
        props.type === 'difficulty' &&
        props.value === 'Beginner' &&
        `
      background-color: var(--color-green-100);
      color: var(--color-green-700);
    `}

    ${(props) =>
        props.type === 'difficulty' &&
        props.value !== 'Beginner' &&
        `
      background-color: var(--color-blue-100);
      color: var(--color-blue-700);
    `}
  
  ${(props) =>
        props.type === 'students' &&
        `
      background-color: var(--color-grey-100);
      color: var(--color-grey-700);
    `}
`

const Description = styled.p`
    font-size: 1.4rem;
    color: var(--color-grey-700);
    line-height: 1.6;
`

function RecommendedCourses() {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedCourseId, setSelectedCourseId] = useState(null)

    useEffect(() => {
        const fetchRecommendedCourses = async () => {
            try {
                const data = await getRecommendedCourses()
                setCourses(data)
            } catch (err) {
                setError('获取推荐课程失败')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchRecommendedCourses()
    }, [])

    useEffect(() => {
        if (selectedCourseId) {
            console.log('RecommendedCourses - 选中的课程ID:', selectedCourseId)
        }
    }, [selectedCourseId])

    const handleCourseSelect = (courseId) => {
        console.log('点击推荐课程卡片，课程ID类型:', typeof courseId)
        console.log('点击推荐课程卡片，课程ID值:', courseId)
        setSelectedCourseId(courseId)
    }

    if (loading) return <Spinner />
    if (error) return <p>{error}</p>
    if (!courses.length) return <Empty resource={'recommended courses'} />

    return (
        <Modal>
            <StyledContainer>
                <Heading as="h2">推荐课程</Heading>

                <CourseGrid>
                    {courses.map((course, index) => (
                        <Modal.Open
                            key={`${course.course_id}-${index}`}
                            opens="recommended-course-detail"
                        >
                            <CourseCard
                                onClick={() =>
                                    handleCourseSelect(course.course_id)
                                }
                            >
                                <CourseTitle>{course.course_title}</CourseTitle>
                                <CourseOrganization>
                                    {course.course_organization}
                                </CourseOrganization>

                                <CourseInfo>
                                    <Rating>
                                        <CourseRating>
                                            {course.course_rating}
                                        </CourseRating>
                                        <span>★</span>
                                    </Rating>

                                    <Label
                                        type="difficulty"
                                        value={course.course_difficulty}
                                    >
                                        {course.course_difficulty}
                                    </Label>

                                    <Label type="students">
                                        {course.course_students_enrolled} 学生
                                    </Label>
                                </CourseInfo>

                                <Description>
                                    {course.course_description}
                                </Description>
                            </CourseCard>
                        </Modal.Open>
                    ))}
                </CourseGrid>
            </StyledContainer>

            <Modal.Window name="recommended-course-detail">
                <CourseDetail
                    courseId={selectedCourseId}
                    onCloseModal={() => {
                        console.log('关闭推荐课程详情模态框')
                        setSelectedCourseId(null)
                    }}
                />
            </Modal.Window>
        </Modal>
    )
}

export default RecommendedCourses
