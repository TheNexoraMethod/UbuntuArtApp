import sql from "@/app/api/utils/sql";
import { getToken } from "@auth/core/jwt";
import { sendEmail } from "@/app/api/utils/send-email";

export const PUT = async (request, { params }) => {
  try {
    const jwt = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.AUTH_URL?.startsWith("https"),
    });

    if (!jwt?.sub) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const [user] = await sql`
      SELECT user_role FROM auth_users WHERE id = ${jwt.sub}
    `;

    if (!user || user.user_role !== "admin") {
      return Response.json(
        { error: "Access denied. Admin role required." },
        { status: 403 },
      );
    }

    const { id } = params;
    const { response_message, status } = await request.json();

    if (!response_message) {
      return Response.json(
        { error: "Response message is required" },
        { status: 400 },
      );
    }

    // Get the original enquiry
    const [enquiry] = await sql`
      SELECT * FROM contact_enquiries WHERE id = ${id}
    `;

    if (!enquiry) {
      return Response.json({ error: "Enquiry not found" }, { status: 404 });
    }

    // Update enquiry with response
    const [updatedEnquiry] = await sql`
      UPDATE contact_enquiries 
      SET 
        status = ${status || "responded"},
        response_notes = ${response_message},
        responded_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    // Send response email to the original sender
    try {
      await sendEmail({
        to: enquiry.email,
        from: "Ubuntu Art Village <info@ubuntuartvillage.com>",
        subject: `Re: ${enquiry.subject || "Your enquiry to Ubuntu Art Village"}`,
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
              .original-message { background: #F8FAFC; border-left: 4px solid #6B7280; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
              .footer { background: #F8FAFC; padding: 30px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #E5E7EB; }
              .contact-info { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Ubuntu Art Village</h1>
                <p>Thank you for your patience</p>
              </div>
              
              <div class="content">
                <h2>Hello ${enquiry.name}! 👋</h2>
                
                <p>Thank you for reaching out to Ubuntu Art Village. Here's our response to your enquiry:</p>
                
                <div class="message-box">
                  <h3>Our Response:</h3>
                  <div style="white-space: pre-wrap;">${response_message}</div>
                </div>
                
                <div class="original-message">
                  <h4>Your Original Message:</h4>
                  <strong>Subject:</strong> ${enquiry.subject || "General Enquiry"}<br>
                  <strong>Sent:</strong> ${new Date(
                    enquiry.created_at,
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}<br><br>
                  <div style="white-space: pre-wrap;">${enquiry.message}</div>
                </div>
                
                <p>If you have any follow-up questions, feel free to reply to this email or contact us directly.</p>
                
                <div class="contact-info">
                  <strong>📞 Contact Us:</strong><br>
                  Email: Info@ubuntuartvillage.com<br>
                  Location: Ubuntu Art Village Bwejuu, Zanzibar<br>
                  Website: ubuntuartvillage.com
                </div>
                
                <p>We look forward to connecting with you further!</p>
                
                <p><em>Ubuntu Spirit: "I am because we are" 🌿</em></p>
              </div>
              
              <div class="footer">
                <p>© 2024 Ubuntu Art Village • Bwejuu, Zanzibar • Creating Community Through Art</p>
                <p>You can reply directly to this email for further assistance.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Hello ${enquiry.name},

Thank you for reaching out to Ubuntu Art Village. Here's our response to your enquiry:

${response_message}

Your Original Message:
Subject: ${enquiry.subject || "General Enquiry"}
Sent: ${new Date(enquiry.created_at).toLocaleDateString()}

${enquiry.message}

If you have any follow-up questions, feel free to reply to this email.

Contact Info:
Email: Info@ubuntuartvillage.com
Location: Ubuntu Art Village Bwejuu, Zanzibar

Ubuntu Spirit: "I am because we are"

© 2024 Ubuntu Art Village`,
      });
    } catch (emailError) {
      console.error("Failed to send response email:", emailError);
      // Don't fail the API call if email fails
    }

    return Response.json({
      success: true,
      enquiry: updatedEnquiry,
      message: "Response sent successfully",
    });
  } catch (error) {
    console.error("Error responding to enquiry:", error);
    return Response.json({ error: "Failed to send response" }, { status: 500 });
  }
};

export const GET = async (request, { params }) => {
  try {
    const jwt = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.AUTH_URL?.startsWith("https"),
    });

    if (!jwt?.sub) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const [user] = await sql`
      SELECT user_role FROM auth_users WHERE id = ${jwt.sub}
    `;

    if (!user || user.user_role !== "admin") {
      return Response.json(
        { error: "Access denied. Admin role required." },
        { status: 403 },
      );
    }

    const { id } = params;

    const [enquiry] = await sql`
      SELECT 
        ce.*,
        u.name as user_account_name,
        u.email as user_account_email
      FROM contact_enquiries ce
      LEFT JOIN auth_users u ON ce.user_id = u.id
      WHERE ce.id = ${id}
    `;

    if (!enquiry) {
      return Response.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return Response.json({ enquiry });
  } catch (error) {
    console.error("Error fetching enquiry:", error);
    return Response.json({ error: "Failed to fetch enquiry" }, { status: 500 });
  }
};
