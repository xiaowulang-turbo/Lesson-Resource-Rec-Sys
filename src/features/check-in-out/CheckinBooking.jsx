/* eslint-disable no-unused-vars */
import styled from 'styled-components'
import BookingDataBox from '../../features/bookings/BookingDataBox'

import Row from '../../ui/Row'
import Heading from '../../ui/Heading'
import ButtonGroup from '../../ui/ButtonGroup'
import Button from '../../ui/Button'
import ButtonText from '../../ui/ButtonText'

import { useMoveBack } from '../../hooks/useMoveBack'
import { useBooking } from '../bookings/useBooking'
import Spinner from '../../ui/Spinner'
import { useEffect, useState } from 'react'
import Checkbox from '../../ui/Checkbox'
import { useCheckin } from './useCheckin'
import { useSettings } from '../settings/useSettings'
import { formatCurrency } from '../../utils/helpers'

const Box = styled.div`
    /* Box */
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem 4rem;
`

function CheckinBooking() {
    const [confirmPaid, setConfirmPaid] = useState(false)
    const [addBreakfast, setAddBreakfast] = useState(false)
    const { booking, isLoading } = useBooking()
    const { checkin, isCheckingIn } = useCheckin()
    const moveBack = useMoveBack()

    // We need the booking to compute state and make a request
    if (isLoading) return <Spinner />

    const {
        id: bookingId,
        resourceId,
        totalPoints,
        isPaid,
        includesMaterials,
        participantsCount,
        duration,
        userId,
    } = booking

    // 兼容旧字段名
    const hasBreakfast = includesMaterials || booking.hasBreakfast || false
    const numGuests = participantsCount || booking.numGuests || 1
    const numNights = duration || booking.numNights || 0
    const totalPrice = totalPoints || booking.totalPrice || 0

    // 可选的额外服务费用
    const optionalBreakfastPrice = 15 * numGuests * numNights

    function handleCheckin() {
        if (!confirmPaid) return

        if (addBreakfast) {
            checkin({
                bookingId,
                status: 'checked-in',
                isPaid: true,
                includesMaterials: true,
                totalPoints: totalPrice + optionalBreakfastPrice,
            })
        } else {
            checkin({ bookingId, status: 'checked-in', isPaid: true })
        }
    }

    return (
        <>
            <Row type="horizontal">
                <Heading as="h1">Check in booking #{bookingId}</Heading>
                <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
            </Row>

            <BookingDataBox booking={booking} />

            {/* 如果预订未包含早餐且未入住，则显示添加早餐选项 */}
            {!hasBreakfast && (
                <Box>
                    <Checkbox
                        checked={addBreakfast}
                        onChange={() => {
                            setAddBreakfast((add) => !add)
                            setConfirmPaid(false)
                        }}
                        id="breakfast"
                    >
                        Want to add educational materials for{' '}
                        {formatCurrency(optionalBreakfastPrice)}?
                    </Checkbox>
                </Box>
            )}

            <Box>
                <Checkbox
                    checked={confirmPaid}
                    onChange={() => setConfirmPaid((confirm) => !confirm)}
                    disabled={booking.isPaid || (addBreakfast && confirmPaid)}
                    id="confirm"
                >
                    I confirm that {userId?.fullName || 'the customer'} has paid
                    the total amount of{' '}
                    {!addBreakfast
                        ? formatCurrency(totalPrice)
                        : `${formatCurrency(
                              totalPrice + optionalBreakfastPrice
                          )} (${formatCurrency(totalPrice)} + ${formatCurrency(
                              optionalBreakfastPrice
                          )})`}
                </Checkbox>
            </Box>

            <ButtonGroup>
                <Button
                    onClick={handleCheckin}
                    disabled={!confirmPaid || isCheckingIn}
                >
                    Check in booking #{bookingId}
                </Button>
                <Button variation="secondary" onClick={moveBack}>
                    Back
                </Button>
            </ButtonGroup>
        </>
    )
}

export default CheckinBooking
