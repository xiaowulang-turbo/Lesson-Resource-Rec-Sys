import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateBooking } from "../../services/apiBookings";
import toast from "react-hot-toast";

export function useCheckout() {
  const queryClient = useQueryClient();

  // mutate && isLoading, we cannot say mutation
  const { mutate: checkout, isLoading: isCheckingout } = useMutation({
    // This mutationFn can only receive one argument
    mutationFn: (bookingId) =>
      updateBooking(bookingId, {
        status: "checked-out",
      }),

    onSuccess: (data) => {
      toast.success(`Booking ${data.id} successfully checked out `);
      queryClient.invalidateQueries({ active: true });
    },

    onError: () => toast.error("There was an error while checking out "),
  });

  return { checkout, isCheckingout };
}
