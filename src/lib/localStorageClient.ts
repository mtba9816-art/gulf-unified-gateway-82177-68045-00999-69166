// Local Storage Client - بديل لـ Supabase يعمل بدون API خارجي
// جميع البيانات تُحفظ في localStorage في متصفح المستخدم

const STORAGE_KEYS = {
  LINKS: 'gulf_platform_links',
  PAYMENTS: 'gulf_platform_payments',
  CHALETS: 'gulf_platform_chalets',
  CARRIERS: 'gulf_platform_carriers',
};

// Helper functions
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    // Silent fail
  }
};

// Links
export const getAllLinks = () => {
  return getFromStorage(STORAGE_KEYS.LINKS);
};

export const getLinkById = (id: string) => {
  const links = getAllLinks();
  return links.find((link: any) => link.id === id);
};

export const createLink = (linkData: any) => {
  const links = getAllLinks();
  const newLink = {
    ...linkData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  links.push(newLink);
  saveToStorage(STORAGE_KEYS.LINKS, links);
  return newLink;
};

export const updateLink = (id: string, updates: any) => {
  const links = getAllLinks();
  const index = links.findIndex((link: any) => link.id === id);
  if (index !== -1) {
    links[index] = {
      ...links[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.LINKS, links);
    return links[index];
  }
  return null;
};

export const deleteLink = (id: string) => {
  const links = getAllLinks();
  const filtered = links.filter((link: any) => link.id !== id);
  saveToStorage(STORAGE_KEYS.LINKS, filtered);
  return true;
};

// Payments
export const getAllPayments = () => {
  return getFromStorage(STORAGE_KEYS.PAYMENTS);
};

export const getPaymentById = (id: string) => {
  const payments = getAllPayments();
  return payments.find((payment: any) => payment.id === id);
};

export const createPayment = (paymentData: any) => {
  const payments = getAllPayments();
  const newPayment = {
    ...paymentData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  payments.push(newPayment);
  saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
  return newPayment;
};

export const updatePayment = (id: string, updates: any) => {
  const payments = getAllPayments();
  const index = payments.findIndex((payment: any) => payment.id === id);
  if (index !== -1) {
    payments[index] = {
      ...payments[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
    return payments[index];
  }
  return null;
};

// Chalets (from static data)
export const getChaletsByCountry = (countryCode?: string) => {
  const chalets = [
    {
      id: 'ae-001',
      name: 'Nakheel Beach Chalet',
      country_code: 'AE',
      city: 'Dubai',
      address: 'Jumeirah Beach',
      default_price: 350,
      images: ['/placeholder.svg'],
      provider_id: 'prov-101',
      verified: true,
      amenities: ['WiFi', 'Beach Access', 'BBQ Area', 'Pool'],
      capacity: 8,
    },
    {
      id: 'ae-002',
      name: 'Dubai Marina View',
      country_code: 'AE',
      city: 'Dubai',
      address: 'Dubai Marina',
      default_price: 450,
      images: ['/placeholder.svg'],
      provider_id: 'prov-101',
      verified: true,
      amenities: ['WiFi', 'City View', 'Pool', 'Gym'],
      capacity: 6,
    },
    {
      id: 'sa-001',
      name: 'Riyadh Desert Chalet',
      country_code: 'SA',
      city: 'Riyadh',
      address: 'AlUla',
      default_price: 450,
      images: ['/placeholder.svg'],
      provider_id: 'prov-201',
      verified: false,
      amenities: ['WiFi', 'Desert View', 'Campfire Area'],
      capacity: 10,
    },
    {
      id: 'sa-002',
      name: 'Jeddah Seaside Retreat',
      country_code: 'SA',
      city: 'Jeddah',
      address: 'North Obhur',
      default_price: 400,
      images: ['/placeholder.svg'],
      provider_id: 'prov-201',
      verified: true,
      amenities: ['Beach Access', 'Pool', 'BBQ Area', 'WiFi'],
      capacity: 12,
    },
    {
      id: 'kw-001',
      name: 'Kuwait Sea Chalet',
      country_code: 'KW',
      city: 'Kuwait City',
      address: 'Salmiya',
      default_price: 300,
      images: ['/placeholder.svg'],
      provider_id: 'prov-301',
      verified: true,
      amenities: ['Sea View', 'WiFi', 'Pool'],
      capacity: 8,
    },
    {
      id: 'qa-001',
      name: 'Doha Dunes Chalet',
      country_code: 'QA',
      city: 'Doha',
      address: 'The Pearl',
      default_price: 400,
      images: ['/placeholder.svg'],
      provider_id: 'prov-401',
      verified: true,
      amenities: ['WiFi', 'Pool', 'Beach Access', 'Restaurant'],
      capacity: 10,
    },
    {
      id: 'om-001',
      name: 'Muscat View Chalet',
      country_code: 'OM',
      city: 'Muscat',
      address: 'Qurum',
      default_price: 280,
      images: ['/placeholder.svg'],
      provider_id: 'prov-501',
      verified: false,
      amenities: ['Mountain View', 'WiFi', 'BBQ Area'],
      capacity: 6,
    },
    {
      id: 'bh-001',
      name: 'Bahrain Bay Chalet',
      country_code: 'BH',
      city: 'Manama',
      address: 'Seef',
      default_price: 320,
      images: ['/placeholder.svg'],
      provider_id: 'prov-601',
      verified: true,
      amenities: ['Bay View', 'WiFi', 'Pool', 'Gym'],
      capacity: 8,
    },
  ];

  if (countryCode) {
    return chalets.filter((c) => c.country_code === countryCode);
  }
  return chalets;
};

// Shipping Carriers (from static data)
export const getCarriersByCountry = (countryCode?: string) => {
  const carriers = [
    {
      id: 'car-aramex',
      name: 'Aramex',
      country_code: 'AE',
      services: ['standard', 'express', 'cod'],
      contact: '+971-4-XXXXXXX',
      website: 'https://www.aramex.com',
      logo_path: '/placeholder.svg',
    },
    {
      id: 'car-fedex-ae',
      name: 'FedEx',
      country_code: 'AE',
      services: ['express', 'standard'],
      contact: '+971-4-XXXXXXX',
      website: 'https://www.fedex.com',
      logo_path: '/placeholder.svg',
    },
    {
      id: 'car-ups-ae',
      name: 'UPS',
      country_code: 'AE',
      services: ['express', 'standard'],
      contact: '+971-4-XXXXXXX',
      website: 'https://www.ups.com',
      logo_path: '/placeholder.svg',
    },
    {
      id: 'car-dhl-sa',
      name: 'DHL',
      country_code: 'SA',
      services: ['express', 'standard'],
      contact: '+966-11-XXXXXXX',
      website: 'https://www.dhl.com',
      logo_path: '/placeholder.svg',
    },
    {
      id: 'car-smsa',
      name: 'SMSA',
      country_code: 'SA',
      services: ['standard', 'express', 'cod'],
      contact: '+966-11-XXXXXXX',
      website: 'https://www.smsaexpress.com',
      logo_path: '/placeholder.svg',
    },
    {
      id: 'car-zajil',
      name: 'Zajil',
      country_code: 'SA',
      services: ['standard', 'express'],
      contact: '+966-XX-XXXXXXX',
      website: 'https://www.zajil.com',
      logo_path: '/placeholder.svg',
    },
    {
      id: 'car-naqel',
      name: 'Naqel',
      country_code: 'SA',
      services: ['standard', 'express', 'cod'],
      contact: '+966-XX-XXXXXXX',
      website: 'https://www.naqel.com',
      logo_path: '/placeholder.svg',
    },
  ];

  if (countryCode) {
    return carriers.filter((c) => c.country_code === countryCode);
  }
  return carriers;
};

// Initialize with seed data if empty
export const initializeStorage = () => {
  const links = getAllLinks();
  if (links.length === 0) {
    // Initializing localStorage with seed data
  }
};

// Clear all data (for testing)
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.LINKS);
  localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
};
