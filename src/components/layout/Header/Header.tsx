import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Container
} from '@mui/material';
import { Home } from '@mui/icons-material';
import { Button } from '@/components/ui';
import { UserMenu } from './UserMenu';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
                                                  title = "Property Management System",
                                                  subtitle = "Manage your properties and track appliance maintenance",
                                                  actions
                                              }) => {
    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                borderBottom: 1,
                borderColor: 'divider'
            }}
        >
            <Container maxWidth="xl">
                <Toolbar sx={{ px: { xs: 0 }, py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 48,
                                height: 48,
                                bgcolor: 'primary.100',
                                borderRadius: 2,
                                mr: 2
                            }}
                        >
                            <Home sx={{ color: 'primary.600', fontSize: 24 }} />
                        </Box>

                        <Box>
                            <Typography variant="h5" component="h1" fontWeight={700}>
                                {title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {subtitle}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {actions}
                        <UserMenu />
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
