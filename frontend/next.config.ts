import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'am-a.akamaihd.net',
        port: '',
        pathname: '/image/**',
      },
      {
        protocol: 'http',
        hostname: 'static.lolesports.com',
        port: '',
        pathname: '/teams/**',
      }
    ],
  },
};

export default nextConfig;
