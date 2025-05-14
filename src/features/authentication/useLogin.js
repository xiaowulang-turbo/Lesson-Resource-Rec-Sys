import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { login as loginApi } from '../../services/apiAuth'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function useLogin() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { login: authContextLogin } = useAuth()

    const { mutate: login, isLoading } = useMutation({
        mutationFn: ({ email, password }) => loginApi({ email, password }),

        onSuccess: (data) => {
            // data is the full authData object { status, token, data: { user } }
            toast.success('登录成功', {
                duration: 1500,
            })

            // 1. Update AuthContext state
            authContextLogin(data)

            // 2. Update React Query cache (if still needed, depends on useUser implementation)
            // queryClient.setQueryData(['user'], data.data.user) // Keep or remove based on how useUser works

            // 3. Navigate based on user role
            const userRole = data?.data?.user?.role
            if (userRole === 'admin') {
                navigate('/admin/resource-management', { replace: true })
            } else {
                navigate('/home', { replace: true })
            }
        },

        onError: (error) => {
            console.log('ERROR', error)
            toast.error(error.message || '邮箱或密码不正确')
        },
    })

    return { login, isLoading }
}
