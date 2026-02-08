import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    IconButton,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Stack
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    TrendingUp as AnalyticsIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const MyArticles = () => {
    const { token, user, isPublisher } = useAuth();
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyArticles();
    }, [token]);

    const fetchMyArticles = async () => {
        try {
            const res = await axios.get('/api/articles/my/articles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setArticles(res.data.articles);
        } catch (err) {
            setError('Failed to load your articles');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            try {
                await axios.delete(`/api/articles/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setArticles(articles.filter(a => a._id !== id));
            } catch (err) {
                setError('Failed to delete article');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'success';
            case 'pending': return 'warning';
            case 'rejected': return 'error';
            case 'scheduled': return 'info';
            default: return 'default';
        }
    };

    const Countdown = ({ targetDate }) => {
        const [timeLeft, setTimeLeft] = useState('');

        useEffect(() => {
            const timer = setInterval(() => {
                const now = new Date().getTime();
                const distance = new Date(targetDate).getTime() - now;

                if (distance < 0) {
                    setTimeLeft('Publishing Now...');
                    clearInterval(timer);
                } else {
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
                }
            }, 1000);
            return () => clearInterval(timer);
        }, [targetDate]);

        return <Typography variant="caption" sx={{ color: 'info.main', fontWeight: 600 }}>{timeLeft}</Typography>;
    };

    if (!user || !isPublisher) {
        return null;
    }

    if (loading) {
        return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="800">My Articles</Typography>
                    <Typography color="text.secondary">Manage your content and track status</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={Link}
                    to="/create-article"
                    sx={{ borderRadius: '12px', px: 3 }}
                >
                    New Article
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {articles.length === 0 ? (
                <Paper sx={{ p: 8, textAlign: 'center', borderRadius: '24px' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        You haven't written any articles yet.
                    </Typography>
                    <Button component={Link} to="/create-article" variant="outlined" sx={{ mt: 1 }}>
                        Start Writing
                    </Button>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: '24px', overflow: 'hidden' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell fontWeight="600">Article Title</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Stats</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {articles.map((article) => (
                                <TableRow key={article._id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight="700">
                                            {article.title}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={article.category} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ display: 'flex', gap: 1 }}>
                                            <span>👁️ {article.views}</span>
                                            <span>❤️ {article.likes.length}</span>
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack spacing={0.5}>
                                            <Chip
                                                label={article.status.toUpperCase()}
                                                color={getStatusColor(article.status)}
                                                size="small"
                                                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                                icon={article.status === 'scheduled' ? <ScheduleIcon style={{ fontSize: '1rem' }} /> : null}
                                            />
                                            {article.status === 'scheduled' && article.scheduledPublish && (
                                                <Countdown targetDate={article.scheduledPublish} />
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(article.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="View">
                                            <IconButton component={Link} to={`/articles/${article._id}`} color="info" size="small">
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton component={Link} to={`/edit-article/${article._id}`} color="primary" size="small">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Analytics">
                                            <IconButton color="secondary" size="small">
                                                <AnalyticsIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton onClick={() => handleDelete(article._id)} color="error" size="small">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default MyArticles;
