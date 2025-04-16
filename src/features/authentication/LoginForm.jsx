import { useState } from 'react'
import Button from '../../ui/Button'
import Form from '../../ui/Form'
import Input from '../../ui/Input'
import FormRowVertical from '../../ui/FormRowVertical'
import useLogin from './useLogin'
import SpinnerMini from '../../ui/SpinnerMini'

function LoginForm() {
    const [email, setEmail] = useState('xiaowu@example.com')
    const [password, setPassword] = useState('example0987')
    const { login, isLoading: isLoggingIn } = useLogin()

    function handleSubmit(e) {
        e.preventDefault()
        if (!email || !password) return

        login(
            { email, password },
            {
                onSettled: () => {
                    setEmail('')
                    setPassword('')
                },
            }
        )
    }

    return (
        <Form onSubmit={handleSubmit}>
            <FormRowVertical label="邮箱地址">
                <Input
                    type="email"
                    id="email"
                    disabled={isLoggingIn}
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱地址"
                />
            </FormRowVertical>
            <FormRowVertical label="密码">
                <Input
                    type="password"
                    id="password"
                    disabled={isLoggingIn}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                />
            </FormRowVertical>
            <FormRowVertical>
                <Button size="large" disabled={isLoggingIn}>
                    {isLoggingIn ? <SpinnerMini /> : '登录'}
                </Button>
            </FormRowVertical>
        </Form>
    )
}

export default LoginForm
