/**
 * Notification configuration for Zalo Bot API
 */

// Validate environment variables
const validateConfig = () => {
  const botToken = process.env.NEXT_PUBLIC_ZALO_BOT_TOKEN;
  const chatId = process.env.NEXT_PUBLIC_ZALO_CHAT_ID;
  const enabled = process.env.NEXT_PUBLIC_NOTIFICATION_ENABLED === 'true';
  
  if (enabled && (!botToken || !chatId)) {
    console.warn('⚠️ Zalo Bot notification is enabled but missing required environment variables:');
    if (!botToken) console.warn('  - NEXT_PUBLIC_ZALO_BOT_TOKEN is not set');
    if (!chatId) console.warn('  - NEXT_PUBLIC_ZALO_CHAT_ID is not set');
    console.warn('  Please check your .env.local file');
  }
  
  return {
    botToken: botToken || '',
    chatId: chatId || '',
    enabled: enabled && !!botToken && !!chatId
  };
};

const config = validateConfig();

export const NOTIFICATION_CONFIG = {
  // Bot token and chat ID from environment variables
  BOT_TOKEN: config.botToken,
  CHAT_ID: config.chatId,
  
  // Enable/disable notifications (only if all required vars are set)
  ENABLED: config.enabled,
  
  // Notification types
  TYPES: {
    INVENTORY_CREATION: process.env.NEXT_PUBLIC_NOTIFICATION_INVENTORY_CREATION !== 'false',
    INVENTORY_APPROVAL: process.env.NEXT_PUBLIC_NOTIFICATION_INVENTORY_APPROVAL !== 'false',
    INVENTORY_REJECTION: process.env.NEXT_PUBLIC_NOTIFICATION_INVENTORY_REJECTION !== 'false',
  }
} as const;

export type NotificationConfig = typeof NOTIFICATION_CONFIG;
