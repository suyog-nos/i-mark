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
  ManageAccounts
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
      {/* Welcome Hero */}
      <Paper elevation={0} sx={{
        p: { xs: 3, md: 4 },
        mb: 4,
        borderRadius: '24px',
        bgcolor: '#f8fafc',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        gap: 4
      }}>
        <Avatar
          src={user?.profile?.picture}
          sx={{ width: 120, height: 120, border: '4px solid white', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}
        />
        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="h3" fontWeight="800" sx={{ mb: 1 }}>
            {dashboardTitle}
          </Typography>
          <Typography variant="h5" fontWeight="400" color="text.secondary" sx={{ mb: 1 }}>
            Welcome back, {user?.name}!
          </Typography>
          <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mb: 2 }}>
            <Chip
              label={user?.role?.toUpperCase()}
              color="primary"
              size="small"
              sx={{ fontWeight: 800, borderRadius: '8px' }}
            />
            {isPublisher && <Chip label="Verified Writer" variant="outlined" color="success" size="small" sx={{ fontWeight: 700 }} />}
          </Stack>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            {isAdmin
              ? "Oversee the entire platform, moderate content, and manage staff operations."
              : isPublisher
                ? "Share your latest insights and reach your audience today."
                : "Explore the latest stories curated specifically for your interests."}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            component={Link}
            to="/profile"
            startIcon={<ManageAccounts />}
            sx={{ borderRadius: '12px', px: 4, py: 1.5 }}
          >
            Account Settings
          </Button>
        </Box>
      </Paper>

      {/* Feature Grid */}
      <Typography variant="h5" fontWeight="700" sx={{ mb: 3 }}>
        {isAdmin ? "Administrator Controls" : isPublisher ? "Publisher Toolkit" : "Your Personal Dashboard"}
      </Typography>

      <Grid container spacing={3}>
        {features.map((item, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{
              height: '100%',
              borderRadius: '24px',
              transition: 'all 0.3s ease',
              border: '1px solid #eee',
              boxShadow: 'none',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.05)',
                borderColor: item.color
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  bgcolor: item.color + '15',
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3
                }}>
                  {item.icon}
                </Box>
                <Typography variant="h6" fontWeight="700" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {item.desc}
                </Typography>
                <Button
                  component={Link}
                  to={item.link}
                  sx={{
                    color: item.color,
                    fontWeight: 700,
                    p: 0,
                    '&:hover': { bgcolor: 'transparent', opacity: 0.8 }
                  }}
                >
                  Enter Section &rarr;
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Admin Quick Link */}
      {isAdmin && (
        <Box sx={{ mt: 4 }}>
          <Alert
            severity="info"
            icon={<ManageAccounts />}
            action={
              <Button component={Link} to="/admin" color="inherit" size="small" sx={{ fontWeight: 800 }}>
                Go to Admin Panel
              </Button>
            }
            sx={{ borderRadius: '16px', py: 2 }}
          >
            <strong>System Administrator Access Detected.</strong> You have full access to platform management tools.
          </Alert>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;
