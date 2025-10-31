import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Shield, Zap } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  return (
    <>
      <SEOHead 
        title="نظام الدفع الآمن - روابط دفع ذكية للشاليهات والشحن"
        description="أنشئ روابط دفع آمنة ومحمية للشاليهات وخدمات الشحن في دول الخليج. دعم جميع شركات الشحن الكبرى مثل أرامكس، دي إتش إل، فيديكس، سمسا والمزيد"
        image="/og-aramex.jpg"
        type="website"
      />
      <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Hero Section - Minimized */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5" />
        
        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border rounded-full px-3 py-1 mb-4 animate-fade-in">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-xs text-muted-foreground">منصة موحدة لدول الخليج</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
              منصة الشحن الذكية
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground mb-2 animate-fade-in">
              حلول شحن متطورة وموثوقة
            </p>
            
            <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto animate-fade-in">
              نقدم خدمات شحن سريعة وآمنة مع دعم جميع شركات الشحن الكبرى في المنطقة
            </p>
            
            <div className="flex justify-center animate-fade-in">
              <Link to="/services">
                <Button size="default" className="px-6">
                  <span className="ml-2">ابدأ الآن</span>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Minimized */}
      <section className="py-10 relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="text-center p-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-base font-bold mb-1">سريع وآمن</h3>
              <p className="text-xs text-muted-foreground">
                معاملات فورية مع أعلى معايير الأمان
              </p>
            </div>

            <div className="text-center p-3">
              <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold mb-1">موثوق ومعتمد</h3>
              <p className="text-xs text-muted-foreground">
                جميع الخدمات معتمدة ومطابقة للمعايير المحلية
              </p>
            </div>

            <div className="text-center p-3">
              <div className="w-12 h-12 bg-gradient-card rounded-xl flex items-center justify-center mx-auto mb-2 border border-border">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-bold mb-1">سهل الاستخدام</h3>
              <p className="text-xs text-muted-foreground">
                واجهة بسيطة وسهلة تدعم جميع دول الخليج
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimized */}
      <section className="py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              جاهز للبدء؟
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              انضم إلى آلاف المستخدمين الذين يثقون بمنصتنا
            </p>
            <Link to="/services">
              <Button size="default" className="px-6">
                <span className="ml-2">استكشف الخدمات</span>
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Index;
