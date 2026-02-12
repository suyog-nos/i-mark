import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Chip,
    Avatar,
    Button,
    Paper,
    Divider,
    Grid,
    Stack,
    Alert
} from '@mui/material';
import {
    Schedule,
    Visibility,
    Edit,
    CheckCircle,
    ArrowBack,
    Preview,
    Wallpaper,
    AutoAwesome
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ArticlePreview = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [article, setArticle] = useState(null);

    useEffect(() => {
        const previewData = sessionStorage.getItem('articlePreview');
        if (previewData) {
            setArticle(JSON.parse(previewData));
        } else {
            navigate('/dashboard');
        }
    }, [navigate]);

    if (!article) return null;

    return (
        <Container maxWidth="lg">
            {/* Preview Banner */}
            {/* Sticky Preview Banner */}
            <Paper
                elevation={4}
                sx={{
                    position: 'sticky',
                    top: 24,
                    zIndex: 1000,
                    borderRadius: '50px',
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    mb: 8,
                    mx: 'auto',
                    maxWidth: '800px',
                    border: '1px solid rgba(0,0,0,0.08)'
                }}
            >
                <Box sx={{ px: 4, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ bgcolor: 'secondary.main', color: 'white', p: 0.5, borderRadius: '50%' }}>
                            <Preview fontSize="small" />
                        </Box>
                        <Typography variant="subtitle2" fontWeight="700" sx={{ color: 'text.primary' }}>
                            Preview Mode
                        </Typography>
                        <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            This is how your story will look.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => navigate(-1)}
                        sx={{ borderRadius: '20px', textTransform: 'none', px: 3, boxShadow: 'none' }}
                    >
                        Continue Editing
                    </Button>
                </Box>
            </Paper>

            <Box sx={{ py: { xs: 4, md: 8 } }}>
                {/* Header Section */}
                <Box sx={{ mb: 6, textAlign: 'center' }}>
                    <Typography
                        variant="h2"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: '2.5rem', md: '3.75rem' },
                            lineHeight: 1.2,
                            mb: 3
                        }}
                    >
                        {article.title}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                                src={user?.profile?.picture}
                                sx={{ width: 40, height: 40, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Typography variant="subtitle1" fontWeight="600">{user?.name || 'Anonymous Author'}</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                            <Schedule fontSize="small" />
                            <Typography variant="body2">{new Date().toLocaleDateString()}</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                            <Visibility fontSize="small" />
                            <Typography variant="body2">0 reads (Preview)</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                            label={article.category || 'Uncategorized'}
                            color="primary"
                            sx={{ fontWeight: 700, px: 1, borderRadius: '8px' }}
                        />
                        {article.tags?.split(',').map((tag) => (
                            <Chip
                                key={tag}
                                label={`#${tag.trim()}`}
                                variant="outlined"
                                sx={{ borderRadius: '8px', borderStyle: 'dashed' }}
                            />
                        ))}
                    </Box>
                </Box>

                {/* Featured Image Preview */}
                {/* Featured Image Preview */}
                <Box sx={{
                    mb: 6,
                    borderRadius: '32px',
                    overflow: 'hidden',
                    boxShadow: article.imagePreview ? '0 32px 64px -12px rgba(0,0,0,0.15)' : 'none',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                    minHeight: '400px',
                    border: article.imagePreview ? 'none' : '2px dashed #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    {article.imagePreview ? (
                        <img
                            src={article.imagePreview}
                            alt={article.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                position: 'absolute',
                                top: 0,
                                left: 0
                            }}
                        />
                    ) : (
                        <Stack alignItems="center" spacing={2} sx={{ opacity: 0.5 }}>
                            <Wallpaper sx={{ fontSize: 64, color: 'text.secondary' }} />
                            <Typography variant="h6" fontWeight="600" color="text.secondary">
                                No Cover Image
                            </Typography>
                            <Typography variant="body2" color="text.disabled">
                                Upload a high-quality image to attract readers
                            </Typography>
                        </Stack>
                    )}
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        {/* Article Content */}
                        <Typography
                            variant="body1"
                            sx={{
                                lineHeight: 1.8,
                                whiteSpace: 'pre-wrap',
                                fontSize: '1.2rem',
                                color: 'text.primary',
                                mb: 6
                            }}
                        >
                            {article.content ? (
                                article.content.split('\n').map((paragraph, index) => (
                                    <Typography key={index} paragraph sx={{ mb: 3 }}>
                                        {paragraph}
                                    </Typography>
                                ))
                            ) : (
                                <Box sx={{
                                    p: 8,
                                    borderRadius: '24px',
                                    border: '1px dashed #cbd5e1',
                                    bgcolor: 'background.paper',
                                    textAlign: 'center'
                                }}>
                                    <AutoAwesome sx={{ fontSize: 48, color: 'secondary.light', mb: 2, opacity: 0.5 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        Your Story Begins Here
                                    </Typography>
                                    <Typography color="text.disabled">
                                        Start writing in the editor to see your masterpiece take shape.
                                    </Typography>
                                </Box>
                            )}
                        </Typography>

                        <Divider sx={{ mb: 4 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBack />}
                                onClick={() => navigate(-1)}
                                size="large"
                                sx={{ borderRadius: '12px', px: 4 }}
                            >
                                Back to Editor
                            </Button>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 4, borderRadius: '24px', position: 'sticky', top: 100, border: (theme) => `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                            <Typography variant="h6" fontWeight="700" gutterBottom>Author Preview</Typography>
                            <Box sx={{ textAlign: 'center', my: 3 }}>
                                <Avatar
                                    src={user?.profile?.picture}
                                    sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                                />
                                <Typography variant="h6">{user?.name || 'Anonymous'}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{user?.profile?.bio || 'Author bio preview...'}</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default ArticlePreview;
