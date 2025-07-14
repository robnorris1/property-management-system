import React from 'react';
import { Card } from '../Card/Card';
import { Box, Typography, SvgIcon } from '@mui/material';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
                                                      title,
                                                      value,
                                                      icon: Icon,
                                                      color = 'primary',
                                                      subtitle
                                                  }) => {
    return (
        <Card>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="text.primary">
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: `${color}.100`,
                    }}
                >
                    <SvgIcon
                        component={Icon}
                        sx={{ fontSize: 24, color: `${color}.600` }}
                    />
                </Box>
            </Box>
        </Card>
    );
};
