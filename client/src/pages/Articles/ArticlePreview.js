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
    Preview
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
            <Alert
                severity="info"
                icon={<Preview />}
                sx={{
                    mt: 3,
                    borderRadius: '12px',
                    '& .MuiAlert-message': { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
                }}
            >
                <Typography variant="subtitle2" fontWeight="700">PREVIEW MODE: This is how your article will look once published.</Typography>
                <Box>
                    <Button
                        startIcon={<Edit />}
                        size="small"
                        onClick={() => navigate(-1)}
                        sx={{ mr: 1 }}
                    >
                        Back to Edit
                    </Button>
                </Box>
            </Alert>

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
                <Box sx={{ mb: 6, borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', bgcolor: '#f1f5f9', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {article.imagePreview ? (
                        <img
                            src={article.imagePreview}
                            alt={article.title}
                            style={{
                                width: '100%',
                                maxHeight: '600px',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <Typography color="text.secondary">No image provided</Typography>
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
                            {article.content || 'No content available.'}
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
                        <Paper sx={{ p: 4, borderRadius: '24px', position: 'sticky', top: 100, border: '1px solid #eee', boxShadow: 'none' }}>
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
