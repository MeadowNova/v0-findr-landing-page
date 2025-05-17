/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // We'll keep this for now but should be removed in a future task
    ignoreDuringBuilds: true,
  },
  // Removed ignoreBuildErrors to enable TypeScript checks
  images: {
    unoptimized: true,
  },
}

export default nextConfig