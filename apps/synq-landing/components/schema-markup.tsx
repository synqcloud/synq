export function SchemaMarkup() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.trysynq.com/#organization",
        name: "Synq",
        url: "https://www.trysynq.com",
        logo: {
          "@type": "ImageObject",
          url: "https://www.trysynq.com/brand/synq-icon.png",
          width: 32,
          height: 32,
        },
        description:
          "Professional inventory management software built specifically for card shops, TCG sellers, and collectibles businesses",
        foundingDate: "2024",
        sameAs: ["https://github.com/synqcloud/synq"],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: "iamtelmo@proton.me",
          availableLanguage: "English",
          areaServed: "Worldwide",
        },
        address: {
          "@type": "PostalAddress",
          addressCountry: "US",
        },
        knowsAbout: [
          "Trading Card Games",
          "Inventory Management",
          "Card Shop Operations",
          "TCG Business Management",
          "Collectibles Retail",
          "Pokemon Cards",
          "Magic The Gathering",
          "Yu-Gi-Oh",
          "Card Grading",
          "Marketplace Integration",
        ],
        slogan: "Inventory software built for card shops and sellers",
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://www.trysynq.com/#software",
        name: "Synq",
        alternateName: "Synq Inventory Management",
        description:
          "Professional inventory management software built specifically for card shops, TCG sellers, and collectibles businesses. Track inventory, manage sales, monitor profits with comprehensive analytics.",
        url: "https://www.trysynq.com",
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Inventory Management Software",
        operatingSystem: "Web",
        softwareVersion: "1.0.0",
        datePublished: "2024-01-01",
        releaseNotes: "Initial release focused on TCG inventory management",
        downloadUrl: "https://www.trysynq.com",
        installUrl: "https://www.trysynq.com",
        softwareRequirements: "Web browser",
        memoryRequirements: "Minimal - cloud-based solution",
        storageRequirements: "No local storage required",
        processorRequirements: "Any modern processor",
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          description:
            "Professional inventory management software for card shops and TCG sellers",
          priceValidUntil: "2025-12-31",
          businessFunction: "https://schema.org/Sell",
        },
        featureList: [
          "Real-time inventory tracking for trading cards",
          "Comprehensive transaction management and history",
          "Access to extensive TCG databases and card data",
          "Precise card condition tracking (Near Mint to Heavily Played)",
          "Advanced profit and loss analysis with fee calculations",
          "Multi-marketplace integration (TCGPlayer, Cardmarket)",
          "Physical location and storage tracking",
          "Grading submissions tracking and management",
          "Damage and loss incident tracking",
          "Returns and refunds management system",
          "Custom card libraries and product groups",
          "Automated price monitoring and alerts",
          "Business analytics and reporting dashboards",
        ],
        screenshot: [
          {
            "@type": "ImageObject",
            url: "https://www.trysynq.com/brand/synq-inventory.png",
            caption:
              "Inventory Management Dashboard - Track card inventory with precision and real-time updates",
            width: 1200,
            height: 800,
          },
          {
            "@type": "ImageObject",
            url: "https://www.trysynq.com/brand/synq-transactions.png",
            caption:
              "Transactions Dashboard - Monitor all buying and selling activities with detailed analytics",
            width: 1200,
            height: 800,
          },
          {
            "@type": "ImageObject",
            url: "https://www.trysynq.com/brand/synq-library.png",
            caption:
              "Card Library Dashboard - Access comprehensive TCG databases and manage custom collections",
            width: 1200,
            height: 800,
          },
        ],
        author: {
          "@id": "https://www.trysynq.com/#organization",
        },
        publisher: {
          "@id": "https://www.trysynq.com/#organization",
        },
        creator: {
          "@id": "https://www.trysynq.com/#organization",
        },
        audience: [
          {
            "@type": "Audience",
            audienceType: "Card shop owners and managers",
            geographicArea: "Worldwide",
          },
          {
            "@type": "Audience",
            audienceType: "TCG sellers and dealers",
            geographicArea: "Worldwide",
          },
          {
            "@type": "Audience",
            audienceType: "Local game store operators",
            geographicArea: "Worldwide",
          },
          {
            "@type": "Audience",
            audienceType: "Collectibles business owners",
            geographicArea: "Worldwide",
          },
        ],
        keywords: [
          "TCG inventory management software",
          "card shop inventory system",
          "trading card game business software",
          "Pokemon card inventory tracking",
          "Magic The Gathering inventory management",
          "Yu-Gi-Oh inventory software",
          "collectibles inventory management",
          "card shop POS integration",
          "TCGPlayer inventory sync",
          "Cardmarket inventory management",
          "card condition tracking software",
          "grading submission tracker",
          "card shop analytics",
          "local game store software",
        ],
        isAccessibleForFree: false,
        usageInfo:
          "Professional inventory management for card shops and TCG sellers",
      },
      {
        "@type": "WebSite",
        "@id": "https://www.trysynq.com/#website",
        url: "https://www.trysynq.com",
        name: "Synq - Professional Inventory Software for Card Shops",
        alternateName: "Synq Inventory Management",
        description:
          "Professional inventory management software built specifically for card shops, TCG sellers, and collectibles businesses",
        publisher: {
          "@id": "https://www.trysynq.com/#organization",
        },
        potentialAction: [
          {
            "@type": "SearchAction",
            target: "https://www.trysynq.com/?search={search_term_string}",
            "query-input": "required name=search_term_string",
          },
          {
            "@type": "SubscribeAction",
            target: "https://www.trysynq.com/#contact",
            object: {
              "@type": "Service",
              name: "Synq Updates",
            },
          },
        ],
        inLanguage: "en-US",
        copyrightYear: "2024",
        copyrightHolder: {
          "@id": "https://www.trysynq.com/#organization",
        },
      },
      {
        "@type": "WebPage",
        "@id": "https://www.trysynq.com/#webpage",
        url: "https://www.trysynq.com",
        name: "Synq - Inventory Software Built for Card Shops and TCG Sellers",
        headline: "Professional Inventory Management for Card Shops",
        description:
          "Professional inventory management software built specifically for card shops, TCG sellers, and collectibles businesses. Track inventory, manage sales, and grow your business with comprehensive analytics.",
        isPartOf: {
          "@id": "https://www.trysynq.com/#website",
        },
        about: {
          "@id": "https://www.trysynq.com/#software",
        },
        mainEntity: {
          "@id": "https://www.trysynq.com/#software",
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: "https://www.trysynq.com/brand/synq-eyecatcher-art.png",
          caption: "Synq - Inventory management software for card shops",
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://www.trysynq.com",
            },
          ],
        },
        datePublished: "2024-01-01",
        dateModified: new Date().toISOString().split("T")[0],
        inLanguage: "en-US",
        isAccessibleForFree: true,
        audience: {
          "@type": "Audience",
          audienceType: "Card shop owners, TCG sellers, collectibles dealers",
        },
      },
      {
        "@type": "ContactPage",
        "@id": "https://www.trysynq.com/#contact",
        url: "https://www.trysynq.com#contact",
        name: "Contact Synq - Get Started with Professional Card Shop Software",
        headline: "Contact Synq",
        description:
          "Get in touch to learn more about Synq inventory management software for card shops and TCG sellers",
        mainEntity: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: "iamtelmo@proton.me",
          availableLanguage: "English",
          areaServed: "Worldwide",
          hoursAvailable: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "17:00",
          },
        },
        isPartOf: {
          "@id": "https://www.trysynq.com/#website",
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://www.trysynq.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Contact",
              item: "https://www.trysynq.com#contact",
            },
          ],
        },
      },
      {
        "@type": "AboutPage",
        "@id": "https://www.trysynq.com/#about-us",
        url: "https://www.trysynq.com#about-us",
        name: "About Synq - Built by Card Shop Owners for Card Shop Owners",
        headline: "About Synq",
        description:
          "Learn about Synq - inventory management software built specifically for card shops with direct input from store owners and sellers",
        mainEntity: {
          "@id": "https://www.trysynq.com/#organization",
        },
        isPartOf: {
          "@id": "https://www.trysynq.com/#website",
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://www.trysynq.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "About",
              item: "https://www.trysynq.com#about-us",
            },
          ],
        },
      },
      {
        "@type": "WebPage",
        "@id": "https://www.trysynq.com/privacy#webpage",
        url: "https://www.trysynq.com/privacy",
        name: "Privacy Policy - Synq",
        description: "Privacy policy for Synq inventory management software",
        isPartOf: {
          "@id": "https://www.trysynq.com/#website",
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://www.trysynq.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Privacy Policy",
              item: "https://www.trysynq.com/privacy",
            },
          ],
        },
      },
      {
        "@type": "WebPage",
        "@id": "https://www.trysynq.com/terms#webpage",
        url: "https://www.trysynq.com/terms",
        name: "Terms of Service - Synq",
        description: "Terms of service for Synq inventory management software",
        isPartOf: {
          "@id": "https://www.trysynq.com/#website",
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://www.trysynq.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Terms of Service",
              item: "https://www.trysynq.com/terms",
            },
          ],
        },
      },
      {
        "@type": "HowTo",
        "@id": "https://www.trysynq.com/#howto",
        name: "How to Get Started with Synq Inventory Management",
        description:
          "Step-by-step guide to getting started with Synq inventory management software for card shops",
        image: "https://www.trysynq.com/brand/synq-eyecatcher-dark.png",
        totalTime: "PT5M",
        estimatedCost: {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: "Contact for pricing",
        },
        supply: [
          {
            "@type": "HowToSupply",
            name: "Web browser",
          },
          {
            "@type": "HowToSupply",
            name: "Card inventory data",
          },
        ],
        tool: [
          {
            "@type": "HowToTool",
            name: "Computer or mobile device",
          },
        ],
        step: [
          {
            "@type": "HowToStep",
            name: "Contact Synq Team",
            text: "Fill out our contact form to learn more about Synq and discuss your card shop's specific needs.",
            url: "https://www.trysynq.com#contact",
            image: "https://www.trysynq.com/brand/synq-icon.png",
          },
          {
            "@type": "HowToStep",
            name: "Explore Core Features",
            text: "Learn about inventory management, transaction tracking, and TCG data access features designed for card shops.",
            url: "https://www.trysynq.com#features",
            image: "https://www.trysynq.com/brand/synq-inventory.png",
          },
          {
            "@type": "HowToStep",
            name: "Start Managing Your Inventory",
            text: "Begin using Synq to track your card inventory, manage sales, and grow your TCG business with professional tools.",
            image: "https://www.trysynq.com/brand/synq-transactions.png",
          },
        ],
        about: {
          "@id": "https://www.trysynq.com/#software",
        },
        isPartOf: {
          "@id": "https://www.trysynq.com/#website",
        },
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.trysynq.com/#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is Synq inventory management software?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Synq is professional inventory management software specifically designed for card shops, TCG sellers, and collectibles businesses. It helps track inventory, manage transactions, analyze sales data, and streamline operations for the trading card game market.",
            },
          },
          {
            "@type": "Question",
            name: "Who should use Synq inventory software?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Synq is designed for local game stores, card shop owners, online TCG sellers, part-time sellers, and anyone who sells trading card games or collectibles professionally.",
            },
          },
          {
            "@type": "Question",
            name: "What features does Synq offer for card shops?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Synq offers real-time inventory tracking, transaction management, comprehensive TCG data access, precise card condition tracking, profit analysis, and integration with major marketplaces like TCGPlayer and Cardmarket.",
            },
          },
          {
            "@type": "Question",
            name: "Is Synq open source inventory software?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Synq is open source software. You can self-host the platform on your own servers, giving you complete control over your inventory data and infrastructure.",
            },
          },
          {
            "@type": "Question",
            name: "How can I get started with Synq for my card shop?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Contact us through our website to learn more about how Synq can help your card shop or TCG business. We'll discuss your specific needs and help you get started.",
            },
          },
          {
            "@type": "Question",
            name: "What makes Synq different from other inventory management systems?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Synq is built specifically for card game businesses, with specialized features like card condition tracking, grading submissions management, and integration with TCG marketplaces that generic inventory systems don't offer.",
            },
          },
          {
            "@type": "Question",
            name: "How much does Synq inventory software cost?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Contact us to learn about pricing and availability for Synq inventory management software.",
            },
          },
          {
            "@type": "Question",
            name: "Does Synq work with Pokemon, Magic, and Yu-Gi-Oh cards?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Synq supports comprehensive inventory management for Pokemon, Magic: The Gathering, Yu-Gi-Oh, and other major trading card games with full database integration.",
            },
          },
          {
            "@type": "Question",
            name: "Can Synq integrate with TCGPlayer and Cardmarket?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, Synq offers multi-marketplace integration including TCGPlayer and Cardmarket for seamless inventory synchronization and sales management.",
            },
          },
          {
            "@type": "Question",
            name: "Does Synq track card conditions and grading?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Synq provides precise card condition tracking from Near Mint to Heavily Played, plus grading submission tracking and management for professional card grading services.",
            },
          },
        ],
        about: {
          "@id": "https://www.trysynq.com/#software",
        },
        isPartOf: {
          "@id": "https://www.trysynq.com/#website",
        },
      },
      {
        "@type": "Product",
        "@id": "https://www.trysynq.com/#product",
        name: "Synq Professional Inventory Management",
        description:
          "Complete inventory management solution for card shops, TCG sellers, and collectibles businesses",
        brand: {
          "@id": "https://www.trysynq.com/#organization",
        },
        manufacturer: {
          "@id": "https://www.trysynq.com/#organization",
        },
        category: "Business Software",
        productID: "synq-inventory-management",
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          seller: {
            "@id": "https://www.trysynq.com/#organization",
          },
          businessFunction: "https://schema.org/Sell",
        },
        audience: {
          "@type": "Audience",
          audienceType:
            "Card shop owners, TCG sellers, collectibles businesses",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
