import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Fade,
  Tab,
  Tabs,
  IconButton,
  CircularProgress,
  InputAdornment,
  Chip,
  Stack
} from '@mui/material';
import {
  Person,
  Lock,
  Language,
  Edit,
  Save,
  Cancel,
  Email,
  Phone,
  LocationOn,
  PhotoCamera,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getImageUrl = (path) => {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  };

  /*
   * form-state-managers
   * Segregates public profile data from sensitive credential data.
   * - profileForm: Handles bio, contact info, and preferences.
   * - passwordForm: Handles the secure password change workflow.
   */
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    phone: '',
    address: '',
    language: 'en'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [interests, setInterests] = useState([]);
  const availableCategories = ['Technology', 'Sports', 'Politics', 'Entertainment', 'Health', 'Business', 'Science', 'World'];

  const [showPassword, setShowPassword] = useState(false);

  /*
   * data-hydration
   * Populates the form with existing user data upon component mount.
   * Also retrieves locally stored interests which are not kept in the relational DB 
   * to provide client-side personalization without backend schema changes.
   */
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        bio: user.profile?.bio || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        language: user.language || 'en'
      });
    }
    // Load interests from localStorage
    const savedInterests = JSON.parse(localStorage.getItem('userInterests') || '[]');
    setInterests(savedInterests);
  }, [user]);

  const toggleInterest = (category) => {
    const updated = interests.includes(category)
      ? interests.filter(i => i !== category)
      : [...interests, category];
    setInterests(updated);
  };

  const saveInterests = () => {
    localStorage.setItem('userInterests', JSON.stringify(interests));
    setSuccess('Interests updated successfully!');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await updateProfile({
      name: profileForm.name,
      language: profileForm.language,
      profile: {
        bio: profileForm.bio,
        phone: profileForm.phone,
        address: profileForm.address
      }
    });

    if (result.success) {
      setSuccess('Profile updated successfully!');
      setEditMode(false);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  /*
   * security-transaction
   * Handles the critical password update process.
   * Enforces client-side validation (matching passwords) before attempting 
   * the server request to minimize API load and improve UX.
   */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="700" gutterBottom sx={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {t('navigation.profile')}
        </Typography>
        <Typography color="text.secondary" variant="h6">
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Card - Quick Info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{
            p: 4,
            borderRadius: '24px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
          }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
              <Avatar
                src={getImageUrl(user?.profile?.picture)}
                sx={{
                  width: 150,
                  height: 150,
                  mx: 'auto',
                  border: '4px solid white',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <PhotoCamera />
              </IconButton>
            </Box>

            <Typography variant="h5" fontWeight="600" gutterBottom>
              {user?.name}
            </Typography>
            <Typography color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1 }}>
              {user?.role}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Email color="primary" fontSize="small" />
                <Typography variant="body2">{user?.email}</Typography>
              </Box>
              {user?.profile?.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  <Phone color="primary" fontSize="small" />
                  <Typography variant="body2">{user.profile.phone}</Typography>
                </Box>
              )}
              {user?.profile?.address && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn color="primary" fontSize="small" />
                  <Typography variant="body2">{user.profile.address}</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Card - Controls */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
          }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': { py: 3, fontWeight: 600 },
                  '& .Mui-selected': { color: 'primary.main' }
                }}
              >
                <Tab icon={<Person sx={{ mr: 1 }} />} iconPosition="start" label="Personal Info" />
                <Tab icon={<Lock sx={{ mr: 1 }} />} iconPosition="start" label="Security" />
                <Tab icon={<Language sx={{ mr: 1 }} />} iconPosition="start" label="Preferences" />
              </Tabs>
            </Box>

            <Box sx={{ p: 4 }}>
              {error && <Fade in><Alert severity="error" sx={{ mb: 3 }}>{error}</Alert></Fade>}
              {success && <Fade in><Alert severity="success" sx={{ mb: 3 }}>{success}</Alert></Fade>}

              {/* Personal Info Tab */}
              {tabValue === 0 && (
                <Box component="form" onSubmit={handleProfileSubmit}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="600">Bio Data</Typography>
                    {!editMode ? (
                      <Button startIcon={<Edit />} variant="outlined" onClick={() => setEditMode(true)}>
                        Edit Profile
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button startIcon={<Cancel />} color="inherit" onClick={() => setEditMode(false)}>
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          startIcon={<Save />}
                          variant="contained"
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        value={user?.email}
                        disabled
                        variant="outlined"
                        helperText="Email cannot be changed"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Biography"
                        name="bio"
                        value={profileForm.bio}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        placeholder="Tell the community about yourself..."
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Location"
                        name="address"
                        value={profileForm.address}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Security Tab */}
              {tabValue === 1 && (
                <Box component="form" onSubmit={handlePasswordSubmit}>
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>Change Password</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        label="Current Password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="password"
                        label="New Password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Confirm New Password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 2 }}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Preferences Tab */}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>System Preferences</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        label="Default Language"
                        name="language"
                        value={profileForm.language}
                        onChange={handleProfileChange}
                        SelectProps={{ native: true }}
                      >
                        <option value="en">English (US)</option>
                        <option value="np">Nepali (नेपाली)</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mt: 2 }}>My Interests</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select categories you're interested in to personalize your "For You" feed.
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        {availableCategories.map((cat) => (
                          <Chip
                            key={cat}
                            label={cat}
                            clickable
                            color={interests.includes(cat) ? "primary" : "default"}
                            variant={interests.includes(cat) ? "contained" : "outlined"}
                            onClick={() => toggleInterest(cat)}
                            sx={{ borderRadius: '8px', px: 1 }}
                          />
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={2}>
                        <Button variant="contained" onClick={handleProfileSubmit} disabled={loading}>
                          Save Settings
                        </Button>
                        <Button variant="outlined" onClick={saveInterests}>
                          Save Interests Only
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
