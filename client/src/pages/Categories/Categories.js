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
  Chip,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search,
  Category,
  Schedule,
  Visibility,
  ArrowForward,
  Home
} from '@mui/icons-material';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import axios from 'axios';

const Categories = () => {
  const { t } = useTranslation();
  const { darkMode } = useCustomTheme();
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  const categories = [
    { name: 'Politics', icon: '🏛️', color: '#ef4444', description: 'Government, elections, and political news' },
    { name: 'Sports', icon: '⚽', color: '#10b981', description: 'Sports events, scores, and athlete news' },
    { name: 'Technology', icon: '💻', color: '#3b82f6', description: 'Tech innovations, gadgets, and digital trends' },
    { name: 'Business', icon: '💼', color: '#f59e0b', description: 'Markets, economy, and business developments' },
    { name: 'Health', icon: '🏥', color: '#8b5cf6', description: 'Medical news, wellness, and health tips' },
    { name: 'Entertainment', icon: '🎬', color: '#ec4899', description: 'Movies, music, celebrities, and entertainment' },
    { name: 'Science', icon: '🔬', color: '#06b6d4', description: 'Scientific discoveries and research' },
    { name: 'Education', icon: '📚', color: '#84cc16', description: 'Educational news and academic updates' }
  ];

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (urlCat) {
      const match = categories.find(c => c.name.toLowerCase() === urlCat.toLowerCase());
      if (match && match.name !== selectedCategory) {
        setSelectedCategory(match.name);
      }
    }
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      let url = '/api/articles?limit=12';
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      const response = await axios.get(url);
      setArticles(response.data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setSearchParams(categoryName ? { category: categoryName.toLowerCase() } : {});
  };

  const handleSearch = () => {
    fetchArticles();
  };

  const selectedCategoryData = categories.find(cat => 
    cat.name.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink
          component={Link}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, userSelect: 'none' }}
        >
          <Home fontSize="small" />
          Home
        </MuiLink>
        <Typography
          color="text.primary"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, userSelect: 'none' }}
        >
          <Category fontSize="small" />
          Categories
        </Typography>
        {selectedCategory && (
          <Typography color="text.primary" sx={{ userSelect: 'text' }}>
            {selectedCategory}
          </Typography>
        )}
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: darkMode
              ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
              : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            userSelect: 'none'
          }}
        >
          Browse by Categories
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: '600px', mx: 'auto', userSelect: 'none' }}
        >
          Discover articles organized by topics that interest you most
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ maxWidth: '600px', mx: 'auto', mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search within categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} color="primary" aria-label="search articles">
                  <ArrowForward />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '50px',
              backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
            }
          }}
          inputProps={{ 'aria-label': 'Search articles within categories' }}
        />
      </Box>

      {/* Categories Grid */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Select a Category
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={3} lg={2} xl={2}>
            <Paper
              component="button"
              onClick={() => handleCategorySelect('')}
              sx={{
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: '16px',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textDecoration: 'none',
                border: `2px solid ${!selectedCategory ? theme.palette.primary.main : 'transparent'}`,
                background: !selectedCategory
                  ? `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.primary.main}40 100%)`
                  : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'),
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                },
                transition: 'all 0.3s ease-in-out',
                borderStyle: 'solid',
                borderWidth: '2px',
              }}
              aria-pressed={!selectedCategory}
              type="button"
            >
              <Typography variant="h4" sx={{ mb: 1, userSelect: 'none' }}>📰</Typography>
              <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ userSelect: 'none' }}>All</Typography>
            </Paper>
          </Grid>
          {categories.map((category) => (
            <Grid item xs={6} sm={4} md={3} lg={2} xl={2} key={category.name}>
              <Paper
                component="button"
                onClick={() => handleCategorySelect(category.name)}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderRadius: '16px',
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textDecoration: 'none',
                  background: selectedCategory.toLowerCase() === category.name.toLowerCase()
                    ? `linear-gradient(135deg, ${category.color}20 0%, ${category.color}40 100%)`
                    : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'),
                  border: `2px solid ${selectedCategory.toLowerCase() === category.name.toLowerCase() ? category.color : 'transparent'}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${category.color}30`,
                  },
                  transition: 'all 0.3s ease-in-out',
                  borderStyle: 'solid',
                  borderWidth: '2px',
                }}
                aria-pressed={selectedCategory.toLowerCase() === category.name.toLowerCase()}
                type="button"
              >
                <Typography variant="h4" sx={{ mb: 1, userSelect: 'none' }}>{category.icon}</Typography>
                <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ userSelect: 'none' }}>{category.name}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Selected Category Info */}
      {selectedCategoryData && (
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${selectedCategoryData.color}10 0%, ${selectedCategoryData.color}20 100%)`,
            border: `1px solid ${selectedCategoryData.color}30`
          }}
          aria-label={`${selectedCategoryData.name} category info`}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h2" sx={{ userSelect: 'none' }}>{selectedCategoryData.icon}</Typography>
            <Box>
              <Typography variant="h5" fontWeight={600} gutterBottom sx={{ userSelect: 'text' }}>
                {selectedCategoryData.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ userSelect: 'text' }}>
                {selectedCategoryData.description}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Articles Section */}
      <Box>
        {/* Updated Box with flexWrap & gap to fix count overlap */}
        <Box
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3, 
            flexWrap: 'wrap',    // Added to allow wrapping
            gap: 1               // Added gap between wrapping items
          }}
        >
          <Typography variant="h5" fontWeight={600} sx={{ userSelect: 'none' }}>
            {selectedCategory ? `${selectedCategory} Articles` : 'All Articles'}
          </Typography>
          {articles.length > 0 && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ minWidth: 'fit-content', userSelect: 'none' }}  // Added minWidth to prevent shrinking
              aria-live="polite"
            >
              {articles.length} article{articles.length > 1 ? 's' : ''} found
            </Typography>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress aria-label="Loading articles" />
          </Box>
        ) : articles.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: '12px' }} role="alert">
            No articles found for the selected category. Try selecting a different category or search term.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {articles.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: '16px',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    },
                    transition: 'all 0.3s ease-in-out'
                  }}
                  aria-label={`Article titled ${article.title}`}
                >
                  {(article.featuredImage || (article.additionalMedia && article.additionalMedia[0])) && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={article.featuredImage || article.additionalMedia[0]}
                      alt={article.title}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 2, flexShrink: 0 }}>
                      <Chip 
                        label={article.category || 'General'} 
                        size="small" 
                        sx={{ 
                          backgroundColor: selectedCategoryData?.color + '20' || theme.palette.primary.main + '20',
                          color: selectedCategoryData?.color || theme.palette.primary.main,
                          fontWeight: 600,
                          userSelect: 'none'
                        }}
                      />
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      {article.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      paragraph
                      sx={{ 
                        flexGrow: 1, 
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {article.summary || article.content.substring(0, 120) + '...'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="caption" sx={{ userSelect: 'none' }}>
                          {new Date(article.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Visibility fontSize="small" color="action" />
                        <Typography variant="caption">
                          {(typeof article.views === 'number' ? article.views : 0)} views
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      variant="contained" 
                      component={Link} 
                      to={`/articles/${article._id}`}
                      fullWidth
                      sx={{ 
                        borderRadius: '12px',
                        mt: 'auto'
                      }}
                      aria-label={`Read article titled ${article.title}`}
                    >
                      Read Article
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Categories;
