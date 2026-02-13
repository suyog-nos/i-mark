import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Button,
  useTheme
} from '@mui/material';
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
  /*
   * administrative-context
   * Validates high-level privileges and initializes system-wide monitoring state.
   * - stats: Aggregates metrics for users, articles, and engagement.
   * - fail-safe: Implements default values to ensure UI stability during partial API failures.
   */
  const { token, isAdmin, user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  // Initialize with safe defaults to prevent "infinite loading" if fetch fails
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
    /*
     * resilient-data-fetching
     * Executes a parallel data retrieval strategy with granular error isolation.
     * Uses a 'safeFetch' wrapper to ensure that a failure in one widget (e.g., Trends) 
     * does not crash the entire dashboard.
     * Aggregates distinct data streams into a unified 'stats' object for rendering.
     */
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Helper to safely fetch data or return default
        const safeFetch = async (url, fallback) => {
          try {
            console.log(`Fetching ${url} with token:`, token ? 'Present' : 'Missing');
            const res = await axios.get(url, {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000 // 10s timeout to prevent hanging
            });
            console.log(`Response from ${url}:`, res.data);
            return res.data;
          } catch (err) {
            console.error(`Failed to fetch ${url}:`, err.response?.status, err.message);
            return fallback;
          }
        };

        // Fetch all data in parallel
        const [dashboardData, categoriesData, mostReadData, trendsData] = await Promise.all([
          safeFetch('/api/analytics/dashboard', {
            totalUsers: 0, totalArticles: 0, pendingArticles: 0, totalViews: 0,
            userDistribution: [], topPublishers: []
          }),
          safeFetch('/api/analytics/categories', []),
          safeFetch('/api/analytics/most-read', []),
          safeFetch('/api/analytics/trends', [])
        ]);

        console.log('Dashboard data received:', dashboardData);

        // Transform userDistribution safely
        const usersByRole = {
          readers: dashboardData.userDistribution?.find(d => d._id === 'reader')?.count || 0,
          publishers: dashboardData.userDistribution?.find(d => d._id === 'publisher')?.count || 0,
          admins: dashboardData.userDistribution?.find(d => d._id === 'admin')?.count || 0
        };

        const newStats = {
          ...dashboardData,
          usersByRole,
          categoryDistribution: Array.isArray(categoriesData) ? categoriesData.map(c => ({ category: c._id || 'Uncategorized', count: c.count })) : [],
          mostRead: Array.isArray(mostReadData) ? mostReadData : [],
          trends: Array.isArray(trendsData) ? trendsData : []
        };

        console.log('Setting stats to:', newStats);
        setStats(newStats);

      } catch (err) {
        console.error('Critical error in dashboard:', err);
        setError('Partial data load failure. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (!user || !isAdmin) {
    return null;
  }

  if (error) {
    return (
      <Container sx={{ py: 10 }}>
        <Typography color="error" variant="h5" textAlign="center">{error}</Typography>
        <Button onClick={() => window.location.reload()} sx={{ mt: 2, display: 'block', mx: 'auto' }}>Retry</Button>
      </Container>
    );
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  // Chart Options for Theme Compatibility
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: theme.palette.text.primary }
      },
      title: { color: theme.palette.text.primary }
    },
    scales: {
      x: {
        ticks: { color: theme.palette.text.secondary },
        grid: { color: theme.palette.divider }
      },
      y: {
        ticks: { color: theme.palette.text.secondary },
        grid: { color: theme.palette.divider }
      }
    }
  };

  const userRoleData = {
    labels: ['Readers', 'Publishers', 'Admins'],
    datasets: [{
      data: [stats.usersByRole.readers, stats.usersByRole.publishers, stats.usersByRole.admins],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      borderWidth: 0,
    }]
  };

  const categoryChartData = {
    labels: stats.categoryDistribution.map(d => d.category),
    datasets: [{
      label: 'Articles',
      data: stats.categoryDistribution.map(d => d.count),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderRadius: 4
    }]
  };

  const userGrowthData = {
    labels: stats.trends.map(t => t._id),
    datasets: [{
      label: 'New Articles',
      data: stats.trends.map(t => t.count),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const mostReadData = {
    labels: stats.mostRead.map(a => a.title.length > 20 ? a.title.substring(0, 20) + '...' : a.title),
    datasets: [{
      label: 'Views',
      data: stats.mostRead.map(a => a.views),
      backgroundColor: 'rgba(16, 185, 129, 0.6)',
      borderRadius: 4
    }]
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="800" gutterBottom sx={{
          background: 'linear-gradient(45deg, #1e3a8a 30%, #3b82f6 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Analytics Dashboard
        </Typography>
        <Typography color="text.secondary" variant="subtitle1">
          Real-time platform usage and content statistics
        </Typography>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Views', val: stats.totalViews.toLocaleString(), color: '#3b82f6', path: null },
          { label: 'Total Articles', val: stats.totalArticles.toLocaleString(), color: '#10b981', path: '/admin/articles' },
          { label: 'Registered Users', val: stats.totalUsers.toLocaleString(), color: '#6366f1', path: '/admin/staff' },
          { label: 'Pending Review', val: stats.pendingArticles, color: '#ef4444', path: '/admin/articles' }
        ].map((item, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper
              elevation={0}
              onClick={() => item.path && navigate(item.path)}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: item.path ? 'pointer' : 'default',
                '&:hover': {
                  transform: item.path ? 'translateY(-4px)' : 'none',
                  boxShadow: item.path ? '0 8px 24px rgba(0,0,0,0.12)' : 'none'
                }
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ textTransform: 'uppercase' }}>
                {item.label}
              </Typography>
              <Typography variant="h3" fontWeight="800" sx={{ color: item.color, mt: 1 }}>
                {item.val}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Article Trend Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>Article Trend Over Time</Typography>
            <Box sx={{ height: 300 }}>
              <Line data={userGrowthData} options={commonOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* User Roles Doughnut */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>User Distribution</Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <Doughnut
                data={userRoleData}
                options={{
                  ...commonOptions,
                  cutout: '70%',
                  scales: {}, // No scales for doughnut
                  plugins: { legend: { position: 'bottom', labels: { color: theme.palette.text.primary } } }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Category Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>Category Wise Distribution</Typography>
            <Box sx={{ height: 300, position: 'relative' }}>
              {stats.categoryDistribution.length > 0 ? (
                <Bar
                  data={categoryChartData}
                  options={{
                    ...commonOptions,
                    indexAxis: 'y',
                    plugins: { legend: { display: false } }
                  }}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', color: 'text.disabled' }}>
                  <Typography variant="body2">No category data yet</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Most Read Articles Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>Most Read Articles</Typography>
            <Box sx={{ height: 300, position: 'relative' }}>
              {stats.mostRead.length > 0 ? (
                <Bar
                  data={mostReadData}
                  options={{
                    ...commonOptions,
                    indexAxis: 'y',
                    plugins: { legend: { display: false } }
                  }}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', color: 'text.disabled' }}>
                  <Typography variant="body2">No article views yet</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
