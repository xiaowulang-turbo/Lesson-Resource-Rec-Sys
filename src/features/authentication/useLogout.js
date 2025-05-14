import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logout as logoutApi } from '../../services/apiAuth'
// import { useNavigate } from "react-router-dom"; // No longer needed here
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext' // Import useAuth

export default function useLogout() {
    // const navigate = useNavigate(); // No longer needed here
    const queryClient = useQueryClient() // Keep for potential cache invalidation if needed elsewhere, but primary logout handled by context
    const { logout: authContextLogout } = useAuth() // Get logout from context

    const { mutate: logout, isLoading } = useMutation({
        mutationFn: logoutApi, // logoutApi clears localStorage
        onSuccess: () => {
            // Call context logout which handles state update and navigation
            authContextLogout()

            // queryClient.removeQueries(["user"]); // Context state change should be sufficient
            // navigate("/login", { replace: true }); // Handled by authContextLogout
            toast.success('Logout successful', {
                duration: 1500,
            })
        },

        onError: (error) => {
            console.log(error)
        },
    })

    return { logout, isLoading }
}
