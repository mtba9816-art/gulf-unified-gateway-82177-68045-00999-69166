import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CHALETS, SHIPPING_CARRIERS } from "@/lib/data";

// Types from former database schema
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

const LINKS_STORAGE_KEY = "gulf_unified_links";
const PAYMENTS_STORAGE_KEY = "gulf_unified_payments";
const memoryStore = new Map<string, unknown>();
const isBrowser = typeof window !== "undefined";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const readStore = <T>(key: string, fallback: T): T => {
  if (isBrowser) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return clone(fallback);
      }
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn(`Failed to read local storage key "${key}":`, error);
      return clone(fallback);
    }
  }

  if (memoryStore.has(key)) {
    return clone(memoryStore.get(key) as T);
  }

  return clone(fallback);
};

const writeStore = <T>(key: string, value: T) => {
  const data = clone(value);

  if (isBrowser) {
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
      return;
    } catch (error) {
      console.warn(`Failed to write local storage key "${key}":`, error);
    }
  }

  memoryStore.set(key, data);
};

const getLinks = (): Link[] => readStore<Link[]>(LINKS_STORAGE_KEY, []);
const setLinks = (links: Link[]) => writeStore(LINKS_STORAGE_KEY, links);

const getPayments = (): Payment[] => readStore<Payment[]>(PAYMENTS_STORAGE_KEY, []);
const setPayments = (payments: Payment[]) => writeStore(PAYMENTS_STORAGE_KEY, payments);

const ensureOrigin = () => (isBrowser ? window.location.origin : "https://app.local");

const encodeBase64 = (input: string) => {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window.btoa(unescape(encodeURIComponent(input)));
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input, "utf-8").toString("base64");
  }
  return "";
};

const generateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const mapChalet = (seed: (typeof CHALETS)[number]): Chalet => ({
  id: seed.id,
  name: seed.name,
  country_code: seed.countryCode,
  city: seed.city,
  address: seed.address,
  default_price: seed.defaultPrice,
  images: seed.images,
  provider_id: seed.providerId ?? null,
  verified: seed.verified,
  amenities: seed.amenities ?? [],
  capacity: seed.capacity ?? 0,
});

const mapCarrier = (seed: (typeof SHIPPING_CARRIERS)[number]): ShippingCarrier => ({
  id: seed.id,
  name: seed.name,
  country_code: seed.countryCode,
  services: seed.services,
  contact: seed.contact ?? null,
  website: seed.website ?? null,
  logo_path: seed.logoPath ?? null,
});

// Fetch chalets by country (local seed data)
export const useChalets = (countryCode?: string) => {
  return useQuery({
    queryKey: ["chalets", countryCode],
    queryFn: async () => {
      const filtered = CHALETS.filter((chalet) =>
        countryCode ? chalet.countryCode === countryCode : true
      ).map(mapChalet);
      return clone(filtered);
    },
    enabled: !!countryCode,
  });
};

// Fetch shipping carriers by country (local seed data)
export const useShippingCarriers = (countryCode?: string) => {
  return useQuery({
    queryKey: ["carriers", countryCode],
    queryFn: async () => {
      const filtered = SHIPPING_CARRIERS.filter((carrier) =>
        countryCode ? carrier.countryCode === countryCode : true
      ).map(mapCarrier);
      return clone(filtered);
    },
    enabled: !!countryCode,
  });
};

// Create link without external API
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
      const linkId = generateId();
      const origin = ensureOrigin();
      const shareParams = new URLSearchParams();
      const payloadServiceKey =
        linkData.payload?.service_key ||
        linkData.payload?.service ||
        linkData.payload?.carrier;

      if (payloadServiceKey) {
        shareParams.set("service", `${payloadServiceKey}`);
      }

      if (linkData.payload?.tracking_number) {
        shareParams.set("tracking", `${linkData.payload.tracking_number}`);
      }

      if (typeof linkData.payload?.cod_amount === "number" && linkData.payload.cod_amount > 0) {
        shareParams.set("amount", `${linkData.payload.cod_amount}`);
      }

      const shareQuery = shareParams.toString();
      const querySuffix = shareQuery ? `?${shareQuery}` : "";
      const micrositeUrl = `${origin}/r/${linkData.country_code}/${linkData.type}/${linkId}${querySuffix}`;
      const paymentUrl = `${origin}/pay/${linkId}${querySuffix}`;
      const signature = encodeBase64(JSON.stringify(linkData.payload));

      const newLink: Link = {
        id: linkId,
        type: linkData.type,
        country_code: linkData.country_code,
        provider_id: linkData.provider_id ?? null,
        payload: clone(linkData.payload),
        microsite_url: micrositeUrl,
        payment_url: paymentUrl,
        signature,
        status: "active",
        created_at: new Date().toISOString(),
      };

      const links = getLinks();
      links.push(newLink);
      setLinks(links);

      return clone(newLink);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast({
        title: "تم إنشاء الرابط",
        description: "تم إنشاء رابط الخدمة محلياً بدون أي تكامل خارجي",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error?.message || "حدث خطأ أثناء إنشاء الرابط",
        variant: "destructive",
      });
      throw error;
    },
  });
};

// Fetch link by ID from local storage
export const useLink = (linkId?: string) => {
  return useQuery({
    queryKey: ["link", linkId],
    queryFn: async () => {
      const links = getLinks();
      const link = links.find((item) => item.id === linkId);
      if (!link) {
        throw new Error("Link not found");
      }
      return clone(link);
    },
    enabled: !!linkId,
  });
};

// Create payment and persist locally
export const useCreatePayment = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (paymentData: {
      link_id: string;
      amount: number;
      currency: string;
    }) => {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const paymentId = generateId();

      const newPayment: Payment = {
        id: paymentId,
        link_id: paymentData.link_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: "pending",
        otp,
        attempts: 0,
        locked_until: null,
        receipt_url: null,
        cardholder_name: null,
        last_four: null,
        created_at: new Date().toISOString(),
      };

      const payments = getPayments();
      payments.push(newPayment);
      setPayments(payments);

      return clone(newPayment);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error?.message || "حدث خطأ أثناء إنشاء الدفعة",
        variant: "destructive",
      });
      throw error;
    },
  });
};

// Fetch payment by ID from local storage
export const usePayment = (paymentId?: string) => {
  return useQuery({
    queryKey: ["payment", paymentId],
    queryFn: async () => {
      const payments = getPayments();
      const payment = payments.find((item) => item.id === paymentId);
      if (!payment) {
        throw new Error("Payment not found");
      }
      return clone(payment);
    },
    enabled: !!paymentId,
    refetchInterval: 2000,
  });
};

// Update payment locally (used for OTP verification flow)
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
      const payments = getPayments();
      const index = payments.findIndex((payment) => payment.id === paymentId);

      if (index === -1) {
        throw new Error("Payment not found");
      }

      const updatedPayment = {
        ...payments[index],
        ...clone(updates),
      } as Payment;

      payments[index] = updatedPayment;
      setPayments(payments);

      return clone(updatedPayment);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payment", variables.paymentId] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error?.message || "حدث خطأ أثناء تحديث الدفعة",
        variant: "destructive",
      });
      throw error;
    },
  });
};
