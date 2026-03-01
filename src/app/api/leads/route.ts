// src/app/api/leads/route.ts
// Create lead and send email notifications
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { createRouteSupabaseClient } from '@/lib/routeAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@example.com';

if (!supabaseUrl)
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
if (!supabaseKey)
  throw new Error('Missing Supabase key environment variable');

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Simple rate limit: track IPs in memory (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      listingId,
      name,
      email,
      phone,
      message,
      leadType = 'inquiry',
    } = body;

    const sessionClient = await createRouteSupabaseClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Save lead to database
    const { data: lead, error: insertError } = await supabaseAdmin
      .from('leads')
      .insert({
        listing_id: listingId || null,
        user_id: user?.id || null,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        message: message.trim(),
        lead_type: leadType,
        status: 'new',
        ip_address: ip,
        user_agent: request.headers.get('user-agent'),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Lead insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit inquiry' },
        { status: 500 }
      );
    }

    // Get property and owner details for email
    let propertyTitle = 'General Inquiry';
    let ownerEmail: string | null = null;

    if (listingId) {
      const { data: property } = await supabaseAdmin
        .from('properties')
        .select(`
          title,
          agent_id,
          agents (
            email,
            name
          )
        `)
        .eq('id', listingId)
        .single();

      if (property) {
        propertyTitle = property.title;
        const agents = property.agents as { email?: string } | null;
        ownerEmail = agents?.email || null;
      }
    }

    // Send email notifications if Resend is configured
    if (resend) {
      // Notify property owner/agent
      if (ownerEmail) {
        try {
          await resend.emails.send({
            from: fromEmail,
            to: ownerEmail,
            subject: `New Inquiry: ${propertyTitle}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e40af;">New Property Inquiry</h2>
                <p>You have a new inquiry for: <strong>${propertyTitle}</strong></p>
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <p><strong>From:</strong> ${name}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                  <p><strong>Message:</strong></p>
                  <p style="white-space: pre-wrap;">${message}</p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">Reply directly to this email to respond to the inquiry.</p>
              </div>
            `,
            replyTo: email,
          });

          // Update lead with notification timestamp
          await supabaseAdmin
            .from('leads')
            .update({ owner_notified_at: new Date().toISOString() })
            .eq('id', lead.id);
        } catch (emailError) {
          console.error('Owner email error:', emailError);
        }
      }

      // Send confirmation email to user
      try {
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: `Your inquiry has been received - Prime Estate`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e40af;">Thank you for your inquiry!</h2>
              <p>Hi ${name},</p>
              <p>We've received your inquiry${listingId ? ` about <strong>${propertyTitle}</strong>` : ''}.</p>
              <p>Our team will get back to you as soon as possible.</p>
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p><strong>Your message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px;">This is an automated confirmation. Please do not reply to this email.</p>
            </div>
          `,
        });

        // Update lead with confirmation timestamp
        await supabaseAdmin
          .from('leads')
          .update({ user_confirmation_sent_at: new Date().toISOString() })
          .eq('id', lead.id);
      } catch (emailError) {
        console.error('User confirmation email error:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been submitted successfully!',
      leadId: lead.id,
    });
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
