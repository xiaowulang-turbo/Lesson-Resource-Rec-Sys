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
import ResourceEdit from './pages/admin/ResourceEdit'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Search from './pages/Search'
import Upload from './pages/Upload'
import GlobalStyles from './styles/GlobalStyles'
import AppLayout from './ui/AppLayout'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './ui/ProtectedRoute'
import { DarkModeProvider } from './context/DarkModeContext'
import { LayoutProvider } from './context/LayoutContext'
import ResourceDetail from './pages/ResourceDetail'
import PageNotFound from './pages/PageNotFound'
import { AuthProvider } from './context/AuthContext'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 0,
        },
    },
})

function App() {
    return (
        <Router>
            <AuthProvider>
                <DarkModeProvider>
                    <LayoutProvider>
                        <QueryClientProvider client={queryClient}>
                            <ReactQueryDevtools initialIsOpen={false} />
                            <GlobalStyles />
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
                                    <Route
                                        index
                                        element={<Navigate replace to="home" />}
                                    />
                                    <Route path="home" element={<Home />} />
                                    <Route
                                        path="account"
                                        element={<Account />}
                                    />
                                    <Route
                                        path="settings"
                                        element={<Settings />}
                                    />
                                    <Route path="users" element={<Users />} />
                                    <Route
                                        path="resources"
                                        element={<Resources />}
                                    />
                                    <Route
                                        path="resource-management"
                                        element={<ResourceManagement />}
                                    />
                                    <Route
                                        path="resources/:id"
                                        element={<ResourceDetail />}
                                    />
                                    <Route
                                        path="resources/edit/:id"
                                        element={<ResourceEdit />}
                                    />
                                    <Route
                                        path="profile"
                                        element={<Profile />}
                                    />
                                    <Route path="search" element={<Search />} />
                                    <Route path="upload" element={<Upload />} />
                                </Route>
                                <Route path="*" element={<PageNotFound />} />
                            </Routes>
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
            </AuthProvider>
        </Router>
    )
}

export default App
