import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, name, eventTitle, qrCodeDataUrl } = await req.json();

    if (!email || !qrCodeDataUrl) {
      return new Response(JSON.stringify({ error: 'Missing email or qrCodeDataUrl' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: Deno.env.get('GMAIL_USER'),
        pass: Deno.env.get('GMAIL_PASSWORD'),
      },
      tls: {
          rejectUnauthorized: false
      }
    });

    const base64Data = qrCodeDataUrl.replace(/^data:image\/\w+;base64,/, "");

    const mailOptions = {
      from: Deno.env.get('GMAIL_USER'),
      to: email,
      subject: `Your Ticket for ${eventTitle || 'the Event'}`,
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2>Hello ${name || 'Attendee'},</h2>
          <p>Here is your ticket for <strong>${eventTitle || 'the Event'}</strong>.</p>
          <p>Please present the attached QR code at the entrance.</p>
          <p>Thank you!</p>
        </div>
      `,
      attachments: [
        {
          filename: 'ticket-qrcode.png',
          content: base64Data,
          encoding: 'base64',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
