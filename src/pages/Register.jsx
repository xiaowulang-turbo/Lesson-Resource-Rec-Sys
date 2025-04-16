import styled from 'styled-components'
import SignupForm from '../features/authentication/SignupForm'
import Logo from '../ui/Logo' // Assuming Logo component exists
import Heading from '../ui/Heading'

const RegisterLayout = styled.main`
    min-height: 100vh;
    display: grid;
    grid-template-columns: 48rem; /* Consistent with Login page */
    align-content: center;
    justify-content: center;
    gap: 3.2rem;
    background-color: var(--color-grey-50);
`

function Register() {
    return (
        <RegisterLayout>
            {/* <Logo /> */}
            <Heading as="h4">创建新账户</Heading>
            <SignupForm />
        </RegisterLayout>
    )
}

export default Register
