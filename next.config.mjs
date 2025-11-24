/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable dark mode (Tailwind CSS will handle the 'class' strategy)
  darkMode: 'class',

  // Allow images from these domains
  images: {
    domains: ['127.0.0.1', 'localhost'], // Add any backend or external host here
  },

  // React compiler for improved performance (optional)
  reactCompiler: true,
};

export default nextConfig;
