import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
      }}
    >
      <Container maxWidth="xl">
        <Typography variant="body2" align="center" color="text.secondary">
          © 2024 News Portal. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
