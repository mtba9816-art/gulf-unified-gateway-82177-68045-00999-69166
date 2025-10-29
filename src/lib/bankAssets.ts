// Bank logos, images, and asset URLs
// These can be updated with actual bank logo URLs or local assets

export interface BankAssets {
  logo?: string; // URL or path to logo
  loginBackground?: string; // Background image for login page
  otpBackground?: string; // Background image for OTP page
  icon?: string; // Favicon or small icon
}

export const BANK_ASSETS: Record<string, BankAssets> = {
  // Saudi Arabia Banks
  alrajhi_bank: {
    logo: 'https://www.alrajhibank.com.sa/ar/images/logo.svg',
    loginBackground: undefined, // Usually white or light gray
    otpBackground: undefined,
  },
  alahli_bank: {
    logo: 'https://www.alahli.com/ar-sa/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  riyad_bank: {
    logo: 'https://www.riyadbank.com/ar-sa/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  samba_bank: {
    logo: 'https://www.samba.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  saudi_investment_bank: {
    logo: 'https://www.saib.com.sa/ar/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  arab_national_bank: {
    logo: 'https://www.anb.com.sa/ar/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  saudi_fransi_bank: {
    logo: 'https://www.alfransi.com.sa/ar/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  alinma_bank: {
    logo: 'https://www.alinma.com/ar/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  albilad_bank: {
    logo: 'https://www.bankalbilad.com/ar/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  aljazira_bank: {
    logo: 'https://www.bankaljazira.com/ar/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },

  // UAE Banks
  emirates_nbd: {
    logo: 'https://www.emiratesnbd.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  adcb: {
    logo: 'https://www.adcb.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  fab: {
    logo: 'https://www.bankfab.com/en-ae/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  dib: {
    logo: 'https://www.dib.ae/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  mashreq_bank: {
    logo: 'https://www.mashreqbank.com/en-uae/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  cbd: {
    logo: 'https://www.cbd.ae/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  rakbank: {
    logo: 'https://www.rakbank.ae/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  ajman_bank: {
    logo: 'https://www.ajmanbank.ae/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },

  // Kuwait Banks
  nbk: {
    logo: 'https://www.nbk.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  gulf_bank: {
    logo: 'https://www.gulfbank.com.kw/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  cbk: {
    logo: 'https://www.cbk.com.kw/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  burgan_bank: {
    logo: 'https://www.burgan.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  ahli_united_bank: {
    logo: 'https://www.ahliunited.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  kfh: {
    logo: 'https://www.kfh.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  boubyan_bank: {
    logo: 'https://www.boubyan.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },

  // Qatar Banks
  qnb: {
    logo: 'https://www.qnb.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  cbq: {
    logo: 'https://www.cbq.com.qa/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  doha_bank: {
    logo: 'https://www.dohabank.com.qa/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  qib: {
    logo: 'https://www.qib.com.qa/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  masraf_alrayan: {
    logo: 'https://www.alrayan.com.qa/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  ahlibank: {
    logo: 'https://www.ahlibank.com.qa/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },

  // Oman Banks
  bank_muscat: {
    logo: 'https://www.bankmuscat.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  national_bank_oman: {
    logo: 'https://www.nbo.co.om/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  bank_dhofar: {
    logo: 'https://www.bankdhofar.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  ahli_bank_oman: {
    logo: 'https://www.ahlibank.om/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  nizwa_bank: {
    logo: 'https://www.banknizwa.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  sohar_international: {
    logo: 'https://www.soharinternational.om/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },

  // Bahrain Banks
  nbb: {
    logo: 'https://www.nbbonline.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  bbk: {
    logo: 'https://www.bbkonline.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  ahli_united_bahrain: {
    logo: 'https://www.ahliunited.com.bh/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  bisb: {
    logo: 'https://www.bisb.com.bh/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  ithmaar_bank: {
    logo: 'https://www.ithmaarbank.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
  khaleeji_bank: {
    logo: 'https://www.khaleejibank.com/en/images/logo.svg',
    loginBackground: undefined,
    otpBackground: undefined,
  },
};

export const getBankAssets = (bankId: string): BankAssets | undefined => {
  return BANK_ASSETS[bankId];
};
