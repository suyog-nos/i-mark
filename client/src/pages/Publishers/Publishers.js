import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Paper,
  Stack,
  IconButton,
  Divider
} from '@mui/material';
import {
  Search,
  PersonAdd,
  PersonRemove,
  Verified,
  Article,
  Email,
  ArrowForward
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Publishers = () => {
  /*
   * discovery-and-subscription-manager
   * Facilitates the exploration of content creators on the platform.
   * - Discovery: Searchable directory of verified publishers.
   * - Persistence: Manages the 'Follow' state using local storage (for guest/quick access) & state sync.
   */
  const { t } = useTranslation();
  const { user, token, isAuthenticated } = useAuth();
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    fetchPublishers();
    // Load followed publishers from localStorage
    const saved = JSON.parse(localStorage.getItem('subscribedPublishers') || '[]');
    setFollowing(saved.map(p => p._id));
  }, [search]);

  const getImageUrl = (path) => {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  };

  /*
   * directory-search-engine
   * Performs dynamic queries to the backend to retrieve publisher profiles.
   * Triggered by the search input debounce or initial component load.
   */
  const fetchPublishers = async () => {
    try {
      const res = await axios.get(`/api/users/publishers/list?search=${search}`);
      setPublishers(res.data.publishers);
    } catch (err) {
      console.error('Failed to fetch publishers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = (publisher) => {
    const saved = JSON.parse(localStorage.getItem('subscribedPublishers') || '[]');
    const isFollowing = saved.some(p => p._id === publisher._id);

    let newSaved;
    if (isFollowing) {
      newSaved = saved.filter(p => p._id !== publisher._id);
    } else {
      newSaved = [...saved, publisher];
    }

    localStorage.setItem('subscribedPublishers', JSON.stringify(newSaved));
    setFollowing(newSaved.map(p => p._id));
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="800" sx={{
          background: 'linear-gradient(45deg, #10b981 30%, #3b82f6 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2
        }}>
          Media Houses & Publishers
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Follow your favorite authors and news organizations to stay updated with their latest investigative reports.
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <TextField
          variant="outlined"
          placeholder="Search by name or bio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: '100%',
            maxWidth: 600,
            '& .MuiOutlinedInput-root': {
              borderRadius: '50px',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff',
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? '0 4px 20px rgba(0,0,0,0.3)'
                : '0 4px 20px rgba(0,0,0,0.05)'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {publishers.map((pub) => (
            <Grid item xs={12} sm={6} md={4} key={pub._id}>
              <Card
                sx={{
                  borderRadius: '24px',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none',
                  transition: 'all 0.3s ease',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                  '&:hover': {
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                      ? '0 20px 40px rgba(0,0,0,0.5)'
                      : '0 20px 40px rgba(0,0,0,0.08)',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar
                    src={getImageUrl(pub.profile?.picture)}
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 2,
                      border: (theme) => `4px solid ${theme.palette.background.paper}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Typography variant="h6" fontWeight="700" display="flex" alignItems="center" justifyContent="center" gap={1}>
                    {pub.name} {pub.articlesCount > 10 && <Verified color="primary" sx={{ fontSize: 18 }} />}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: '3em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {pub.profile?.bio || 'Independent contributor sharing global perspectives and breaking news stories.'}
                  </Typography>

                  <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 3 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="700">{pub.articlesCount || 0}</Typography>
                      <Typography variant="caption" color="text.secondary">Articles</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography variant="h6" fontWeight="700">{pub.followersCount || 0}</Typography>
                      <Typography variant="caption" color="text.secondary">Followers</Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant={following?.includes(pub._id) ? "outlined" : "contained"}
                      startIcon={following?.includes(pub._id) ? <PersonRemove /> : <PersonAdd />}
                      onClick={() => handleToggleFollow(pub)}
                      disabled={!isAuthenticated}
                      sx={{ borderRadius: '12px', py: 1.2, fontWeight: 600 }}
                    >
                      {following?.includes(pub._id) ? "Unfollow" : "Follow"}
                    </Button>
                    <IconButton
                      sx={{
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        borderRadius: '12px'
                      }}
                      color="primary"
                    >
                      <Email />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {publishers.length === 0 && !loading && (
        <Paper sx={{ p: 10, textAlign: 'center', borderRadius: '24px' }}>
          <Typography variant="h5" color="text.secondary">No publishers found matching your search.</Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Publishers;
