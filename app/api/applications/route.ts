import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const HR_EMAILS: Record<string, string> = {
  Utah: process.env.HR_EMAIL_UTAH || '',
  Nevada: process.env.HR_EMAIL_NEVADA || '',
  Arizona: process.env.HR_EMAIL_ARIZONA || '',
  Texas: process.env.HR_EMAIL_TEXAS || '',
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('applications')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Send email notification if Resend is configured
  if (process.env.RESEND_API_KEY && data.state_applying && HR_EMAILS[data.state_applying]) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'RBM ATS <noreply@rbmservicesinc.com>',
        to: HR_EMAILS[data.state_applying],
        subject: `New Application — ${data.first_name} ${data.last_name} (${data.state_applying})`,
        html: `
          <h2>New Application Received</h2>
          <p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p>
          <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
          <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
          <p><strong>State:</strong> ${data.state_applying}</p>
          <p><strong>Document Type:</strong> ${data.document_type}</p>
          <p><strong>Referral:</strong> ${data.referral_source || 'N/A'}</p>
          <p><strong>Submitted:</strong> ${new Date(data.submitted_at).toLocaleString()}</p>
          <hr/>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard">View in HR Portal</a></p>
        `,
      })
    } catch {
      // Email failure should not block the submission response
      console.error('Email notification failed')
    }
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
