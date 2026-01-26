import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    console.log("📧 Email verification attempt:", {
      token: token?.substring(0, 10) + "...",
      fullUrl: request.url,
    });

    if (!token) {
      console.error("❌ No token provided in verification URL");
      return new Response(
        `
        <html>
          <head><title>Invalid Link - Ubuntu Art Village</title></head>
          <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background-color: #F0F9F4;">
            <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <h1 style="color: #EF4444; margin-bottom: 16px;">Invalid Verification Link</h1>
              <p style="color: #6B7280; margin-bottom: 24px;">This verification link is invalid or malformed.</p>
              <a href="/" style="display: inline-block; background: #22C55E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Return to Homepage</a>
            </div>
          </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
          status: 400,
        },
      );
    }

    // Find the verification token
    const tokens = await sql`
      SELECT evt.*, au.email, au.email_verified
      FROM email_verification_tokens evt
      JOIN auth_users au ON evt.user_id = au.id
      WHERE evt.token = ${token}
      LIMIT 1
    `;

    console.log("🔍 Token lookup result:", {
      found: tokens.length > 0,
      email: tokens[0]?.email,
    });

    if (tokens.length === 0) {
      console.error("❌ Token not found in database");
      return new Response(
        `
        <html>
          <head><title>Invalid Link - Ubuntu Art Village</title></head>
          <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background-color: #F0F9F4;">
            <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <h1 style="color: #EF4444; margin-bottom: 16px;">Invalid Verification Link</h1>
              <p style="color: #6B7280; margin-bottom: 24px;">This verification link does not exist or has already been used.</p>
              <a href="/" style="display: inline-block; background: #22C55E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Return to Homepage</a>
            </div>
          </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
          status: 400,
        },
      );
    }

    const verificationData = tokens[0];

    // Check if token has expired
    if (new Date() > new Date(verificationData.expires_at)) {
      console.error("❌ Token expired:", {
        expiresAt: verificationData.expires_at,
      });
      // Delete expired token
      await sql`DELETE FROM email_verification_tokens WHERE token = ${token}`;

      return new Response(
        `
        <html>
          <head><title>Expired Link - Ubuntu Art Village</title></head>
          <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background-color: #F0F9F4;">
            <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <h1 style="color: #F59E0B; margin-bottom: 16px;">Verification Link Expired</h1>
              <p style="color: #6B7280; margin-bottom: 24px;">This verification link has expired. Please request a new verification email from your account settings.</p>
              <a href="/account/signin" style="display: inline-block; background: #22C55E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Sign In to Request New Link</a>
            </div>
          </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
          status: 400,
        },
      );
    }

    console.log(
      "✅ Token valid, marking email as verified for user:",
      verificationData.user_id,
    );

    // Mark email as verified
    await sql`
      UPDATE auth_users 
      SET email_verified = true 
      WHERE id = ${verificationData.user_id}
    `;

    // Delete ALL tokens for this user (cleanup)
    await sql`DELETE FROM email_verification_tokens WHERE user_id = ${verificationData.user_id}`;

    console.log("✅ Email verified successfully for:", verificationData.email);

    // Detect if request is from mobile app (Expo)
    const userAgent = request.headers.get("user-agent") || "";
    const isMobile =
      userAgent.includes("Expo") || userAgent.includes("ReactNative");

    // Redirect to appropriate platform-specific success page
    if (isMobile) {
      console.log(
        "📱 Mobile verification - redirecting to mobile success page",
      );
      return Response.redirect(
        new URL("/account-verified?success=true", request.url),
      );
    } else {
      console.log("🌐 Web verification - redirecting to web success page");
      return Response.redirect(
        new URL("/account/verified?success=true", request.url),
      );
    }
  } catch (error) {
    console.error("❌ Email verification error:", error);

    // Detect platform for error redirect as well
    const userAgent = request.headers.get("user-agent") || "";
    const isMobile =
      userAgent.includes("Expo") || userAgent.includes("ReactNative");

    if (isMobile) {
      return Response.redirect(
        new URL("/account-verified?error=true", request.url),
      );
    } else {
      return Response.redirect(
        new URL("/account/verified?error=true", request.url),
      );
    }
  }
}
