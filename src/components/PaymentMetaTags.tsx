import { Helmet } from "react-helmet-async";
import { getServiceBranding } from "@/lib/serviceLogos";

interface PaymentMetaTagsProps {
  serviceName: string;
  serviceKey?: string;
  amount?: string;
  title?: string;
  description?: string;
}

const PaymentMetaTags = ({ serviceName, serviceKey, amount, title, description }: PaymentMetaTagsProps) => {
  const actualServiceKey = serviceKey || serviceName?.toLowerCase() || "aramex";
  const branding = getServiceBranding(actualServiceKey);

  const isBrowser = typeof window !== "undefined";
  const origin = isBrowser ? window.location.origin : "https://gulf-unified.app";
  const currentUrl = isBrowser ? window.location.href : `${origin}/pay`;

  const [arabicName] = (serviceName || "").split(" - ");
  const serviceDisplayName = (arabicName || serviceName || "حلول الشحن").trim();

  const defaultTitleSegment = amount ? `دفعة ${amount}` : "رابط الدفع والتتبع الآمن";
  const computedTitle = title || `${serviceDisplayName} | ${defaultTitleSegment}`;

  const baseDescription = branding.description || "حلول شحن موثوقة";
  const actionLine = amount
    ? `أكمل دفع ${serviceDisplayName} الآن (${amount}) وشاركه مع عميلك فوراً.`
    : `أكمل الدفع وتتبع شحنة ${serviceDisplayName} بخطوة واحدة.`;
  const computedDescription = description || `${serviceDisplayName} - ${baseDescription}. ${actionLine}`.trim();

  const imagePath = branding.ogImage || branding.heroImage || "/og-aramex.jpg";
  const ogImage = imagePath.startsWith("http") ? imagePath : `${origin}${imagePath}`;

  return (
    <Helmet>
      <title>{computedTitle}</title>
      <meta name="description" content={computedDescription} />
      <meta name="theme-color" content={branding.colors.primary} />

      {/* Canonical */}
      {isBrowser && <link rel="canonical" href={currentUrl} />}

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={computedTitle} />
      <meta property="og:description" content={computedDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={`${serviceDisplayName} | Gulf Unified`} />
      <meta property="og:locale" content="ar_AR" />
      {isBrowser && <meta property="og:url" content={currentUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={computedTitle} />
      <meta name="twitter:description" content={computedDescription} />
      <meta name="twitter:image" content={ogImage} />
      {isBrowser && <meta name="twitter:url" content={currentUrl} />}
    </Helmet>
  );
};

export default PaymentMetaTags;
