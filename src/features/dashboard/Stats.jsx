/* eslint-disable react/prop-types */
import { useQuery } from '@tanstack/react-query'
import {
    HiOutlineBanknotes,
    HiOutlineBriefcase,
    HiOutlineCalendarDays,
    HiOutlineChartBar,
} from 'react-icons/hi2'
import Stat from './Stat'
import { formatCurrency, subtractDates } from '../../utils/helpers'

export default function Stats({
    bookings = [],
    confirmedStays = [],
    cabins = [],
    dateStart,
    dateEnd,
}) {
    // 1.
    const numBookings = bookings?.length || 0

    // 2.
    const sales =
        bookings?.reduce((acc, cur) => acc + (cur.totalPrice || 0), 0) || 0

    // 3.
    const checkins = confirmedStays?.length || 0

    // 4. 计算入住率，添加防护检查
    const numDays = dateStart && dateEnd ? subtractDates(dateEnd, dateStart) : 1
    const occupation =
        confirmedStays?.reduce(
            (acc, cur) => acc + (cur.numNights || cur.duration || 0),
            0
        ) /
            ((cabins?.length || 1) * numDays) || 0

    // Calculating the stay duration statistics
    const avgDuration = confirmedStays?.length
        ? confirmedStays.reduce(
              (acc, cur) => acc + (cur.duration || cur.numNights || 0),
              0
          ) / confirmedStays.length
        : 0

    return (
        <>
            <Stat
                title="Bookings"
                color="blue"
                icon={<HiOutlineBriefcase />}
                value={numBookings}
            />
            <Stat
                title="Sales"
                color="green"
                icon={<HiOutlineBanknotes />}
                value={formatCurrency(sales)}
            />
            <Stat
                title="Check ins"
                color="indigo"
                icon={<HiOutlineCalendarDays />}
                value={checkins}
            />
            <Stat
                title="Occupancy rate"
                color="yellow"
                icon={<HiOutlineChartBar />}
                value={Math.round(occupation * 100) + '%'}
            />
        </>
    )
}
