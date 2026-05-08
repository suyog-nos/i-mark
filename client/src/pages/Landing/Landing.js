import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Stack,
  Card,
  Avatar,
  AvatarGroup,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  ArrowForward,
  Verified,
  Speed,
  Language,
  AutoAwesome,
  Security,
  HistoryEdu
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const { darkMode } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /*
   * PUBLIC ACQUISITION AND BRAND AUTHORITY WORKFLOW (Workflow Overview)
   * This module serves as the primary "Public Acquisition Funnel" for the platform. 
   * The workflow is designed to establish immediate institutional trust through high-impact 
   * visual storytelling and clear value propositions. It utilizes a layered layout strategy—
   * transitioning from a premium hero section into a detailed feature grid that explains 
   * the platform's unique editorial lifecycle. The logic here is primarily focused on 
   * user conversion: providing anonymous visitors with clear pathways to "Start Reading" 
   * or "Sign In," effectively bridging the gap between a guest visit and full engagement 
   * with the personalized news universe.
   */
  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          background: darkMode
            ? 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), #0f172a'
            : 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), #f8fafc',
          pt: { xs: 10, md: 0 }
        }}
      >
        {/* Background Mesh Image (from generate_image) */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: darkMode ? 0.4 : 0.6,
            backgroundImage: `url(/news_hero_glassmorphic_1778039203561.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px)',
            zIndex: 0
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box className="page-transition">
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: '100px',
                    bgcolor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                    border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`,
                    mb: 4
                  }}
                >
                  <AutoAwesome sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="caption" fontWeight="700" color="primary.main" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Defining the Future of News
                  </Typography>
                </Box>

                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '3.5rem', md: '5rem' },
                    lineHeight: 1.1,
                    mb: 3,
                    background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-2px'
                  }}
                >
                  Truth in Every <br /> Story. Insight <br /> in Every Word.
                </Typography>

                <Typography
                  variant="h5"
                  color={darkMode ? "text.primary" : "text.secondary"}
                  sx={{ mb: 6, maxWidth: '600px', lineHeight: 1.6, fontWeight: 600, opacity: darkMode ? 0.9 : 1 }}
                >
                  Welcome to Insight World—a premium, role-based news ecosystem built for integrity, transparency, and global reach. Experience journalism redefined.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                  <Button
                    component={Link}
                    to="/home"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      px: 6,
                      py: 2,
                      borderRadius: '20px',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.4)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.5)'
                      }
                    }}
                  >
                    Start Reading
                  </Button>
                  {!isAuthenticated && (
                    <Button
                      component={Link}
                      to="/login"
                      variant="outlined"
                      size="large"
                      sx={{
                        px: 6,
                        py: 2,
                        borderRadius: '20px',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderWidth: '2px',
                        '&:hover': {
                          borderWidth: '2px',
                          bgcolor: 'rgba(255,255,255,0.05)'
                        }
                      }}
                    >
                      Sign In
                    </Button>
                  )}
                </Stack>

                <Box sx={{ mt: 8, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AvatarGroup max={4}>
                    <Avatar src="https://i.pravatar.cc/150?u=1" />
                    <Avatar src="https://i.pravatar.cc/150?u=2" />
                    <Avatar src="https://i.pravatar.cc/150?u=3" />
                    <Avatar src="https://i.pravatar.cc/150?u=4" />
                  </AvatarGroup>
                  <Typography variant="body2" color="text.secondary" fontWeight="500">
                    Trusted by <strong>10,000+</strong> readers daily
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {!isMobile && (
              <Grid item md={5}>
                <Box
                  sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '10%',
                      left: '10%',
                      right: '-5%',
                      bottom: '-5%',
                      background: 'linear-gradient(45deg, #3b82f622, #8b5cf622)',
                      borderRadius: '40px',
                      zIndex: -1,
                      filter: 'blur(40px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      p: 4,
                      borderRadius: '40px',
                      background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}`,
                      boxShadow: '0 40px 80px -20px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Stack spacing={3}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'primary.main', color: 'white' }}>
                          <Verified />
                        </Box>
                        <Box>
                          <Typography fontWeight="800">Verified Sources</Typography>
                          <Typography variant="caption" color="text.secondary">100-year institutional heritage</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'secondary.main', color: 'white' }}>
                          <Language />
                        </Box>
                        <Box>
                          <Typography fontWeight="800">Multi-lingual Depth</Typography>
                          <Typography variant="caption" color="text.secondary">English & Nepali Native Support</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: 'success.main', color: 'white' }}>
                          <Security />
                        </Box>
                        <Box>
                          <Typography fontWeight="800">Secure & Private</Typography>
                          <Typography variant="caption" color="text.secondary">JWT Encryption & Role Protection</Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Features Grid */}
      <Container maxWidth="xl" sx={{ py: 15 }}>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography variant="h3" fontWeight="900" gutterBottom>
            Institutional Newsroom Intelligence
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Built with the discipline of a century-old publisher and the speed of modern tech.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              icon: <HistoryEdu />,
              title: "Editorial Lifecycle",
              desc: "Every article undergoes a rigorous Draft → Pending → Published workflow managed by our senior editors.",
              color: "#3b82f6"
            },
            {
              icon: <Verified />,
              title: "Fact-Check Protocol",
              desc: "Transparency is our priority. Our system tracks source verifiability and content integrity.",
              color: "#10b981"
            },
            {
              icon: <Speed />,
              title: "Real-time Alerts",
              desc: "Get breaking news the second it happens with our low-latency Socket.IO notification engine.",
              color: "#f59e0b"
            }
          ].map((feature, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card
                sx={{
                  height: '100%',
                  p: 4,
                  borderRadius: '32px',
                  background: darkMode ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                  }
                }}
                elevation={0}
              >
                <Box sx={{ mb: 3, display: 'inline-flex', p: 2, borderRadius: '20px', bgcolor: `${feature.color}22`, color: feature.color, border: `1px solid ${feature.color}33` }}>
                  {feature.icon}
                </Box>
                <Typography variant="h5" fontWeight="800" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary" lineHeight={1.6}>
                  {feature.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ py: 15, bgcolor: darkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.02)' }}>
        <Container maxWidth="md">
          <Card
            sx={{
              p: { xs: 4, md: 8 },
              borderRadius: '48px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              boxShadow: '0 40px 80px -20px rgba(59, 130, 246, 0.4)'
            }}
          >
            <Typography variant="h3" fontWeight="900" gutterBottom>
              Join the Information Revolution
            </Typography>
            <Typography variant="h6" sx={{ mb: 6, opacity: 0.9 }}>
              Experience the clarity of trusted journalism today.
            </Typography>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: '#ffffff !important',
                  color: '#1d4ed8 !important',
                  px: 8,
                  py: 2.5,
                  borderRadius: '24px',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  '&:hover': {
                    backgroundColor: '#ffffff !important',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.2)'
                  }
                }}
              >
                Get Started for Free
              </Button>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
