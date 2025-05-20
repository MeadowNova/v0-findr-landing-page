/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // We'll keep this for now but should be removed in a future task
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Add this to ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add this to ensure compatibility with external packages
  transpilePackages: [
    '@chakra-ui/react',
    '@chakra-ui/icons',
    'lucide-react',
    'sonner',
    '@emotion/react',
    '@emotion/styled',
    'framer-motion'
  ],
}

export default nextConfig