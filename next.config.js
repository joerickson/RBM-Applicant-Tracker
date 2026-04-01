/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Allow /apply routes to be embedded via iframe from rbmservicesinc.com (Phase 9)
        source: '/apply/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://rbmservicesinc.com',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://rbmservicesinc.com https://www.rbmservicesinc.com",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
