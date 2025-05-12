import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../../services/apiUsers'

export function useUsers() {
    const {
        isLoading,
        data: users,
        error,
    } = useQuery({
        queryKey: ['users'], // react-query 的 key
        queryFn: getUsers, // 获取数据的函数
    })

    return { isLoading, users, error }
}
