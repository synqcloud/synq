/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://www.trysynq.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/private/', '/admin/'],
      },
    ],
  },
  exclude: [
    '/private/*', 
    '/admin/*',
    '/manifest.json',
    '/icon0.svg',
    '/icon1.png',
    '/apple-icon.png',
    '/favicon.ico'
  ],
  generateIndexSitemap: true,
  changefreq: 'weekly',
  priority: 0.7,
  transform: async (config, path) => {
    // Customize priority based on path
    let priority = config.priority;
    
    // Set higher priority for main pages
    if (path === '/') {
      priority = 1.0;
    } else if (path === '/terms' || path === '/privacy') {
      priority = 0.8;
    }
    
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priority,
      lastmod: new Date().toISOString(),
    };
  },
  // SEO optimization for TCG sellers and card shops
  additionalPaths: async (config) => {
    return [];
  },
} 