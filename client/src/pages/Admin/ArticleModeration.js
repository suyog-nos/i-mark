import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
    Stack,
    useTheme,
    Avatar,
    Pagination
} from '@mui/material';
import {
    Check as CheckIcon,
    Close as CloseIcon,
    Article as ArticleIcon,
    Visibility as VisibilityIcon,
    Shield as ShieldIcon,
    Warning as WarningIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';


const ArticleModeration = () => {
    const { token } = useAuth();
    const theme = useTheme();
    const [filter, setFilter] = useState('pending');
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [rejectDialog, setRejectDialog] = useState({ open: false, articleId: null, type: 'reject', reason: '' });
    const [viewDialog, setViewDialog] = useState({ open: false, article: null });

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/admin/articles', {
                    params: { 
                        status: filter === 'all' ? undefined : filter,
                        page: page,
                        limit: 10
                    },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setArticles(response.data.articles);
                setTotalPages(response.data.totalPages || 1);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching articles:', err);
                setError('Failed to load articles');
                setLoading(false);
            }
        };

        if (token) {
            fetchArticles();
        }
    }, [token, filter, page]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setPage(1); // Reset to first page when changing filter
    };

    const handleAction = async (id, newStatus, message = '') => {
        try {
            let endpoint = '';
            if (newStatus === 'published') endpoint = 'approve';
            else if (newStatus === 'rejected') endpoint = 'reject';
            else if (newStatus === 'flagged') endpoint = 'flag';
            else if (newStatus === 'draft') endpoint = 'unpublish';
            else return;

            const response = await axios.put(`/api/admin/articles/${id}/${endpoint}`,
                { reason: message },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setArticles(articles.map(a => a._id === id ? response.data.article : a));
            setSuccess(`Article ${newStatus} successfully`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Failed to update article status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'success';
            case 'pending': return 'warning';
            case 'rejected': return 'error';
            case 'flagged': return 'secondary';
            case 'draft': return 'default';
            default: return 'default';
        }
    };

    const filteredArticles = articles.filter(a => filter === 'all' ? true : a.status === filter);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress /></Box>;
    }

    return (
        <Box className="mesh-gradient" sx={{ minHeight: '100vh', py: 6 }}>
            <Container maxWidth="xl">
                <Box sx={{ mb: 6, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 3 }}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <ShieldIcon color="primary" sx={{ fontSize: '2rem' }} />
                            <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-1px' }}>Moderation Center</Typography>
                        </Stack>
                        <Typography color="text.secondary" variant="h6" fontWeight="500">
                            Quality control and editorial review pipeline
                        </Typography>
                    </Box>
                    <Box className="glass-panel" sx={{ p: 1, borderRadius: '16px', display: 'flex', gap: 1, overflowX: 'auto' }}>
                        {['pending', 'published', 'flagged', 'rejected', 'all'].map(status => (
                            <Chip
                                key={status}
                                label={status.toUpperCase()}
                                onClick={() => handleFilterChange(status)}
                                sx={{ 
                                    fontWeight: 700, 
                                    px: 1,
                                    borderRadius: '10px',
                                    transition: 'all 0.2s',
                                    bgcolor: filter === status ? 'primary.main' : 'transparent',
                                    color: filter === status ? 'white' : 'text.secondary',
                                    '&:hover': { bgcolor: filter === status ? 'primary.dark' : 'rgba(0,0,0,0.05)' }
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                {success && <Alert severity="success" sx={{ mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'success.light' }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>}

                <TableContainer className="glass-panel" component={Paper} sx={{ borderRadius: 5, overflow: 'hidden' }}>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 3 }}>ARTICLE INFO</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 3 }}>PUBLISHER</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 3 }}>STATUS</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', py: 3 }}>ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredArticles.length > 0 ? filteredArticles.map((article) => (
                                <TableRow key={article._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ py: 3 }}>
                                        <Typography variant="subtitle1" fontWeight="800" sx={{ color: 'text.primary', mb: 0.5 }}>{article.title}</Typography>
                                        <Stack direction="row" spacing={1} divider={<Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled', alignSelf: 'center' }} />}>
                                            <Typography variant="caption" fontWeight="600" color="primary.main">{article.category}</Typography>
                                            <Typography variant="caption" color="text.secondary">{new Date(article.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.light', fontSize: '0.8rem', fontWeight: 800 }}>
                                                {article.author.name.charAt(0)}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight="700">{article.author.name}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={article.status.toUpperCase()}
                                            color={getStatusColor(article.status)}
                                            size="small"
                                            sx={{ fontWeight: 900, fontSize: '0.65rem', letterSpacing: '0.5px' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Preview Content">
                                                <IconButton size="small" onClick={() => setViewDialog({ open: true, article })} sx={{ border: '1px solid', borderColor: 'divider' }}>
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {article.status === 'pending' && (
                                                <>
                                                    <Tooltip title="Approve & Publish">
                                                        <IconButton size="small" color="success" onClick={() => handleAction(article._id, 'published')} sx={{ border: '1px solid', borderColor: 'success.light' }}>
                                                            <CheckIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Flag for Revision">
                                                        <IconButton size="small" color="secondary" onClick={() => setRejectDialog({ open: true, articleId: article._id, type: 'flag', reason: '' })} sx={{ border: '1px solid', borderColor: 'secondary.light' }}>
                                                            <WarningIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject Submission">
                                                        <IconButton size="small" color="error" onClick={() => setRejectDialog({ open: true, articleId: article._id, type: 'reject', reason: '' })} sx={{ border: '1px solid', borderColor: 'error.light' }}>
                                                            <CloseIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                            {article.status === 'published' && (
                                                <Tooltip title="Unpublish (Move to Draft)">
                                                    <IconButton size="small" color="warning" onClick={() => handleAction(article._id, 'draft')} sx={{ border: '1px solid', borderColor: 'warning.light' }}>
                                                        <VisibilityOffIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                        <Box sx={{ opacity: 0.3, mb: 2 }}>
                                            <ArticleIcon sx={{ fontSize: '60px' }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight="700" color="text.secondary">No articles found in this queue</Typography>
                                        <Typography variant="body2" color="text.disabled">Everything is up to date!</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination Section */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination 
                            count={totalPages} 
                            page={page} 
                            onChange={(e, v) => setPage(v)}
                            color="primary"
                            size="large"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    className: 'glass-panel',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' }
                                    }
                                }
                            }}
                        />
                    </Box>
                )}

                {/* Dialogs */}
                <Dialog 
                    open={rejectDialog.open} 
                    onClose={() => setRejectDialog({ ...rejectDialog, open: false })}
                    PaperProps={{ className: 'glass-panel', sx: { borderRadius: 4, p: 1 } }}
                >
                    <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem' }}>
                        {rejectDialog.type === 'reject' ? 'Reject Article' : 'Flag for Revision'}
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Provide detailed feedback for the publisher. This helps them improve the content.
                        </Typography>
                        <TextField
                            fullWidth multiline rows={4}
                            placeholder="e.g. Please verify the sources in paragraph 3..."
                            value={rejectDialog.reason}
                            onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
                            variant="outlined"
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button onClick={() => setRejectDialog({ ...rejectDialog, open: false })} sx={{ fontWeight: 700 }}>Dismiss</Button>
                        <Button
                            variant="contained"
                            disableElevation
                            color={rejectDialog.type === 'reject' ? 'error' : 'secondary'}
                            onClick={() => {
                                handleAction(rejectDialog.articleId, rejectDialog.type === 'reject' ? 'rejected' : 'flagged', rejectDialog.reason);
                                setRejectDialog({ ...rejectDialog, open: false });
                            }}
                            sx={{ fontWeight: 800, px: 4, borderRadius: '10px' }}
                        >
                            Confirm Decision
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={viewDialog.open}
                    onClose={() => setViewDialog({ open: false, article: null })}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{ className: 'glass-panel', sx: { borderRadius: 5 } }}
                >
                    <DialogTitle sx={{ fontWeight: 900, fontSize: '1.75rem', py: 4 }}>
                        {viewDialog.article?.title}
                    </DialogTitle>
                    <DialogContent dividers sx={{ borderBottom: 0 }}>
                        <Box sx={{ mb: 4, display: 'flex', gap: 3 }}>
                            <Box>
                                <Typography variant="overline" color="primary.main" fontWeight="800">CATEGORY</Typography>
                                <Typography variant="body1" fontWeight="700">{viewDialog.article?.category}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="overline" color="primary.main" fontWeight="800">PUBLISHER</Typography>
                                <Typography variant="body1" fontWeight="700">{viewDialog.article?.author.name}</Typography>
                            </Box>
                        </Box>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '1.1rem', color: 'text.primary' }}>
                            {viewDialog.article?.content}
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 4, pt: 2 }}>
                        <Button variant="contained" onClick={() => setViewDialog({ open: false, article: null })} sx={{ borderRadius: '10px', px: 4, fontWeight: 800 }}>
                            Done Reviewing
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default ArticleModeration;
