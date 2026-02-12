import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Input,
  CircularProgress,
  Grid
} from '@mui/material';
import { Preview, Save, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const EditArticle = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    status: 'draft'
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const res = await axios.get(`/api/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const article = res.data;
      setFormData({
        title: article.title,
        content: article.content,
        category: article.category,
        tags: article.tags.join(', '),
        status: article.status
      });
      if (article.featuredImage) {
        setImagePreview(`/uploads/${article.featuredImage.split('/').pop()}`);
      }
    } catch (err) {
      setError('Failed to load article details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePreview = () => {
    const previewData = {
      ...formData,
      imagePreview: imagePreview
    };
    sessionStorage.setItem('articlePreview', JSON.stringify(previewData));
    navigate('/article-preview');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('category', formData.category);
      submitData.append('tags', formData.tags);
      submitData.append('status', formData.status);

      if (featuredImage) {
        submitData.append('featuredImage', featuredImage);
      }

      await axios.put(`/api/articles/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccess('Article updated successfully!');
      setTimeout(() => navigate('/publisher/my-articles'), 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update article');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 6 }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: '24px', border: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h4" fontWeight="800" sx={{ mb: 4 }}>
            Edit Article
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Article Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              margin="normal"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <TextField
              fullWidth
              label="Content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              multiline
              rows={12}
              margin="normal"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleChange}
                    required
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="Technology">Technology</MenuItem>
                    <MenuItem value="Sports">Sports</MenuItem>
                    <MenuItem value="Politics">Politics</MenuItem>
                    <MenuItem value="Entertainment">Entertainment</MenuItem>
                    <MenuItem value="Health">Health</MenuItem>
                    <MenuItem value="Business">Business</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleChange}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="pending">Submit for Review</MenuItem>
                    <MenuItem value="published" disabled={formData.status !== 'published'}>Published</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              margin="normal"
              helperText="Separate tags with commas"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <Box sx={{ mt: 3, mb: 4 }}>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Featured Image
              </Typography>
              {imagePreview && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: '12px' }}
                  />
                </Box>
              )}
              <Button
                variant="outlined"
                component="label"
                sx={{ borderRadius: '12px' }}
              >
                Change Image
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
            </Box>

            <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
                startIcon={<Save />}
                sx={{ borderRadius: '12px', px: 4, py: 1.5 }}
              >
                {submitting ? 'Saving...' : 'Update Article'}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={handlePreview}
                startIcon={<Preview />}
                sx={{ borderRadius: '12px', px: 4 }}
              >
                Preview
              </Button>
              <Button
                variant="text"
                size="large"
                onClick={() => navigate('/publisher/my-articles')}
                startIcon={<Cancel />}
                sx={{ borderRadius: '12px', px: 4 }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditArticle;
