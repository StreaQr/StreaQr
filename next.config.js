const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')

module.exports = withPWA({
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching,
  },
  images: {
    domains: ["www.menupix.com", "chameleonproduction.com", "clipground.com", 'res.cloudinary.com'],
  },
  reactStrictMode: true,
  swcMinify: true
})


