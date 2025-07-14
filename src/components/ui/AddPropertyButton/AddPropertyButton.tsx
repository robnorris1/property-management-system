import React from 'react';
import { Button } from '../Button/Button';
import { Add } from '@mui/icons-material';

interface AddPropertyButtonProps {
    variant?: 'primary' | 'outlined';
    size?: 'small' | 'medium' | 'large';
}

export const AddPropertyButton: React.FC<AddPropertyButtonProps> = ({
                                                                        variant = 'primary',
                                                                        size = 'medium'
                                                                    }) => {
    const handleClick = () => {
        window.dispatchEvent(new CustomEvent('openAddPropertyModal'));
    };

    return (
        <Button
            variant={variant}
            onClick={handleClick}
            startIcon={<Add />}
            size={size}
        >
            Add Property
        </Button>
    );
};
