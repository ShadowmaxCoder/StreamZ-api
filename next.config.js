/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['your-cdn.com'], // Add if using external images
    },
}

module.exports = nextConfig;
