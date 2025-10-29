export interface BankDesign {
  // Colors - Exact hex codes from bank websites
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textSecondaryColor?: string;
  borderColor?: string;
  errorColor?: string;
  successColor?: string;
  
  // Typography - Exact font specifications
  fontFamily?: string;
  fontFamilyArabic?: string;
  fontWeight?: string;
  fontSize?: {
    h1?: string;
    h2?: string;
    h3?: string;
    body?: string;
    small?: string;
  };
  
  // Layout - Exact structure matching bank login pages
  layoutType: 'split' | 'centered' | 'full-width' | 'sidebar';
  containerMaxWidth?: string;
  cardStyle?: 'elevated' | 'flat' | 'outlined' | 'gradient';
  borderRadius?: string;
  padding?: {
    container?: string;
    card?: string;
    button?: string;
    input?: string;
  };
  
  // Components - Exact styling
  buttonStyle: 'gradient' | 'solid' | 'outline' | 'elevated';
  buttonRadius?: string;
  buttonFontSize?: string;
  buttonPadding?: string;
  inputStyle: 'modern' | 'classic' | 'minimal';
  inputRadius?: string;
  inputHeight?: string;
  inputPadding?: string;
  
  // Logo & Branding
  logo?: string;
  logoPosition?: 'top-left' | 'top-center' | 'top-right' | 'center';
  logoSize?: string;
  backgroundImage?: string;
  patternImage?: string;
  backgroundPattern?: 'solid' | 'gradient' | 'mesh' | 'dots' | 'lines';
  
  // Specific Design Elements - Matching exact bank pages
  headerStyle?: 'standard' | 'minimal' | 'prominent';
  showDecorativeElements?: boolean;
  showLogo?: boolean;
  showTagline?: boolean;
  tagline?: string;
  taglineAr?: string;
  
  // Spacing - Exact measurements
  spacing?: {
    small?: string;
    medium?: string;
    large?: string;
    xlarge?: string;
  };
  
  // Shadows & Effects
  shadow?: {
    card?: string;
    button?: string;
    input?: string;
  };
  
  // Custom CSS - For exact matching
  customCSS?: string;
}

export interface Bank {
  id: string;
  name: string;
  nameAr: string;
  logo?: string;
  color?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonStyle?: 'gradient' | 'solid' | 'outline';
  layoutStyle?: 'modern' | 'classic' | 'minimal';
  inputStyle?: 'rounded' | 'square' | 'rounded-lg';
  fontStyle?: 'normal' | 'bold';
  design?: BankDesign; // Complete design specification
}

export interface BanksByCountry {
  [countryCode: string]: Bank[];
}

export const BANKS_BY_COUNTRY: BanksByCountry = {
  SA: [
    {
      id: "alrajhi_bank",
      name: "Al Rajhi Bank",
      nameAr: "مصرف الراجحي",
      color: "#006C35",
      secondaryColor: "#00A650",
      backgroundColor: "#F5F5F5",
      textColor: "#333333",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "alahli_bank",
      name: "Al Ahli Bank",
      nameAr: "البنك الأهلي التجاري",
      color: "#00843D",
      secondaryColor: "#00A651",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'solid',
      layoutStyle: 'modern',
      inputStyle: 'rounded-lg',
      fontStyle: 'normal',
    },
    {
      id: "riyad_bank",
      name: "Riyad Bank",
      nameAr: "بنك الرياض",
      color: "#0066B2",
      secondaryColor: "#004B87",
      backgroundColor: "#F8F9FA",
      textColor: "#003366",
      buttonStyle: 'solid',
      layoutStyle: 'classic',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "samba_bank",
      name: "Samba Financial Group",
      nameAr: "مجموعة سامبا المالية",
      color: "#E31E24",
      secondaryColor: "#C8102E",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'solid',
      layoutStyle: 'modern',
      inputStyle: 'rounded-lg',
      fontStyle: 'bold',
    },
    {
      id: "saudi_investment_bank",
      name: "Saudi Investment Bank",
      nameAr: "البنك السعودي للاستثمار",
      color: "#004B87",
      secondaryColor: "#0066B2",
      backgroundColor: "#F5F7FA",
      textColor: "#003366",
      buttonStyle: 'solid',
      layoutStyle: 'classic',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "arab_national_bank",
      name: "Arab National Bank",
      nameAr: "البنك العربي الوطني",
      color: "#00A551",
      secondaryColor: "#00843D",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "saudi_fransi_bank",
      name: "Banque Saudi Fransi",
      nameAr: "البنك السعودي الفرنسي",
      color: "#ED1C24",
      secondaryColor: "#C8102E",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'solid',
      layoutStyle: 'classic',
      inputStyle: 'rounded-lg',
      fontStyle: 'normal',
    },
    {
      id: "alinma_bank",
      name: "Alinma Bank",
      nameAr: "بنك الإنماء",
      color: "#00A650",
      secondaryColor: "#00843D",
      backgroundColor: "#F5F5F5",
      textColor: "#333333",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "albilad_bank",
      name: "Bank AlBilad",
      nameAr: "بنك البلاد",
      color: "#1C4587",
      secondaryColor: "#004B87",
      backgroundColor: "#F8F9FA",
      textColor: "#003366",
      buttonStyle: 'solid',
      layoutStyle: 'classic',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "aljazira_bank",
      name: "Bank AlJazira",
      nameAr: "بنك الجزيرة",
      color: "#005EB8",
      secondaryColor: "#0066B2",
      backgroundColor: "#F5F7FA",
      textColor: "#003366",
      buttonStyle: 'solid',
      layoutStyle: 'modern',
      inputStyle: 'rounded-lg',
      fontStyle: 'normal',
    },
  ],
  AE: [
    {
      id: "emirates_nbd",
      name: "Emirates NBD",
      nameAr: "بنك الإمارات دبي الوطني",
      color: "#D50032",
      secondaryColor: "#C8102E",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'solid',
      layoutStyle: 'modern',
      inputStyle: 'rounded-lg',
      fontStyle: 'normal',
    },
    {
      id: "adcb",
      name: "Abu Dhabi Commercial Bank",
      nameAr: "بنك أبوظبي التجاري",
      color: "#004B87",
      secondaryColor: "#0066B2",
      backgroundColor: "#F5F7FA",
      textColor: "#003366",
      buttonStyle: 'solid',
      layoutStyle: 'classic',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "fab",
      name: "First Abu Dhabi Bank",
      nameAr: "بنك أبوظبي الأول",
      color: "#000000",
      secondaryColor: "#333333",
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      buttonStyle: 'solid',
      layoutStyle: 'minimal',
      inputStyle: 'rounded-lg',
      fontStyle: 'bold',
    },
    {
      id: "dib",
      name: "Dubai Islamic Bank",
      nameAr: "بنك دبي الإسلامي",
      color: "#00923F",
      secondaryColor: "#00A651",
      backgroundColor: "#F5F5F5",
      textColor: "#1A1A1A",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "mashreq_bank",
      name: "Mashreq Bank",
      nameAr: "بنك المشرق",
      color: "#E31E24",
      secondaryColor: "#C8102E",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'solid',
      layoutStyle: 'modern',
      inputStyle: 'rounded-lg',
      fontStyle: 'normal',
    },
    {
      id: "cbd",
      name: "Commercial Bank of Dubai",
      nameAr: "بنك دبي التجاري",
      color: "#004B87",
      secondaryColor: "#0066B2",
      backgroundColor: "#F8F9FA",
      textColor: "#003366",
      buttonStyle: 'solid',
      layoutStyle: 'classic',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "rakbank",
      name: "RAKBANK",
      nameAr: "بنك رأس الخيمة الوطني",
      color: "#E31E24",
      secondaryColor: "#C8102E",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'solid',
      layoutStyle: 'modern',
      inputStyle: 'rounded-lg',
      fontStyle: 'normal',
    },
    {
      id: "ajman_bank",
      name: "Ajman Bank",
      nameAr: "بنك عجمان",
      color: "#00A651",
      secondaryColor: "#00843D",
      backgroundColor: "#F5F5F5",
      textColor: "#333333",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
  ],
  KW: [
    {
      id: "nbk",
      name: "National Bank of Kuwait",
      nameAr: "بنك الكويت الوطني",
      color: "#005EB8",
      secondaryColor: "#004B87",
      backgroundColor: "#F5F7FA",
      textColor: "#003366",
      buttonStyle: 'solid',
      layoutStyle: 'classic',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "gulf_bank",
      name: "Gulf Bank",
      nameAr: "بنك الخليج",
      color: "#004B87",
      secondaryColor: "#0066B2",
      backgroundColor: "#F8F9FA",
      textColor: "#003366",
      buttonStyle: 'solid',
      layoutStyle: 'classic',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "cbk",
      name: "Commercial Bank of Kuwait",
      nameAr: "البنك التجاري الكويتي",
      color: "#00A651",
      secondaryColor: "#00843D",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "burgan_bank",
      name: "Burgan Bank",
      nameAr: "بنك برقان",
      color: "#E31E24",
      secondaryColor: "#C8102E",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'solid',
      layoutStyle: 'modern',
      inputStyle: 'rounded-lg',
      fontStyle: 'normal',
    },
    {
      id: "ahli_united_bank",
      name: "Ahli United Bank",
      nameAr: "الأهلي المتحد",
      color: "#00843D",
      secondaryColor: "#00A651",
      backgroundColor: "#F5F5F5",
      textColor: "#333333",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "kfh",
      name: "Kuwait Finance House",
      nameAr: "بيت التمويل الكويتي",
      color: "#00923F",
      secondaryColor: "#00A651",
      backgroundColor: "#F5F5F5",
      textColor: "#1A1A1A",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "boubyan_bank",
      name: "Boubyan Bank",
      nameAr: "بنك بوبيان",
      color: "#0066B2",
      secondaryColor: "#004B87",
      backgroundColor: "#F8F9FA",
      textColor: "#003366",
      buttonStyle: 'solid',
      layoutStyle: 'modern',
      inputStyle: 'rounded-lg',
      fontStyle: 'normal',
    },
  ],
  QA: [
    {
      id: "qnb",
      name: "Qatar National Bank",
      nameAr: "بنك قطر الوطني",
      color: "#6E1D3E",
      secondaryColor: "#8E1838",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'solid',
      layoutStyle: 'classic',
      inputStyle: 'rounded-lg',
      fontStyle: 'bold',
    },
    {
      id: "cbq",
      name: "Commercial Bank of Qatar",
      nameAr: "البنك التجاري القطري",
      color: "#004B87",
      secondaryColor: "#0066B2",
      backgroundColor: "#F5F7FA",
      textColor: "#003366",
      buttonStyle: 'solid',
      layoutStyle: 'classic',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "doha_bank",
      name: "Doha Bank",
      nameAr: "بنك الدوحة",
      color: "#E31E24",
      secondaryColor: "#C8102E",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'solid',
      layoutStyle: 'modern',
      inputStyle: 'rounded-lg',
      fontStyle: 'normal',
    },
    {
      id: "qib",
      name: "Qatar Islamic Bank",
      nameAr: "بنك قطر الإسلامي",
      color: "#00923F",
      secondaryColor: "#00A651",
      backgroundColor: "#F5F5F5",
      textColor: "#1A1A1A",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "masraf_alrayan",
      name: "Masraf Al Rayan",
      nameAr: "مصرف الريان",
      color: "#00A651",
      secondaryColor: "#00843D",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "ahlibank",
      name: "Ahlibank",
      nameAr: "الأهلي بنك",
      color: "#00843D",
      secondaryColor: "#00A651",
      backgroundColor: "#F5F5F5",
      textColor: "#333333",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
  ],
  OM: [
    {
      id: "bank_muscat",
      name: "Bank Muscat",
      nameAr: "بنك مسقط",
      color: "#004B87",
      secondaryColor: "#0066B2",
      backgroundColor: "#F8F9FA",
      textColor: "#003366",
      buttonStyle: 'solid',
      layoutStyle: 'classic',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "national_bank_oman",
      name: "National Bank of Oman",
      nameAr: "البنك الوطني العماني",
      color: "#00A651",
      secondaryColor: "#00843D",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "bank_dhofar",
      name: "Bank Dhofar",
      nameAr: "بنك ظفار",
      color: "#E31E24",
      secondaryColor: "#C8102E",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'solid',
      layoutStyle: 'modern',
      inputStyle: 'rounded-lg',
      fontStyle: 'normal',
    },
    {
      id: "ahli_bank_oman",
      name: "Ahli Bank",
      nameAr: "البنك الأهلي",
      color: "#00843D",
      secondaryColor: "#00A651",
      backgroundColor: "#F5F5F5",
      textColor: "#333333",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "nizwa_bank",
      name: "Bank Nizwa",
      nameAr: "بنك نزوى",
      color: "#00923F",
      secondaryColor: "#00A651",
      backgroundColor: "#F5F5F5",
      textColor: "#1A1A1A",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "sohar_international",
      name: "Sohar International Bank",
      nameAr: "بنك صحار الدولي",
      color: "#0066B2",
      secondaryColor: "#004B87",
      backgroundColor: "#F8F9FA",
      textColor: "#003366",
      buttonStyle: 'solid',
      layoutStyle: 'modern',
      inputStyle: 'rounded-lg',
      fontStyle: 'normal',
    },
  ],
  BH: [
    {
      id: "nbb",
      name: "National Bank of Bahrain",
      nameAr: "بنك البحرين الوطني",
      color: "#E31E24",
      secondaryColor: "#C8102E",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'solid',
      layoutStyle: 'modern',
      inputStyle: 'rounded-lg',
      fontStyle: 'normal',
    },
    {
      id: "bbk",
      name: "Bank of Bahrain and Kuwait",
      nameAr: "بنك البحرين والكويت",
      color: "#004B87",
      secondaryColor: "#0066B2",
      backgroundColor: "#F8F9FA",
      textColor: "#003366",
      buttonStyle: 'solid',
      layoutStyle: 'classic',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "ahli_united_bahrain",
      name: "Ahli United Bank",
      nameAr: "الأهلي المتحد",
      color: "#00843D",
      secondaryColor: "#00A651",
      backgroundColor: "#F5F5F5",
      textColor: "#333333",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "bisb",
      name: "Bahrain Islamic Bank",
      nameAr: "بنك البحرين الإسلامي",
      color: "#00923F",
      secondaryColor: "#00A651",
      backgroundColor: "#F5F5F5",
      textColor: "#1A1A1A",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "ithmaar_bank",
      name: "Ithmaar Bank",
      nameAr: "بنك إثمار",
      color: "#00A651",
      secondaryColor: "#00843D",
      backgroundColor: "#FFFFFF",
      textColor: "#1A1A1A",
      buttonStyle: 'gradient',
      layoutStyle: 'modern',
      inputStyle: 'rounded',
      fontStyle: 'normal',
    },
    {
      id: "khaleeji_bank",
      name: "Khaleeji Commercial Bank",
      nameAr: "بنك الخليج التجاري",
      color: "#0066B2",
      secondaryColor: "#004B87",
      backgroundColor: "#F8F9FA",
      textColor: "#003366",
      buttonStyle: 'solid',
      layoutStyle: 'modern',
      inputStyle: 'rounded-lg',
      fontStyle: 'normal',
    },
  ],
};

export const getBanksByCountry = (countryCode: string): Bank[] => {
  return BANKS_BY_COUNTRY[countryCode] || [];
};

export const getBankById = (bankId: string): Bank | undefined => {
  for (const banks of Object.values(BANKS_BY_COUNTRY)) {
    const bank = banks.find((b) => b.id === bankId);
    if (bank) return bank;
  }
  return undefined;
};

// API simulation function (can be replaced with actual API call)
export const fetchBanksByCountry = async (countryCode: string): Promise<Bank[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getBanksByCountry(countryCode);
};
