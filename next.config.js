/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Skip TypeScript errors during build test (for prepush hook)
  ...(process.env.SKIP_TYPE_CHECK === 'true' && {
    typescript: {
      ignoreBuildErrors: true,
    },
  }),
}

module.exports = nextConfig
