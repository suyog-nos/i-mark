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
    Paper,
    Stack,
    IconButton,
    Divider,
    Fade
} from '@mui/material';
import {
    PersonRemove,
    Verified,
    Email,
    People
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const MySubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('subscribedPublishers') || '[]');
        setSubscriptions(saved);
        setLoading(false);
    }, []);

    const handleUnsubscribe = (id) => {
        const saved = JSON.parse(localStorage.getItem('subscribedPublishers') || '[]');
        const newSaved = saved.filter(p => p._id !== id);
        localStorage.setItem('subscribedPublishers', JSON.stringify(newSaved));
        setSubscriptions(newSaved);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <Typography>Loading your subscriptions...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography
                    variant="h3"
                    fontWeight="800"
                    gutterBottom
                    sx={{
                        background: 'linear-gradient(45deg, #10b981 30%, #3b82f6 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    My Subscriptions
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Publishers and authors you follow
                </Typography>
            </Box>

            {subscriptions.length === 0 ? (
                <Fade in>
                    <Paper
                        sx={{
                            p: 8,
                            textAlign: 'center',
                            borderRadius: '24px',
                            background: 'rgba(255,255,255,0.5)',
                            backdropFilter: 'blur(10px)',
                            border: '1px dashed #ccc'
                        }}
                    >
                        <People sx={{ fontSize: 80, color: 'action.disabled', mb: 2 }} />
                        <Typography variant="h5" gutterBottom color="text.secondary">
                            You haven't followed any publishers yet
                        </Typography>
                        <Button
                            variant="contained"
                            component={Link}
                            to="/publishers"
                            sx={{ mt: 2, borderRadius: '12px', px: 4 }}
                        >
                            Find Publishers
                        </Button>
                    </Paper>
                </Fade>
            ) : (
                <Grid container spacing={4}>
                    {subscriptions.map((pub) => (
                        <Grid item xs={12} sm={6} md={4} key={pub._id}>
                            <Card
                                sx={{
                                    borderRadius: '24px',
                                    border: '1px solid #f0f0f0',
                                    boxShadow: 'none',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                        borderColor: 'transparent'
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                    <Avatar
                                        src={pub.profile?.picture}
                                        sx={{ width: 100, height: 100, mx: 'auto', mb: 2, border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Typography variant="h6" fontWeight="700" display="flex" alignItems="center" justifyContent="center" gap={1}>
                                        {pub.name} {pub.articlesCount > 10 && <Verified color="primary" sx={{ fontSize: 18 }} />}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: '3em' }}>
                                        {pub.profile?.bio || 'Independent contributor sharing global perspectives.'}
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
                                            variant="outlined"
                                            startIcon={<PersonRemove />}
                                            onClick={() => handleUnsubscribe(pub._id)}
                                            color="error"
                                            sx={{ borderRadius: '12px', py: 1.2, fontWeight: 600 }}
                                        >
                                            Unfollow
                                        </Button>
                                        <IconButton
                                            sx={{ border: '1px solid #eee', borderRadius: '12px' }}
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
        </Container>
    );
};

export default MySubscriptions;
