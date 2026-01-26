import sql from "@/app/api/utils/sql";
import { sendEmail } from "@/app/api/utils/send-email";
import crypto from "crypto";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const users = await sql`
      SELECT id, email, name 
      FROM auth_users 
      WHERE email = ${email.trim()}
    `;

    if (users.length === 0) {
      // Don't reveal if email exists or not (security best practice)
      return Response.json({
        message: "If that email exists, a reset link has been sent",
      });
    }

    const user = users[0];

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store token in database
    await sql`
      INSERT INTO password_reset_tokens (token, user_id, expires_at)
      VALUES (${token}, ${user.id}, ${expiresAt})
    `;

    // Get base URL from request headers or environment
    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer")?.replace(/\/[^\/]*$/, "") ||
      process.env.AUTH_URL ||
      process.env.APP_URL ||
      "http://localhost:3000";

    // Send email with reset link
    const resetUrl = `${origin}/account/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password - Ubuntu Art Village",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #F0F9F4; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
            <h1 style="color: #166534; margin-top: 0;">Reset Your Password</h1>
            <p>Hi ${user.name || "there"},</p>
            <p>We received a request to reset your password for your Ubuntu Art Village account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #22C55E; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="color: #92400E; background-color: #FEF3C7; padding: 15px; border-radius: 8px; border: 2px solid #FDE68A;">
              <strong>⚠️ Important:</strong> This link expires in 1 hour.
            </p>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <p style="margin-top: 30px; color: #6B7280; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #22C55E; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          <div style="text-align: center; color: #6B7280; font-size: 12px; margin-top: 20px;">
            <p>Ubuntu Art Village<br>
            This is an automated email, please do not reply.</p>
          </div>
        </body>
        </html>
      `,
    });

    return Response.json({
      message: "If that email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return Response.json(
      { error: "Failed to process password reset request" },
      { status: 500 },
    );
  }
}
