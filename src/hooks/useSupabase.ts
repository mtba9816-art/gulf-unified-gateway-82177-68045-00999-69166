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

const toUrlSafeBase64 = (value: string) =>
  value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const fromUrlSafeBase64 = (value: string) => {
  let normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4 !== 0) {
    normalized += "=";
  }
  return normalized;
};

const encodeBase64 = (input: string) => {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    const raw = window.btoa(unescape(encodeURIComponent(input)));
    return toUrlSafeBase64(raw);
  }
  if (typeof Buffer !== "undefined") {
    const raw = Buffer.from(input, "utf-8").toString("base64");
    return toUrlSafeBase64(raw);
  }
  return "";
};

const decodeBase64 = (input: string) => {
  const normalize = fromUrlSafeBase64(input.replace(/\s/g, ""));
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    try {
      const binary = window.atob(normalize);
      let result = "";
      for (let i = 0; i < binary.length; i += 1) {
        result += String.fromCharCode(binary.charCodeAt(i));
      }
      return decodeURIComponent(escape(result));
    } catch (error) {
      console.warn("Failed to decode base64 in browser:", error);
    }
  }

  if (typeof Buffer !== "undefined") {
    try {
      return Buffer.from(normalize, "base64").toString("utf-8");
    } catch (error) {
      console.warn("Failed to decode base64 in Node:", error);
    }
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
      const payloadClone = clone(linkData.payload);
      const payloadServiceKey =
        payloadClone?.service_key || payloadClone?.service || payloadClone?.carrier || "";
      const serviceName = payloadClone?.service_name || payloadServiceKey;
      const trackingNumber = payloadClone?.tracking_number;
      const codAmount =
        typeof payloadClone?.cod_amount === "number" && payloadClone.cod_amount > 0
          ? payloadClone.cod_amount
          : undefined;

      const createdAt = new Date().toISOString();

      const shareParams = new URLSearchParams();
      if (linkData.type) {
        shareParams.set("type", linkData.type);
      }
      if (linkData.country_code) {
        shareParams.set("country", linkData.country_code);
      }
      if (payloadServiceKey) {
        shareParams.set("service", `${payloadServiceKey}`);
      }
      if (serviceName) {
        shareParams.set("service_name", `${serviceName}`);
      }
      if (trackingNumber) {
        shareParams.set("tracking", `${trackingNumber}`);
      }
      if (typeof codAmount === "number") {
        shareParams.set("amount", `${codAmount}`);
      }

      const querySuffix = shareParams.toString();
      const micrositeUrl = `${origin}/r/${linkData.country_code}/${linkData.type}/${linkId}${querySuffix ? `?${querySuffix}` : ""}`;
      const paymentUrl = `${origin}/pay/${linkId}${querySuffix ? `?${querySuffix}` : ""}`;
      const signature = encodeBase64(JSON.stringify(payloadClone));

      const newLink: Link = {
        id: linkId,
        type: linkData.type,
        country_code: linkData.country_code,
        provider_id: linkData.provider_id ?? null,
        payload: payloadClone,
        microsite_url: micrositeUrl,
        payment_url: paymentUrl,
        signature,
        status: "active",
        created_at: createdAt,
      };

      const links = getLinks();
      links.push(newLink);
      setLinks(links);

      return clone(newLink);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast({
        title: "?? ????? ??????",
        description: "?? ????? ???? ?????? ?????? ???? ?? ????? ?????",
      });
    },
    onError: (error: any) => {
      toast({
        title: "???",
        description: error?.message || "??? ??? ????? ????? ??????",
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
      const parseIdentifier = (identifier: string | undefined) => {
        if (!identifier) {
          return { baseId: "" };
        }
        return { baseId: identifier.split("!")[0] || identifier };
      };

      const { baseId } = parseIdentifier(linkId);

      let links = getLinks();
      let link = links.find((item) => item.id === baseId);

      if (!link && isBrowser) {
        const params = new URLSearchParams(window.location.search || "");
        const service = params.get("service");
        const type = params.get("type") || "shipping";
        const countryCode = params.get("country") || "";
        const serviceName = params.get("service_name") || service || "";
        const trackingNumber = params.get("tracking") || "";
        const amountRaw = params.get("amount");
        const codAmount = amountRaw ? Number(amountRaw) || 0 : 0;

        if (service) {
          const origin = ensureOrigin();
          const currentSearch = params.toString();
          const suffix = currentSearch ? `?${currentSearch}` : "";

          const fallbackPayload: Record<string, any> = {
            service_key: service,
            service_name: serviceName || service,
            tracking_number: trackingNumber,
            cod_amount: codAmount,
            type,
            country: countryCode,
          };

          const hydrated: Link = {
            id: baseId,
            type,
            country_code: countryCode,
            provider_id: null,
            payload: fallbackPayload,
            microsite_url: `${origin}/r/${countryCode || "sa"}/${type}/${baseId}${suffix}`,
            payment_url: `${origin}/pay/${baseId}${suffix}`,
            signature: encodeBase64(JSON.stringify(fallbackPayload)),
            status: "active",
            created_at: new Date().toISOString(),
          };

          links.push(hydrated);
          setLinks(links);
          link = hydrated;
        }
      }

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
        title: "???",
        description: error?.message || "??? ??? ????? ????? ??????",
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
        title: "???",
        description: error?.message || "??? ??? ????? ????? ??????",
        variant: "destructive",
      });
      throw error;
    },
  });
};
