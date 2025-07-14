import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outlined' | 'text';
    loading?: boolean;
}

const StyledButton = styled(MuiButton)<ButtonProps>(({ theme, variant }) => ({
    ...(variant === 'primary' && {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover': {
            backgroundColor: theme.palette.primary.dark,
        },
    }),
    ...(variant === 'secondary' && {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.secondary.contrastText,
        '&:hover': {
            backgroundColor: theme.palette.secondary.dark,
        },
    }),
    ...(variant === 'danger' && {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
        '&:hover': {
            backgroundColor: theme.palette.error.dark,
        },
    }),
}));

export const Button: React.FC<ButtonProps> = ({
                                                  variant = 'primary',
                                                  loading = false,
                                                  children,
                                                  disabled,
                                                  ...props
                                              }) => {
    const muiVariant = variant === 'outlined' ? 'outlined' : variant === 'text' ? 'text' : 'contained';

    return (
        <StyledButton
            variant={muiVariant}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? 'Loading...' : children}
        </StyledButton>
    );
};
