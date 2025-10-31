export interface BankLoginTheme {
  primary: string;
  secondary: string;
  backgroundGradient: string;
  headerGradient: string;
  accentBackground: string;
  accentBorder: string;
  panelBackground: string;
  panelBorder: string;
  buttonGradient: string;
  buttonShadow: string;
  inputBackground: string;
  inputBorder: string;
  focusRing: string;
  badgeBackground: string;
  badgeText: string;
  subtleText: string;
  textOnPrimary: string;
  fontFamily?: string;
}

const clamp = (value: number) => Math.max(0, Math.min(255, value));

const normalizeHex = (hex: string) => {
  if (!hex) return "#0f172a";
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex.startsWith("#") ? hex : `#${hex}`;
};

const shadeColor = (hex: string, percent: number) => {
  const normalized = normalizeHex(hex);
  const amount = Math.round(2.55 * percent);
  const num = parseInt(normalized.slice(1), 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00ff) + amount);
  const b = clamp((num & 0x0000ff) + amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = normalizeHex(hex);
  const num = parseInt(normalized.slice(1), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const createTheme = (hex: string, overrides: Partial<BankLoginTheme> = {}): BankLoginTheme => {
  const base = normalizeHex(hex);
  const softer = shadeColor(base, 35);
  const deeper = shadeColor(base, -20);
  const secondary = shadeColor(base, -10);
  const subtleText = hexToRgba(base, 0.65);
  const accentBackground = hexToRgba(softer, 0.18);
  const accentBorder = hexToRgba(base, 0.25);
  const panelBorder = hexToRgba(base, 0.12);
  const inputBackground = hexToRgba(softer, 0.12);
  const inputBorder = hexToRgba(base, 0.4);
  const focusRing = hexToRgba(base, 0.4);
  const buttonShadow = `0 12px 30px ${hexToRgba(base, 0.28)}`;

  const defaultTheme: BankLoginTheme = {
    primary: base,
    secondary,
    backgroundGradient: `linear-gradient(135deg, ${shadeColor(base, 45)} 0%, ${shadeColor(base, -30)} 100%)`,
    headerGradient: `linear-gradient(135deg, ${base} 0%, ${deeper} 80%)`,
    accentBackground,
    accentBorder,
    panelBackground: "#ffffff",
    panelBorder,
    buttonGradient: `linear-gradient(135deg, ${base} 0%, ${deeper} 100%)`,
    buttonShadow,
    inputBackground,
    inputBorder,
    focusRing,
    badgeBackground: hexToRgba(base, 0.15),
    badgeText: base,
    subtleText,
    textOnPrimary: "#ffffff",
    fontFamily: "'Tajawal', sans-serif",
  };

  return {
    ...defaultTheme,
    ...overrides,
  };
};

const BANK_LOGIN_THEMES: Record<string, BankLoginTheme> = {
  // Saudi Arabia
  alrajhi_bank: createTheme("#006C35", {
    fontFamily: "'DIN Next LT Arabic', 'Tajawal', sans-serif",
    backgroundGradient: "linear-gradient(135deg, #0f3d2a 0%, #008b45 60%, #0f3d2a 100%)",
  }),
  alahli_bank: createTheme("#00843D"),
  riyad_bank: createTheme("#0066B2", {
    backgroundGradient: "linear-gradient(135deg, #0f172a 0%, #0a6dc2 65%, #051937 100%)",
  }),
  samba_bank: createTheme("#E31E24"),
  saudi_investment_bank: createTheme("#004B87"),
  arab_national_bank: createTheme("#00A551"),
  saudi_fransi_bank: createTheme("#0F6B73"),
  alinma_bank: createTheme("#00A650", {
    backgroundGradient: "linear-gradient(135deg, #052926 0%, #0ba66f 60%, #02110f 100%)",
  }),
  albilad_bank: createTheme("#1C4587"),
  aljazira_bank: createTheme("#005EB8"),

  // United Arab Emirates
  emirates_nbd: createTheme("#0B4EA2", {
    fontFamily: "'Neo Sans Arabic', 'Tajawal', sans-serif",
    headerGradient: "linear-gradient(135deg, #0b4ea2 0%, #082f6e 80%)",
  }),
  adcb: createTheme("#B11F3A"),
  fab: createTheme("#0033A1", {
    headerGradient: "linear-gradient(135deg, #0033a1 0%, #001a57 85%)",
  }),
  dib: createTheme("#00923F"),
  mashreq_bank: createTheme("#E04500", {
    backgroundGradient: "linear-gradient(135deg, #1f0d00 0%, #f27f16 70%, #3b1200 100%)",
  }),
  cbd: createTheme("#009674"),
  rakbank: createTheme("#E31E24"),
  ajman_bank: createTheme("#00A651"),

  // Kuwait
  nbk: createTheme("#005EB8"),
  gulf_bank: createTheme("#C8102E"),
  cbk: createTheme("#009A44"),
  burgan_bank: createTheme("#00447C"),
  ahli_united_bank: createTheme("#00843D"),
  kfh: createTheme("#00923F", {
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
  }),
  boubyan_bank: createTheme("#0066B2"),

  // Qatar
  qnb: createTheme("#6E1D3E", {
    backgroundGradient: "linear-gradient(135deg, #1e0b18 0%, #6e1d3e 60%, #12060d 100%)",
  }),
  cbq: createTheme("#AA1E3F"),
  doha_bank: createTheme("#00529B"),
  qib: createTheme("#007A3D"),
  masraf_alrayan: createTheme("#005E54"),
  ahlibank: createTheme("#00843D"),

  // Oman
  bank_muscat: createTheme("#ED1C24"),
  national_bank_oman: createTheme("#005A43"),
  bank_dhofar: createTheme("#007A3D"),
  ahli_bank_oman: createTheme("#00843D"),
  nizwa_bank: createTheme("#006778"),
  sohar_international: createTheme("#005EB8"),

  // Bahrain
  nbb: createTheme("#E31E24"),
  bbk: createTheme("#1B3F95"),
  ahli_united_bahrain: createTheme("#00843D"),
  bisb: createTheme("#00923F"),
  ithmaar_bank: createTheme("#005F5B"),
  khaleeji_bank: createTheme("#003c71"),
};

export const getBankLoginTheme = (bankId: string, fallbackColor = "#1d4ed8"): BankLoginTheme => {
  if (BANK_LOGIN_THEMES[bankId]) {
    return BANK_LOGIN_THEMES[bankId];
  }
  return createTheme(fallbackColor);
};
