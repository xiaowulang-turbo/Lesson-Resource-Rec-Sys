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
import Account from './pages/Account'
import Settings from './pages/Settings'
import Users from './pages/Users'
import Resources from './pages/Resources'
import Profile from './pages/Profile'
import ApiTest from './pages/ApiTest'
import GlobalStyles from './styles/GlobalStyles'
import AppLayout from './ui/AppLayout'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './ui/ProtectedRoute'
import { DarkModeProvider } from './context/DarkModeContext'
import { LayoutProvider } from './context/LayoutContext'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 0,
        },
    },
})

function App() {
    return (
        <DarkModeProvider>
            <LayoutProvider>
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
                                <Route path="account" element={<Account />} />
                                <Route path="settings" element={<Settings />} />
                                <Route path="home" element={<Home />} />
                                <Route path="users" element={<Users />} />
                                <Route path="courses" element={<Courses />} />
                                <Route
                                    path="resources"
                                    element={<Resources />}
                                />
                                <Route path="profile" element={<Profile />} />
                                <Route path="api-test" element={<ApiTest />} />
                            </Route>
                        </Routes>
                    </Router>
                    <Toaster
                        position="top-center"
                        gutter={12}
                        containerStyle={{ margin: '8px' }}
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
            </LayoutProvider>
        </DarkModeProvider>
    )
}

export default App
