import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl, { status: 302 })
  } catch (err) {
    console.error('Logout error:', err)
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl, { status: 302 })
  }
}
