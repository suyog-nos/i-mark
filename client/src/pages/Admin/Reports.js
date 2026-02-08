import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    Stack,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Download,
    PictureAsPdf,
    TableChart,
    Assessment,
    TrendingUp,
    Star,
    EmojiEvents
} from '@mui/icons-material';
import axios from 'axios';

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                setLoading(true);
                const [dashboardRes, mostReadRes] = await Promise.all([
                    axios.get('/api/analytics/dashboard', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                    axios.get('/api/analytics/most-read', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                ]);

                const data = dashboardRes.data;
                const mostRead = mostReadRes.data;

                setReportData({
                    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
                    summary: {
                        totalViews: data.totalViews.toLocaleString(),
                        totalNewUsers: data.totalUsers.toLocaleString(),
                        adRevenue: '$0', // Real revenue logic not yet implemented
                        engagementRate: 'N/A'
                    },
                    mostRead: mostRead.map(a => ({
                        title: a.title,
                        author: 'Author', // Author name missing from select, can be populated in backend
                        views: a.views.toLocaleString(),
                        change: '0%'
                    })),
                    topPublishers: data.topPublishers.map(p => ({
                        name: p.name,
                        articles: p.articleCount,
                        views: p.totalViews.toLocaleString(),
                        rating: 'N/A'
                    }))
                });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching report data:', err);
                setLoading(false);
            }
        };

        fetchReportData();
    }, []);

    const handleDownload = (format) => {
        alert(`Downloading report as ${format}... (Simulation)`);
    };

    if (loading) return null;

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                <Box>
                    <Typography variant="h4" fontWeight="900" gutterBottom>Monthly Reports</Typography>
                    <Typography color="text.secondary">Performance summary for {reportData.month}</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<TableChart />}
                        onClick={() => handleDownload('CSV')}
                        sx={{ borderRadius: '12px' }}
                    >
                        Export CSV
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PictureAsPdf />}
                        onClick={() => handleDownload('PDF')}
                        sx={{ borderRadius: '12px' }}
                    >
                        Export PDF
                    </Button>
                </Stack>
            </Box>

            {/* Performance Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {[
                    { label: 'Total Platform Views', val: reportData.summary.totalViews, icon: <TrendingUp color="primary" />, color: '#eff6ff' },
                    { label: 'New User Growth', val: reportData.summary.totalNewUsers, icon: <Star color="secondary" />, color: '#faf5ff' },
                    { label: 'Platform Revenue', val: reportData.summary.adRevenue, icon: <Assessment color="success" />, color: '#f0fdf4' },
                    { label: 'Engagement Rate', val: reportData.summary.engagementRate, icon: <EmojiEvents color="warning" />, color: '#fff7ed' }
                ].map((item, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Card sx={{ borderRadius: '24px', boxShadow: 'none', border: '1px solid #f1f5f9', bgcolor: item.color }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ mb: 2 }}>{item.icon}</Box>
                                <Typography variant="h4" fontWeight="800">{item.val}</Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight="600">{item.label}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={4}>
                {/* Most Read Articles */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: 'none' }}>
                        <Typography variant="h6" fontWeight="800" sx={{ mb: 4 }}>Most Read Articles</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Views</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Growth</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData.mostRead.map((article, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <Typography variant="subtitle2" fontWeight="700">{article.title}</Typography>
                                                <Typography variant="caption" color="text.secondary">By {article.author}</Typography>
                                            </TableCell>
                                            <TableCell fontWeight="600">{article.views}</TableCell>
                                            <TableCell color={article.change.startsWith('+') ? 'success.main' : 'error.main'}>
                                                <Typography variant="body2" fontWeight="700" sx={{ color: article.change.startsWith('+') ? 'success.main' : 'error.main' }}>
                                                    {article.change}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Top Publishers */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: 'none' }}>
                        <Typography variant="h6" fontWeight="800" sx={{ mb: 4 }}>Top Performers</Typography>
                        <Stack spacing={3}>
                            {reportData.topPublishers.map((pub, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            width: 40, height: 40, borderRadius: '12px', bgcolor: 'primary.light', color: 'primary.main',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                        }}>
                                            {i + 1}
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="700">{pub.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{pub.articles} Articles · {pub.rating}⭐</Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="button" fontWeight="800" color="primary">{pub.views}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Reports;
