/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import styled from 'styled-components'
import Tag from '../../ui/Tag'
import { Flag } from '../../ui/Flag'
import Button from '../../ui/Button'
import { Link } from 'react-router-dom'
import CheckoutButton from './CheckoutButton'

const StyledTodayItem = styled.li`
    display: grid;
    grid-template-columns: 9rem 2rem 1fr 7rem 9rem;
    gap: 1.2rem;
    align-items: center;

    font-size: 1.4rem;
    padding: 0.8rem 0;
    border-bottom: 1px solid var(--color-grey-100);

    &:first-child {
        border-top: 1px solid var(--color-grey-100);
    }
`

const Guest = styled.div`
    font-weight: 500;
`

function TodayItem({ activity }) {
    const { id, status, guests = {}, duration } = activity

    // 如果旧字段存在，则使用旧字段
    const nights = duration || activity.numNights

    // 处理可能为 undefined 的 guests 对象
    const guestName = guests?.fullName || '访客'
    const countryFlag = guests?.countryFlag || 'https://flagcdn.com/cn.svg' // 默认使用中国国旗
    const country = guests?.country || '未知'

    return (
        <StyledTodayItem>
            {status === 'unconfirmed' && <Tag type="green">Arriving</Tag>}
            {status === 'checked-in' && <Tag type="blue">Departing</Tag>}

            <Flag src={countryFlag} alt={`Flag of ${country}`} />
            <Guest>{guestName}</Guest>
            <div>{nights} nights</div>

            {status === 'unconfirmed' && (
                <Button
                    size="small"
                    variation="primary"
                    as={Link}
                    to={`/checkin/${id}`}
                >
                    Check in
                </Button>
            )}
            {status === 'checked-in' && <CheckoutButton bookingId={id} />}
        </StyledTodayItem>
    )
}

export default TodayItem
