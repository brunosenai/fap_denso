/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public', // É aqui que o Service Worker será gerado
  disable: process.env.NODE_ENV === 'development', // Desativa o PWA no modo dev para não atrapalhar com caches antigos
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  // ... outras configurações do Next que você já tenha
};

module.exports = withPWA(nextConfig);
