/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.gravatar.com', // Apenas o Gravatar agora
      },
    ],
  },
};

export default nextConfig;
