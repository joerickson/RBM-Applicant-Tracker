import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const applicationSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  document_type: z.string().optional(),
  document_number: z.string().optional(),
  document_expiration: z.string().optional(),
  work_authorized: z.boolean(),
  position: z.string().optional(),
  state_applying: z.string().min(1),
  referral_source: z.string().optional(),
  referred_by: z.string().optional(),
  available_date: z.string().optional(),
  notes: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Consent is required',
  }),
  locale: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = applicationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const supabase = await createClient()

    // Find or create state record
    const { data: stateRecord } = await supabase
      .from('states')
      .select('id')
      .ilike('name', `%${data.state_applying}%`)
      .single()

    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zip: data.zip || null,
        document_type: data.document_type || null,
        document_number: data.document_number || null,
        document_expiration: data.document_expiration || null,
        work_authorized: data.work_authorized,
        position: data.position || null,
        state_id: stateRecord?.id || null,
        referral_source: data.referral_source || null,
        referred_by: data.referred_by || null,
        available_date: data.available_date || null,
        notes: data.notes || null,
        locale: data.locale || 'en',
        status: 'portal_submitted',
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('Application insert error:', error)
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        referenceId: application.id,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Application route error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const stateId = searchParams.get('state_id')
    const status = searchParams.get('status')

    let query = supabase
      .from('applications')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (stateId) query = query.eq('state_id', stateId)
    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ applications: data })
  } catch (err) {
    console.error('GET applications error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
