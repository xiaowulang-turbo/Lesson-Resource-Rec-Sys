import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Home from './pages/Home'
import Courses from './pages/Courses'
import Resources from './pages/Resources'
import Profile from './pages/Profile'
import Account from './pages/Account'
import Login from './pages/Login'
import Bookings from './pages/Bookings'
import Cabins from './pages/Cabins'
import DashBoard from './pages/Dashboard'
import PageNotFound from './pages/PageNotFound'
import Settings from './pages/Settings'
import Users from './pages/Users'
import GlobalStyles from './styles/GlobalStyles'
import AppLayout from './ui/AppLayout'
import { Toaster } from 'react-hot-toast'
import Booking from './pages/Booking'
import Checkin from './pages/Checkin'
import ProtectedRoute from './ui/ProtectedRoute'
import { DarkModeProvider } from './context/DarkModeContext'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // 1分钟
            cacheTime: 60 * 60 * 1000, // 1小时
            retry: 1,
        },
    },
})

function App() {
    return (
        <DarkModeProvider>
            <QueryClientProvider client={queryClient}>
                <ReactQueryDevtools initialIsOpen={false} />
                <GlobalStyles />
                <Router>
                    <Routes>
                        <Route
                            element={
                                <ProtectedRoute>
                                    <AppLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route
                                index
                                element={<Navigate replace to="home" />}
                            />
                            <Route path="dashboard" element={<Home />} />
                            <Route path="bookings" element={<Bookings />} />
                            <Route
                                path="bookings/:bookingId"
                                element={<Booking />}
                            />
                            <Route
                                path="checkin/:bookingId"
                                element={<Checkin />}
                            />
                            <Route path="cabins" element={<Cabins />} />
                            <Route path="account" element={<Account />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="home" element={<Home />} />
                            <Route path="users" element={<Users />} />
                            <Route path="courses" element={<Courses />} />
                            <Route path="resources" element={<Resources />} />
                            <Route path="profile" element={<Profile />} />
                        </Route>
                        <Route path="login" element={<Login />} />
                        <Route path="/" element={<Home />} />
                        <Route path="*" element={<PageNotFound />} />
                    </Routes>
                </Router>
                <Toaster
                    position="top-center"
                    gutter={12}
                    containerStyle={{
                        margin: '8px',
                    }}
                    toastOptions={{
                        success: {
                            duration: 3000,
                        },
                        error: {
                            duration: 5000,
                        },
                        style: {
                            fontSize: '16px',
                            maxWidth: '500px',
                            padding: '16px 24px',
                            backgroundColor: 'var(--color-grey-0)',
                            color: 'var(--color-grey-700)',
                        },
                    }}
                />
            </QueryClientProvider>
        </DarkModeProvider>
    )
}

export default App
