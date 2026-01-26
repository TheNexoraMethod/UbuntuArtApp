import sql from "@/app/api/utils/sql";
import { getToken } from "@auth/core/jwt";
import { sendEmail } from "@/app/api/utils/send-email";

export const POST = async (request) => {
  try {
    // Get user session if exists
    const jwt = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.AUTH_URL?.startsWith("https"),
    });

    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return Response.json(
        { error: "Name, email, and message are required" },
        { status: 400 },
      );
    }

    // Insert enquiry into database
    const [enquiry] = await sql`
      INSERT INTO contact_enquiries (
        user_id,
        name,
        email,
        subject,
        message
      ) VALUES (
        ${jwt?.sub || null},
        ${name},
        ${email},
        ${subject || "General Enquiry"},
        ${message}
      )
      RETURNING id, created_at
    `;

    // Send confirmation email to user
    try {
      await sendEmail({
        to: email,
        from: "Ubuntu Art Village <info@ubuntuartvillage.com>",
        subject: "Thank you for contacting Ubuntu Art Village!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #F0F9F4; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(34, 197, 94, 0.1); }
              .header { background: linear-gradient(135deg, #166534, #22C55E); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
              .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
              .content { padding: 40px 30px; }
              .message-box { background: #F0F9F4; border-left: 4px solid #22C55E; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
              .footer { background: #F8FAFC; padding: 30px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #E5E7EB; }
              .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
              .contact-info { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Ubuntu Art Village</h1>
                <p>Thank you for reaching out to our creative community</p>
              </div>
              
              <div class="content">
                <h2>Hello ${name}! 👋</h2>
                
                <p>Thank you for contacting Ubuntu Art Village. We've received your message and our team will get back to you within 24-48 hours.</p>
                
                <div class="message-box">
                  <strong>Your Message Details:</strong><br>
                  <strong>Subject:</strong> ${subject || "General Enquiry"}<br>
                  <strong>Submitted:</strong> ${new Date(
                    enquiry.created_at,
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                
                <p>While you wait for our response, feel free to:</p>
                <ul>
                  <li>🏠 <strong>Explore our residency programs</strong> - Join our creative community</li>
                  <li>🎨 <strong>Check out upcoming events</strong> - Connect with fellow artists</li>
                  <li>🌍 <strong>Follow us on social media</strong> - Stay updated with our latest news</li>
                </ul>
                
                <div class="contact-info">
                  <strong>📞 Quick Contact Info:</strong><br>
                  Email: Info@ubuntuartvillage.com<br>
                  Location: Ubuntu Art Village Bwejuu, Zanzibar<br>
                  Website: ubuntuartvillage.com
                </div>
                
                <p>We appreciate your interest in Ubuntu Art Village and look forward to connecting with you soon!</p>
                
                <p><em>Ubuntu Spirit: "I am because we are" 🌿</em></p>
              </div>
              
              <div class="footer">
                <p>© 2024 Ubuntu Art Village • Bwejuu, Zanzibar • Creating Community Through Art</p>
                <p>This is an automated confirmation. Please don't reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Hello ${name},

Thank you for contacting Ubuntu Art Village! We've received your message about "${subject || "General Enquiry"}" and our team will get back to you within 24-48 hours.

Your message was submitted on ${new Date(enquiry.created_at).toLocaleDateString()}.

Contact Info:
Email: Info@ubuntuartvillage.com
Location: Ubuntu Art Village Bwejuu, Zanzibar

Ubuntu Spirit: "I am because we are"

© 2024 Ubuntu Art Village`,
      });
    } catch (emailError) {
      console.error("Failed to send user confirmation email:", emailError);
      // Don't fail the API call if email fails
    }

    // Send notification email to admin
    try {
      await sendEmail({
        to: "Info@ubuntuartvillage.com",
        from: "Ubuntu Art Village <info@ubuntuartvillage.com>",
        subject: `New Contact Enquiry: ${subject || "General Enquiry"}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #F8FAFC; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
              .header { background: linear-gradient(135deg, #DC2626, #EF4444); color: white; padding: 30px; }
              .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
              .content { padding: 30px; }
              .enquiry-details { background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B; }
              .message-content { background: #F0F9F4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22C55E; white-space: pre-wrap; }
              .footer { background: #F8FAFC; padding: 20px; text-align: center; font-size: 12px; color: #666; }
              .urgent { color: #DC2626; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 New Contact Enquiry</h1>
                <p>A new message has been received through the website</p>
              </div>
              
              <div class="content">
                <div class="enquiry-details">
                  <h3>Contact Details:</h3>
                  <strong>Name:</strong> ${name}<br>
                  <strong>Email:</strong> <a href="mailto:${email}">${email}</a><br>
                  <strong>Subject:</strong> ${subject || "General Enquiry"}<br>
                  <strong>Submitted:</strong> ${new Date(
                    enquiry.created_at,
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Africa/Dar_es_Salaam",
                  })} EAT<br>
                  <strong>Enquiry ID:</strong> #${enquiry.id}
                  ${jwt?.sub ? `<br><strong>Registered User:</strong> Yes (ID: ${jwt.sub})` : "<br><strong>Registered User:</strong> No"}
                </div>
                
                <h3>Message:</h3>
                <div class="message-content">${message}</div>
                
                <p class="urgent">⚡ Please respond within 24-48 hours to maintain excellent customer service.</p>
                
                <p><strong>Quick Actions:</strong></p>
                <ul>
                  <li>Reply directly to <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || "Your enquiry to Ubuntu Art Village")}&body=${encodeURIComponent(`Hello ${name},\n\nThank you for reaching out to Ubuntu Art Village.\n\n`)}">${email}</a></li>
                  <li>View enquiry details in admin dashboard</li>
                  <li>Mark as priority if time-sensitive</li>
                </ul>
              </div>
              
              <div class="footer">
                <p>Ubuntu Art Village Admin Notification System</p>
                <p>Enquiry ID: #${enquiry.id} • ${new Date().toISOString()}</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `NEW CONTACT ENQUIRY - Ubuntu Art Village

Contact Details:
Name: ${name}
Email: ${email}
Subject: ${subject || "General Enquiry"}
Submitted: ${new Date(enquiry.created_at).toLocaleDateString()}
Enquiry ID: #${enquiry.id}

Message:
${message}

Please respond within 24-48 hours.

Reply to: ${email}`,
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
      // Don't fail the API call if email fails
    }

    return Response.json({
      success: true,
      enquiryId: enquiry.id,
      createdAt: enquiry.created_at,
      message:
        "Your message has been sent successfully! You should receive a confirmation email shortly.",
    });
  } catch (error) {
    console.error("Error submitting contact enquiry:", error);
    return Response.json(
      { error: "Failed to submit contact enquiry" },
      { status: 500 },
    );
  }
};

export const GET = async (request) => {
  try {
    const jwt = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.AUTH_URL?.startsWith("https"),
    });

    if (!jwt?.sub) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const status = url.searchParams.get("status");

    let query = `
      SELECT 
        ce.*,
        u.name as user_account_name,
        u.email as user_account_email
      FROM contact_enquiries ce
      LEFT JOIN auth_users u ON ce.user_id = u.id
    `;

    const params = [];

    if (status) {
      query += ` WHERE ce.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY ce.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const enquiries = await sql(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM contact_enquiries";
    const countParams = [];

    if (status) {
      countQuery += " WHERE status = $1";
      countParams.push(status);
    }

    const [{ total }] = await sql(countQuery, countParams);

    return Response.json({
      enquiries,
      total: parseInt(total),
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching contact enquiries:", error);
    return Response.json(
      { error: "Failed to fetch contact enquiries" },
      { status: 500 },
    );
  }
};
