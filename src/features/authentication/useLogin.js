import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { login as loginApi } from '../../services/apiAuth'
import { useNavigate } from 'react-router-dom'

export default function useLogin() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { mutate: login, isLoading } = useMutation({
        mutationFn: ({ email, password }) => loginApi({ email, password }),

        onSuccess: (data) => {
            // data is an object which contains { data: { user, token } }
            toast.success('登录成功')
            queryClient.setQueryData(['user'], data.data.user)
            navigate('/dashboard', { replace: true })
        },

        onError: (error) => {
            console.log('ERROR', error)
            toast.error(error.message || '邮箱或密码不正确')
        },
    })

    return { login, isLoading }
}
