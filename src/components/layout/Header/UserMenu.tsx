'use client'
import React, { useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
    Box,
    IconButton
} from '@mui/material';
import {
    Person,
    Logout,
    Settings,
    KeyboardArrowDown
} from '@mui/icons-material';

export const UserMenu: React.FC = () => {
    const { data: session } = useSession();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSignOut = () => {
        signOut({ callbackUrl: '/auth/signin' });
        handleClose();
    };

    if (!session) return null;

    return (
        <>
            <IconButton
                onClick={handleClick}
                size="small"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    '&:hover': {
                        bgcolor: 'neutral.100'
                    }
                }}
            >
                <Avatar
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        fontSize: '0.875rem'
                    }}
                >
                    {session.user?.name?.[0]?.toUpperCase() || <Person />}
                </Avatar>

                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                    <Typography variant="body2" fontWeight={500}>
                        {session.user?.name || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {session.user?.email}
                    </Typography>
                </Box>

                <KeyboardArrowDown sx={{ fontSize: 16, color: 'text.secondary' }} />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        minWidth: 200,
                        mt: 1.5,
                        '& .MuiMenuItem-root': {
                            px: 2,
                            py: 1,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight={500}>
                        {session.user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {session.user?.email}
                    </Typography>
                    {session.user?.role && (
                        <Typography variant="caption" color="primary.main" sx={{ display: 'block', textTransform: 'capitalize' }}>
                            {session.user.role}
                        </Typography>
                    )}
                </Box>

                <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Account Settings</ListItemText>
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleSignOut} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                        <Logout fontSize="small" sx={{ color: 'error.main' }} />
                    </ListItemIcon>
                    <ListItemText>Sign Out</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};
