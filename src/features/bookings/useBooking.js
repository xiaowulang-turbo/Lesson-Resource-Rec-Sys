import { useQuery } from "@tanstack/react-query";

import { getBooking } from "../../services/apiBookings";
import { useParams } from "react-router-dom";

export function useBooking() {
  const { bookingId } = useParams();

  const {
    isLoading,
    data: booking,
    error,
  } = useQuery({
    // It's very important to add the bookingId to the query key, or else the query will not be refreshed when the bookingId changes
    queryKey: ["bookings", bookingId],
    queryFn: () => getBooking(bookingId),
    // just for fun, retry 3 times by default
    retry: true,
  });

  return { isLoading, booking, error };
}
