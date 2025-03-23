import Heading from '../ui/Heading'
import Row from '../ui/Row'
import styled from 'styled-components'

const StyledResources = styled.div`
    padding: 2.4rem;
`

const Description = styled.p`
    font-size: 1.6rem;
    color: var(--color-grey-500);
    margin-bottom: 2.4rem;
`

function Resources() {
    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">学习资源</Heading>
            </Row>

            <StyledResources>
                <Description>
                    这里将展示各类学习资源，包括文档、视频和练习题等。
                </Description>
            </StyledResources>
        </>
    )
}

export default Resources
