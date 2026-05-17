const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isProd ? '/java-wemo-bridge' : '',
  images: { unoptimized: true },
}

export default nextConfig
