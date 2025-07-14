const nextConfig = {
    modularizeImports: {
        '@mui/icons-material': {
            transform: '@mui/icons-material/{{member}}',
        },
        '@mui/material': {
            transform: '@mui/material/{{member}}',
        },
    },
    experimental: {
        optimizePackageImports: ['@mui/material', '@mui/icons-material'],
    },
};

module.exports = nextConfig;
