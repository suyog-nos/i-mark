import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    IconButton,
    Chip,
    Avatar,
    Paper,
    Fade,
    Stack
} from '@mui/material';
import {
    Bookmark,
    BookmarkRemove,
    Visibility,
    Schedule,
    Newspaper
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useBookmarks } from '../../contexts/BookmarkContext';
import { useTranslation } from 'react-i18next';

const Bookmarks = () => {
    /*
     * bookmark-view-controller
     * A dedicated interface for managing the user's personal reading list.
     * subscribes to the global BookmarkContext to receive real-time updates 
     * when items are added or removed from other parts of the application.
     */
    const { t } = useTranslation();
    const { bookmarks, loading, toggleBookmark } = useBookmarks();

    const handleRemoveBookmark = (article) => {
        toggleBookmark(article);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <Typography>Loading your saved stories...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography
                    variant="h3"
                    fontWeight="800"
                    gutterBottom
                    sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    My Reading List
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Articles you've saved for later
                </Typography>
            </Box>

            {/* 
              * empty-state-handler
              * Provides constructive feedback and navigation cues when the list is empty.
              * encourages user engagement by directing them to the main feed.
              */}
            {bookmarks.length === 0 ? (
                <Fade in>
                    <Paper
                        sx={{
                            p: 8,
                            textAlign: 'center',
                            borderRadius: '24px',
                            background: 'rgba(255,255,255,0.5)',
                            backdropFilter: 'blur(10px)',
                            border: '1px dashed #ccc'
                        }}
                    >
                        <Bookmark sx={{ fontSize: 80, color: 'action.disabled', mb: 2 }} />
                        <Typography variant="h5" gutterBottom color="text.secondary">
                            Your reading list is empty
                        </Typography>
                        <Button
                            variant="contained"
                            component={Link}
                            to="/articles"
                            sx={{ mt: 2, borderRadius: '12px', px: 4 }}
                        >
                            Discover Articles
                        </Button>
                    </Paper>
                </Fade>
            ) : (
                <Grid container spacing={4}>
                    {bookmarks.map((article) => (
                        <Grid item xs={12} sm={6} md={4} key={article._id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: '20px',
                                    transition: 'transform 0.3s ease',
                                    '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={`/uploads/${article.featuredImage?.split('/').pop() || 'placeholder.jpg'}`}
                                    alt={article.title}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                        <Chip
                                            label={article.category}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{ borderRadius: '8px' }}
                                        />
                                    </Stack>
                                    <Typography variant="h6" fontWeight="700" gutterBottom>
                                        {article.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {article.content.substring(0, 100)}...
                                    </Typography>

                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 'auto' }}>
                                        <Avatar
                                            src={article.author?.profile?.picture}
                                            sx={{ width: 32, height: 32 }}
                                        />
                                        <Box>
                                            <Typography variant="caption" fontWeight="600" display="block">
                                                {article.author?.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(article.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        component={Link}
                                        to={`/articles/${article._id}`}
                                        startIcon={<Visibility />}
                                        sx={{ borderRadius: '10px' }}
                                    >
                                        Read
                                    </Button>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleRemoveBookmark(article)}
                                        sx={{ border: '1px solid currentColor', borderRadius: '10px' }}
                                    >
                                        <BookmarkRemove />
                                    </IconButton>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default Bookmarks;
