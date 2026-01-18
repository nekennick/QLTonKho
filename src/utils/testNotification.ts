/**
 * Test utility for Zalo Bot notifications
 * This file can be used to test notification functionality
 */

import { 
  sendZaloMessage, 
  sendZaloPhoto,
  generateInventoryCreationMessage,
  generateInventoryApprovalMessage,
  convertHtmlToImageUrl,
  generateInventorySlipHtml
} from './notificationUtils';
import { NOTIFICATION_CONFIG } from '@/config/notification';

/**
 * Test sending a simple text message
 */
export async function testTextMessage(): Promise<boolean> {
  try {
    console.log('🧪 Testing Zalo text message...');
    
    if (!NOTIFICATION_CONFIG.ENABLED) {
      console.warn('⚠️ Notifications are disabled');
      return false;
    }

    if (!NOTIFICATION_CONFIG.BOT_TOKEN || !NOTIFICATION_CONFIG.CHAT_ID) {
      console.error('❌ Missing bot token or chat ID');
      return false;
    }

    const testMessage = `🧪 Test message from GoalKho system
📅 Time: ${new Date().toLocaleString('vi-VN')}
✅ Notification system is working!`;

    const success = await sendZaloMessage(
      {
        botToken: NOTIFICATION_CONFIG.BOT_TOKEN,
        chatId: NOTIFICATION_CONFIG.CHAT_ID
      },
      testMessage
    );

    if (success) {
      console.log('✅ Text message sent successfully!');
    } else {
      console.error('❌ Failed to send text message');
    }

    return success;
  } catch (error) {
    console.error('❌ Error testing text message:', error);
    return false;
  }
}

/**
 * Test sending a photo message
 */
export async function testPhotoMessage(): Promise<boolean> {
  try {
    console.log('🧪 Testing Zalo photo message...');
    
    if (!NOTIFICATION_CONFIG.ENABLED) {
      console.warn('⚠️ Notifications are disabled');
      return false;
    }

    if (!NOTIFICATION_CONFIG.BOT_TOKEN || !NOTIFICATION_CONFIG.CHAT_ID) {
      console.error('❌ Missing bot token or chat ID');
      return false;
    }

    const testImageUrl = 'https://placehold.co/400x300/4F46E5/FFFFFF?text=Test+Image';
    const caption = `🧪 Test photo from GoalKho system
📅 Time: ${new Date().toLocaleString('vi-VN')}
✅ Photo notification is working!`;

    const success = await sendZaloPhoto(
      {
        botToken: NOTIFICATION_CONFIG.BOT_TOKEN,
        chatId: NOTIFICATION_CONFIG.CHAT_ID
      },
      testImageUrl,
      caption
    );

    if (success) {
      console.log('✅ Photo message sent successfully!');
    } else {
      console.error('❌ Failed to send photo message');
    }

    return success;
  } catch (error) {
    console.error('❌ Error testing photo message:', error);
    return false;
  }
}

/**
 * Test inventory creation notification
 */
export async function testInventoryCreationNotification(): Promise<boolean> {
  try {
    console.log('🧪 Testing inventory creation notification...');
    
    if (!NOTIFICATION_CONFIG.ENABLED || !NOTIFICATION_CONFIG.TYPES.INVENTORY_CREATION) {
      console.warn('⚠️ Inventory creation notifications are disabled');
      return false;
    }

    // Generate test message
    const testMessage = generateInventoryCreationMessage(
      'TEST001',
      'export',
      'Test User',
      'KHO A',
      'KHO B',
      3,
      1500000,
      [
        {
          code: 'VT001',
          name: 'Vật tư test 1',
          quantity: 10,
          unit: 'cái',
          price: 500000,
          total: 5000000
        },
        {
          code: 'VT002', 
          name: 'Vật tư test 2',
          quantity: 5,
          unit: 'kg',
          price: 200000,
          total: 1000000
        }
      ]
    );

    const success = await sendZaloMessage(
      {
        botToken: NOTIFICATION_CONFIG.BOT_TOKEN,
        chatId: NOTIFICATION_CONFIG.CHAT_ID
      },
      testMessage
    );

    if (success) {
      console.log('✅ Inventory creation notification sent successfully!');
    } else {
      console.error('❌ Failed to send inventory creation notification');
    }

    return success;
  } catch (error) {
    console.error('❌ Error testing inventory creation notification:', error);
    return false;
  }
}

/**
 * Test inventory approval notification
 */
export async function testInventoryApprovalNotification(): Promise<boolean> {
  try {
    console.log('🧪 Testing inventory approval notification...');
    
    if (!NOTIFICATION_CONFIG.ENABLED || !NOTIFICATION_CONFIG.TYPES.INVENTORY_APPROVAL) {
      console.warn('⚠️ Inventory approval notifications are disabled');
      return false;
    }

    // Generate test message
    const testMessage = generateInventoryApprovalMessage(
      'TEST001',
      'approve',
      'Test Admin',
      'Phiếu đã được duyệt thành công'
    );

    const success = await sendZaloMessage(
      {
        botToken: NOTIFICATION_CONFIG.BOT_TOKEN,
        chatId: NOTIFICATION_CONFIG.CHAT_ID
      },
      testMessage
    );

    if (success) {
      console.log('✅ Inventory approval notification sent successfully!');
    } else {
      console.error('❌ Failed to send inventory approval notification');
    }

    return success;
  } catch (error) {
    console.error('❌ Error testing inventory approval notification:', error);
    return false;
  }
}

/**
 * Test HTML to image conversion
 */
export async function testHtmlToImage(): Promise<boolean> {
  try {
    console.log('🧪 Testing HTML to image conversion...');
    
    const testHtml = generateInventorySlipHtml(
      {
        slipCode: 'TEST001',
        slipType: 'export',
        creator: 'Test User',
        dateTime: new Date().toLocaleString('vi-VN'),
        fromWarehouse: 'KHO A',
        toWarehouse: 'KHO B',
        address: 'Test Address',
        notes: 'Test Notes'
      },
      [
        {
          code: 'VT001',
          name: 'Test Item 1',
          unit: 'Cái',
          quantity: 2,
          price: 500000,
          total: 1000000
        },
        {
          code: 'VT002',
          name: 'Test Item 2',
          unit: 'Cái',
          quantity: 1,
          price: 500000,
          total: 500000
        }
      ]
    );

    const imageUrl = await convertHtmlToImageUrl(testHtml);
    console.log('✅ HTML to image conversion successful:', imageUrl);
    
    return true;
  } catch (error) {
    console.error('❌ Error testing HTML to image conversion:', error);
    return false;
  }
}

/**
 * Run all notification tests
 */
export async function runAllNotificationTests(): Promise<void> {
  console.log('🚀 Starting notification system tests...');
  console.log('📋 Configuration:', {
    enabled: NOTIFICATION_CONFIG.ENABLED,
    hasToken: !!NOTIFICATION_CONFIG.BOT_TOKEN,
    hasChatId: !!NOTIFICATION_CONFIG.CHAT_ID,
    types: NOTIFICATION_CONFIG.TYPES
  });

  const results = {
    textMessage: await testTextMessage(),
    photoMessage: await testPhotoMessage(),
    inventoryCreation: await testInventoryCreationNotification(),
    inventoryApproval: await testInventoryApprovalNotification(),
    htmlToImage: await testHtmlToImage()
  };

  console.log('📊 Test Results:', results);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`✅ ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All notification tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check configuration and network connection.');
  }
}

// Make functions available in browser console for testing
if (typeof window !== 'undefined') {
  (window as any).testNotifications = {
    testTextMessage,
    testPhotoMessage,
    testInventoryCreationNotification,
    testInventoryApprovalNotification,
    testHtmlToImage,
    runAllNotificationTests
  };
}
