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
    Stack
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const StaffManagement = () => {
    /*
     * user-administration-interface
     * Central control panel for managing platform users.
     * Capabilities:
     * - Role Assignment: Elevating users to Publishers or Admins.
     * - Status Control: Activating or banning user accounts.
     * - Staff Oversight: Monitoring login activity and access levels.
     */
    const { token } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [openRoleDialog, setOpenRoleDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                // Fetch users who are staff (admin/publisher) or just all users if it's general management
                const response = await axios.get('/api/users', {
                    params: { limit: 100 }, // Get all for now or implement pagination
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Show all users including readers
                setUsers(response.data.users);
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
    }, [token]);

    /*
     * role-escalation-handler
     * Modifies the security clearance of a target user.
     * CRITICAL: This operation grants or revokes administrative/publishing privileges.
     * Updates are persisted to the backend and reflected immediately in the UI.
     */
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
            // Simulated link sending until we have email service
            setSuccess(`Password reset instructions sent to ${user.email}`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to send reset link');
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                <Box>
                    <Typography variant="h4" fontWeight="900">User Management</Typography>
                    <Typography color="text.secondary">Manage all users and their roles on the platform</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    component={Link}
                    to="/admin/users/create"
                    sx={{ borderRadius: '12px', px: 3 }}
                >
                    Add User
                </Button>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: 'none' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Last Activity</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id} hover>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight="700">{user.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role.toUpperCase()}
                                        color={user.role === 'admin' ? 'secondary' : 'primary'}
                                        size="small"
                                        sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.status.toUpperCase()}
                                        color={user.status === 'active' ? 'success' : 'default'}
                                        variant={user.status === 'active' ? 'contained' : 'outlined'}
                                        size="small"
                                        sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">{new Date(user.lastLogin).toLocaleDateString()}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                        <Button size="small" variant="outlined" onClick={() => handleResetPassword(user)}>Reset Pass</Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setNewRole(user.role);
                                                setOpenRoleDialog(true);
                                            }}
                                        >
                                            Role
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color={user.status === 'active' ? 'error' : 'success'}
                                            onClick={() => toggleStatus(user._id)}
                                        >
                                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)}>
                <DialogTitle sx={{ fontWeight: 800 }}>Change Role: {selectedUser?.name}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, minWidth: 300 }}>
                        <FormControl fullWidth>
                            <InputLabel>New Role</InputLabel>
                            <Select
                                value={newRole}
                                label="New Role"
                                onChange={(e) => setNewRole(e.target.value)}
                            >
                                <MenuItem value="reader">Reader</MenuItem>
                                <MenuItem value="publisher">Publisher</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="editor">Editor</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
                    <Button onClick={handleRoleChange} variant="contained" color="primary">Update Access</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StaffManagement;
