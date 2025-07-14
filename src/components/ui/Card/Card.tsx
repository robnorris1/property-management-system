// src/components/ui/Card/Card.tsx
import React from 'react';
import { Card as MuiCard, CardContent, CardActions, CardHeader } from '@mui/material';
import { styled } from '@mui/material/styles';

interface CardProps {
    title?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

const StyledCard = styled(MuiCard)(({ theme }) => ({
    transition: 'box-shadow 0.2s ease-in-out',
    '&:hover': {
        boxShadow: theme.shadows[4],
    },
}));

export const Card: React.FC<CardProps> = ({ title, children, actions, className }) => {
    return (
        <StyledCard className={className}>
            {title && <CardHeader title={title} />}
            <CardContent>{children}</CardContent>
            {actions && <CardActions>{actions}</CardActions>}
        </StyledCard>
    );
};
