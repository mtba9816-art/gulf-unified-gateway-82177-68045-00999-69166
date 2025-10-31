import { useState, useEffect } from "react";
import { Home, Package, FileText, Heart, Truck, Building2 } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import { Country, COUNTRIES } from "@/lib/countries";
import SEOHead from "@/components/SEOHead";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MobileSelect, MobileSelectItem } from "@/components/ui/mobile-select";

const Services = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  const services = [
    {
      title: "Chalet Booking",
      titleAr: "حجز الشاليهات",
      description: "احجز شاليه أحلامك بأسعار مخصصة",
      icon: Home,
      href: selectedCountry ? `/create/${selectedCountry.code}/chalet` : "#",
      gradient: "var(--gradient-primary)",
    },
    {
      title: "Shipping Services",
      titleAr: "خدمات الشحن",
      description: "شحن سريع وآمن مع شركات محلية معتمدة",
      icon: Package,
      href: selectedCountry ? `/create/${selectedCountry.code}/shipping` : "#",
      gradient: "var(--gradient-success)",
    },
    {
      title: "Invoices",
      titleAr: "الفواتير",
      description: "إنشاء وإدارة الفواتير بسهولة",
      icon: FileText,
      href: "#",
      gradient: "linear-gradient(135deg, hsl(210 95% 50%), hsl(220 90% 60%))",
    },
    {
      title: "Health Services",
      titleAr: "الخدمات الصحية",
      description: "خدمات طبية وصحية معتمدة",
      icon: Heart,
      href: "#",
      gradient: "linear-gradient(135deg, hsl(0 85% 55%), hsl(10 80% 60%))",
    },
    {
      title: "Logistics",
      titleAr: "الخدمات اللوجستية",
      description: "حلول لوجستية متكاملة",
      icon: Truck,
      href: "#",
      gradient: "linear-gradient(135deg, hsl(260 95% 55%), hsl(280 90% 60%))",
    },
    {
      title: "Contracts",
      titleAr: "العقود",
      description: "إدارة وتوثيق العقود الإلكترونية",
      icon: Building2,
      href: "#",
      gradient: "linear-gradient(135deg, hsl(40 95% 55%), hsl(30 90% 50%))",
    },
  ];

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    setSelectedCountry(country);
  };

  return (
    <>
      <SEOHead 
        title="خدمات الشحن في دول الخليج"
        description="اختر شركة الشحن المفضلة لديك من بين جميع شركات الشحن الكبرى في دول الخليج: أرامكس، دي إتش إل، فيديكس، يو بي إس، سمسا، زاجل، ناقل، والبريد الوطني"
        image="/og-aramex.jpg"
        type="website"
      />
      <div className="min-h-screen py-6 bg-background text-foreground" dir="rtl">
      <div className="container mx-auto px-4">
        {/* Header - Minimized */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            اختر خدمتك
          </h1>
          <p className="text-sm text-muted-foreground">
            ابدأ بتحديد الدولة، ثم اختر الخدمة المناسبة
          </p>
        </div>

        {/* Country Dropdown - Minimized */}
        <div className="mb-6">
          <div className="max-w-md mx-auto">
            <label className="block text-base font-semibold mb-2 text-center">
              اختر الدولة
            </label>
            {isMobile ? (
              <MobileSelect onValueChange={handleCountryChange} placeholder="اختر دولة..." className="w-full h-11 text-base">
                {COUNTRIES.map((country) => (
                  <MobileSelectItem key={country.code} value={country.code}>
                    {country.flag} {country.nameAr}
                  </MobileSelectItem>
                ))}
              </MobileSelect>
            ) : (
              <Select onValueChange={handleCountryChange}>
                <SelectTrigger className="w-full h-11 text-base bg-card/50 backdrop-blur-sm border-2 hover:border-primary transition-colors">
                  <SelectValue placeholder="اختر دولة..." />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem
                      key={country.code}
                      value={country.code}
                      className="text-base py-2 cursor-pointer hover:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{country.flag}</span>
                        <div className="text-right">
                          <div className="font-semibold text-sm">{country.nameAr}</div>
                          <div className="text-xs text-muted-foreground">
                            {country.name}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Services Grid - Minimized */}
        {selectedCountry ? (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold mb-4 text-center">
              الخدمات المتاحة في {selectedCountry.nameAr}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
              {services.map((service) => (
                <ServiceCard key={service.title} {...service} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <Package className="w-8 h-8 text-primary-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              الرجاء اختيار دولة لعرض الخدمات المتاحة
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Services;
