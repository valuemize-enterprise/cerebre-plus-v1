// app/api/email/welcome/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createElement } from 'react';
import { render } from '@react-email/render';
import { WelcomeEmail } from '@/emails';
import { createServerClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const { firstName } = await req.json();

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await resend.emails.send({
    from: 'hello@cerebreplus.com',
    to: user.email!,
    subject: 'Welcome to Cerebre Plus ✨',
    html: render(createElement(WelcomeEmail, { firstName })),
  });

  return NextResponse.json({ ok: true });
}