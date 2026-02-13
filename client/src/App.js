import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { BookmarkProvider } from './contexts/BookmarkContext';
import { SocketProvider } from './contexts/SocketContext';

/**
 * component-registry-imports
 * Centralized import block for application layout shells, routing guards, and page-level components.
 * Organized by semantic category (Layout, Auth, Common) and Domain (Pages).
 */
// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ScrollToTop from './components/Common/ScrollToTop';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Articles from './pages/Articles/Articles';
import ArticleDetail from './pages/Articles/ArticleDetail';
import CreateArticle from './pages/Articles/CreateArticle';
import EditArticle from './pages/Articles/EditArticle';
import ArticlePreview from './pages/Articles/ArticlePreview';
import Profile from './pages/Profile/Profile';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ArticleModeration from './pages/Admin/ArticleModeration';
import StaffManagement from './pages/Admin/StaffManagement';
import CreateUser from './pages/Admin/CreateUser';
import Publishers from './pages/Publishers/Publishers';
import Categories from './pages/Categories/Categories';
import Notifications from './pages/Notifications/Notifications';
import Bookmarks from './pages/Bookmarks/Bookmarks';
import MyArticles from './pages/Publishers/MyArticles';
import PublisherAnalytics from './pages/Publishers/Analytics';
import MySubscriptions from './pages/Publishers/MySubscriptions';
import Reports from './pages/Admin/Reports';

const AppRoutes = () => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes key={user?.id || 'guest'}>
      {/* 
        * public-route-definitions
        * Accessible to all visitors regardless of authentication state.
        * Serves as the entry point for discovery and acquisition workflows.
       */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/articles" element={<Articles />} />
      <Route path="/articles/:id" element={<ArticleDetail />} />
      <Route path="/publishers" element={<Publishers />} />
      <Route path="/categories" element={<Categories />} />

      {/* 
        * protected-route-enforcement
        * Implements Role-Based Access Control (RBAC) via the ProtectedRoute wrapper.
        * Routes are gated based on specific roles (Reader, Publisher, Admin) ensuring security and compliance.
       */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/create-article" element={
        <ProtectedRoute roles={['publisher', 'admin']}>
          <CreateArticle />
        </ProtectedRoute>
      } />
      <Route path="/edit-article/:id" element={
        <ProtectedRoute roles={['publisher', 'admin']}>
          <EditArticle />
        </ProtectedRoute>
      } />
      <Route path="/article-preview" element={
        <ProtectedRoute roles={['publisher', 'admin']}>
          <ArticlePreview />
        </ProtectedRoute>
      } />
      <Route path="/bookmarks" element={
        <ProtectedRoute>
          <Bookmarks />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />
      <Route path="/subscriptions" element={
        <ProtectedRoute>
          <MySubscriptions />
        </ProtectedRoute>
      } />
      <Route path="/publisher/my-articles" element={
        <ProtectedRoute roles={['publisher', 'admin']}>
          <MyArticles />
        </ProtectedRoute>
      } />
      <Route path="/publisher/analytics/:id?" element={
        <ProtectedRoute roles={['publisher', 'admin']}>
          <PublisherAnalytics />
        </ProtectedRoute>
      } />

      {/* 
        * admin-module-routes
        * High-privilege area restricted strictly to the 'admin' role.
        * Contains sensitive resource management and system oversight capabilities.
       */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute roles={['admin']}>
          <Reports />
        </ProtectedRoute>
      } />
      <Route path="/admin/articles" element={
        <ProtectedRoute roles={['admin']}>
          <ArticleModeration />
        </ProtectedRoute>
      } />
      <Route path="/admin/staff" element={
        <ProtectedRoute roles={['admin']}>
          <StaffManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/users/create" element={
        <ProtectedRoute roles={['admin']}>
          <CreateUser />
        </ProtectedRoute>
      } />

      {/* Fallback for /admin/* */}
      <Route path="/admin/*" element={
        <ProtectedRoute roles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

// App Content Component that uses theme
const AppContent = () => {
  const { theme } = useTheme();

  return (
    <MuiThemeProvider theme={theme}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-transition {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
      <CssBaseline />
      {/* 
       * provider-hierarchy-composition
       * Establishes the global context tree for the application.
       * Order is critical: 
       * 1. I18nProvider: Makes translation functions available.
       * 2. AuthProvider: Initializes user session.
       * 3. Domain Providers (Notification, Bookmark, Socket): Depend on Auth state.
       */}
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <NotificationProvider>
            <BookmarkProvider>
              <SocketProvider>
                <Router>
                  <div className="App">
                    <div id="back-to-top-anchor" />
                    <Navbar />
                    {/* 
                     * layout-shell-integration
                     * Wraps the dynamic route content with the persistent application shell (Navbar/Footer).
                     * Applies a transition class to animate route changes.
                     */}
                    <main style={{ flex: '1 0 auto' }} className="page-transition">
                      <AppRoutes />
                    </main>
                    <Footer />
                    <ScrollToTop />
                  </div>
                </Router>
              </SocketProvider>
            </BookmarkProvider>
          </NotificationProvider>
        </AuthProvider>
      </I18nextProvider>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
