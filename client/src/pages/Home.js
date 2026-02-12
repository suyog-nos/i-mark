import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Avatar,
  Divider,
  Stack,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Search,
  TrendingUp,
  Schedule,
  Visibility,
  Bookmark,
  BookmarkBorder,
  Share,
  ArrowForward,
  Newspaper,
  Category,
  People,
  Notifications,
  Star,
  LocalFireDepartment,
  AdminPanelSettings,
  AddCircle,
  AutoAwesome
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { t } = useTranslation();
  const { darkMode } = useCustomTheme();
  const { isAdmin, isPublisher, token, isAuthenticated, user } = useAuth();
  const theme = useTheme();

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('latest');
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [personalizedArticles, setPersonalizedArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  const getImageUrl = (path) => {
    if (!path || typeof path !== 'string') return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'; // Fallback
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  };

  const [trendingPublishers, setTrendingPublishers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch articles, categories, and top publishers in parallel
        const [articlesRes, categoriesRes, publishersRes] = await Promise.all([
          axios.get('/api/articles', {
            params: {
              category: activeCategory === 'All' ? undefined : activeCategory,
              search: searchQuery || undefined,
              sortBy: searchFilter === 'popular' ? 'views' : 'createdAt'
            }
          }),
          axios.get('/api/articles/categories/list'),
          axios.get('/api/users/publishers/list?limit=5') // Fetch top 5 publishers
        ]);

        setArticles(articlesRes.data.articles);
        setCategories(['All', ...categoriesRes.data]);
        setTrendingPublishers(publishersRes.data.publishers || []);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching home data:', error);
        setLoading(false);
      }
    };

    fetchData();

    // Load bookmarks
    const saved = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
    setBookmarkedIds(saved.map(a => a._id));
  }, [activeCategory, searchQuery, searchFilter]);

  // ... (rest of the component)



  useEffect(() => {
    if (isAuthenticated && tabValue === 1) {
      fetchPersonalizedFeed();
    }
  }, [tabValue, isAuthenticated]);

  const fetchPersonalizedFeed = async () => {
    try {
      const response = await axios.get('/api/articles?limit=20');
      // Simple personalization: articles in common categories or just trending
      setPersonalizedArticles(response.data.articles);
    } catch (error) {
      console.error('Error fetching personalized feed:', error);
    }
  };

  const handleBookmark = (article) => {
    const saved = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
    const isBookmarked = saved.some(a => a._id === article._id);
    let newSaved = isBookmarked ? saved.filter(a => a._id !== article._id) : [...saved, article];
    localStorage.setItem('bookmarkedArticles', JSON.stringify(newSaved));
    setBookmarkedIds(newSaved.map(a => a._id));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the dependency array in fetchData useEffect
  };

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  return (
    <Container maxWidth="xl">

      {/* Premium Hero Section */}
      <Box sx={{
        textAlign: 'center',
        py: { xs: 8, md: 10 },
        mb: 6,
        borderRadius: '32px',
        background: darkMode
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #3b82f6 0%, #8b5cf6 100%)',
          filter: 'blur(80px)',
          opacity: 0.1
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #ec4899 0%, #f43f5e 100%)',
          filter: 'blur(60px)',
          opacity: 0.1
        }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" fontWeight="900" gutterBottom sx={{
            letterSpacing: '-1px',
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            mb: 2
          }}>
            Insight World
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 6, fontWeight: 500, maxWidth: 600, mx: 'auto' }}>
            Discover stories that matter. Stay informed with curated news from top publishers.
          </Typography>

          <Paper
            component="form"
            onSubmit={handleSearch}
            elevation={0}
            sx={{
              p: '8px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: 700,
              mx: 'auto',
              borderRadius: '20px',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(12px)',
              boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(59, 130, 246, 0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 40px rgba(59, 130, 246, 0.2)'
              }
            }}
          >
            <IconButton sx={{ p: '10px' }} aria-label="search">
              <Search color="primary" />
            </IconButton>
            <TextField
              sx={{ ml: 1, flex: 1, '& fieldset': { border: 'none' } }}
              placeholder="Search topics, publishers, or keywords..."
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ disableUnderline: true }}
            />
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <Tabs
              value={searchFilter}
              onChange={(e, v) => setSearchFilter(v)}
              sx={{
                minHeight: 0,
                ml: 1,
                '& .MuiTab-root': {
                  minHeight: 0,
                  py: 1,
                  minWidth: 'auto',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: '8px'
                },
                '& .MuiTabs-indicator': { display: 'none' }
              }}
            >
              <Tab
                label="Latest"
                value="latest"
                sx={{
                  color: searchFilter === 'latest' ? 'primary.main' : 'text.secondary',
                  bgcolor: searchFilter === 'latest' ? (theme) => theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)' : 'transparent'
                }}
              />
              <Tab
                label="Popular"
                value="popular"
                sx={{
                  color: searchFilter === 'popular' ? 'primary.main' : 'text.secondary',
                  bgcolor: searchFilter === 'popular' ? (theme) => theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)' : 'transparent'
                }}
              />
            </Tabs>
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: '14px',
                px: 4,
                py: 1.5,
                ml: 2,
                fontWeight: 700,
                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)'
              }}
            >
              Search
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* Scrollable Categories */}
      <Box sx={{
        mb: 6,
        display: 'flex',
        gap: 1.5,
        overflowX: 'auto',
        pb: 2,
        mx: -2,
        px: 2,
        '&::-webkit-scrollbar': { height: 6 },
        '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: 'rgba(0,0,0,0.1)' }
      }}>
        {categories.map((cat) => {
          const catName = typeof cat === 'string' ? cat : cat.name;
          const icons = { 'Technology': '💻', 'Sports': '⚽', 'Nepal': '🏔️', 'Global': '🌍', 'Business': '📈', 'Health': '🏥', 'All': '🔥' };
          const isActive = activeCategory === catName;

          return (
            <Chip
              key={catName}
              icon={<span style={{ fontSize: '1.2rem' }}>{icons[catName] || '📰'}</span>}
              label={catName}
              onClick={() => setActiveCategory(catName)}
              sx={{
                px: 2,
                py: 2.5,
                borderRadius: '16px',
                fontSize: '0.95rem',
                fontWeight: isActive ? 700 : 500,
                background: isActive
                  ? 'linear-gradient(45deg, #2563eb, #3b82f6)'
                  : (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                color: isActive ? 'white' : 'text.primary',
                border: (theme) => `1px solid ${isActive ? 'transparent' : theme.palette.divider}`,
                boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}
            />
          );
        })}
      </Box>

      <Grid container spacing={4}>
        {/* Main Content Area */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalFireDepartment sx={{ color: 'error.main', mr: 1.5, fontSize: 28 }} />
              <Typography variant="h5" fontWeight="800">Latest from {activeCategory}</Typography>
            </Box>
            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              sx={{ '& .MuiTab-root': { minHeight: 40, fontWeight: 700, borderRadius: '10px' } }}
            >
              <Tab label="All News" />
              <Tab label="For You" />
            </Tabs>
          </Box>

          <Grid container spacing={3}>
            {(tabValue === 0 ? articles : personalizedArticles).map((article) => (
              <Grid item xs={12} key={article._id}>
                <Card
                  elevation={0}
                  component={Link}
                  to={`/articles/${article._id}`}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    borderRadius: '24px',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.15)',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ width: { xs: '100%', sm: 240 }, height: { xs: 200, sm: 'auto' } }}
                    image={getImageUrl(article.featuredImage)}
                    alt={article.title}
                  />
                  <CardContent sx={{ flex: 1, p: 4 }}>
                    <Chip label={article.category} size="small" color="primary" sx={{ mb: 2, fontWeight: 700 }} />
                    <Typography variant="h5" fontWeight="800" sx={{ mb: 1 }}>{article.title}</Typography>
                    <Typography
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {article.content}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={getImageUrl(article.author?.profile?.picture)} sx={{ width: 24, height: 24 }}>
                          {article.author?.name?.[0]}
                        </Avatar>
                        <Typography variant="caption" fontWeight="700">{article.author?.name}</Typography>
                      </Stack>
                      <IconButton
                        onClick={(e) => {
                          e.preventDefault();
                          handleBookmark(article);
                        }}
                        color="primary"
                      >
                        {bookmarkedIds.includes(article._id) ? <Bookmark /> : <BookmarkBorder />}
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Discover Grid */}
          {/* Quick Discover Grid */}
          <Paper elevation={0} sx={{
            p: 4,
            mb: 4,
            borderRadius: '24px',
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AutoAwesome sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6" fontWeight="800">Quick Discover</Typography>
            </Box>

            <Grid container spacing={1.5}>
              {['Nepal', 'Economy', 'AI', 'Cricket', 'Movies', 'Music'].map(tag => (
                <Grid item xs={6} sm={4} key={tag}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      color: 'text.secondary',
                      borderColor: (theme) => theme.palette.divider,
                      borderWidth: '1.5px',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#f0f9ff',
                        color: 'primary.main'
                      }
                    }}
                  >
                    #{tag}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Featured Publisher Carousel (Mockup) */}
          <Paper elevation={0} sx={{
            p: 4,
            borderRadius: '24px',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingUp sx={{ color: 'secondary.main', mr: 1 }} />
              <Typography variant="h6" fontWeight="800">Trending Publishers</Typography>
            </Box>

            <Stack spacing={2.5}>
              {trendingPublishers.length > 0 ? (
                trendingPublishers.slice(0, 5).map((pub, index) => (
                  <Box
                    key={pub._id}
                    component={Link}
                    to={`/publishers`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textDecoration: 'none',
                      color: 'inherit',
                      p: 1.5,
                      borderRadius: '16px',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          src={getImageUrl(pub.profile?.picture)}
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: 'primary.main',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          {typeof pub.name === 'string' ? pub.name[0].toUpperCase() : '?'}
                        </Avatar>
                        <Box sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: -4,
                          width: 20,
                          height: 20,
                          bgcolor: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: 'text.secondary',
                          border: '1px solid #eee'
                        }}>
                          {index + 1}
                        </Box>
                      </Box>
                      <Box>
                        <Typography fontWeight="700" variant="subtitle2">{pub.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {pub.articlesCount || 0} Articles
                        </Typography>
                      </Box>
                    </Stack>
                    <ArrowForward sx={{ fontSize: 16, color: 'text.disabled', opacity: 0.5 }} />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No trending publishers yet.</Typography>
              )}
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to="/publishers"
                endIcon={<ArrowForward />}
                sx={{ borderRadius: '12px', mt: 1, textTransform: 'none', fontWeight: 600 }}
              >
                View All Publishers
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
