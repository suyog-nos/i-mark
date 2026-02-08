import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link as MuiLink,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  InputAdornment,
  Fade,
  Slide
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd,
  Language,
  AccountCircle
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'reader',
    language: 'en'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      setLoading(false);
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      language: formData.language
    });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 }
      }}
    >
      <Container component="main" maxWidth="sm">
        <Slide direction="up" in={true} mountOnEnter unmountOnExit timeout={600}>
          <Paper
            elevation={24}
            sx={{
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* Header Section */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: 'white',
                py: { xs: 3, sm: 4 },
                px: { xs: 3, sm: 4 },
                textAlign: 'center'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <PersonAdd sx={{ fontSize: 32 }} />
                </Box>
              </Box>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                {t('auth.register')}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Join our community and start sharing your stories
              </Typography>
            </Box>

            {/* Form Section */}
            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              {error && (
                <Fade in={!!error}>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: '12px',
                      '& .MuiAlert-icon': {
                        fontSize: '1.5rem'
                      }
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="name"
                      label={t('auth.name')}
                      name="name"
                      autoComplete="name"
                      autoFocus
                      value={formData.name}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'rgba(37, 99, 235, 0.04)',
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label={t('auth.email')}
                      name="email"
                      autoComplete="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'rgba(37, 99, 235, 0.04)',
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label={t('auth.password')}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: 'primary.main' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'rgba(37, 99, 235, 0.04)',
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      label={t('auth.confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              sx={{ color: 'primary.main' }}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: 'rgba(37, 99, 235, 0.04)',
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="role-label">Role</InputLabel>
                      <Select
                        labelId="role-label"
                        id="role"
                        name="role"
                        value={formData.role}
                        label="Role"
                        onChange={handleChange}
                        sx={{
                          borderRadius: '12px',
                          backgroundColor: 'rgba(37, 99, 235, 0.04)',
                        }}
                      >
                        <MenuItem value="reader">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            📖 Reader
                          </Box>
                        </MenuItem>
                        <MenuItem value="publisher">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            ✍️ Publisher
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="language-label">{t('common.language')}</InputLabel>
                      <Select
                        labelId="language-label"
                        id="language"
                        name="language"
                        value={formData.language}
                        label={t('common.language')}
                        onChange={handleChange}
                        startAdornment={
                          <InputAdornment position="start">
                            <Language sx={{ color: 'primary.main', ml: 1 }} />
                          </InputAdornment>
                        }
                        sx={{
                          borderRadius: '12px',
                          backgroundColor: 'rgba(37, 99, 235, 0.04)',
                        }}
                      >
                        <MenuItem value="en">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            🇺🇸 {t('common.english')}
                          </Box>
                        </MenuItem>
                        <MenuItem value="np">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            🇳🇵 {t('common.nepali')}
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        py: { xs: 1.5, sm: 2 },
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        fontWeight: 600,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                        boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                          boxShadow: '0 12px 40px rgba(37, 99, 235, 0.4)',
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
                          boxShadow: 'none',
                        }
                      }}
                    >
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              border: '2px solid rgba(255, 255, 255, 0.3)',
                              borderTop: '2px solid white',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite',
                              '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' },
                              },
                            }}
                          />
                          Creating Account...
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonAdd />
                          {t('auth.register')}
                        </Box>
                      )}
                    </Button>
                  </Grid>
                </Grid>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <MuiLink
                      component={Link}
                      to="/login"
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      {t('auth.login')}
                    </MuiLink>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Slide>
      </Container>
    </Box>
  );
};

export default Register;
