import styled from 'styled-components'
import { Link } from 'react-router-dom'
import LoginForm from '../features/authentication/LoginForm'
import Logo from '../ui/Logo'
import Heading from '../ui/Heading'

const LoginLayout = styled.main`
    min-height: 100vh;
    display: grid;
    grid-template-columns: 48rem;
    align-content: center;
    justify-content: center;
    gap: 3.2rem;
    background-color: var(--color-grey-50);
`

const RegisterLink = styled.div`
    text-align: center;
    font-size: 1.4rem;
    color: var(--color-grey-600);

    & a {
        color: var(--color-brand-600);
        text-decoration: none;
        font-weight: 500;

        &:hover {
            text-decoration: underline;
        }
    }
`

function Login() {
    return (
        <LoginLayout>
            {/* <Logo /> */}
            <Heading type="h4">登录您的账户</Heading>
            <LoginForm />
            <RegisterLink>
                还没有账户? <Link to="/register">立即注册</Link>
            </RegisterLink>
        </LoginLayout>
    )
}

export default Login
