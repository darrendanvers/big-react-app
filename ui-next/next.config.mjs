/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

nextConfig.output = "standalone";

nextConfig.experimental = {
    instrumentationHook: true
};