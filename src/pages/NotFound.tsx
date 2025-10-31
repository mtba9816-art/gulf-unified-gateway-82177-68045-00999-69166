import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background" style={{ backgroundColor: 'hsl(220 15% 15%)' }} dir="rtl">
      <div className="text-center p-8">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="mb-4 text-5xl font-bold text-foreground">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">الصفحة غير موجودة</h2>
        <p className="mb-6 text-lg text-muted-foreground max-w-md mx-auto">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </p>
        <div className="bg-card p-4 rounded-lg mb-6 max-w-md mx-auto text-right">
          <p className="text-xs text-muted-foreground">المسار المطلوب:</p>
          <p className="text-sm font-mono text-foreground mt-2 break-all">{location.pathname}</p>
        </div>
        <Button 
          onClick={() => navigate('/services')}
          size="lg"
          className="bg-primary text-primary-foreground"
        >
          <Home className="w-5 h-5 ml-2" />
          العودة للصفحة الرئيسية
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
