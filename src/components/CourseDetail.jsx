import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { getCourseById } from '../services/apiCourses'
import Spinner from '../ui/Spinner'
import {
    HiOutlineStar,
    HiStar,
    HiOutlineUserGroup,
    HiOutlineAcademicCap,
    HiOutlineBookOpen,
} from 'react-icons/hi'

const StyledCourseDetail = styled.div`
    width: 70rem;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2.4rem;
`

const Header = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`

const Title = styled.h2`
    font-size: 2.4rem;
    font-weight: 600;
    color: var(--color-grey-800);
`

const Organization = styled.p`
    font-size: 1.6rem;
    color: var(--color-grey-500);
    display: flex;
    align-items: center;
    gap: 0.8rem;

    & svg {
        width: 2rem;
        height: 2rem;
    }
`

const CourseInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1.6rem;
    margin-top: 0.8rem;
`

const InfoItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1.4rem;
    color: var(--color-grey-700);

    & svg {
        width: 2rem;
        height: 2rem;
        color: var(--color-brand-600);
    }
`

const Rating = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
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
`

const Section = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
`

const SectionTitle = styled.h3`
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--color-grey-800);
`

const Description = styled.p`
    font-size: 1.6rem;
    line-height: 1.6;
    color: var(--color-grey-700);
    white-space: pre-wrap;
`

const TopicsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 0.8rem;
`

const Topic = styled.span`
    font-size: 1.4rem;
    padding: 0.4rem 1.2rem;
    border-radius: var(--border-radius-sm);
    background-color: var(--color-grey-100);
    color: var(--color-grey-700);
`

const SkillsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    margin-top: 1.2rem;
`

const SkillItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1.2rem;
    padding: 1.2rem;
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-md);
`

const SkillIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.6rem;
    height: 3.6rem;
    background-color: var(--color-brand-100);
    border-radius: 50%;

    & svg {
        width: 2rem;
        height: 2rem;
        color: var(--color-brand-700);
    }
`

const SkillContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
`

const SkillName = styled.h4`
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--color-grey-800);
`

const SkillDescription = styled.p`
    font-size: 1.4rem;
    color: var(--color-grey-600);
`

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1.2rem;
    margin-top: 1.6rem;
`

const Button = styled.button`
    font-size: 1.4rem;
    padding: 1.2rem 2.4rem;
    font-weight: 500;
    border: none;
    border-radius: var(--border-radius-sm);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }

    &:active {
        transform: translateY(0);
    }
`

const PrimaryButton = styled(Button)`
    background-color: var(--color-brand-600);
    color: var(--color-grey-0);

    &:hover {
        background-color: var(--color-brand-700);
    }
`

const SecondaryButton = styled(Button)`
    background-color: var(--color-grey-100);
    color: var(--color-grey-700);

    &:hover {
        background-color: var(--color-grey-200);
    }
`

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    gap: 1.6rem;
    min-height: 30rem;
`

const LoadingText = styled.p`
    font-size: 1.6rem;
    color: var(--color-grey-500);
`

const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3.2rem;
    gap: 1.2rem;
    min-height: 20rem;
    text-align: center;
`

const ErrorMessage = styled.h3`
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--color-red-700);
`

const ErrorDetail = styled.p`
    font-size: 1.4rem;
    color: var(--color-grey-500);
    margin-bottom: 2rem;
`

function CourseDetail({ courseId, onCloseModal }) {
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchCourseDetails = async () => {
            if (!courseId) {
                console.error('没有提供课程ID')
                setError('没有提供课程ID')
                setLoading(false)
                return
            }

            console.log('正在获取课程详情，ID:', courseId)

            try {
                setLoading(true)
                setError(null)
                const data = await getCourseById(courseId)
                console.log('获取到的课程数据:', data)

                if (!data) {
                    setError('未获取到课程数据')
                    console.error('未获取到课程数据')
                } else {
                    setCourse(data)
                }
            } catch (err) {
                console.error('获取课程详情失败:', err.message)
                setError(`获取课程详情失败: ${err.message}`)
            } finally {
                setLoading(false)
            }
        }

        if (courseId) {
            fetchCourseDetails()
        } else {
            setError('没有提供课程ID')
            setLoading(false)
        }
    }, [courseId])

    if (loading)
        return (
            <LoadingContainer>
                <Spinner />
                <LoadingText>正在加载课程详情...</LoadingText>
            </LoadingContainer>
        )

    if (error)
        return (
            <ErrorContainer>
                <ErrorMessage>{error}</ErrorMessage>
                <ErrorDetail>请检查网络连接或联系管理员</ErrorDetail>
                {onCloseModal && (
                    <SecondaryButton onClick={onCloseModal}>
                        关闭
                    </SecondaryButton>
                )}
            </ErrorContainer>
        )

    if (!course)
        return (
            <ErrorContainer>
                <ErrorMessage>未找到课程信息</ErrorMessage>
                <ErrorDetail>课程ID: {courseId}</ErrorDetail>
                {onCloseModal && (
                    <SecondaryButton onClick={onCloseModal}>
                        关闭
                    </SecondaryButton>
                )}
            </ErrorContainer>
        )

    return (
        <StyledCourseDetail>
            <Header>
                <Title>{course.course_title}</Title>
                <Organization>
                    <HiOutlineAcademicCap />
                    {course.course_organization}
                </Organization>

                <CourseInfo>
                    <InfoItem>
                        <Rating>
                            <HiStar />
                            <span>{course.course_rating}</span>
                        </Rating>
                    </InfoItem>

                    <Label type="difficulty" value={course.course_difficulty}>
                        {course.course_difficulty}
                    </Label>

                    <InfoItem>
                        <HiOutlineUserGroup />
                        <span>{course.course_students_enrolled} 名学生</span>
                    </InfoItem>
                </CourseInfo>
            </Header>

            <Section>
                <SectionTitle>课程简介</SectionTitle>
                <Description>{course.course_description}</Description>
            </Section>

            <Section>
                <SectionTitle>主题</SectionTitle>
                <TopicsContainer>
                    {course.course_topics.map((topic, index) => (
                        <Topic key={index}>{topic}</Topic>
                    ))}
                </TopicsContainer>
            </Section>

            <Section>
                <SectionTitle>您将学到的技能</SectionTitle>
                <SkillsSection>
                    {course.course_skills.map((skill, index) => (
                        <SkillItem key={index}>
                            <SkillIcon>
                                <HiOutlineBookOpen />
                            </SkillIcon>
                            <SkillContent>
                                <SkillName>{skill}</SkillName>
                                <SkillDescription>
                                    掌握{skill}相关的知识和应用方法
                                </SkillDescription>
                            </SkillContent>
                        </SkillItem>
                    ))}
                </SkillsSection>
            </Section>

            <ButtonContainer>
                <SecondaryButton onClick={onCloseModal}>关闭</SecondaryButton>
                <PrimaryButton>开始学习</PrimaryButton>
            </ButtonContainer>
        </StyledCourseDetail>
    )
}

export default CourseDetail
