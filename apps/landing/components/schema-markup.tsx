export function SchemaMarkup() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://trysynq.com/#organization",
        "name": "Synq",
        "url": "https://trysynq.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://trysynq.com/brand/synq-icon.png",
          "width": 32,
          "height": 32
        },
        "description": "Inventory management software built specifically for trading card game sellers",
        "foundingDate": "2024",
        "sameAs": [
          "https://github.com/iamtelmo/synq-collectibles"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "iamtelmo@proton.me",
          "availableLanguage": "English"
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "US"
        },
        "knowsAbout": [
          "Trading Card Games",
          "Inventory Management",
          "Card Game Retail",
          "TCG Business Operations"
        ]
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://trysynq.com/#software",
        "name": "Synq",
        "description": "Inventory management software built specifically for trading card game sellers. Track inventory, manage transactions, and grow your TCG business.",
        "url": "https://trysynq.com",
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Inventory Management",
        "operatingSystem": "Web",
        "softwareVersion": "1.0.0",
        "datePublished": "2024-01-01",
        "offers": {
          "@type": "Offer",
          "availability": "https://schema.org/InStock",
          "description": "Inventory management software for card game stores"
        },
        "featureList": [
          "Real-time inventory tracking",
          "Transaction management",
          "TCG data access",
          "Card condition tracking",
          "Profit analysis",
          "Multi-marketplace integration",
          "Physical location tracking",
          "Grading submissions tracking",
          "Damage and loss tracking",
          "Returns and refunds management"
        ],
        "screenshot": [
          {
            "@type": "ImageObject",
            "url": "https://trysynq.com/brand/synq-inventory.png",
            "caption": "Inventory Management Dashboard - Track card inventory with precision",
            "width": 1200,
            "height": 800
          },
          {
            "@type": "ImageObject",
            "url": "https://trysynq.com/brand/synq-transactions.png",
            "caption": "Transactions Dashboard - Monitor buying and selling activities",
            "width": 1200,
            "height": 800
          },
          {
            "@type": "ImageObject",
            "url": "https://trysynq.com/brand/synq-library.png",
            "caption": "Library Dashboard - Access comprehensive TCG databases",
            "width": 1200,
            "height": 800
          }
        ],
        "author": {
          "@id": "https://trysynq.com/#organization"
        },
        "publisher": {
          "@id": "https://trysynq.com/#organization"
        },
        "audience": {
          "@type": "Audience",
          "audienceType": "Card game store owners, TCG sellers, local game stores"
        },
        "keywords": "TCG inventory management, trading card game software, card shop inventory, local game store software"
      },
      {
        "@type": "WebSite",
        "@id": "https://trysynq.com/#website",
        "url": "https://trysynq.com",
        "name": "Synq",
        "description": "Inventory management software for card game stores",
        "publisher": {
          "@id": "https://trysynq.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://trysynq.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "WebPage",
        "@id": "https://trysynq.com/#webpage",
        "url": "https://trysynq.com",
        "name": "Synq - Inventory Software Built for TCG Sellers",
        "description": "Inventory management software built specifically for trading card game sellers. Track inventory, manage transactions, and grow your TCG business.",
        "isPartOf": {
          "@id": "https://trysynq.com/#website"
        },
        "about": {
          "@id": "https://trysynq.com/#software"
        },
        "mainEntity": {
          "@id": "https://trysynq.com/#software"
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://trysynq.com"
            }
          ]
        },
        "datePublished": "2024-01-01",
        "dateModified": "2025-01-01",
        "inLanguage": "en-US",
        "isAccessibleForFree": true
      },
      {
        "@type": "ContactPage",
        "@id": "https://trysynq.com/#contact",
        "url": "https://trysynq.com#contact-form",
        "name": "Contact Synq",
        "description": "Get in touch to learn more about Synq inventory management software",
        "mainEntity": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "iamtelmo@proton.me",
          "availableLanguage": "English",
          "areaServed": "Worldwide"
        },
        "isPartOf": {
          "@id": "https://trysynq.com/#website"
        }
      },
      {
        "@type": "HowTo",
        "@id": "https://trysynq.com/#howto",
        "name": "How to Get Started with Synq",
        "description": "Learn how to get started with Synq inventory management software",
        "image": "https://trysynq.com/brand/synq-eyecatcher-art.png",
        "totalTime": "PT5M",
        "estimatedCost": {
          "@type": "MonetaryAmount",
          "currency": "USD",
          "value": "Contact for pricing"
        },
        "step": [
          {
            "@type": "HowToStep",
            "name": "Contact Us",
            "text": "Fill out our contact form to learn more about Synq.",
            "url": "https://trysynq.com#contact-form"
          },
          {
            "@type": "HowToStep",
            "name": "Learn About Features",
            "text": "Explore our core features including inventory management, transaction tracking, and TCG data access.",
            "url": "https://trysynq.com#showcase"
          },
          {
            "@type": "HowToStep",
            "name": "Get Started",
            "text": "Start using Synq to manage your card game inventory."
          }
        ],
        "about": {
          "@id": "https://trysynq.com/#software"
        },
        "isPartOf": {
          "@id": "https://trysynq.com/#website"
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://trysynq.com/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Synq?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Synq is inventory management software specifically designed for trading card game sellers and local game stores. It helps track inventory, manage transactions, and analyze sales data for the card game market."
            }
          },
          {
            "@type": "Question",
            "name": "Who is Synq for?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Synq is designed for local game stores, online sellers, part-time sellers, and anyone who sells trading card games."
            }
          },
          {
            "@type": "Question",
            "name": "What features does Synq offer?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Synq offers real-time inventory tracking, transaction management, TCG data access, card condition tracking, profit analysis, and integration with major marketplaces like TCGPlayer and Cardmarket."
            }
          },
          {
            "@type": "Question",
            "name": "Is Synq open source?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Synq is open source. You can self-host the platform on your own servers, giving you complete control over your data and infrastructure."
            }
          },
          {
            "@type": "Question",
            "name": "How can I get started with Synq?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Contact us through our website to learn more about how Synq can help your business."
            }
          },
          {
            "@type": "Question",
            "name": "What makes Synq different from other inventory systems?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Synq is built specifically for card game businesses, with features like card condition tracking, grading submissions, and integration with TCG marketplaces that generic inventory systems don't offer."
            }
          },
          {
            "@type": "Question",
            "name": "How much does Synq cost?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Contact us to learn about pricing and availability."
            }
          }
        ],
        "about": {
          "@id": "https://trysynq.com/#software"
        },
        "isPartOf": {
          "@id": "https://trysynq.com/#website"
        }
      },
      {
        "@type": "Product",
        "@id": "https://trysynq.com/#product",
        "name": "Synq Inventory Management",
        "description": "Complete inventory management solution for trading card game businesses",
        "brand": {
          "@id": "https://trysynq.com/#organization"
        },
        "manufacturer": {
          "@id": "https://trysynq.com/#organization"
        },
        "category": "Business Software",
        "offers": {
          "@type": "Offer",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@id": "https://trysynq.com/#organization"
          }
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
} 