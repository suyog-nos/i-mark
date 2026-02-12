import React, { useState } from 'react';
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
  Input
} from '@mui/material';
import { Preview, Save, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const CreateArticle = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    status: 'draft',
    scheduledPublish: ''
  });
  const [isScheduled, setIsScheduled] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
    }
  };

  const handlePreview = () => {
    const previewData = {
      ...formData,
      imagePreview: featuredImage ? URL.createObjectURL(featuredImage) : null
    };
    sessionStorage.setItem('articlePreview', JSON.stringify(previewData));
    navigate('/article-preview');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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

      const response = await axios.post('/api/articles', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Article created successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('articles.createArticle')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t('articles.title')}
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              margin="normal"
            />

            <TextField
              fullWidth
              label={t('articles.content')}
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              multiline
              rows={10}
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>{t('articles.category')}</InputLabel>
              <Select
                name="category"
                value={formData.category}
                label={t('articles.category')}
                onChange={handleChange}
                required
              >
                <MenuItem value="Technology">Technology</MenuItem>
                <MenuItem value="Sports">Sports</MenuItem>
                <MenuItem value="Politics">Politics</MenuItem>
                <MenuItem value="Entertainment">Entertainment</MenuItem>
                <MenuItem value="Health">Health</MenuItem>
                <MenuItem value="Business">Business</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label={t('articles.tags')}
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              margin="normal"
              helperText="Separate tags with commas"
            />

            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('articles.featuredImage')}
              </Typography>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </Box>

            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={isScheduled ? 'scheduled' : formData.status}
                label="Status"
                onChange={handleChange}
                disabled={isScheduled}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending">Submit for Review</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 2, p: 2, bgcolor: isScheduled ? '#f0f7ff' : 'transparent', borderRadius: '12px', border: isScheduled ? '1px solid #1976d2' : '1px dashed #ccc' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: isScheduled ? 2 : 0 }}>
                <Typography variant="subtitle1" fontWeight="600">Schedule Publication</Typography>
                <Button
                  size="small"
                  variant={isScheduled ? "contained" : "outlined"}
                  onClick={() => {
                    setIsScheduled(!isScheduled);
                    if (!isScheduled) setFormData({ ...formData, status: 'scheduled' });
                  }}
                >
                  {isScheduled ? "Scheduled" : "Set Schedule"}
                </Button>
              </Box>
              {isScheduled && (
                <TextField
                  fullWidth
                  type="datetime-local"
                  name="scheduledPublish"
                  label="Publish Date & Time"
                  value={formData.scheduledPublish}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={<Save />}
              >
                {loading ? 'Creating...' : t('common.save')}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handlePreview}
                startIcon={<Preview />}
              >
                Preview
              </Button>
              <Button
                variant="text"
                onClick={() => navigate('/dashboard')}
                startIcon={<Cancel />}
              >
                {t('common.cancel')}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateArticle;
