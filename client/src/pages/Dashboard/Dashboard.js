import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Paper,
  Avatar,
  Stack,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  AddCircle,
  Article,
  Analytics,
  Notifications,
  Bookmark,
  People,
  Newspaper,
  TrendingUp,
  AccountCircle,
  ManageAccounts,
  AutoAwesome,
  ArrowForward
} from '@mui/icons-material';

const Dashboard = () => {
  const { user, isAdmin, isPublisher } = useAuth();
  const { t } = useTranslation();

  const readerFeatures = [
    { title: 'My Bookmarks', desc: 'Articles you saved for later', icon: <Bookmark />, color: '#4f46e5', link: '/bookmarks' },
    { title: 'Notifications', desc: 'Updates on your favorites', icon: <Notifications />, color: '#ec4899', link: '/notifications' },
    { title: 'Discover Publishers', desc: 'Find more media houses', icon: <People />, color: '#10b981', link: '/publishers' },
    { title: 'Daily News', desc: 'Browse the latest stories', icon: <Newspaper />, color: '#3b82f6', link: '/articles' },
  ];

  const publisherFeatures = [
    { title: 'Write New Article', desc: 'Compose and publish stories', icon: <AddCircle />, color: '#8b5cf6', link: '/create-article' },
    { title: 'My Articles', desc: 'Manage your existing content', icon: <Article />, color: '#f59e0b', link: '/publisher/my-articles' },
    { title: 'My Analytics', desc: 'Track your reach and views', icon: <Analytics />, color: '#3b82f6', link: '/publisher/analytics' },
    { title: 'Profile Settings', desc: 'Update your public bio', icon: <AccountCircle />, color: '#64748b', link: '/profile' },
  ];

  const adminFeatures = [
    { title: 'System Moderation', desc: 'Approve or reject new articles', icon: <ManageAccounts />, color: '#ef4444', link: '/admin/articles' },
    { title: 'Staff Management', desc: 'Manage user roles and staff', icon: <People />, color: '#3b82f6', link: '/admin/staff' },
    { title: 'Platform Analytics', desc: 'Holistic view of system growth', icon: <Analytics />, color: '#10b981', link: '/admin' },
    { title: 'Profile Settings', desc: 'Update your admin profile', icon: <AccountCircle />, color: '#64748b', link: '/profile' },
  ];

  const features = isAdmin ? adminFeatures : (isPublisher ? publisherFeatures : readerFeatures);
  const dashboardTitle = isAdmin ? "Administrator Command Center" : (isPublisher ? "Publisher Studio" : "Reader's Personalized Hub");

  return (
    <Container maxWidth="xl">
      {/* Premium Welcome Hero */}
      <Box sx={{
        position: 'relative',
        p: { xs: 4, md: 6 },
        mb: 6,
        borderRadius: '32px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
        border: (theme) => `1px solid ${theme.palette.divider}`
      }}>
        {/* Background Decorations */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: isAdmin ? 'linear-gradient(45deg, #ef4444 0%, #f87171 100%)' : 'linear-gradient(45deg, #3b82f6 0%, #8b5cf6 100%)',
          filter: 'blur(100px)',
          opacity: 0.08
        }} />

        <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid item>
            <Avatar
              src={user?.profile?.picture}
              sx={{
                width: 100,
                height: 100,
                border: '4px solid white',
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                bgcolor: 'primary.main',
                fontSize: '2.5rem'
              }}
            >
              {user?.name?.[0]}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
              <Chip
                label={dashboardTitle.toUpperCase()}
                size="small"
                sx={{
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: 'text.secondary',
                  letterSpacing: '1px'
                }}
              />
              {isPublisher && (
                <Chip
                  icon={<TrendingUp sx={{ fontSize: '1rem !important' }} />}
                  label="VERIFIED CREATOR"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ borderRadius: '8px', fontWeight: 700, fontSize: '0.7rem' }}
                />
              )}
            </Stack>
            <Typography variant="h3" fontWeight="800" gutterBottom sx={{
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, #fff, #94a3b8)'
                : 'linear-gradient(90deg, #1e293b, #334155)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              letterSpacing: '-1px'
            }}>
              Hello, {user?.name?.split(' ')[0]}! 👋
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, maxWidth: 600 }}>
              {isAdmin
                ? "Manage the platform ecosystem, moderate content, and oversee user activity."
                : isPublisher
                  ? "Access your creative tools, track performance, and manage your publications."
                  : "Welcome to your personal news hub. Discover stories tailored just for you."}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              component={Link}
              to="/profile"
              startIcon={<ManageAccounts />}
              sx={{
                borderRadius: '14px',
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.3)'
              }}
            >
              Profile Settings
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Feature Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="800" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <AutoAwesome sx={{ mr: 1.5, color: 'primary.main' }} />
          {isAdmin ? "Admin Controls" : isPublisher ? "Publisher Tools" : "Your Dashboard"}
        </Typography>

        <Grid container spacing={3}>
          {features.map((item, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card
                component={Link}
                to={item.link}
                sx={{
                  height: '100%',
                  borderRadius: '24px',
                  textDecoration: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  boxShadow: 'none',
                  overflow: 'visible',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                    borderColor: item.color,
                    '& .icon-box': {
                      transform: 'scale(1.1) rotate(5deg)',
                      boxShadow: `0 8px 16px -4px ${item.color}40`
                    }
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    className="icon-box"
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '20px',
                      bgcolor: item.color + '15',
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {React.cloneElement(item.icon, { sx: { fontSize: 32 } })}
                  </Box>
                  <Typography variant="h6" fontWeight="800" gutterBottom sx={{ color: 'text.primary' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    {item.desc}
                  </Typography>
                  <Typography
                    variant="button"
                    sx={{
                      color: item.color,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.875rem'
                    }}
                  >
                    Access <ArrowForward sx={{ ml: 0.5, fontSize: 16 }} />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Admin Quick Link */}
      {isAdmin && (
        <Box sx={{ mt: 2 }}>
          <Alert
            severity="info"
            icon={<ManageAccounts />}
            action={
              <Button component={Link} to="/admin" color="primary" variant="contained" size="small" sx={{ borderRadius: '8px', fontWeight: 700 }}>
                Enter Panel
              </Button>
            }
            sx={{
              borderRadius: '20px',
              py: 2,
              border: '1px solid #bae6fd',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(14, 165, 233, 0.1)' : '#f0f9ff'
            }}
          >
            <Typography variant="subtitle2" fontWeight="700">Administrator Access Active</Typography>
            <Typography variant="body2" color="text.secondary">You are currently logged in with global administrative privileges.</Typography>
          </Alert>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;
