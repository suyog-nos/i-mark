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
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom fontWeight="700">
        {t('navigation.articles')}
      </Typography>

      {/* Search and Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label={t('search.searchPlaceholder')}
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          sx={{ minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>{t('articles.category')}</InputLabel>
          <Select
            value={category}
            label={t('articles.category')}
            onChange={handleCategoryChange}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>{t('search.sortBy')}</InputLabel>
          <Select
            value={sortBy}
            label={t('search.sortBy')}
            onChange={handleSortChange}
          >
            <MenuItem value="createdAt">{t('search.newest')}</MenuItem>
            <MenuItem value="views">{t('search.mostViewed')}</MenuItem>
            <MenuItem value="likes">{t('search.mostLiked')}</MenuItem>
          </Select>
        </FormControl>
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
                border: '1px solid #f0f0f0',
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
