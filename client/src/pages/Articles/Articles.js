import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Pagination
} from '@mui/material';
import {
  Schedule,
  Visibility,
  Favorite,
  CalendarToday,
  RemoveRedEye,
  FavoriteBorder
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useSocket } from '../../contexts/SocketContext';
import ImageComponent from '../../components/Common/ImageComponent';

const Articles = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);

  const socket = useSocket();

  useEffect(() => {
    fetchArticles();
    fetchCategories();

    // Listen for real-time article publication
    if (socket) {
      socket.on('article_published', () => {
        fetchArticles();
      });

      return () => socket.off('article_published');
    }
  }, [search, category, sortBy, page, socket]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/articles/categories/list');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy,
        sortOrder: 'desc'
      });

      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await axios.get(`/api/articles?${params}`);
      setArticles(response.data.articles);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading && articles.length === 0) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading articles...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Premium Page Header */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h3"
          component="h1"
          fontWeight={800}
          sx={{
            mb: 1,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {t('navigation.articles')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem' }}>
          Discover and explore our latest articles across all categories
        </Typography>
      </Box>

      {/* Premium Search and Filters */}
      <Box
        sx={{
          mb: 5,
          p: 3,
          borderRadius: '20px',
          background: (theme) => theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.05)'
            : '#ffffff',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.06)'
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search articles..."
            placeholder="Type keywords, topics, or author names"
            variant="outlined"
            value={search}
            onChange={handleSearchChange}
            sx={{
              flex: '1 1 300px',
              minWidth: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : '#f8f9fa',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : '#f0f2f5'
                }
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500
              }
            }}
          />

          <FormControl
            sx={{
              minWidth: 180,
              flex: '0 1 auto',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : '#f8f9fa'
              }
            }}
          >
            <InputLabel sx={{ fontWeight: 500 }}>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>All Categories</Typography>
                </Box>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  <Typography fontWeight={500}>{cat}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            sx={{
              minWidth: 180,
              flex: '0 1 auto',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : '#f8f9fa'
              }
            }}
          >
            <InputLabel sx={{ fontWeight: 500 }}>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="createdAt">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CalendarToday sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography fontWeight={500}>Newest First</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="views">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <RemoveRedEye sx={{ fontSize: 18, color: 'info.main' }} />
                  <Typography fontWeight={500}>Most Viewed</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="likes">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Favorite sx={{ fontSize: 18, color: 'error.main' }} />
                  <Typography fontWeight={500}>Most Liked</Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Active Filters Display */}
        {(search || category) && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mr: 1 }}>
                ACTIVE FILTERS:
              </Typography>
              {search && (
                <Chip
                  label={`Search: "${search}"`}
                  onDelete={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                    color: '#fff'
                  }}
                />
              )}
              {category && (
                <Chip
                  label={`Category: ${category}`}
                  onDelete={() => {
                    setCategory('');
                    setPage(1);
                  }}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
                    color: '#fff'
                  }}
                />
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Articles Grid */}
      <Grid container spacing={4}>
        {articles.map((article) => (
          <Grid item key={article._id} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '24px',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                boxShadow: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                  borderColor: 'primary.main'
                }
              }}
            >
              <ImageComponent
                src={article.featuredImage}
                alt={article.title}
                height={240}
                sx={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}
              />

              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={article.category}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 700, borderRadius: '6px' }}
                  />
                  {article.tags.slice(0, 2).map((tag) => (
                    <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" sx={{ borderRadius: '6px' }} />
                  ))}
                </Box>
                <Typography gutterBottom variant="h5" component="h3" fontWeight="800">
                  {article.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {article.content.substring(0, 150)}...
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 2 }}>
                  <Avatar
                    src={article.author.profile?.picture}
                    sx={{ width: 32, height: 32, mr: 1.5, border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="700">{article.author.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(article.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                </Box>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  component={Link}
                  to={`/articles/${article._id}`}
                  sx={{ borderRadius: '12px', py: 1, fontWeight: 700 }}
                >
                  Read Full Story
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {articles.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {t('search.noResults')}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Articles;
