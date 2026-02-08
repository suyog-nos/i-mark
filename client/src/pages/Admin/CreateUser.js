import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    IconButton
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const CreateUser = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'publisher'
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (!formData.role) newErrors.role = 'Role is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user types
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            setError('');
            setSuccess('');
            await axios.post('/api/admin/users', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess(`User ${formData.name} created successfully as ${formData.role}`);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'publisher'
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton onClick={() => navigate('/admin')} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" component="h1">
                        Create Staff Member
                    </Typography>
                </Box>

                <Paper sx={{ p: 4 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            id="name"
                            name="name"
                            label="Full Name"
                            margin="normal"
                            value={formData.name}
                            onChange={handleChange}
                            error={Boolean(errors.name)}
                            helperText={errors.name}
                        />

                        <TextField
                            fullWidth
                            id="email"
                            name="email"
                            label="Email Address"
                            margin="normal"
                            value={formData.email}
                            onChange={handleChange}
                            error={Boolean(errors.email)}
                            helperText={errors.email}
                        />

                        <TextField
                            fullWidth
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                            margin="normal"
                            value={formData.password}
                            onChange={handleChange}
                            error={Boolean(errors.password)}
                            helperText={errors.password}
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="role-label">Role</InputLabel>
                            <Select
                                labelId="role-label"
                                id="role"
                                name="role"
                                value={formData.role}
                                label="Role"
                                onChange={handleChange}
                            >
                                <MenuItem value="publisher">Publisher (Staff)</MenuItem>
                                <MenuItem value="admin">Admin (Full Access)</MenuItem>
                                <MenuItem value="reader">Reader</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            color="primary"
                            variant="contained"
                            fullWidth
                            type="submit"
                            size="large"
                            sx={{ mt: 3 }}
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create User'}
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default CreateUser;
