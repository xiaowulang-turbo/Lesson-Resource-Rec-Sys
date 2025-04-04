import { useState } from 'react'
import { isFuture, isPast, isToday } from 'date-fns'
import styled from 'styled-components'
import { Button } from '../ui/Button'
import { guests } from './data-guests'
import { cabins } from './data-cabins'
import { bookings } from './data-bookings'
import axios from 'axios'
import { BASE_URL } from '../services/apiConfig'

const StyledUploader = styled.div`
    margin-top: 2.5rem;
    padding: 2.5rem;
    background-color: var(--color-grey-0);
    border-radius: var(--border-radius-lg);
`

async function deleteGuests() {
    try {
        await axios.delete(`${BASE_URL}/guests`)
    } catch (error) {
        console.error('Error deleting guests:', error)
        throw error
    }
}

async function deleteCabins() {
    try {
        await axios.delete(`${BASE_URL}/cabins`)
    } catch (error) {
        console.error('Error deleting cabins:', error)
        throw error
    }
}

async function deleteBookings() {
    try {
        await axios.delete(`${BASE_URL}/bookings`)
    } catch (error) {
        console.error('Error deleting bookings:', error)
        throw error
    }
}

async function createGuests() {
    try {
        await axios.post(`${BASE_URL}/guests`, guests)
    } catch (error) {
        console.error('Error creating guests:', error)
        throw error
    }
}

async function createCabins() {
    try {
        await axios.post(`${BASE_URL}/cabins`, cabins)
    } catch (error) {
        console.error('Error creating cabins:', error)
        throw error
    }
}

async function createBookings() {
    try {
        // Get all guests
        const { data: guestsData } = await axios.get(`${BASE_URL}/guests`)
        const guestsIds = guestsData.map((guest) => guest.id)

        // Get all cabins
        const { data: cabinsData } = await axios.get(`${BASE_URL}/cabins`)
        const cabinsIds = cabinsData.map((cabin) => cabin.id)

        const finalBookings = bookings.map((booking) => {
            // Get random guestId
            const guestId =
                guestsIds[Math.floor(Math.random() * guestsIds.length)]
            // Get random cabinId
            const cabinId =
                cabinsIds[Math.floor(Math.random() * cabinsIds.length)]
            const numNights =
                booking.numNights ?? Math.floor(Math.random() * 14) + 1

            const cabinPrice = cabinsData.find(
                (cabin) => cabin.id === cabinId
            )?.regularPrice
            const extrasPrice = booking.hasBreakfast ? 15 : 0
            const totalPrice = (cabinPrice + extrasPrice) * numNights

            let status
            if (
                isPast(new Date(booking.endDate)) &&
                !isToday(new Date(booking.endDate))
            )
                status = 'checked-out'
            if (
                isFuture(new Date(booking.startDate)) ||
                isToday(new Date(booking.startDate))
            )
                status = 'unconfirmed'
            if (
                (isPast(new Date(booking.startDate)) ||
                    isToday(new Date(booking.startDate))) &&
                (isFuture(new Date(booking.endDate)) ||
                    isToday(new Date(booking.endDate)))
            )
                status = 'checked-in'

            return {
                ...booking,
                numNights,
                guestId,
                cabinId,
                totalPrice,
                status,
            }
        })

        await axios.post(`${BASE_URL}/bookings`, finalBookings)
    } catch (error) {
        console.error('Error creating bookings:', error)
        throw error
    }
}

function Uploader() {
    const [isLoading, setIsLoading] = useState(false)

    async function uploadAll() {
        setIsLoading(true)
        try {
            // 1. Delete all existing data
            await deleteGuests()
            await deleteCabins()
            await deleteBookings()

            // 2. Upload new data
            await createGuests()
            await createCabins()
            await createBookings()

            setIsLoading(false)
        } catch (err) {
            console.error(err)
            setIsLoading(false)
        }
    }

    return (
        <StyledUploader>
            <h3>SAMPLE DATA UPLOADER</h3>
            <Button onClick={uploadAll} disabled={isLoading}>
                Upload All
            </Button>
        </StyledUploader>
    )
}

export default Uploader
