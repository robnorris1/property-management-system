// src/theme/index.ts
import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        neutral: Palette['primary'];
    }

    interface PaletteOptions {
        neutral?: PaletteOptions['primary'];
    }

    interface PaletteColor {
        50?: string;
        100?: string;
        200?: string;
        300?: string;
        400?: string;
        500?: string;
        600?: string;
        700?: string;
        800?: string;
        900?: string;
    }

    interface SimplePaletteColorOptions {
        50?: string;
        100?: string;
        200?: string;
        300?: string;
        400?: string;
        500?: string;
        600?: string;
        700?: string;
        800?: string;
        900?: string;
    }
}

// Define your color palette
const colors = {
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
    },
    secondary: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
    },
    error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
    },
    warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
    },
    success: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
    },
    neutral: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    },
};

export const theme = createTheme({
    palette: {
        primary: {
            main: colors.primary[600],
            light: colors.primary[400],
            dark: colors.primary[700],
            contrastText: '#ffffff',
            ...colors.primary,
        },
        secondary: {
            main: colors.secondary[600],
            light: colors.secondary[400],
            dark: colors.secondary[700],
            contrastText: '#ffffff',
            ...colors.secondary,
        },
        error: {
            main: colors.error[500],
            light: colors.error[400],
            dark: colors.error[600],
            contrastText: '#ffffff',
            ...colors.error,
        },
        warning: {
            main: colors.warning[500],
            light: colors.warning[400],
            dark: colors.warning[600],
            contrastText: '#ffffff',
            ...colors.warning,
        },
        success: {
            main: colors.success[500],
            light: colors.success[400],
            dark: colors.success[600],
            contrastText: '#ffffff',
            ...colors.success,
        },
        neutral: {
            main: colors.neutral[500],
            light: colors.neutral[400],
            dark: colors.neutral[600],
            contrastText: '#ffffff',
            ...colors.neutral,
        },
        background: {
            default: colors.neutral[50],
            paper: '#ffffff',
        },
        text: {
            primary: colors.neutral[900],
            secondary: colors.neutral[600],
            disabled: colors.neutral[400],
        },
    },
    typography: {
        fontFamily: 'var(--font-geist-sans)',
        h1: {
            fontWeight: 700,
            fontSize: '2.25rem',
            lineHeight: 1.2,
            letterSpacing: '-0.025em',
        },
        h2: {
            fontWeight: 600,
            fontSize: '1.875rem',
            lineHeight: 1.3,
            letterSpacing: '-0.025em',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.4,
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.4,
        },
        h5: {
            fontWeight: 500,
            fontSize: '1.125rem',
            lineHeight: 1.4,
        },
        h6: {
            fontWeight: 500,
            fontSize: '1rem',
            lineHeight: 1.5,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.5,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.4,
        },
        caption: {
            fontSize: '0.75rem',
            lineHeight: 1.4,
            color: colors.neutral[500],
        },
    },
    spacing: 8,
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                '*': {
                    boxSizing: 'border-box',
                },
                html: {
                    MozOsxFontSmoothing: 'grayscale',
                    WebkitFontSmoothing: 'antialiased',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100%',
                    width: '100%',
                },
                body: {
                    display: 'flex',
                    flex: '1 1 auto',
                    flexDirection: 'column',
                    minHeight: '100%',
                    width: '100%',
                },
                '#root': {
                    display: 'flex',
                    flex: '1 1 auto',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    paddingTop: 8,
                    paddingBottom: 8,
                    paddingLeft: 16,
                    paddingRight: 16,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                    '&:focus': {
                        boxShadow: `0 0 0 2px ${colors.primary[600]}40`,
                    },
                },
                containedPrimary: {
                    backgroundColor: colors.primary[600],
                    color: '#ffffff',
                    '&:hover': {
                        backgroundColor: colors.primary[700],
                    },
                    '&:active': {
                        backgroundColor: colors.primary[800],
                    },
                },
                containedSecondary: {
                    backgroundColor: colors.secondary[600],
                    color: '#ffffff',
                    '&:hover': {
                        backgroundColor: colors.secondary[700],
                    },
                    '&:active': {
                        backgroundColor: colors.secondary[800],
                    },
                },
                outlinedPrimary: {
                    borderColor: colors.primary[300],
                    color: colors.primary[600],
                    '&:hover': {
                        borderColor: colors.primary[400],
                        backgroundColor: colors.primary[50],
                    },
                },
                textPrimary: {
                    color: colors.primary[600],
                    '&:hover': {
                        backgroundColor: colors.primary[50],
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                    borderRadius: 12,
                    border: `1px solid ${colors.neutral[200]}`,
                    transition: 'box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                        borderColor: colors.neutral[300],
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.primary[600],
                            borderWidth: 2,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.neutral[400],
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: colors.neutral[600],
                        '&.Mui-focused': {
                            color: colors.primary[600],
                        },
                    },
                    '& .MuiFormHelperText-root': {
                        marginLeft: 0,
                        marginTop: 4,
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: colors.neutral[900],
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    height: 24,
                },
                filledDefault: {
                    backgroundColor: colors.neutral[100],
                    color: colors.neutral[800],
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${colors.neutral[200]}`,
                },
                head: {
                    backgroundColor: colors.neutral[50],
                    color: colors.neutral[700],
                    fontWeight: 600,
                    fontSize: '0.875rem',
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${colors.neutral[200]}`,
                },
                indicator: {
                    backgroundColor: colors.primary[600],
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    color: colors.neutral[500],
                    '&.Mui-selected': {
                        color: colors.primary[600],
                    },
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
                standardError: {
                    backgroundColor: colors.error[50],
                    color: colors.error[800],
                    '& .MuiAlert-icon': {
                        color: colors.error[600],
                    },
                },
                standardWarning: {
                    backgroundColor: colors.warning[50],
                    color: colors.warning[800],
                    '& .MuiAlert-icon': {
                        color: colors.warning[600],
                    },
                },
                standardSuccess: {
                    backgroundColor: colors.success[50],
                    color: colors.success[800],
                    '& .MuiAlert-icon': {
                        color: colors.success[600],
                    },
                },
                standardInfo: {
                    backgroundColor: colors.primary[50],
                    color: colors.primary[800],
                    '& .MuiAlert-icon': {
                        color: colors.primary[600],
                    },
                },
            },
        },
    },
});

export default theme;
