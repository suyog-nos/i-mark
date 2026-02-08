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
      {/* Search & Hero Section */}
      <Box sx={{ textAlign: 'center', py: 5, mb: 4, borderRadius: '24px', bgcolor: darkMode ? '#1e293b' : '#f8fafc', border: '1px solid #e2e8f0' }}>
        <Typography variant="h2" fontWeight="900" gutterBottom sx={{ letterSpacing: '-2px' }}>Insight World</Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>Stay informed, stay ahead.</Typography>

        <Box sx={{ maxWidth: 800, mx: 'auto', px: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ bgcolor: 'white', p: 1, borderRadius: '24px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
            <TextField
              fullWidth
              placeholder="Search topics, publishers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                sx: { borderRadius: '16px', border: 'none', '& fieldset': { border: 'none' } }
              }}
            />
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Tabs
              value={searchFilter}
              onChange={(e, v) => setSearchFilter(v)}
              sx={{ minWidth: 150 }}
            >
              <Tab label="Latest" value="latest" />
              <Tab label="Popular" value="popular" />
            </Tabs>
            <Button variant="contained" onClick={handleSearch} sx={{ borderRadius: '16px', px: 4 }}>Search</Button>
          </Stack>
        </Box>
      </Box>

      {/* Scrollable Categories */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, overflowX: 'auto', pb: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
        {categories.map((cat) => {
          const catName = typeof cat === 'string' ? cat : cat.name;
          const icons = { 'Technology': '💻', 'Sports': '⚽', 'Nepal': '🏔️', 'Global': '🌍', 'Business': '📈', 'Health': '🏥', 'All': '🔥' };
          return (
            <Chip
              key={catName}
              icon={<span>{icons[catName] || '📰'}</span>}
              label={catName}
              onClick={() => setActiveCategory(catName)}
              sx={{
                px: 2, py: 3, borderRadius: '12px', fontSize: '1rem', fontWeight: 700,
                bgcolor: activeCategory === catName ? 'primary.main' : 'transparent',
                color: activeCategory === catName ? 'white' : 'text.primary',
                border: '1.5px solid',
                borderColor: activeCategory === catName ? 'primary.main' : '#e2e8f0',
                '&:hover': { bgcolor: activeCategory === catName ? 'primary.dark' : '#f1f5f9' }
              }}
            />
          );
        })}
      </Box>

      <Grid container spacing={4}>
        {/* Main Content Area */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="800">Latest from {activeCategory}</Typography>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
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
                    border: '1px solid #f1f5f9',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': { border: '1.5px solid #3b82f6' }
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
          <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: '24px', bgcolor: '#f1f5f9' }}>
            <Typography variant="h6" fontWeight="800" sx={{ mb: 3 }}>Quick Discover</Typography>
            <Grid container spacing={2}>
              {['Nepal', 'Economy', 'AI', 'Cricket', 'Movies', 'Music'].map(tag => (
                <Grid item xs={4} key={tag}>
                  <Button fullWidth variant="contained" sx={{ bgcolor: 'white', color: 'text.primary', borderRadius: '12px', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
                    {tag}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Featured Publisher Carousel (Mockup) */}
          <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #f1f5f9' }}>
            <Typography variant="h6" fontWeight="800" sx={{ mb: 3 }}>Trending Publishers</Typography>
            <Stack spacing={3}>
              {trendingPublishers.length > 0 ? (
                trendingPublishers.slice(0, 5).map(pub => (
                  <Box key={pub._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={getImageUrl(pub.profile?.picture)} sx={{ bgcolor: 'primary.main' }}>
                        {typeof pub.name === 'string' ? pub.name[0].toUpperCase() : '?'}
                      </Avatar>
                      <Box>
                        <Typography fontWeight="700">{pub.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {pub.articlesCount || 0} Articles • {pub.followersCount || 0} Followers
                        </Typography>
                      </Box>
                    </Stack>
                    <Button size="small" component={Link} to={`/publishers`}>View</Button>
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
                sx={{ borderRadius: '12px' }}
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
