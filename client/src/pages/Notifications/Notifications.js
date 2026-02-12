import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    IconButton,
    Button,
    Chip,
    Divider,
    Fade,
    Stack,
    CircularProgress
} from '@mui/material';
import {
    Notifications as NotifyIcon,
    Delete as DeleteIcon,
    CheckCircle as ReadIcon,
    Article,
    Person,
    Comment,
    Favorite,
    Circle
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
    const {
        notifications,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications();

    const getIcon = (type) => {
        switch (type) {
            case 'new_article': return <Article color="primary" />;
            case 'new_subscriber': return <Person color="secondary" />;
            case 'new_comment': return <Comment color="info" />;
            case 'new_like': return <Favorite color="error" />;
            default: return <NotifyIcon />;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <NotifyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                        <Typography variant="h4" fontWeight="800">Notifications</Typography>
                        <Typography color="text.secondary">
                            Stay updated with the latest activity
                        </Typography>
                    </Box>
                </Box>
                {unreadCount > 0 && (
                    <Button variant="outlined" onClick={markAllAsRead} sx={{ borderRadius: '12px' }}>
                        Mark all as read
                    </Button>
                )}
            </Stack>

            {notifications.length === 0 ? (
                <Paper sx={{ p: 8, textAlign: 'center', borderRadius: '24px' }}>
                    <ReadIcon sx={{ fontSize: 60, color: 'success.light', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        You're all caught up!
                    </Typography>
                </Paper>
            ) : (
                <Paper elevation={0} sx={{
                    borderRadius: '24px',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden'
                }}>
                    <List sx={{ p: 0 }}>
                        {notifications.map((n, index) => (
                            <Fade in key={n._id} timeout={300 + index * 50}>
                                <Box>
                                    <ListItem
                                        sx={{
                                            p: 3,
                                            bgcolor: n.isRead ? 'transparent' : 'rgba(37, 99, 235, 0.04)',
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                                        }}
                                        secondaryAction={
                                            <Stack direction="row" spacing={1}>
                                                {!n.isRead && (
                                                    <IconButton size="small" color="primary" onClick={() => markAsRead(n._id)}>
                                                        <ReadIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                                <IconButton size="small" color="error" onClick={() => deleteNotification(n._id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#ffffff', color: 'inherit', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                                                {getIcon(n.type)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="subtitle1" fontWeight={n.isRead ? 500 : 700}>
                                                        {n.title}
                                                    </Typography>
                                                    {!n.isRead && <Circle sx={{ fontSize: 8, color: 'primary.main' }} />}
                                                </Stack>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 0.5 }}>
                                                    <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                                                        {n.message}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < notifications.length - 1 && <Divider />}
                                </Box>
                            </Fade>
                        ))}
                    </List>
                </Paper>
            )}
        </Container>
    );
};

export default Notifications;
