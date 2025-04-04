import { useState } from 'react'
import styled from 'styled-components'
import { getAllCourses, getCourseById } from '../services/apiCourses'

const Container = styled.div`
    padding: 2rem;
    background-color: var(--color-grey-100);
    border-radius: var(--border-radius-md);
    max-width: 60rem;
    margin: 0 auto;
`

const Title = styled.h2`
    font-size: 2rem;
    margin-bottom: 2rem;
    color: var(--color-grey-800);
`

const FormGroup = styled.div`
    margin-bottom: 1.6rem;
`

const Label = styled.label`
    display: block;
    font-size: 1.4rem;
    font-weight: 500;
    margin-bottom: 0.8rem;
`

const Input = styled.input`
    width: 100%;
    padding: 1.2rem;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    font-size: 1.6rem;
`

const Button = styled.button`
    background-color: var(--color-brand-600);
    color: white;
    border: none;
    padding: 1.2rem 2.4rem;
    border-radius: var(--border-radius-sm);
    font-size: 1.4rem;
    font-weight: 500;
    cursor: pointer;
    margin-right: 1rem;
    margin-bottom: 1rem;

    &:hover {
        background-color: var(--color-brand-700);
    }
`

const ResultContainer = styled.div`
    margin-top: 2rem;
    padding: 1.6rem;
    background-color: var(--color-grey-0);
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--color-grey-200);
`

const ResultHeader = styled.h3`
    font-size: 1.6rem;
    margin-bottom: 1rem;
    color: var(--color-grey-800);
`

const ResultContent = styled.pre`
    font-family: monospace;
    font-size: 1.4rem;
    background-color: var(--color-grey-50);
    padding: 1.6rem;
    border-radius: var(--border-radius-sm);
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
`

const Error = styled.div`
    color: var(--color-red-700);
    background-color: var(--color-red-100);
    padding: 1.6rem;
    border-radius: var(--border-radius-sm);
    margin-top: 1rem;
    font-size: 1.4rem;
`

function ApiTester() {
    const [courseId, setCourseId] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleFetchAllCourses = async () => {
        setLoading(true)
        setError(null)

        try {
            const data = await getAllCourses()
            setResult(data)
        } catch (err) {
            setError(`获取所有课程失败: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleFetchCourseById = async () => {
        if (!courseId.trim()) {
            setError('请输入课程ID')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const data = await getCourseById(courseId)
            setResult(data)
        } catch (err) {
            setError(`获取课程详情失败: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container>
            <Title>API测试工具</Title>

            <FormGroup>
                <Label htmlFor="courseId">课程ID</Label>
                <Input
                    id="courseId"
                    type="text"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    placeholder="请输入课程ID"
                />
            </FormGroup>

            <Button onClick={handleFetchAllCourses} disabled={loading}>
                获取所有课程
            </Button>

            <Button onClick={handleFetchCourseById} disabled={loading}>
                获取指定课程
            </Button>

            {loading && <p>加载中...</p>}

            {error && <Error>{error}</Error>}

            {result && (
                <ResultContainer>
                    <ResultHeader>
                        {Array.isArray(result) ? '所有课程' : '课程详情'}
                    </ResultHeader>
                    <ResultContent>
                        {JSON.stringify(result, null, 2)}
                    </ResultContent>
                </ResultContainer>
            )}
        </Container>
    )
}

export default ApiTester
