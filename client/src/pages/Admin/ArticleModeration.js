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
    Divider
} from '@mui/material';
import {
    Check as CheckIcon,
    Close as CloseIcon,
    Article as ArticleIcon,
    Visibility as VisibilityIcon,
    ArrowBack as ArrowBackIcon,
    Shield as ShieldIcon,
    Warning as WarningIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const ArticleModeration = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('pending');
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [rejectDialog, setRejectDialog] = useState({ open: false, articleId: null, type: 'reject', reason: '' });
    const [viewDialog, setViewDialog] = useState({ open: false, article: null });

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                setLoading(true);
                // We use the general articles endpoint with status filters if needed
                // or the moderation queue endpoint for pending specifically
                const response = await axios.get('/api/admin/articles', {
                    params: { status: filter === 'all' ? undefined : filter },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setArticles(response.data.articles);
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
    }, [token, filter]);

    const handleAction = async (id, newStatus, message = '') => {
        try {
            let endpoint = '';
            if (newStatus === 'published') endpoint = 'approve';
            else if (newStatus === 'rejected') endpoint = 'reject';
            else if (newStatus === 'flagged') endpoint = 'flag';
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

    if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="800">Moderation Queue</Typography>
                    <Typography color="text.secondary">Review and manage article submissions</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    {['pending', 'published', 'flagged', 'rejected', 'draft', 'all'].map(status => (
                        <Chip
                            key={status}
                            label={status.toUpperCase()}
                            onClick={() => setFilter(status)}
                            color={filter === status ? 'primary' : 'default'}
                            variant={filter === status ? 'contained' : 'outlined'}
                            sx={{ fontWeight: 700 }}
                        />
                    ))}
                </Stack>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: 'none' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Article Info</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Reviewer Notes</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredArticles.map((article) => (
                            <TableRow key={article._id} hover>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight="700">{article.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {article.author.name} · {article.category} · {new Date(article.createdAt).toLocaleDateString()}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ maxWidth: 200 }}>
                                    <Typography variant="body2" noWrap sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                        "{article.reviewerComments}"
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={article.status.toUpperCase()}
                                        color={getStatusColor(article.status)}
                                        size="small"
                                        sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                        <Tooltip title="Preview">
                                            <IconButton size="small" onClick={() => setViewDialog({ open: true, article })}>
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Approve">
                                            <IconButton size="small" color="success" onClick={() => handleAction(article._id, 'published')}>
                                                <CheckIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Flag for Revision">
                                            <IconButton size="small" color="secondary" onClick={() => setRejectDialog({ open: true, articleId: article._id, type: 'flag', reason: '' })}>
                                                <WarningIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Reject">
                                            <IconButton size="small" color="error" onClick={() => setRejectDialog({ open: true, articleId: article._id, type: 'reject', reason: '' })}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialogs */}
            <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ ...rejectDialog, open: false })}>
                <DialogTitle>{rejectDialog.type === 'reject' ? 'Reject Article' : 'Flag for Revision'}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>Provide a reason for this decision. This will be visible to the publisher.</Typography>
                    <TextField
                        fullWidth multiline rows={4}
                        label="Reason/Notes"
                        value={rejectDialog.reason}
                        onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setRejectDialog({ ...rejectDialog, open: false })}>Cancel</Button>
                    <Button
                        variant="contained"
                        color={rejectDialog.type === 'reject' ? 'error' : 'secondary'}
                        onClick={() => {
                            handleAction(rejectDialog.articleId, rejectDialog.type === 'reject' ? 'rejected' : 'flagged', rejectDialog.reason);
                            setRejectDialog({ ...rejectDialog, open: false });
                        }}
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
            >
                <DialogTitle sx={{ fontWeight: 800 }}>{viewDialog.article?.title}</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>{viewDialog.article?.content}</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight="700">Author:</Typography>
                        <Typography variant="body2">{viewDialog.article?.author.name}</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialog({ open: false, article: null })}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ArticleModeration;
