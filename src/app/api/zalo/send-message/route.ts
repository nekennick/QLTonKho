import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { botToken, chatId, message } = await request.json();

    console.log('Zalo API request:', { 
      botToken: botToken ? `${botToken.substring(0, 8)}...` : 'missing', 
      chatId, 
      message: message.substring(0, 50) + '...' 
    });

    // Validate required parameters
    if (!botToken || !chatId || !message) {
      return NextResponse.json(
        { error: 'Missing required parameters: botToken, chatId, message' },
        { status: 400 }
      );
    }

    // Validate bot token format (should be alphanumeric)
    if (!/^[a-zA-Z0-9]+$/.test(botToken)) {
      return NextResponse.json(
        { error: 'Invalid bot token format. Bot token should contain only letters and numbers.' },
        { status: 400 }
      );
    }

    // Call Zalo Bot API with correct endpoint
    const response = await fetch(`https://bot-api.zapps.me/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });

    const responseText = await response.text();
    console.log('Zalo API response status:', response.status);
    console.log('Zalo API response body:', responseText);

    if (!response.ok) {
      console.error('Zalo API error:', response.status, responseText);
      
      // Parse error response for better error messages
      let errorMessage = `Zalo API error: ${response.status} ${response.statusText}`;
      let errorDetails = responseText;
      
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.description) {
          errorMessage = `Zalo API Error: ${errorData.description}`;
        }
        if (errorData.error_code) {
          errorMessage += ` (Code: ${errorData.error_code})`;
        }
      } catch (e) {
        // Keep original error message if parsing fails
      }

      // Provide specific guidance for common errors
      if (response.status === 401) {
        errorMessage += '\n\n💡 Khắc phục:\n- Kiểm tra Bot Token có đúng không\n- Đảm bảo bot đã được publish\n- Kiểm tra bot có quyền gửi tin nhắn không';
      } else if (response.status === 404) {
        errorMessage += '\n\n💡 Khắc phục:\n- Kiểm tra Chat ID có đúng không\n- Đảm bảo bot đã được thêm vào chat/group';
      }

      return NextResponse.json(
        { error: errorMessage, details: errorDetails },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    console.log('Zalo message sent successfully:', result);
    
    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error('Error sending Zalo message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
