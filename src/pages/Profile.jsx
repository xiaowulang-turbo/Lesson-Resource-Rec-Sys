import Heading from '../ui/Heading'
import Row from '../ui/Row'
import styled from 'styled-components'

const StyledProfile = styled.div`
    padding: 2.4rem;
`

const Description = styled.p`
    font-size: 1.6rem;
    color: var(--color-grey-500);
    margin-bottom: 2.4rem;
`

function Profile() {
    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">个人中心</Heading>
            </Row>

            <StyledProfile>
                <Description>
                    这里将展示用户的个人信息、学习进度和个性化推荐。
                </Description>
            </StyledProfile>
        </>
    )
}

export default Profile
