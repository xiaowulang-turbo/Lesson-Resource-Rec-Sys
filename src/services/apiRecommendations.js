// Base URL for your API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

/**
 * Fetches homepage recommendations from the backend.
 * Handles both guest and logged-in users.
 */
export const fetchHomepageRecommendations = async (limit = 8) => {
    try {
        const url = `${API_URL}/recommendations/homepage?limit=${limit}`

        // Retrieve the token from local storage (or wherever it's stored)
        const token = localStorage.getItem('jwt') // Adjust if token is stored differently

        const headers = {
            'Content-Type': 'application/json',
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const res = await fetch(url, {
            method: 'GET',
            headers: headers,
        })

        if (!res.ok) {
            // Try to parse error message from backend if available
            let errorMessage = `HTTP error! status: ${res.status}`
            try {
                const errorData = await res.json()
                errorMessage = errorData.message || errorMessage
            } catch (e) {
                // Ignore if response body is not JSON or empty
            }
            throw new Error(errorMessage)
        }

        const data = await res.json()

        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch recommendations')
        }

        // Return the recommendations array
        return data.data.recommendations
    } catch (error) {
        console.error('Error fetching homepage recommendations:', error)
        // Re-throw the error so the calling component can handle it (e.g., show error message)
        throw error
    }
}

// Add other recommendation-related API functions here if needed
