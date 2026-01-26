import sql from "@/app/api/utils/sql";
import { auth } from "@/app/api/utils/auth";
import crypto from "crypto";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { newEmail } = body;

    if (!newEmail) {
      return Response.json({ error: "New email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Check if email is already taken
    const existingUsers = await sql`
      SELECT id FROM auth_users WHERE email = ${newEmail} AND id != ${session.user.id}
    `;

    if (existingUsers.length > 0) {
      return Response.json(
        { error: "This email address is already in use" },
        { status: 400 },
      );
    }

    // Generate email change token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store email change token
    await sql`
      INSERT INTO email_verification_tokens (user_id, token, email, expires_at)
      VALUES (${session.user.id}, ${token}, ${newEmail}, ${expiresAt})
      ON CONFLICT (token) DO UPDATE SET 
        email = EXCLUDED.email,
        expires_at = EXCLUDED.expires_at,
        created_at = CURRENT_TIMESTAMP
    `;

    // Generate verification URL
    const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email-change?token=${token}`;

    console.log(
      `Email change verification link for ${newEmail}: ${verificationUrl}`,
    );

    // TODO: Send verification email to new email address
    // await sendEmailChangeVerification(newEmail, verificationUrl);

    return Response.json({
      message: "Verification email sent to your new email address",
      // In development, include the token for testing
      ...(process.env.NODE_ENV === "development" && { verificationUrl }),
    });
  } catch (error) {
    console.error("Change email error:", error);
    return Response.json({ error: "Failed to change email" }, { status: 500 });
  }
}
