import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Stack,
  Divider,
  Avatar,
  CardActionArea,
  Pagination
} from '@mui/material';
import {
  Search,
  Visibility,
  ArrowForward,
  AccountBalance,
  SportsFootball,
  Computer,
  Business,
  LocalHospital,
  Theaters,
  Science,
  School,
  AccessTime,
  SearchOff,
  FilterList,
  Newspaper
} from '@mui/icons-material';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import ImageComponent from '../../components/Common/ImageComponent';

const Categories = () => {
  const { darkMode } = useCustomTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = React.useMemo(() => [
    { name: 'Politics', icon: AccountBalance, color: '#ef4444', description: 'Government, elections, and political news' },
    { name: 'Sports', icon: SportsFootball, color: '#10b981', description: 'Sports events, scores, and athlete news' },
    { name: 'Technology', icon: Computer, color: '#3b82f6', description: 'Tech innovations, gadgets, and digital trends' },
    { name: 'Business', icon: Business, color: '#f59e0b', description: 'Markets, economy, and business developments' },
    { name: 'Health', icon: LocalHospital, color: '#8b5cf6', description: 'Medical news, wellness, and health tips' },
    { name: 'Entertainment', icon: Theaters, color: '#ec4899', description: 'Movies, music, celebrities, and entertainment' },
    { name: 'Science', icon: Science, color: '#06b6d4', description: 'Scientific discoveries and research' },
    { name: 'Education', icon: School, color: '#84cc16', description: 'Educational news and academic updates' }
  ], []);

  /*
   * EXPLORE UNIVERSE DISCOVERY CONTROLLER (Workflow Overview)
   * This function is responsible for orchestrating the deep discovery experience on the category 
   * page. It constructs dynamic query strings that allow the backend to filter news by specific 
   * topics, search keywords, and pagination offsets. A key part of the workflow here is the 
   * "Shareability" factor—we synchronize these filters with the URL's search parameters so that 
   * if a user finds a specific set of articles and shares the link, another user will see the 
   * exact same filtered view. It effectively acts as a bridge between the user's curiosity and 
   * the vast archive of news stored in the database.
   */
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/articles?limit=12&page=${page}`;
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      const response = await axios.get(url);
      setArticles(response.data.articles || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (urlCat) {
      const match = categories.find(c => c.name.toLowerCase() === urlCat.toLowerCase());
      if (match && match.name !== selectedCategory) {
        setSelectedCategory(match.name);
      }
    }
    const urlPage = parseInt(searchParams.get('page'));
    if (urlPage && urlPage !== page) {
      setPage(urlPage);
    }
  }, [categories, page, searchParams, selectedCategory]);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setPage(1);
    const newParams = { page: 1 };
    if (categoryName) newParams.category = categoryName.toLowerCase();
    setSearchParams(newParams);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const newParams = { page: value };
    if (selectedCategory) newParams.category = selectedCategory.toLowerCase();
    if (searchQuery) newParams.search = searchQuery;
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    setPage(1);
    fetchArticles();
  };

  const selectedCategoryData = categories.find(cat =>
    cat.name.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <Box className="mesh-gradient" sx={{ minHeight: '100vh', py: 6 }}>
      <Container maxWidth="xl" className="page-transition">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 900,
              letterSpacing: '-2px',
              mb: 2,
              background: darkMode
                ? 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Explore Universe
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: '700px', mx: 'auto', fontWeight: 500, lineHeight: 1.6 }}
          >
            Tailored content for your specific interests. Dive deep into the topics that matter most to you.
          </Typography>
        </Box>

        {/* Premium Search Section */}
        <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 10 }}>
          <TextField
            fullWidth
            placeholder="Search within categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              className: 'glass-panel',
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'primary.main', ml: 1 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={handleSearch}
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      mr: -0.5,
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    <ArrowForward />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: '20px',
                height: '70px',
                fontSize: '1.1rem',
                border: 'none',
                '& fieldset': { border: 'none' },
                boxShadow: 'var(--shadow-premium)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)' }
              }
            }}
          />
        </Box>

        {/* Category Grid */}
        <Box sx={{ mb: 10 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
            <FilterList color="primary" />
            <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-1px' }}>
              Select Topic
            </Typography>
          </Stack>
          
          <Grid container spacing={3}>
            {/* "All" Category */}
            <Grid item xs={6} sm={4} md={3} lg={2.4}>
              <Box
                className="glass-panel"
                component="button"
                onClick={() => handleCategorySelect('')}
                sx={{
                  width: '100%',
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderRadius: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  border: !selectedCategory ? '2px solid' : '1px solid',
                  borderColor: !selectedCategory ? 'primary.main' : 'transparent',
                  background: !selectedCategory ? 'rgba(37, 99, 235, 0.1)' : undefined,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 'var(--shadow-premium)',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <Newspaper sx={{ fontSize: 48, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="800">All Topics</Typography>
              </Box>
            </Grid>

            {categories.map((cat) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} key={cat.name}>
                <Box
                  className="glass-panel"
                  component="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  sx={{
                    width: '100%',
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    border: selectedCategory.toLowerCase() === cat.name.toLowerCase() ? '2px solid' : '1px solid',
                    borderColor: selectedCategory.toLowerCase() === cat.name.toLowerCase() ? cat.color : 'transparent',
                    background: selectedCategory.toLowerCase() === cat.name.toLowerCase() ? `${cat.color}15` : undefined,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 'var(--shadow-premium)',
                      borderColor: cat.color
                    }
                  }}
                >
                  <Box component={cat.icon} sx={{ fontSize: 48, color: cat.color }} />
                  <Typography variant="subtitle1" fontWeight="800">{cat.name}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Category Description Banner */}
        {selectedCategoryData && (
          <Box 
            className="glass-panel" 
            sx={{ 
              p: 6, 
              mb: 10, 
              borderRadius: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexWrap: 'wrap',
              borderLeft: '8px solid',
              borderLeftColor: selectedCategoryData.color
            }}
          >
            <Box 
              component={selectedCategoryData.icon} 
              sx={{ fontSize: 80, color: selectedCategoryData.color, flexShrink: 0 }} 
            />
            <Box sx={{ flex: 1, minWidth: '300px' }}>
              <Typography variant="h3" fontWeight="900" sx={{ mb: 1, letterSpacing: '-1px' }}>
                {selectedCategoryData.name}
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight="500">
                {selectedCategoryData.description}
              </Typography>
            </Box>
            <Box>
              <Chip 
                label={`${articles.length} Available Articles`}
                sx={{ 
                  bgcolor: `${selectedCategoryData.color}20`, 
                  color: selectedCategoryData.color,
                  fontWeight: 800,
                  px: 2,
                  py: 3,
                  borderRadius: '16px',
                  fontSize: '1rem'
                }}
              />
            </Box>
          </Box>
        )}

        {/* Article Grid Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight="900" sx={{ mb: 5, letterSpacing: '-1px' }}>
            {selectedCategory ? `Featured in ${selectedCategory}` : 'Recent Discoveries'}
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          ) : articles.length === 0 ? (
            <Box className="glass-panel" sx={{ p: 10, textAlign: 'center', borderRadius: '32px' }}>
              <SearchOff sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" fontWeight="700" color="text.secondary">
                No matches found in this universe
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 3, borderRadius: '12px' }}
                onClick={() => { setSelectedCategory(''); setSearchQuery(''); }}
              >
                Reset Exploration
              </Button>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {articles.map((article) => {
                const categoryData = categories.find(cat => cat.name.toLowerCase() === article.category?.toLowerCase());
                return (
                  <Grid item xs={12} sm={6} lg={4} key={article._id}>
                    <Card
                      className="glass-panel"
                      sx={{
                        borderRadius: '24px',
                        overflow: 'hidden',
                        height: '100%',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        '&:hover': {
                          transform: 'translateY(-12px)',
                          boxShadow: 'var(--shadow-premium)'
                        }
                      }}
                    >
                      <CardActionArea component={Link} to={`/articles/${article._id}`}>
                        <Box sx={{ position: 'relative' }}>
                          <ImageComponent
                            src={article.featuredImage || article.additionalMedia?.[0]}
                            alt={article.title}
                            height={240}
                          />
                          <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
                            <Chip
                              label={article.category}
                              size="small"
                              sx={{
                                bgcolor: categoryData ? `${categoryData.color}cc` : 'primary.main',
                                color: 'white',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                fontSize: '0.8rem',
                                px: 1,
                                backdropFilter: 'blur(8px)'
                              }}
                            />
                          </Box>
                        </Box>
                        <CardContent sx={{ p: 4 }}>
                          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" fontWeight="600" color="text.secondary">
                                {new Date(article.createdAt).toLocaleDateString()}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" fontWeight="600" color="text.secondary">
                                {article.views}
                              </Typography>
                            </Stack>
                          </Stack>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              fontWeight: 900, 
                              mb: 2, 
                              lineHeight: 1.2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textTransform: 'uppercase',
                              fontSize: '1.4rem',
                              color: 'text.primary'
                            }}
                          >
                            {article.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              mb: 3,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {article.summary || article.content?.substring(0, 120) + '...'}
                          </Typography>
                          <Divider sx={{ mb: 3 }} />
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                {article.author?.name?.charAt(0)}
                              </Avatar>
                              <Typography variant="caption" fontWeight="700">
                                {article.author?.name}
                              </Typography>
                            </Stack>
                            <Button 
                              size="small" 
                              variant="text" 
                              sx={{ fontWeight: 800, color: categoryData?.color || 'primary.main' }}
                            >
                              Read More
                            </Button>
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, mb: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  className: 'glass-panel',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  height: '48px',
                  width: '48px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    transform: 'translateY(-2px)'
                  },
                  '&.Mui-selected': {
                    bgcolor: selectedCategoryData?.color || 'primary.main',
                    color: 'white',
                    boxShadow: 'var(--shadow-premium)',
                    '&:hover': {
                      bgcolor: selectedCategoryData?.color || 'primary.dark',
                    }
                  }
                }
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Categories;
