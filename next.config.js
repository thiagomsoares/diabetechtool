/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    const nightscoutUrl = process.env.NEXT_PUBLIC_NIGHTSCOUT_API_URL;
    // Garantir que a URL começa com http:// ou https://
    const baseUrl = nightscoutUrl?.startsWith('http') 
      ? nightscoutUrl 
      : `https://${nightscoutUrl}`;

    return [
      {
        source: '/api/:path*',
        destination: `${baseUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, api-secret' },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 