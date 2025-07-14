import React from 'react';
import { useForm } from 'react-hook-form';
import { Grid, Box } from '@mui/material';
import { FormField } from '../FormField/FormField';
import { Button } from '../../ui';

interface PropertyFormData {
    address: string;
    property_type: string;
}

interface PropertyFormProps {
    onSubmit: (data: PropertyFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    initialValues?: Partial<PropertyFormData>;
}

const propertyTypes = [
    { value: '', label: 'Select property type' },
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'office', label: 'Office' },
    { value: 'retail', label: 'Retail' },
    { value: 'warehouse', label: 'Warehouse' }
];

export const PropertyForm: React.FC<PropertyFormProps> = ({
                                                              onSubmit,
                                                              onCancel,
                                                              loading = false,
                                                              initialValues = {}
                                                          }) => {
    const { control, handleSubmit, formState: { isValid } } = useForm<PropertyFormData>({
        defaultValues: {
            address: '',
            property_type: '',
            ...initialValues
        },
        mode: 'onChange'
    });

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <FormField
                        name="address"
                        control={control}
                        label="Property Address"
                        placeholder="Enter full property address"
                        rules={{
                            required: 'Property address is required',
                            minLength: { value: 5, message: 'Please enter a complete address' }
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormField
                        name="property_type"
                        control={control}
                        type="select"
                        label="Property Type"
                        options={propertyTypes}
                    />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={!isValid}
                >
                    Add Property
                </Button>
            </Box>
        </Box>
    );
};

