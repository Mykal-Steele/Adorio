import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/schemas/contactSchema';

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const rawBody = await req.json().catch(() => null);
  if (!rawBody) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const parsed = contactSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, email, subject, message } = parsed.data;

  try {
    await resend.emails.send({
      from: 'Portfolio Contact <noreply@adorio.space>',
      to: 'oakar@adorio.space',
      replyTo: email,
      subject: subject?.trim() || `Portfolio contact from ${name}`,
      html: `
        <div style="font-family: monospace; max-width: 600px; background: #0a0e14; color: #f1f3fc; padding: 24px; border-radius: 4px;">
          <div style="color: #00ffc2; font-size: 11px; letter-spacing: 0.1em; margin-bottom: 16px;">// NEW MESSAGE — portfolio.contact</div>
          <table style="width:100%; border-collapse: collapse; font-size: 13px;">
            <tr><td style="color:#64748b; padding: 4px 0; width: 80px;">from</td><td style="color:#f1f3fc;">${name} &lt;${email}&gt;</td></tr>
            <tr><td style="color:#64748b; padding: 4px 0;">subject</td><td style="color:#f1f3fc;">${subject || '(no subject)'}</td></tr>
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #0d1117; border-left: 2px solid #00ffc2; font-size: 14px; line-height: 1.6; color: #a8abb3; white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <div style="margin-top: 16px; color: #3d4f6b; font-size: 10px;">Sent from adorio.space portfolio</div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contact] Resend error:', err);
    return NextResponse.json(
      { error: 'Failed to send message. Please try email directly.' },
      { status: 500 },
    );
  }
}
