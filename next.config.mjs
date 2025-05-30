/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["airbnbnew.cybersoft.edu.vn"],
  },
  plugins: { "@tailwindcss/postcss": {} },
};

export default nextConfig;
