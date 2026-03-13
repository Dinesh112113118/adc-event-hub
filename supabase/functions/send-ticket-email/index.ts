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
    const { email, name, eventTitle, qrCodeDataUrl, template, department, year } = await req.json();

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

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px; }
          .ticket-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
          .ticket-header { background-color: ${template?.primaryColor || '#3b82f6'}; color: white; padding: 30px; text-align: center; }
          .ticket-header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
          .ticket-header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
          .ticket-body { padding: 35px; }
          .ticket-info { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; }
          .info-block { flex: 1; min-width: 120px; }
          .info-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 6px; letter-spacing: 0.5px;}
          .info-value { font-size: 16px; color: #0f172a; font-weight: 600; margin: 0; }
          .attendee-details { margin-bottom: 30px; text-align: left; }
          .attendee-name { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 6px; }
          .attendee-meta { font-size: 14px; color: #64748b; margin: 0; font-weight: 500;}
          .qr-section { text-align: center; padding: 25px 0 10px; border-top: 2px dashed #e2e8f0; }
          .qr-text { font-size: 14px; color: #64748b; margin-bottom: 20px; font-weight: 500;}
          .qr-image { max-width: 250px; height: auto; margin: 0 auto; border-radius: 12px; display: block; }
          .ticket-footer { background: #f8fafc; padding: 25px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="ticket-header">
            <h1>${template?.eventName || eventTitle}</h1>
            <p>${template?.tagline || 'Your Official Entry Pass'}</p>
          </div>
          
          <div class="ticket-body">
            <div class="attendee-details">
              <h2 class="attendee-name">${name}</h2>
              ${(template?.showDepartment && department) || (template?.showYear && year) ? 
                `<p class="attendee-meta">
                  ${template?.showDepartment && department ? department : ''} 
                  ${template?.showDepartment && template?.showYear && department && year ? ' &bull; ' : ''}
                  ${template?.showYear && year ? `Year ${year}` : ''}
                 </p>` 
              : ''}
            </div>

            <div class="ticket-info">
              <div class="info-block">
                <div class="info-label">Date</div>
                <p class="info-value">${template?.date || 'See Dashboard'}</p>
              </div>
              <div class="info-block">
                <div class="info-label">Time</div>
                <p class="info-value">${template?.time || 'See Dashboard'}</p>
              </div>
              <div class="info-block" style="flex-basis: 100%;">
                <div class="info-label">Venue</div>
                <p class="info-value">${template?.venue || 'See Dashboard'}</p>
              </div>
            </div>

            <div class="qr-section">
              <p class="qr-text">Scan this code at the entrance</p>
              <img src="cid:ticket-qr" alt="Ticket QR Code" class="qr-image" />
            </div>
          </div>
          
          <div class="ticket-footer">
            <p style="margin: 0 0 8px; font-size: 15px;"><strong>${template?.organizerName || 'Organizer'}</strong></p>
            <p style="margin: 0;">${template?.footerText || 'Please present this ticket for entry.'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: Deno.env.get('GMAIL_USER'),
      to: email,
      subject: `Your Ticket for ${template?.eventName || eventTitle || 'the Event'}`,
      html: htmlTemplate,
      attachments: [
        {
          filename: 'ticket-qrcode.png',
          content: base64Data,
          encoding: 'base64',
          cid: 'ticket-qr'
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
