import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { botToken, chatId, photoUrl, caption } = await request.json();

    // Validate required parameters
    if (!botToken || !chatId || !photoUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters: botToken, chatId, photoUrl' },
        { status: 400 }
      );
    }

    // Call Zalo Bot API with correct endpoint
    const response = await fetch(`https://bot-api.zapps.me/bot${botToken}/sendPhoto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption: caption || ''
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Zalo API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Zalo API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Zalo photo sent successfully:', result);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error sending Zalo photo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
