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
  Link as MuiLink,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Avatar,
  CardActionArea
} from '@mui/material';
import {
  Search,
  Schedule,
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
  Article,
  TrendingUp,
  AccessTime,
  PersonOutline,
  SearchOff,
  FilterList
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
    { name: 'Politics', icon: AccountBalance, color: '#ef4444', description: 'Government, elections, and political news' },
    { name: 'Sports', icon: SportsFootball, color: '#10b981', description: 'Sports events, scores, and athlete news' },
    { name: 'Technology', icon: Computer, color: '#3b82f6', description: 'Tech innovations, gadgets, and digital trends' },
    { name: 'Business', icon: Business, color: '#f59e0b', description: 'Markets, economy, and business developments' },
    { name: 'Health', icon: LocalHospital, color: '#8b5cf6', description: 'Medical news, wellness, and health tips' },
    { name: 'Entertainment', icon: Theaters, color: '#ec4899', description: 'Movies, music, celebrities, and entertainment' },
    { name: 'Science', icon: Science, color: '#06b6d4', description: 'Scientific discoveries and research' },
    { name: 'Education', icon: School, color: '#84cc16', description: 'Educational news and academic updates' }
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

      {/* Premium Search Bar */}
      <Box sx={{ maxWidth: '700px', mx: 'auto', mb: 6, px: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search articles, topics, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: 28,
                    ml: 0.5
                  }}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSearch}
                  color="primary"
                  aria-label="search articles"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: '#fff',
                    width: 48,
                    height: 48,
                    mr: -0.5,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      transform: 'scale(1.05)',
                      boxShadow: `0 4px 20px ${theme.palette.primary.main}60`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <ArrowForward />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '60px',
              backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : '#ffffff',
              paddingRight: '6px',
              fontSize: '1.05rem',
              height: '64px',
              border: `2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : theme.palette.primary.main}20`,
              boxShadow: darkMode
                ? '0 4px 20px rgba(0,0,0,0.3)'
                : `0 4px 20px ${theme.palette.primary.main}15`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 8px 30px ${theme.palette.primary.main}25`,
                transform: 'translateY(-2px)',
              },
              '&.Mui-focused': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 8px 35px ${theme.palette.primary.main}35`,
                transform: 'translateY(-2px)',
                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : '#ffffff',
              },
              '& fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              padding: '18px 20px 18px 8px',
              fontWeight: 500,
              '&::placeholder': {
                color: 'text.secondary',
                opacity: 0.7,
                fontWeight: 400,
              },
            },
          }}
          inputProps={{ 'aria-label': 'Search articles within categories' }}
        />
      </Box>

      {/* Categories Grid */}
      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            mb: 4,
            fontWeight: 700,
            fontSize: '1.5rem',
            letterSpacing: '-0.02em'
          }}
        >
          Select a Category
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={4} md={3} lg={2} xl={2}>
            <Paper
              component="button"
              onClick={() => handleCategorySelect('')}
              elevation={!selectedCategory ? 4 : 0}
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: '20px',
                minHeight: '140px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                border: !selectedCategory
                  ? `3px solid ${theme.palette.primary.main}`
                  : '3px solid transparent',
                background: !selectedCategory
                  ? `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}30 100%)`
                  : (darkMode ? 'rgba(255,255,255,0.05)' : '#ffffff'),
                boxShadow: !selectedCategory
                  ? `0 8px 32px ${theme.palette.primary.main}40`
                  : (darkMode ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.08)'),
                '&:hover': {
                  transform: 'translateY(-6px) scale(1.02)',
                  boxShadow: `0 12px 40px ${theme.palette.primary.main}50`,
                  border: `3px solid ${theme.palette.primary.main}`,
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderStyle: 'solid',
                borderWidth: '3px',
              }}
              aria-pressed={!selectedCategory}
              type="button"
            >
              <Article sx={{
                fontSize: 48,
                color: theme.palette.primary.main,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }} />
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color="text.primary"
                sx={{
                  userSelect: 'none',
                  fontSize: '0.95rem',
                  letterSpacing: '0.02em'
                }}
              >
                All
              </Typography>
            </Paper>
          </Grid>
          {categories.map((category) => (
            <Grid item xs={6} sm={4} md={3} lg={2} xl={2} key={category.name}>
              <Paper
                component="button"
                onClick={() => handleCategorySelect(category.name)}
                elevation={selectedCategory.toLowerCase() === category.name.toLowerCase() ? 4 : 0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderRadius: '20px',
                  minHeight: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 1.5,
                  textDecoration: 'none',
                  background: selectedCategory.toLowerCase() === category.name.toLowerCase()
                    ? `linear-gradient(135deg, ${category.color}15 0%, ${category.color}30 100%)`
                    : (darkMode ? 'rgba(255,255,255,0.05)' : '#ffffff'),
                  border: selectedCategory.toLowerCase() === category.name.toLowerCase()
                    ? `3px solid ${category.color}`
                    : '3px solid transparent',
                  boxShadow: selectedCategory.toLowerCase() === category.name.toLowerCase()
                    ? `0 8px 32px ${category.color}40`
                    : (darkMode ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.08)'),
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.02)',
                    boxShadow: `0 12px 40px ${category.color}50`,
                    border: `3px solid ${category.color}`,
                    background: `linear-gradient(135deg, ${category.color}20 0%, ${category.color}35 100%)`,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderStyle: 'solid',
                  borderWidth: '3px',
                }}
                aria-pressed={selectedCategory.toLowerCase() === category.name.toLowerCase()}
                type="button"
              >
                <Box
                  component={category.icon}
                  sx={{
                    fontSize: 48,
                    color: category.color,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="text.primary"
                  sx={{
                    userSelect: 'none',
                    fontSize: '0.95rem',
                    letterSpacing: '0.02em'
                  }}
                >
                  {category.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Selected Category Info */}
      {selectedCategoryData && (
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 6,
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${selectedCategoryData.color}12 0%, ${selectedCategoryData.color}25 100%)`,
            border: `2px solid ${selectedCategoryData.color}40`,
            boxShadow: `0 8px 32px ${selectedCategoryData.color}25`,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: `0 12px 40px ${selectedCategoryData.color}35`,
              transform: 'translateY(-2px)',
            }
          }}
          aria-label={`${selectedCategoryData.name} category info`}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box
              component={selectedCategoryData.icon}
              sx={{
                fontSize: 72,
                color: selectedCategoryData.color,
                flexShrink: 0,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'
              }}
            />
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                gutterBottom
                sx={{
                  userSelect: 'text',
                  letterSpacing: '-0.02em',
                  mb: 1
                }}
              >
                {selectedCategoryData.name}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  userSelect: 'text',
                  fontSize: '1.05rem',
                  lineHeight: 1.6
                }}
              >
                {selectedCategoryData.description}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Premium Articles Section */}
      <Box sx={{ mb: 4 }}>
        {/* Section Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                mb: 0.5,
                letterSpacing: '-0.03em',
                background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.text.secondary} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {selectedCategory ? `${selectedCategory} Articles` : 'Latest Articles'}
            </Typography>
            {articles.length > 0 && (
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  icon={<TrendingUp />}
                  label={`${articles.length} ${articles.length === 1 ? 'Article' : 'Articles'}`}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: theme.palette.primary.main + '15',
                    color: theme.palette.primary.main,
                    '& .MuiChip-icon': { color: theme.palette.primary.main }
                  }}
                />
              </Stack>
            )}
          </Box>
        </Stack>

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 12
            }}
          >
            <CircularProgress
              size={56}
              thickness={4}
              sx={{ mb: 3 }}
            />
            <Typography variant="h6" color="text.secondary" fontWeight={500}>
              Loading articles...
            </Typography>
          </Box>
        ) : articles.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: '24px',
              background: darkMode
                ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: `2px dashed ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}25 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                border: `3px solid ${theme.palette.primary.main}30`
              }}
            >
              <SearchOff
                sx={{
                  fontSize: 64,
                  color: theme.palette.primary.main,
                  opacity: 0.6
                }}
              />
            </Box>
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{ mb: 1.5 }}
            >
              No Articles Found
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 480,
                mx: 'auto',
                mb: 4,
                lineHeight: 1.7,
                fontSize: '1.05rem'
              }}
            >
              {searchQuery
                ? `We couldn't find any articles matching "${searchQuery}". Try different keywords or browse other categories.`
                : selectedCategory
                  ? `No articles available in ${selectedCategory} yet. Check back soon or explore other categories.`
                  : 'No articles available at the moment. New content is added regularly.'}
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              {(searchQuery || selectedCategory) && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setSearchParams({});
                  }}
                  sx={{
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  View All Articles
                </Button>
              )}
            </Stack>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {articles.map((article) => {
              const categoryData = categories.find(cat => cat.name.toLowerCase() === article.category?.toLowerCase());
              const hasImage = article.featuredImage || (article.additionalMedia && article.additionalMedia[0]);

              return (
                <Grid item xs={12} sm={6} lg={4} key={article._id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '20px',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : theme.palette.divider}`,
                      overflow: 'hidden',
                      background: darkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
                      boxShadow: darkMode
                        ? '0 2px 12px rgba(0,0,0,0.3)'
                        : '0 2px 12px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: darkMode
                          ? '0 16px 48px rgba(0,0,0,0.5)'
                          : '0 16px 48px rgba(0,0,0,0.12)',
                        border: `1px solid ${categoryData?.color || theme.palette.primary.main}40`,
                      },
                    }}
                  >
                    <CardActionArea
                      component={Link}
                      to={`/articles/${article._id}`}
                      sx={{ flexGrow: 0 }}
                    >
                      {hasImage ? (
                        <Box sx={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                          <CardMedia
                            component="img"
                            image={article.featuredImage || article.additionalMedia[0]}
                            alt={article.title}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.5s ease',
                              '&:hover': {
                                transform: 'scale(1.05)'
                              }
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 16,
                              left: 16,
                              zIndex: 1
                            }}
                          >
                            <Chip
                              label={article.category || 'General'}
                              size="small"
                              sx={{
                                backgroundColor: categoryData?.color ? `${categoryData.color}dd` : `${theme.palette.primary.main}dd`,
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                              }}
                            />
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            height: 200,
                            background: categoryData?.color
                              ? `linear-gradient(135deg, ${categoryData.color}15 0%, ${categoryData.color}30 100%)`
                              : `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}30 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}
                        >
                          {categoryData && (
                            <Box
                              component={categoryData.icon}
                              sx={{
                                fontSize: 80,
                                color: categoryData.color,
                                opacity: 0.3
                              }}
                            />
                          )}
                          <Chip
                            label={article.category || 'General'}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 16,
                              left: 16,
                              backgroundColor: categoryData?.color + 'dd' || theme.palette.primary.main + 'dd',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          />
                        </Box>
                      )}
                    </CardActionArea>

                    <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          fontWeight: 700,
                          lineHeight: 1.4,
                          mb: 1.5,
                          fontSize: '1.15rem',
                          letterSpacing: '-0.01em',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minHeight: '2.8em'
                        }}
                      >
                        {article.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          flexGrow: 1,
                          lineHeight: 1.7,
                          mb: 2.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.925rem'
                        }}
                      >
                        {article.summary || article.content?.substring(0, 150) + '...' || 'No summary available.'}
                      </Typography>

                      <Divider sx={{ mb: 2 }} />

                      <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 2.5 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <AccessTime
                            sx={{
                              fontSize: 16,
                              color: 'text.secondary'
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: '0.8rem', fontWeight: 500 }}
                          >
                            {new Date(article.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Visibility
                            sx={{
                              fontSize: 16,
                              color: 'text.secondary'
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: '0.8rem', fontWeight: 500 }}
                          >
                            {((article.views || 0)).toLocaleString()}
                          </Typography>
                        </Stack>

                        {article.author?.name && (
                          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ ml: 'auto' }}>
                            <PersonOutline
                              sx={{
                                fontSize: 16,
                                color: 'text.secondary'
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                maxWidth: 100,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {article.author.name}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>

                      <Button
                        variant="contained"
                        component={Link}
                        to={`/articles/${article._id}`}
                        fullWidth
                        size="large"
                        sx={{
                          borderRadius: '12px',
                          py: 1.25,
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          textTransform: 'none',
                          background: categoryData?.color
                            ? `linear-gradient(135deg, ${categoryData.color} 0%, ${categoryData.color}dd 100%)`
                            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          boxShadow: categoryData?.color
                            ? `0 4px 14px ${categoryData.color}40`
                            : `0 4px 14px ${theme.palette.primary.main}40`,
                          '&:hover': {
                            background: categoryData?.color
                              ? categoryData.color
                              : theme.palette.primary.dark,
                            boxShadow: categoryData?.color
                              ? `0 6px 20px ${categoryData.color}50`
                              : `0 6px 20px ${theme.palette.primary.main}50`,
                            transform: 'translateY(-1px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                        aria-label={`Read article titled ${article.title}`}
                      >
                        Read Article
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Categories;
