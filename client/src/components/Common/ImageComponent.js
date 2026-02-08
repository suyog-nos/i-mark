import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ImageNotSupported } from '@mui/icons-material';

const ImageComponent = ({ src, alt, height = 200, sx = {} }) => {
    const [error, setError] = useState(false);

    // Helper to construct the correct URL
    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;

        // Clean up windows paths
        const cleanPath = path.replace(/\\/g, '/').split('/').pop();
        return `http://localhost:5000/uploads/${cleanPath}`;
    };

    const imageUrl = getImageUrl(src);

    if (error || !src) {
        return (
            <Box
                sx={{
                    height,
                    width: '100%',
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                    ...sx
                }}
            >
                <ImageNotSupported sx={{ fontSize: 40, opacity: 0.5 }} />
            </Box>
        );
    }

    return (
        <Box
            component="img"
            src={imageUrl}
            alt={alt}
            onError={() => setError(true)}
            sx={{
                height,
                width: '100%',
                objectFit: 'cover',
                ...sx
            }}
        />
    );
};

export default ImageComponent;
