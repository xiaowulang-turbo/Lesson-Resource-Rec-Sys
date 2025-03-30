import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { getAllCourses } from '../services/courseService'
import Spinner from '../ui/Spinner'
import Empty from '../ui/Empty'
import Modal from '../ui/Modal'
import CourseDetail from './CourseDetail'

const CourseGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2.4rem;
    margin-bottom: 2.4rem;
`

const CourseCard = styled.div`
    background-color: var(--color-grey-0);
    border-radius: var(--border-radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
`

const CourseContent = styled.div`
    padding: 1.6rem 2rem;
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
    margin-bottom: 1.6rem;
    color: var(--color-grey-700);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
`

const TopicContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
`

const Topic = styled.span`
    font-size: 1.2rem;
    padding: 0.2rem 0.8rem;
    border-radius: var(--border-radius-sm);
    background-color: var(--color-grey-100);
    color: var(--color-grey-600);
`

function CourseList() {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedCourseId, setSelectedCourseId] = useState(null)

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getAllCourses()
                setCourses(data)
            } catch (err) {
                setError('获取课程列表失败')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchCourses()
    }, [])

    useEffect(() => {
        if (selectedCourseId) {
            console.log('CourseList - 选中的课程ID:', selectedCourseId)
        }
    }, [selectedCourseId])

    const handleCourseSelect = (courseId) => {
        console.log('点击课程卡片，课程ID类型:', typeof courseId)
        console.log('点击课程卡片，课程ID值:', courseId)
        setSelectedCourseId(courseId)
    }

    if (loading) return <Spinner />
    if (error) return <p>{error}</p>
    if (!courses.length) return <Empty resource={'courses'} />

    return (
        <>
            <Modal>
                <CourseGrid>
                    {courses.map((course) => (
                        <Modal.Open
                            key={course.course_id}
                            opens="course-detail"
                        >
                            <CourseCard
                                onClick={() =>
                                    handleCourseSelect(course.course_id)
                                }
                            >
                                <CourseContent>
                                    <CourseTitle>
                                        {course.course_title}
                                    </CourseTitle>
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
                                            {course.course_students_enrolled}{' '}
                                            学生
                                        </Label>
                                    </CourseInfo>

                                    <Description>
                                        {course.course_description}
                                    </Description>

                                    <TopicContainer>
                                        {course.course_topics.map((topic) => (
                                            <Topic
                                                key={`${course.course_id}-${topic}`}
                                            >
                                                {topic}
                                            </Topic>
                                        ))}
                                    </TopicContainer>
                                </CourseContent>
                            </CourseCard>
                        </Modal.Open>
                    ))}
                </CourseGrid>

                <Modal.Window name="course-detail">
                    <CourseDetail
                        courseId={selectedCourseId}
                        onCloseModal={() => console.log('关闭课程详情模态框')}
                    />
                </Modal.Window>
            </Modal>
        </>
    )
}

export default CourseList
