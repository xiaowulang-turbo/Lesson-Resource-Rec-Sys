export const BASE_URL = 'http://localhost:3000/api/v1'

export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        SIGNUP: '/auth/signup',
        LOGOUT: '/auth/logout',
    },
    USERS: {
        ME: '/users/me',
        UPDATE_ME: '/users/updateMe',
        DELETE_ME: '/users/deleteMe',
    },
    RESOURCES: {
        BASE: '/resources',
        RATINGS: (id) => `/resources/${id}/ratings`,
    },
    BOOKINGS: {
        BASE: '/bookings',
        SINGLE: (id) => `/bookings/${id}`,
        STATUS: (id) => `/bookings/${id}/status`,
    },
}
