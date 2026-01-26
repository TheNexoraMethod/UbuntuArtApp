import sql from "@/app/api/utils/sql";
import { auth } from "@/app/api/utils/auth";
import { sendEmail } from "@/app/api/utils/send-email";
import { createEmailVerificationEmail } from "@/app/api/utils/email-templates";
import crypto from "crypto";

export async function POST(request) {
  try {
    console.log("📧 Starting send-verification request");

    const session = await auth();
    console.log(
      "🔐 Session:",
      session ? `User ${session.user.email}` : "No session",
    );

    const body = await request.json();
    const { email } = body;
    console.log("📨 Request body email:", email);

    // If no session, we're sending verification for new account
    if (!email && !session?.user?.email) {
      console.error("❌ No email provided and no session");
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const targetEmail = email || session.user.email;
    console.log("🎯 Target email:", targetEmail);

    // Get user by email
    const users = await sql`
      SELECT id, email, email_verified, name 
      FROM auth_users 
      WHERE email = ${targetEmail} 
      LIMIT 1
    `;

    console.log("👤 Users found:", users.length);

    if (users.length === 0) {
      console.log("⚠️ No user found for email:", targetEmail);
      // Don't reveal if email exists or not for security
      return Response.json({
        message: "If the email exists, a verification link has been sent.",
      });
    }

    const user = users[0];
    console.log("✅ User found:", {
      id: user.id,
      email: user.email,
      verified: user.email_verified,
    });

    // Clean up any old verification tokens for this user
    await sql`
      DELETE FROM email_verification_tokens 
      WHERE user_id = ${user.id}
    `;
    console.log("🧹 Cleaned up old tokens");

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    await sql`
      INSERT INTO email_verification_tokens (user_id, token, email, expires_at)
      VALUES (${user.id}, ${token}, ${targetEmail}, ${expiresAt})
    `;
    console.log("💾 Verification token stored");

    // Get base URL (same approach as password reset)
    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer")?.replace(/\/[^\/]*$/, "") ||
      process.env.AUTH_URL ||
      process.env.APP_URL ||
      "http://localhost:3000";

    console.log("🌐 Origin URL:", origin);

    // Create verification URL
    const verificationUrl = `${origin}/api/auth/verify-email?token=${token}`;

    console.log("🔗 Generated verification URL:", verificationUrl);

    // Use centralized email template
    const emailContent = createEmailVerificationEmail(
      user.name,
      verificationUrl,
      targetEmail,
    );

    console.log("📝 Email content prepared for:", targetEmail);

    // Send email (same approach as password reset - simple and working!)
    try {
      await sendEmail({
        to: targetEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
      console.log(`✅ Verification email sent successfully to ${targetEmail}`);
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      console.error("Email error details:", {
        message: emailError.message,
        name: emailError.name,
      });
      throw emailError;
    }

    return Response.json({
      message: "Verification email sent successfully",
      // In development, include the token for testing
      ...(process.env.NODE_ENV === "development" && { verificationUrl }),
    });
  } catch (error) {
    console.error("❌❌❌ Send verification email error:", error);
    console.error("Error stack:", error.stack);
    return Response.json(
      {
        error: "Failed to send verification email",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
