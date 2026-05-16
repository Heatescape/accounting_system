import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const { mobile, merchantId } = await request.json()

  if (!mobile || !merchantId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Verify merchant exists
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('id', merchantId)
    .single()

  if (!merchant) {
    return NextResponse.json({ error: 'Invalid merchant' }, { status: 404 })
  }

  // Normalize mobile: strip spaces, dashes
  const normalizedMobile = mobile.replace(/[\s\-()]/g, '')

  // Find customer by mobile (try normalized and original)
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('merchant_id', merchantId)
    .or(`mobile.eq.${mobile},mobile.eq.${normalizedMobile}`)
    .single()

  if (!customer) {
    return NextResponse.json(
      { error: 'Mobile number not found. Please check with your service provider.' },
      { status: 404 }
    )
  }

  // Set a session cookie
  const cookieStore = await cookies()
  cookieStore.set('customer_session', JSON.stringify({ customerId: customer.id, merchantId }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
