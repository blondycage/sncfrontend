import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Telegram webhook received on frontend:', JSON.stringify(body, null, 2))
    
    // Forward the webhook to the backend
    const backendResponse = await fetch('http://localhost:5000/api/auth/telegram/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!backendResponse.ok) {
      console.error('Backend webhook forwarding failed:', backendResponse.status)
      return NextResponse.json(
        { error: 'Webhook forwarding failed' },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Frontend webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle GET requests (for webhook verification)
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'Webhook endpoint is active' })
} 