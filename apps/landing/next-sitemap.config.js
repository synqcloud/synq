/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://trysynq.com',
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
  exclude: ['/private/*', '/admin/*'],
  generateIndexSitemap: true,
  changefreq: 'weekly',
  priority: 0.7,
  transform: async (config, path) => {
    // Customize priority based on path
    let priority = config.priority;
    
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