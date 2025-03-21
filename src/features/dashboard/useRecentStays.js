import { useQuery } from '@tanstack/react-query'
import { getStaysAfterDate } from '../../services/apiBookings'
import { useSearchParams } from 'react-router-dom'
import { subDays } from 'date-fns'

export default function useRecentStays() {
    const [searchParams] = useSearchParams()

    const numDays = searchParams.get('last')
        ? parseInt(searchParams.get('last'))
        : 7

    const endDate = new Date()
    const startDate = subDays(endDate, numDays)
    const queryDate = startDate.toISOString()

    const { data: stays, isLoading } = useQuery({
        queryKey: ['stays', `last-${numDays}`],
        queryFn: () => getStaysAfterDate(queryDate),
    })

    const confirmedStays =
        stays?.filter(
            (stay) =>
                stay.status === 'checked-in' ||
                stay.status === 'checked-out' ||
                stay.status === 'in-progress' ||
                stay.status === 'completed'
        ) || []

    return {
        stays,
        isLoading,
        numDays,
        confirmedStays,
        startDate,
        endDate,
    }
}
