// src/components/forms/ApplianceForm/ApplianceForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Grid, Box } from '@mui/material';
import { Calendar, Build } from '@mui/icons-material';
import { FormField } from '../FormField/FormField';
import { Button } from '../../ui';

interface ApplianceFormData {
    name: string;
    type: string;
    installation_date: string;
    last_maintenance: string;
    status: string;
}

interface ApplianceFormProps {
    onSubmit: (data: ApplianceFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    initialValues?: Partial<ApplianceFormData>;
}

const applianceTypes = [
    { value: '', label: 'Select appliance type' },
    { value: 'hvac', label: 'HVAC System' },
    { value: 'water_heater', label: 'Water Heater' },
    { value: 'refrigerator', label: 'Refrigerator' },
    { value: 'washer', label: 'Washer' },
    { value: 'dryer', label: 'Dryer' },
    { value: 'dishwasher', label: 'Dishwasher' },
    { value: 'oven', label: 'Oven/Range' },
    { value: 'microwave', label: 'Microwave' },
    { value: 'garbage_disposal', label: 'Garbage Disposal' },
    { value: 'furnace', label: 'Furnace' },
    { value: 'air_conditioner', label: 'Air Conditioner' },
    { value: 'boiler', label: 'Boiler' },
    { value: 'heat_pump', label: 'Heat Pump' },
    { value: 'other', label: 'Other' }
];

const statusOptions = [
    { value: 'working', label: 'Working' },
    { value: 'needs_repair', label: 'Needs Repair' },
    { value: 'under_repair', label: 'Under Repair' },
    { value: 'out_of_service', label: 'Out of Service' }
];

export const ApplianceForm: React.FC<ApplianceFormProps> = ({
                                                                onSubmit,
                                                                onCancel,
                                                                loading = false,
                                                                initialValues = {}
                                                            }) => {
    const { control, handleSubmit, watch, formState: { isValid } } = useForm<ApplianceFormData>({
        defaultValues: {
            name: '',
            type: '',
            installation_date: '',
            last_maintenance: '',
            status: 'working',
            ...initialValues
        },
        mode: 'onChange'
    });

    const installationDate = watch('installation_date');

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <FormField
                        name="name"
                        control={control}
                        label="Appliance Name"
                        placeholder="e.g., Kitchen Refrigerator, Main HVAC Unit"
                        rules={{
                            required: 'Appliance name is required',
                            minLength: { value: 2, message: 'Please enter a valid appliance name' }
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormField
                        name="type"
                        control={control}
                        type="select"
                        label="Appliance Type"
                        options={applianceTypes}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormField
                        name="status"
                        control={control}
                        type="select"
                        label="Current Status"
                        options={statusOptions}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormField
                        name="installation_date"
                        control={control}
                        type="date"
                        label="Installation Date"
                        startAdornment={<Calendar />}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormField
                        name="last_maintenance"
                        control={control}
                        type="date"
                        label="Last Maintenance Date"
                        startAdornment={<Build />}
                        helperText="Leave empty if never maintained or unknown"
                        rules={{
                            validate: (value: string) => {
                                if (!value || !installationDate) return true;
                                return new Date(value) >= new Date(installationDate) ||
                                    'Last maintenance date cannot be before installation date';
                            }
                        }}
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
                    {initialValues.name ? 'Update Appliance' : 'Add Appliance'}
                </Button>
            </Box>
        </Box>
    );
};
