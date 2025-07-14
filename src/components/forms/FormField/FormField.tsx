import React from 'react';
import {
    TextField,
    TextFieldProps,
    MenuItem,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    FormGroup,
    FormHelperText,
    InputAdornment
} from '@mui/material';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

interface BaseFormFieldProps<T extends FieldValues> {
    name: FieldPath<T>;
    control: Control<T>;
    rules?: any;
    label?: string;
    helperText?: string;
    disabled?: boolean;
}

interface TextFormFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    placeholder?: string;
    multiline?: boolean;
    rows?: number;
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
    fullWidth?: boolean;
}

interface SelectFormFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
    type: 'select';
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
    fullWidth?: boolean;
}

interface RadioFormFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
    type: 'radio';
    options: Array<{ value: string; label: string }>;
    row?: boolean;
}

interface CheckboxFormFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
    type: 'checkbox';
    options: Array<{ value: string; label: string }>;
}

interface DateFormFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
    type: 'date';
    placeholder?: string;
    fullWidth?: boolean;
}

type FormFieldProps<T extends FieldValues> =
    | TextFormFieldProps<T>
    | SelectFormFieldProps<T>
    | RadioFormFieldProps<T>
    | CheckboxFormFieldProps<T>
    | DateFormFieldProps<T>;

export function FormField<T extends FieldValues>(props: FormFieldProps<T>) {
    const { name, control, rules, label, helperText, disabled, ...fieldProps } = props;

    if (props.type === 'select') {
        return (
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field, fieldState: { error } }) => (
                    <TextField
                        {...field}
                        select
                        label={label}
                        error={!!error}
                        helperText={error?.message || helperText}
                        disabled={disabled}
                        placeholder={props.placeholder}
                        fullWidth={props.fullWidth ?? true}
                    >
                        {props.options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
            />
        );
    }

    if (props.type === 'radio') {
        return (
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field, fieldState: { error } }) => (
                    <FormControl error={!!error} disabled={disabled}>
                        {label && <FormLabel>{label}</FormLabel>}
                        <RadioGroup
                            {...field}
                            row={props.row}
                        >
                            {props.options.map((option) => (
                                <FormControlLabel
                                    key={option.value}
                                    value={option.value}
                                    control={<Radio />}
                                    label={option.label}
                                />
                            ))}
                        </RadioGroup>
                        {(error?.message || helperText) && (
                            <FormHelperText>{error?.message || helperText}</FormHelperText>
                        )}
                    </FormControl>
                )}
            />
        );
    }

    if (props.type === 'checkbox') {
        return (
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field, fieldState: { error } }) => (
                    <FormControl error={!!error} disabled={disabled}>
                        {label && <FormLabel>{label}</FormLabel>}
                        <FormGroup>
                            {props.options.map((option) => (
                                <FormControlLabel
                                    key={option.value}
                                    control={
                                        <Checkbox
                                            checked={(field.value || []).includes(option.value)}
                                            onChange={(e) => {
                                                const currentValue = field.value || [];
                                                if (e.target.checked) {
                                                    field.onChange([...currentValue, option.value]);
                                                } else {
                                                    field.onChange(currentValue.filter((v: string) => v !== option.value));
                                                }
                                            }}
                                        />
                                    }
                                    label={option.label}
                                />
                            ))}
                        </FormGroup>
                        {(error?.message || helperText) && (
                            <FormHelperText>{error?.message || helperText}</FormHelperText>
                        )}
                    </FormControl>
                )}
            />
        );
    }

    // Default to text field (including date, number, etc.)
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState: { error } }) => (
                <TextField
                    {...field}
                    type={props.type || 'text'}
                    label={label}
                    error={!!error}
                    helperText={error?.message || helperText}
                    disabled={disabled}
                    placeholder={props.type !== 'date' ? (props as any).placeholder : undefined}
                    multiline={(props as any).multiline}
                    rows={(props as any).rows}
                    fullWidth={(props as any).fullWidth ?? true}
                    InputProps={{
                        startAdornment: (props as any).startAdornment ? (
                            <InputAdornment position="start">{(props as any).startAdornment}</InputAdornment>
                        ) : undefined,
                        endAdornment: (props as any).endAdornment ? (
                            <InputAdornment position="end">{(props as any).endAdornment}</InputAdornment>
                        ) : undefined,
                    }}
                />
            )}
        />
    );
}
