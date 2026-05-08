import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Button,
  useTheme,
  Avatar,
  Stack,
  IconButton,
  Divider
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  Group as GroupIcon,
  AssignmentLate as AssignmentLateIcon,
  TrendingUp,
  MoreVert as MoreVertIcon,
  ArrowForward
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const AdminDashboard = () => {
  const { token, isAdmin, user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const socket = useSocket();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    pendingArticles: 0,
    totalViews: 0,
    usersByRole: { readers: 0, publishers: 0, admins: 0 },
    categoryDistribution: [],
    mostRead: [],
    trends: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        /*
         * ANALYTICAL AGGREGATION AND OVERSIGHT WORKFLOW (Workflow Overview)
         * This controller serves as the primary intelligence hub for the entire platform. 
         * The workflow utilizes a "Safe-Fetch" architecture, which allows the dashboard to 
         * gracefully handle partial data failures without crashing the entire Control Center. 
         * By orchestrating concurrent requests via Promise.all, we aggregate real-time metrics 
         * across user distributions, content trends, and category saturation. This data is then 
         * transformed into a structured visual state that allows system administrators to monitor 
         * the "Content Pulse" of the application and make informed decisions on article 
         * approvals and publisher performance.
         */
        const safeFetch = async (url, fallback) => {
          try {
            const res = await axios.get(url, {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000
            });
            return res.data;
          } catch (err) {
            console.error(`Failed to fetch ${url}:`, err.message);
            return fallback;
          }
        };

        const [dashboardData, categoriesData, mostReadData, trendsData] = await Promise.all([
          safeFetch('/api/analytics/dashboard', {
            totalUsers: 0, totalArticles: 0, pendingArticles: 0, totalViews: 0,
            userDistribution: [], topPublishers: []
          }),
          safeFetch('/api/analytics/categories', []),
          safeFetch('/api/analytics/most-read', []),
          safeFetch('/api/analytics/trends', [])
        ]);

        const usersByRole = {
          readers: dashboardData.userDistribution?.find(d => d._id === 'reader')?.count || 0,
          publishers: dashboardData.userDistribution?.find(d => d._id === 'publisher')?.count || 0,
          admins: dashboardData.userDistribution?.find(d => d._id === 'admin')?.count || 0
        };

        setStats({
          ...dashboardData,
          usersByRole,
          categoryDistribution: Array.isArray(categoriesData) ? categoriesData.map(c => ({ category: c._id || 'Uncategorized', count: c.count })) : [],
          mostRead: Array.isArray(mostReadData) ? mostReadData : [],
          trends: Array.isArray(trendsData) ? trendsData : []
        });

      } catch (err) {
        setError('Partial data load failure. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  /*
   * real-time-synchronization-monitor
   * Listens for system-wide 'analytics_update' events broadcast via Socket.IO.
   * When an article is created, modified, or deleted elsewhere in the system, 
   * this effect triggers a non-disruptive background refresh of the dashboard metrics.
   * This ensures the Control Center remains a "Live" view of the platform state.
   */
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data) => {
      console.log('Real-time analytics update received:', data.type);
      // Trigger a silent refresh of the analytics data
      const refreshAnalytics = async () => {
        try {
          const safeFetch = async (url, fallback) => {
            try {
              const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000
              });
              return res.data;
            } catch (err) {
              return fallback;
            }
          };

          const [dashboardData, categoriesData, mostReadData, trendsData] = await Promise.all([
            safeFetch('/api/analytics/dashboard', stats),
            safeFetch('/api/analytics/categories', stats.categoryDistribution),
            safeFetch('/api/analytics/most-read', stats.mostRead),
            safeFetch('/api/analytics/trends', stats.trends)
          ]);

          const usersByRole = {
            readers: dashboardData.userDistribution?.find(d => d._id === 'reader')?.count || 0,
            publishers: dashboardData.userDistribution?.find(d => d._id === 'publisher')?.count || 0,
            admins: dashboardData.userDistribution?.find(d => d._id === 'admin')?.count || 0
          };

          setStats({
            ...dashboardData,
            usersByRole,
            categoryDistribution: Array.isArray(categoriesData) ? categoriesData.map(c => ({ category: c._id || 'Uncategorized', count: c.count })) : [],
            mostRead: Array.isArray(mostReadData) ? mostReadData : [],
            trends: Array.isArray(trendsData) ? trendsData : []
          });
        } catch (err) {
          console.error('Real-time refresh failed:', err);
        }
      };

      refreshAnalytics();
    };

    socket.on('analytics_update', handleUpdate);

    return () => {
      socket.off('analytics_update', handleUpdate);
    };
  }, [socket, token, stats]);

  if (!user || !isAdmin) return null;

  if (error) {
    return (
      <Container sx={{ py: 10 }}>
        <Typography color="error" variant="h5" textAlign="center">{error}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2, display: 'block', mx: 'auto' }}>Retry</Button>
      </Container>
    );
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress size={60} thickness={4} /></Box>;
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          color: theme.palette.text.secondary,
          font: { family: 'Inter', size: 12, weight: 500 },
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        ticks: { color: theme.palette.text.secondary, font: { size: 11 } },
        grid: { display: false }
      },
      y: {
        ticks: { color: theme.palette.text.secondary, font: { size: 11 } },
        grid: { color: theme.palette.divider, drawBorder: false }
      }
    }
  };

  const userRoleData = {
    labels: ['Readers', 'Publishers', 'Admins'],
    datasets: [{
      data: [stats.usersByRole.readers, stats.usersByRole.publishers, stats.usersByRole.admins],
      backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
      hoverOffset: 15,
      borderWidth: 0,
    }]
  };

  const categoryChartData = {
    labels: stats.categoryDistribution.map(d => d.category),
    datasets: [{
      label: 'Articles',
      data: stats.categoryDistribution.map(d => d.count),
      backgroundColor: 'rgba(99, 102, 241, 0.7)',
      hoverBackgroundColor: '#6366f1',
      borderRadius: 6,
      barThickness: 12
    }]
  };

  const userGrowthData = {
    labels: stats.trends.map(t => t._id),
    datasets: [{
      label: 'New Articles',
      data: stats.trends.map(t => t.count),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#6366f1'
    }]
  };

  const quickStats = [
    { label: 'Total Views', val: stats.totalViews.toLocaleString(), color: '#6366f1', icon: <VisibilityIcon />, path: null },
    { label: 'Total Articles', val: stats.totalArticles.toLocaleString(), color: '#10b981', icon: <DescriptionIcon />, path: '/admin/articles' },
    { label: 'System Users', val: stats.totalUsers.toLocaleString(), color: '#8b5cf6', icon: <GroupIcon />, path: '/admin/staff' },
    { label: 'Pending Review', val: stats.pendingArticles, color: '#f43f5e', icon: <AssignmentLateIcon />, path: '/admin/articles' }
  ];

  return (
    <Box className="mesh-gradient" sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="h3" fontWeight="900" sx={{
              letterSpacing: '-1.5px',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}>
              Control Center
            </Typography>
            <Typography color="text.secondary" variant="h6" fontWeight="500">
              System health and engagement overview
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Stack direction="row" spacing={2}>
              <Button 
                variant="outlined" 
                startIcon={<TrendingUp />}
                sx={{ borderRadius: '12px', borderWeight: 2 }}
              >
                View Full Reports
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Quick Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {quickStats.map((item, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper
                className="glass-panel"
                elevation={0}
                onClick={() => item.path && navigate(item.path)}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: item.path ? 'pointer' : 'default',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: item.path ? 'translateY(-6px)' : 'none',
                    boxShadow: 'var(--shadow-premium)',
                    '& .stat-icon': {
                      transform: 'scale(1.2) rotate(-10deg)',
                      opacity: 0.2
                    }
                  }
                }}
              >
                <Box className="stat-icon" sx={{ 
                  position: 'absolute', 
                  right: -10, 
                  bottom: -10, 
                  fontSize: '80px', 
                  color: item.color, 
                  opacity: 0.1,
                  transition: 'all 0.3s ease'
                }}>
                  {item.icon}
                </Box>
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary" fontWeight="700" sx={{ letterSpacing: '1px' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h3" fontWeight="900" sx={{ color: item.color }}>
                    {item.val}
                  </Typography>
                  {item.path && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: item.color }}>
                      <Typography variant="caption" fontWeight="600">Manage</Typography>
                      <ArrowForward sx={{ fontSize: '12px' }} />
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          {/* Main Trend Chart */}
          <Grid item xs={12} lg={8}>
            <Paper className="glass-panel" elevation={0} sx={{ p: 4, borderRadius: 5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" fontWeight="800">Content Pulse</Typography>
                <IconButton size="small"><MoreVertIcon /></IconButton>
              </Box>
              <Box sx={{ height: 350 }}>
                <Line data={userGrowthData} options={commonOptions} />
              </Box>
            </Paper>
          </Grid>

          {/* User Distribution */}
          <Grid item xs={12} lg={4}>
            <Paper className="glass-panel" elevation={0} sx={{ p: 4, borderRadius: 5, height: '100%' }}>
              <Typography variant="h5" fontWeight="800" sx={{ mb: 4 }}>User Ecosystem</Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                <Doughnut
                  data={userRoleData}
                  options={{
                    ...commonOptions,
                    cutout: '75%',
                    plugins: { ...commonOptions.plugins, legend: { position: 'bottom' } }
                  }}
                />
                <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="900">{stats.totalUsers}</Typography>
                  <Typography variant="caption" color="text.secondary">Total Souls</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 3 }} />
              <Stack spacing={2}>
                {['Readers', 'Publishers', 'Admins'].map((role, idx) => (
                  <Box key={role} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: userRoleData.datasets[0].backgroundColor[idx] }} />
                      <Typography variant="body2" fontWeight="600">{role}</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight="700">
                      {role === 'Readers' ? stats.usersByRole.readers : role === 'Publishers' ? stats.usersByRole.publishers : stats.usersByRole.admins}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Secondary Charts */}
          <Grid item xs={12} md={6}>
            <Paper className="glass-panel" elevation={0} sx={{ p: 4, borderRadius: 5 }}>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 3 }}>Category Saturation</Typography>
              <Box sx={{ height: 300 }}>
                <Bar
                  data={categoryChartData}
                  options={{
                    ...commonOptions,
                    indexAxis: 'y',
                    plugins: { ...commonOptions.plugins, legend: { display: false } }
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper className="glass-panel" elevation={0} sx={{ p: 4, borderRadius: 5 }}>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 3 }}>Top Performing Content</Typography>
              <Stack spacing={2.5}>
                {stats.mostRead.length > 0 ? stats.mostRead.slice(0, 5).map((article, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36, fontSize: '0.875rem', fontWeight: 800 }}>
                        #{i + 1}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight="700" noWrap>{article.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{article.category?.name || 'General'}</Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" fontWeight="800" color="primary.main" sx={{ ml: 2 }}>
                      {article.views.toLocaleString()} <VisibilityIcon sx={{ fontSize: '12px', ml: 0.5 }} />
                    </Typography>
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.disabled" textAlign="center" py={5}>No data available yet</Typography>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
