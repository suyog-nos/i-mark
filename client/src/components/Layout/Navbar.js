import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Select,
  FormControl,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Language,
  Home,
  Article,
  Dashboard,
  AdminPanelSettings,
  People,
  Category,
  LightMode,
  DarkMode,
  Newspaper,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isPublisher, loading } = useAuth();
  const { t, i18n } = useTranslation();
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const getImageUrl = (path) => {
    if (!path || typeof path !== 'string') return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        {/* Clickable Logo */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: { xs: 1, md: 0 },
            mr: { md: 4 },
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s ease-in-out'
            }
          }}
        >
          <Newspaper
            sx={{
              fontSize: '2rem',
              mr: 1,
              color: theme.palette.secondary.main,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}
          />
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              background: darkMode
                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            NewsHub
          </Typography>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              color: 'white',
              display: { xs: 'block', sm: 'none' }
            }}
          >
            NH
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexGrow: 1 }}>
            <Button
              color="inherit"
              component={Link}
              to="/"
              startIcon={<Home sx={{ fontSize: '1.6rem !important' }} />}
              sx={{
                fontSize: '1.15rem',
                fontWeight: 700,
                px: 3,
                py: 1.25,
                borderRadius: '12px',
                letterSpacing: '0.4px',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {t('navigation.home')}
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/articles"
              startIcon={<Article sx={{ fontSize: '1.6rem !important' }} />}
              sx={{
                fontSize: '1.15rem',
                fontWeight: 700,
                px: 3,
                py: 1.25,
                borderRadius: '12px',
                letterSpacing: '0.4px',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {t('navigation.articles')}
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/publishers"
              startIcon={<People sx={{ fontSize: '1.6rem !important' }} />}
              sx={{
                fontSize: '1.15rem',
                fontWeight: 700,
                px: 3,
                py: 1.25,
                borderRadius: '12px',
                letterSpacing: '0.4px',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {t('navigation.publishers')}
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/categories"
              startIcon={<Category sx={{ fontSize: '1.6rem !important' }} />}
              sx={{
                fontSize: '1.15rem',
                fontWeight: 700,
                px: 3,
                py: 1.25,
                borderRadius: '12px',
                letterSpacing: '0.4px',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {t('navigation.categories')}
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Dark Mode Toggle */}
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton
              onClick={toggleDarkMode}
              color="inherit"
              sx={{
                borderRadius: '12px',
                p: 1,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {darkMode ? (
                <LightMode sx={{ fontSize: '1.2rem', color: '#fbbf24' }} />
              ) : (
                <DarkMode sx={{ fontSize: '1.2rem', color: '#1e293b' }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Language Selector */}
          <FormControl size="small">
            <Select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              sx={{
                color: 'white',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& .MuiSelect-icon': { color: 'white' },
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                }
              }}
            >
              <MenuItem value="en">🇺🇸 EN</MenuItem>
              <MenuItem value="np">🇳🇵 नेपाली</MenuItem>
            </Select>
          </FormControl>

          {/* Notifications Icon */}
          {!loading && isAuthenticated && (
            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                component={Link}
                to="/notifications"
                sx={{
                  borderRadius: '12px',
                  p: 1,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon sx={{ fontSize: '1.2rem' }} />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={() => setMobileMenuOpen(true)}
              sx={{
                borderRadius: '8px',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {!loading && (
            isAuthenticated ? (
              <div>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  {user?.profile?.picture ? (
                    <Avatar src={getImageUrl(user.profile.picture)} sx={{ width: 32, height: 32 }} />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                    {t('navigation.profile')}
                  </MenuItem>
                  {isAdmin ? (
                    <MenuItem onClick={() => { navigate('/admin'); handleClose(); }}>
                      Admin Control Panel
                    </MenuItem>
                  ) : isPublisher ? (
                    <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                      Publisher Dashboard
                    </MenuItem>
                  ) : (
                    <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                      Reader Dashboard
                    </MenuItem>
                  )}
                  {isPublisher && (
                    <MenuItem onClick={() => { navigate('/create-article'); handleClose(); }}>
                      {t('articles.createArticle')}
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    {t('navigation.logout')}
                  </MenuItem>
                </Menu>
              </div>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">
                  {t('navigation.login')}
                </Button>
                <Button color="inherit" component={Link} to="/register">
                  {t('navigation.register')}
                </Button>
              </>
            )
          )}
        </Box>
      </Toolbar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: darkMode
              ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
              : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            color: 'white'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Navigation
          </Typography>
          <List>
            <ListItem
              button
              component={Link}
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              sx={{ borderRadius: '8px', mb: 1, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <Home />
              </ListItemIcon>
              <ListItemText primary={t('navigation.home')} />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/articles"
              onClick={() => setMobileMenuOpen(false)}
              sx={{ borderRadius: '8px', mb: 1, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <Article />
              </ListItemIcon>
              <ListItemText primary={t('navigation.articles')} />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/publishers"
              onClick={() => setMobileMenuOpen(false)}
              sx={{ borderRadius: '8px', mb: 1, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <People />
              </ListItemIcon>
              <ListItemText primary={t('navigation.publishers')} />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              sx={{ borderRadius: '8px', mb: 1, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <Category />
              </ListItemIcon>
              <ListItemText primary={t('navigation.categories')} />
            </ListItem>

            {!loading && isAuthenticated && (
              <>
                <ListItem
                  button
                  component={Link}
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  sx={{ borderRadius: '8px', mb: 1, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                >
                  <ListItemIcon sx={{ color: 'white' }}>
                    <Dashboard />
                  </ListItemIcon>
                  <ListItemText primary={t('navigation.dashboard')} />
                </ListItem>
                {isAdmin && (
                  <ListItem
                    button
                    component={Link}
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    sx={{ borderRadius: '8px', mb: 1, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                  >
                    <ListItemIcon sx={{ color: 'white' }}>
                      <AdminPanelSettings />
                    </ListItemIcon>
                    <ListItemText primary="Admin Panel" />
                  </ListItem>
                )}
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
