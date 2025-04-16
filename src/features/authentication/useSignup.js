import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { signup as signupApi } from '../../services/apiAuth'
import toast from 'react-hot-toast'

export default function useSignup() {
    const navigate = useNavigate()
    const { mutate: signup, isLoading } = useMutation({
        mutationFn: signupApi,
        onSuccess: (user) => {
            toast.success('注册成功！请使用您的邮箱和密码登录。')
            navigate('/login', { replace: true })
        },

        onError: (error) => {
            console.log('error', error)
            toast.error(error.message || '注册失败，请稍后再试。')
        },
    })

    return { signup, isLoading }
}
