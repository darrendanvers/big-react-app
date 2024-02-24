/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

// Add a reverse-proxy to the API server.
nextConfig.rewrites = async () => {
    return [
        {
            source: '/be/:path*',
            destination: 'http://localhost:5556/:path*',
        },
    ]
}