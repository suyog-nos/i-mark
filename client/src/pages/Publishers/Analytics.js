import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Paper,
    CircularProgress,
    Stack,
    Divider,
    LinearProgress
} from '@mui/material';
import {
    TrendingUp,
    Visibility,
    Favorite,
    Share,
    Comment,
    Article,
    Assessment,
    Timeline
} from '@mui/icons-material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const PublisherAnalytics = () => {
    /*
     * performance-metrology-engine
     * Calculates and visualizes key performance indicators (KPIs) for the publisher's content.
     * - Aggregates engagement metrics (Views, Likes, Shares).
     * - Analyzes content lifecycle distribution (Published vs Pending).
     * - Generates trend data for visual graphing.
     */
    const { user, token, isPublisher, isAdmin } = useAuth();
    const { id: routeId } = useParams();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [articles, setArticles] = useState([]);
    const [trends, setTrends] = useState([]);

    /*
     * metrics-aggregation-pipeline
     * Fetches raw analytic data from the backend and transforms it into chart-ready structures.
     * Computes derived statistics for the summary cards.
     * Supports both "Self" view (for Publishers) and "Inspection" view (for Admins viewing a publisher).
     */
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/analytics/publisher', {
                    params: routeId ? { id: routeId } : {},
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = response.data;

                setStats({
                    totalArticles: data.totalArticles,
                    totalViews: data.totalViews,
                    totalLikes: data.totalLikes,
                    totalShares: data.totalShares,
                    totalComments: data.totalComments,
                    publishedArticles: data.statusDistribution.find(s => s._id === 'published')?.count || 0,
                    pendingArticles: data.statusDistribution.find(s => s._id === 'pending')?.count || 0,
                    draftArticles: data.statusDistribution.find(s => s._id === 'draft')?.count || 0,
                    rejectedArticles: data.statusDistribution.find(s => s._id === 'rejected')?.count || 0
                });

                setArticles(data.topArticles.map(a => ({
                    id: a._id,
                    title: a.title,
                    views: a.views,
                    likes: a.likes?.length || 0,
                    shares: a.shares,
                    date: new Date(a.createdAt).toLocaleDateString()
                })));

                setTrends(data.trends || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching publisher analytics:', error);
                setLoading(false);
            }
        };

        if (token) {
            fetchAnalytics();
        }
    }, [token]);

    if (!user || (!isPublisher && !isAdmin)) {
        return null;
    }

    if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
    if (!stats) return <Box display="flex" justifyContent="center" py={10}><Typography>No analytics data available.</Typography></Box>;

    const performanceData = {
        labels: articles.length > 0 ? articles.map(a => a.title.length > 15 ? a.title.substring(0, 15) + '...' : a.title) : ['No Content'],
        datasets: [{
            label: 'Views per Article',
            data: articles.map(a => a.views),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderRadius: 12
        }]
    };

    const viewsOverTimeData = {
        labels: trends.length > 0 ? trends.map(t => t._id) : ['No Data'],
        datasets: [{
            label: 'Activity (Articles Created)',
            data: trends.map(t => t.count),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    const articleStatusData = {
        labels: ['Published', 'Pending', 'Draft', 'Rejected'],
        datasets: [{
            data: [
                stats.publishedArticles,
                stats.pendingArticles,
                stats.draftArticles,
                stats.rejectedArticles
            ],
            backgroundColor: ['#10b981', '#f59e0b', '#94a3b8', '#ef4444'],
            borderWidth: 0
        }]
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h4" fontWeight="800" gutterBottom display="flex" alignItems="center" gap={2}>
                    <Assessment color="primary" fontSize="large" />
                    Publisher Insights
                </Typography>
                <Typography color="text.secondary">Deep dive into your article performance and audience engagement.</Typography>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {[
                    { label: 'Total Articles', val: stats.totalArticles, icon: <Article color="primary" />, bg: '#eff6ff' },
                    { label: 'Total Views', val: stats.totalViews.toLocaleString(), icon: <Visibility color="secondary" />, bg: '#faf5ff' },
                    { label: 'Total Likes', val: stats.totalLikes, icon: <Favorite color="error" />, bg: '#fef2f2' },
                    { label: 'Total Shares', val: stats.totalShares, icon: <Share color="success" />, bg: '#f0fdf4' }
                ].map((item, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Card sx={{ borderRadius: '24px', boxShadow: 'none', border: '1px solid #efefef', bgcolor: item.bg }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    {item.icon}
                                    <TrendingUp sx={{ color: 'action.disabled', fontSize: 20 }} />
                                </Box>
                                <Typography variant="h4" fontWeight="800">{item.val || 0}</Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight="600">{item.label}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 4, borderRadius: '24px', boxShadow: 'none', border: '1px solid #eee', height: '100%' }}>
                        <Typography variant="h6" fontWeight="700" sx={{ mb: 4 }}>Publishing Activity</Typography>
                        <Box sx={{ height: 300 }}>
                            <Line
                                data={viewsOverTimeData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 4, borderRadius: '24px', boxShadow: 'none', border: '1px solid #eee', height: '100%' }}>
                        <Typography variant="h6" fontWeight="700" sx={{ mb: 4 }}>Status Distribution</Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <Doughnut
                                data={articleStatusData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom' } }
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper sx={{ p: 4, borderRadius: '24px', boxShadow: 'none', border: '1px solid #eee' }}>
                        <Typography variant="h6" fontWeight="700" sx={{ mb: 4 }}>Top Content Performance</Typography>
                        <Box sx={{ height: 300 }}>
                            <Bar
                                data={performanceData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: { x: { grid: { display: false } } }
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Article List Table */}
            <Paper sx={{ p: 4, borderRadius: '24px', boxShadow: 'none', border: '1px solid #eee' }}>
                <Typography variant="h6" fontWeight="700" sx={{ mb: 4 }}>Article Performance Details</Typography>
                <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: '16px 8px' }}>Title</th>
                                <th style={{ padding: '16px 8px' }}>Views</th>
                                <th style={{ padding: '16px 8px' }}>Likes</th>
                                <th style={{ padding: '16px 8px' }}>Shares</th>
                                <th style={{ padding: '16px 8px' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map(article => (
                                <tr key={article.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                    <td style={{ padding: '16px 8px' }}>{article.title}</td>
                                    <td style={{ padding: '16px 8px' }}>{article.views.toLocaleString()}</td>
                                    <td style={{ padding: '16px 8px' }}>{article.likes}</td>
                                    <td style={{ padding: '16px 8px' }}>{article.shares}</td>
                                    <td style={{ padding: '16px 8px' }}>{article.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            </Paper>
        </Container>
    );
};

export default PublisherAnalytics;
