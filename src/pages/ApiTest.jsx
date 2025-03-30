import ApiTester from '../components/ApiTester'
import Heading from '../ui/Heading'
import Row from '../ui/Row'

function ApiTest() {
    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">API测试</Heading>
            </Row>

            <Row>
                <ApiTester />
            </Row>
        </>
    )
}

export default ApiTest
