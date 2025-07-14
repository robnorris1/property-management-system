import React from 'react';
import {
    Tabs,
    Tab,
    Box,
    Badge
} from '@mui/material';
import {
    Dashboard,
    Business,
    Build,
    ReportProblem
} from '@mui/icons-material';

interface NavigationProps {
    value: string;
    onChange: (value: string) => void;
    badges?: {
        [key: string]: number;
    };
}

export const Navigation: React.FC<NavigationProps> = ({
                                                          value,
                                                          onChange,
                                                          badges = {}
                                                      }) => {
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        onChange(newValue);
    };

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
                value={value}
                onChange={handleChange}
                sx={{ px: 3 }}
            >
                <Tab
                    label="Dashboard"
                    value="dashboard"
                    icon={<Dashboard />}
                    iconPosition="start"
                />
                <Tab
                    label={
                        badges.properties ? (
                            <Badge badgeContent={badges.properties} color="primary">
                                Properties
                            </Badge>
                        ) : 'Properties'
                    }
                    value="properties"
                    icon={<Business />}
                    iconPosition="start"
                />
                <Tab
                    label="Maintenance"
                    value="maintenance"
                    icon={<Build />}
                    iconPosition="start"
                />
                <Tab
                    label={
                        badges.issues ? (
                            <Badge badgeContent={badges.issues} color="error">
                                Issues
                            </Badge>
                        ) : 'Issues'
                    }
                    value="issues"
                    icon={<ReportProblem />}
                    iconPosition="start"
                />
            </Tabs>
        </Box>
    );
};
