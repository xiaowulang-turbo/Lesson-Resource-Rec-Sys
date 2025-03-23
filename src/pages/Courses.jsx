import Heading from '../ui/Heading'
import Row from '../ui/Row'
import CourseList from '../components/CourseList'
import RecommendedCourses from '../components/RecommendedCourses'

function Courses() {
    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">课程中心</Heading>
            </Row>

            <Row>
                <RecommendedCourses />
            </Row>

            <Row>
                <Heading as="h2">所有课程</Heading>
            </Row>

            <Row>
                <CourseList />
            </Row>
        </>
    )
}

export default Courses
