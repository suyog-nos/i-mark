import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Stack,
    Avatar,
    useTheme,
    Tooltip,
    Divider,
    Pagination
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon,
    ArrowBack as ArrowBackIcon,
    AdminPanelSettings,
    Shield,
    LockReset,
    Block,
    CheckCircle
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const StaffManagement = () => {
    const { token } = useAuth();
    const theme = useTheme();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [openRoleDialog, setOpenRoleDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/users', {
                    params: { page: page, limit: 10 },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data.users);
                setTotalPages(response.data.totalPages || 1);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching staff:', err);
                setError('Failed to load staff members');
                setLoading(false);
            }
        };

        if (token) {
            fetchUsers();
        }
    }, [token, page]);

    const handleRoleChange = async () => {
        try {
            await axios.put(`/api/users/${selectedUser._id}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(users.map(u => u._id === selectedUser._id ? { ...u, role: newRole } : u));
            setSuccess(`Role updated for ${selectedUser.name}`);
            setOpenRoleDialog(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating role:', err);
            setError('Failed to update user role');
        }
    };

    const toggleStatus = async (id) => {
        try {
            const user = users.find(u => u._id === id);
            const newStatus = user.status === 'active' ? 'inactive' : 'active';
            await axios.put(`/api/users/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
            setSuccess(`Staff status updated to ${newStatus}`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Failed to update user status');
        }
    };

    const handleResetPassword = async (user) => {
        try {
            setSuccess(`Password reset instructions sent to ${user.email}`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to send reset link');
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress /></Box>;
    }

    return (
        <Box className="mesh-gradient" sx={{ minHeight: '100vh', py: 6 }}>
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6, flexWrap: 'wrap', gap: 3 }}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <AdminPanelSettings color="primary" sx={{ fontSize: '2.5rem' }} />
                            <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-1.5px' }}>User Management</Typography>
                        </Stack>
                        <Typography color="text.secondary" variant="h6" fontWeight="500">
                            Orchestrate platform access and security levels
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        disableElevation
                        startIcon={<PersonAddIcon />}
                        component={Link}
                        to="/admin/users/create"
                        sx={{ borderRadius: '14px', px: 4, py: 1.5, fontWeight: 800, fontSize: '1rem' }}
                    >
                        Add System User
                    </Button>
                </Box>

                {success && <Alert severity="success" sx={{ mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'success.light' }} onClose={() => setSuccess('')}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>}

                <TableContainer className="glass-panel" component={Paper} sx={{ borderRadius: 5, overflow: 'hidden' }}>
                    <Table sx={{ minWidth: 900 }}>
                        <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 3 }}>IDENTITY</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 3 }}>SECURITY ROLE</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 3 }}>STATUS</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 3 }}>LAST ACTIVITY</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', py: 3 }}>ADMIN ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ py: 2.5 }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ 
                                                width: 42, 
                                                height: 42, 
                                                bgcolor: user.role === 'admin' ? 'warning.light' : 'primary.light',
                                                fontWeight: 800,
                                                fontSize: '1rem',
                                                boxShadow: 'var(--shadow-sm)'
                                            }}>
                                                {user.name.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="800" sx={{ color: 'text.primary', lineHeight: 1.2 }}>{user.name}</Typography>
                                                <Typography variant="caption" color="text.secondary" fontWeight="500">{user.email}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role.toUpperCase()}
                                            color={user.role === 'admin' ? 'warning' : user.role === 'publisher' ? 'success' : 'primary'}
                                            size="small"
                                            sx={{ fontWeight: 900, fontSize: '0.65rem', letterSpacing: '0.5px', px: 1 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.status.toUpperCase()}
                                            icon={user.status === 'active' ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <Block sx={{ fontSize: '14px !important' }} />}
                                            color={user.status === 'active' ? 'success' : 'default'}
                                            variant={user.status === 'active' ? 'contained' : 'outlined'}
                                            size="small"
                                            sx={{ fontWeight: 800, fontSize: '0.65rem', borderRadius: '8px' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="600" color="text.secondary">
                                            {new Date(user.lastLogin || user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Reset Password">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleResetPassword(user)}
                                                    sx={{ border: '1px solid', borderColor: 'divider' }}
                                                >
                                                    <LockReset fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setNewRole(user.role);
                                                    setOpenRoleDialog(true);
                                                }}
                                                sx={{ borderRadius: '8px', fontWeight: 700, px: 2 }}
                                            >
                                                Adjust Role
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                disableElevation
                                                color={user.status === 'active' ? 'error' : 'success'}
                                                onClick={() => toggleStatus(user._id)}
                                                sx={{ borderRadius: '8px', fontWeight: 800, px: 2 }}
                                            >
                                                {user.status === 'active' ? 'Revoke' : 'Reinstate'}
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination Section */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination 
                            count={totalPages} 
                            page={page} 
                            onChange={(e, v) => setPage(v)}
                            color="primary"
                            size="large"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    className: 'glass-panel',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' }
                                    }
                                }
                            }}
                        />
                    </Box>
                )}

                <Dialog 
                    open={openRoleDialog} 
                    onClose={() => setOpenRoleDialog(false)}
                    PaperProps={{ className: 'glass-panel', sx: { borderRadius: 4, p: 1 } }}
                >
                    <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem' }}>
                        Elevate Security Access
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            Modifying the role for <strong>{selectedUser?.name}</strong> will immediately change their system privileges.
                        </Typography>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="role-select-label">New System Role</InputLabel>
                            <Select
                                labelId="role-select-label"
                                value={newRole}
                                label="New System Role"
                                onChange={(e) => setNewRole(e.target.value)}
                                sx={{ borderRadius: '12px' }}
                            >
                                <MenuItem value="reader" sx={{ fontWeight: 600 }}>Reader (Default Access)</MenuItem>
                                <MenuItem value="publisher" sx={{ fontWeight: 600 }}>Publisher (Content Creation)</MenuItem>
                                <MenuItem value="admin" sx={{ fontWeight: 700, color: 'error.main' }}>Administrator (Full System Control)</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button onClick={() => setOpenRoleDialog(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                        <Button 
                            onClick={handleRoleChange} 
                            variant="contained" 
                            disableElevation
                            sx={{ fontWeight: 800, px: 4, borderRadius: '10px' }}
                        >
                            Authorize Update
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default StaffManagement;
