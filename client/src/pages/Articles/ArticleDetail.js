import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
  IconButton,
  Paper,
  Divider,
  Grid,
  Stack
} from '@mui/material';
import {
  ThumbUp,
  Share,
  Comment,
  Visibility,
  Schedule,
  Edit,
  Shield,
  CheckCircle,
  Cancel,
  Bookmark,
  BookmarkBorder
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBookmarks } from '../../contexts/BookmarkContext';
import axios from 'axios';

const ArticleDetail = () => {
  /*
   * resource-resolution-context
   * Extracts the unique article identifier from the URL parameters.
   * Initializes access control hooks to determine if the user has read/write permissions.
   */
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin, isPublisher, token } = useAuth();
  const { toggleBookmark, isBookmarked: checkBookmarked } = useBookmarks();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const isBookmarked = checkBookmarked(id);

  /*
   * data-hydration-lifecycle
   * Triggers the article fetching sequence whenever the ID or User context changes.
   * Ensures the view reflects the most current data state.
   */
  useEffect(() => {
    fetchArticle();
  }, [id, user]);

  const handleBookmark = async () => {
    if (!article) return;
    await toggleBookmark(article);
  };

  const fetchArticle = async () => {
    try {
      const response = await axios.get(`/api/articles/${id}`);
      setArticle(response.data);
      // Check if user has liked this article
      if (isAuthenticated && user && response.data.likes.includes(user.id)) {
        setLiked(true);
      } else {
        setLiked(false);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * interaction-handler-optimistic
   * Manages user engagement actions (Likes).
   * Implements optimistic UI updates to provide immediate feedback before the server response confirms the action.
   */
  const handleLike = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await axios.post(`/api/articles/${id}/like`);
      setLiked(response.data.userLiked);
      // Re-fetch or update count carefully
      setArticle(prev => ({
        ...prev,
        likes: response.data.userLiked
          ? [...(prev.likes || []), user.id]
          : (prev.likes || []).filter(id => id !== user.id)
      }));
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleShare = async () => {
    try {
      await axios.post(`/api/articles/${id}/share`);
      setArticle(prev => ({
        ...prev,
        shares: prev.shares + 1
      }));

      if (navigator.share) {
        navigator.share({
          title: article.title,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Handle both forward and backslashes, and ensure single leading slash
    const cleanPath = path.replace(/\\/g, '/');
    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading article...</Typography>
        </Box>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Article not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
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
                src={getImageUrl(article?.author?.profile?.picture)}
                sx={{ width: 40, height: 40, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Typography variant="subtitle1" fontWeight="600">{article?.author?.name || 'Anonymous Author'}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <Schedule fontSize="small" />
              <Typography variant="body2">{article?.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'N/A'}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <Visibility fontSize="small" />
              <Typography variant="body2">{article?.views || 0} reads</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={article?.category || 'Uncategorized'}
              color="primary"
              sx={{ fontWeight: 700, px: 1, borderRadius: '8px' }}
            />
            {article?.tags?.map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                variant="outlined"
                sx={{ borderRadius: '8px', borderStyle: 'dashed' }}
              />
            ))}
          </Box>
        </Box>

        {/* Featured Image */}
        {article?.featuredImage && (
          <Box sx={{ mb: 6, borderRadius: '32px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <img
              src={getImageUrl(article.featuredImage)}
              alt={article.title}
              style={{
                width: '100%',
                maxHeight: '600px',
                objectFit: 'cover'
              }}
            />
          </Box>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {/* Admin/Publisher Actions */}
            {(isAdmin || (isPublisher && user?.id === article?.author?._id)) && (
              <Paper sx={{ p: 2, mb: 4, borderRadius: '16px', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc', border: (theme) => `1px solid ${theme.palette.divider}`, display: 'flex', gap: 2 }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                  <Shield color="primary" /> Manage Article:
                </Typography>
                {(isPublisher && user?.id === article?.author?._id) && (
                  <Button startIcon={<Edit />} size="small" component={Link} to={`/edit-article/${article?._id}`}>Edit</Button>
                )}
                {isAdmin && article?.status === 'pending' && (
                  <>
                    <Button startIcon={<CheckCircle />} color="success" size="small">Approve</Button>
                    <Button startIcon={<Cancel />} color="error" size="small">Reject</Button>
                  </>
                )}
              </Paper>
            )}

            {/* 
              * content-rendering-with-paywall
              * Renders the main article body text.
              * Implements a "Soft Paywall" mechanism:
              * - Full access for authenticated users.
              * - Truncated view with CSS gradient mask for unauthenticated guests.
              */}
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                fontSize: '1.2rem',
                color: 'text.primary',
                mb: 6,
                position: 'relative',
                ...(!isAuthenticated && {
                  maxHeight: '150px',
                  overflow: 'hidden',
                  maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                  userSelect: 'none'
                })
              }}
            >
              {article?.content || 'No content available.'}
            </Typography>

            {!isAuthenticated && (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: '24px',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  mt: -4,
                  position: 'relative',
                  zIndex: 2,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
                }}
              >
                <Typography variant="h5" fontWeight="800" gutterBottom>
                  Read the full story
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                  Join thousands of readers accessing premium reports and exclusive investigative journalism.
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    component={Link}
                    to="/login"
                    sx={{ borderRadius: '12px', px: 4, py: 1.5, fontWeight: 700 }}
                  >
                    Log In to Read
                  </Button>
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/register"
                    sx={{ borderRadius: '12px', px: 4, py: 1.5, fontWeight: 700 }}
                  >
                    Create Free Account
                  </Button>
                </Stack>
              </Paper>
            )}

            {isAuthenticated && <Divider sx={{ mb: 4 }} />}

            {/* Engagement */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Button
                variant={liked ? "contained" : "outlined"}
                startIcon={<ThumbUp />}
                onClick={handleLike}
                disabled={!isAuthenticated}
                sx={{ borderRadius: '12px', px: 3 }}
              >
                {article?.likes?.length || 0} Likes
              </Button>
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={handleShare}
                sx={{ borderRadius: '12px', px: 3 }}
              >
                {article?.shares || 0} Shares
              </Button>
              <Button
                variant="outlined"
                startIcon={<Comment />}
                disabled={!isAuthenticated}
                sx={{ borderRadius: '12px', px: 3 }}
              >
                {article?.comments?.length || 0} Comments
              </Button>
              <Button
                variant={isBookmarked ? "contained" : "outlined"}
                startIcon={isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                onClick={handleBookmark}
                color="primary"
                sx={{ borderRadius: '12px', px: 3, ml: 'auto' }}
              >
                {isBookmarked ? "Saved" : "Save for Later"}
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, borderRadius: '24px', position: 'sticky', top: 100, border: (theme) => `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
              <Typography variant="h6" fontWeight="700" gutterBottom>About the Author</Typography>
              <Box sx={{ textAlign: 'center', my: 3 }}>
                <Avatar
                  src={getImageUrl(article?.author?.profile?.picture)}
                  sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                />
                <Typography variant="h6">{article?.author?.name || 'Anonymous'}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{article?.author?.profile?.bio || 'No bio provided.'}</Typography>
                <Button variant="contained" fullWidth sx={{ borderRadius: '10px' }} component={Link} to={`/publishers`}>
                  View Publisher
                </Button>
              </Box>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>SHARE THIS STORY</Typography>
              <Stack direction="row" spacing={1}>
                <IconButton color="primary" sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.15)' : '#f0f7ff' }}><Share /></IconButton>
                <IconButton color="primary" sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.15)' : '#f0f7ff' }}><ThumbUp /></IconButton>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ArticleDetail;
