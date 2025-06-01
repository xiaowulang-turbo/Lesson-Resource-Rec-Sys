import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Home from './pages/Home'
import Account from './pages/Account'
import Settings from './pages/Settings'
import Users from './pages/Users'
import Resources from './pages/Resources'
import ResourceManagement from './pages/admin/ResourceManagement'
import UserManagement from './pages/admin/UserManagement'
import NotificationManagePage from './pages/admin/NotificationManagePage'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Search from './pages/Search'
import Upload from './pages/Upload'
import EditResource from './pages/EditResource'
import NotificationsPage from './pages/NotificationsPage'
import GlobalStyles from './styles/GlobalStyles'
import AppLayout from './ui/AppLayout'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './ui/ProtectedRoute'
import { DarkModeProvider } from './context/DarkModeContext'
import { LayoutProvider } from './context/LayoutContext'
import { NotificationProvider } from './context/NotificationContext'
import ResourceDetail from './pages/ResourceDetail'
import PageNotFound from './pages/PageNotFound'
import { AuthProvider, AuthContext } from './context/AuthContext'
import { useContext } from 'react'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 0,
        },
    },
})

function AppRoutes() {
    const { user } = useContext(AuthContext)
    return (
        <Routes>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate replace to="home" />} />
                <Route
                    path="home"
                    element={
                        user?.role === 'admin' ? (
                            <Navigate replace to="/admin/resource-management" />
                        ) : (
                            <Home />
                        )
                    }
                />
                <Route path="account" element={<Account />} />
                <Route path="settings" element={<Settings />} />
                <Route path="users" element={<Users />} />
                <Route
                    path="admin/resource-management"
                    element={<ResourceManagement />}
                />
                <Route
                    path="admin/user-management"
                    element={<UserManagement />}
                />
                <Route
                    path="admin/notification-management"
                    element={<NotificationManagePage />}
                />
                <Route
                    path="resources"
                    element={
                        user?.role === 'admin' ? (
                            <Navigate replace to="/admin/resource-management" />
                        ) : (
                            <Resources />
                        )
                    }
                />
                <Route path="resources/:id" element={<ResourceDetail />} />
                <Route path="resources/edit/:id" element={<EditResource />} />
                <Route path="profile" element={<Profile />} />
                <Route path="search" element={<Search />} />
                <Route path="upload" element={<Upload />} />
                <Route path="notifications" element={<NotificationsPage />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    )
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <NotificationProvider>
                    <DarkModeProvider>
                        <LayoutProvider>
                            <QueryClientProvider client={queryClient}>
                                <ReactQueryDevtools initialIsOpen={false} />
                                <GlobalStyles />
                                <AppRoutes />
                                <Toaster
                                    position="top-center"
                                    gutter={12}
                                    containerStyle={{ margin: '8px' }}
                                    toastOptions={{
                                        success: {
                                            duration: 1500,
                                        },
                                        error: {
                                            duration: 2000,
                                        },
                                        style: {
                                            fontSize: '16px',
                                            maxWidth: '500px',
                                            padding: '16px 24px',
                                            backgroundColor:
                                                'var(--color-grey-0)',
                                            color: 'var(--color-grey-700)',
                                        },
                                    }}
                                />
                            </QueryClientProvider>
                        </LayoutProvider>
                    </DarkModeProvider>
                </NotificationProvider>
            </AuthProvider>
        </Router>
    )
}

export default App
