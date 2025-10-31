import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import * as localStorageClient from "@/lib/localStorageClient";

// Types from database
export interface Chalet {
  id: string;
  name: string;
  country_code: string;
  city: string;
  address: string;
  default_price: number;
  images: string[];
  provider_id: string | null;
  verified: boolean;
  amenities: string[];
  capacity: number;
}

export interface ShippingCarrier {
  id: string;
  name: string;
  country_code: string;
  services: string[];
  contact: string | null;
  website: string | null;
  logo_path: string | null;
}

export interface Link {
  id: string;
  type: string;
  country_code: string;
  provider_id: string | null;
  payload: any;
  microsite_url: string;
  payment_url: string;
  signature: string;
  status: string;
  created_at: string;
}

export interface Payment {
  id: string;
  link_id: string | null;
  amount: number;
  currency: string;
  status: string;
  otp: string | null;
  attempts: number;
  locked_until: string | null;
  receipt_url: string | null;
  cardholder_name: string | null;
  last_four: string | null;
  created_at: string;
}

// Fetch chalets by country
export const useChalets = (countryCode?: string) => {
  return useQuery({
    queryKey: ["chalets", countryCode],
    queryFn: async () => {
      const data = localStorageClient.getChaletsByCountry(countryCode);
      return data as Chalet[];
    },
    enabled: !!countryCode,
  });
};

// Fetch shipping carriers by country
export const useShippingCarriers = (countryCode?: string) => {
  return useQuery({
    queryKey: ["carriers", countryCode],
    queryFn: async () => {
      const data = localStorageClient.getCarriersByCountry(countryCode);
      return data as ShippingCarrier[];
    },
    enabled: !!countryCode,
  });
};

// Create link
export const useCreateLink = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (linkData: {
      type: string;
      country_code: string;
      provider_id?: string;
      payload: any;
    }) => {
      const linkId = crypto.randomUUID();
      const micrositeUrl = `${window.location.origin}/r/${linkData.country_code.toLowerCase()}/${linkData.type}/${linkId}`;
      const paymentUrl = `${window.location.origin}/pay/${linkId}`;
      
      // Simple signature (in production, use HMAC)
      // Use encodeURIComponent to handle Arabic and other Unicode characters
      const signature = btoa(encodeURIComponent(JSON.stringify(linkData.payload)));
      
      const newLink = {
        id: linkId,
        type: linkData.type,
        country_code: linkData.country_code,
        provider_id: linkData.provider_id,
        payload: linkData.payload,
        microsite_url: micrositeUrl,
        payment_url: paymentUrl,
        signature,
        status: "active",
      };
      
      const data = localStorageClient.createLink(newLink);
      return data as Link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast({
        title: "تم إنشاء الرابط",
        description: "تم إنشاء رابط الخدمة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الرابط",
        variant: "destructive",
      });
    },
  });
};

// Fetch link by ID
export const useLink = (linkId?: string) => {
  return useQuery({
    queryKey: ["link", linkId],
    queryFn: async () => {
      if (!linkId) {
        throw new Error("Link ID is required");
      }
      
      // Try to get from localStorage first
      let data = localStorageClient.getLinkById(linkId);
      
      // If not found in localStorage, try to get from URL params (for sharing)
      if (!data) {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('d');
        
        if (encodedData && encodedData.length > 0) {
          try {
            const decoded = JSON.parse(decodeURIComponent(atob(encodedData)));
            
            // Save to localStorage for future use
            data = localStorageClient.createLink({
              id: linkId,
              ...decoded
            });
          } catch (e) {
            // Silent fail
          }
        }
      }
      
      if (!data) {
        throw new Error("Link not found");
      }
      
      return data as Link;
    },
    enabled: !!linkId,
    retry: 1, // Only retry once
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

// Create payment
export const useCreatePayment = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (paymentData: {
      link_id: string;
      amount: number;
      currency: string;
    }) => {
      // Generate OTP (4 digits)
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      
      const newPayment = {
        id: crypto.randomUUID(),
        ...paymentData,
        otp,
        status: "pending",
        attempts: 0,
      };
      
      const data = localStorageClient.createPayment(newPayment);
      return data as Payment;
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الدفعة",
        variant: "destructive",
      });
    },
  });
};

// Fetch payment by ID
export const usePayment = (paymentId?: string) => {
  return useQuery({
    queryKey: ["payment", paymentId],
    queryFn: async () => {
      if (!paymentId) {
        throw new Error("Payment ID is required");
      }
      
      const data = localStorageClient.getPaymentById(paymentId);
      
      if (!data) {
        throw new Error("Payment not found");
      }
      
      return data as Payment;
    },
    enabled: !!paymentId,
    refetchInterval: 2000, // Refresh every 2 seconds for OTP status
  });
};

// Update payment (for OTP verification)
export const useUpdatePayment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      paymentId,
      updates,
    }: {
      paymentId: string;
      updates: Partial<Payment>;
    }) => {
      const data = localStorageClient.updatePayment(paymentId, updates);
      
      if (!data) {
        throw new Error("Payment not found");
      }
      
      return data as Payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث الدفعة",
        variant: "destructive",
      });
    },
  });
};
