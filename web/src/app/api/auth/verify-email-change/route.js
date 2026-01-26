import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        `
        <html>
          <head><title>Invalid Link</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #e74c3c;">Invalid Email Change Link</h1>
            <p>This email change link is invalid or malformed.</p>
            <a href="/" style="color: #3498db;">Return to Homepage</a>
          </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
          status: 400,
        },
      );
    }

    // Find the email change token
    const tokens = await sql`
      SELECT evt.*, au.email as current_email
      FROM email_verification_tokens evt
      JOIN auth_users au ON evt.user_id = au.id
      WHERE evt.token = ${token}
      LIMIT 1
    `;

    if (tokens.length === 0) {
      return new Response(
        `
        <html>
          <head><title>Invalid Link</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #e74c3c;">Invalid Email Change Link</h1>
            <p>This email change link does not exist or has already been used.</p>
            <a href="/" style="color: #3498db;">Return to Homepage</a>
          </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
          status: 400,
        },
      );
    }

    const changeData = tokens[0];

    // Check if token has expired
    if (new Date() > new Date(changeData.expires_at)) {
      // Delete expired token
      await sql`DELETE FROM email_verification_tokens WHERE token = ${token}`;

      return new Response(
        `
        <html>
          <head><title>Expired Link</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #e74c3c;">Email Change Link Expired</h1>
            <p>This email change link has expired. Please request a new email change from your profile settings.</p>
            <a href="/profile" style="color: #3498db;">Go to Profile Settings</a>
          </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
          status: 400,
        },
      );
    }

    // Check if the new email is still available
    const existingUsers = await sql`
      SELECT id FROM auth_users WHERE email = ${changeData.email} AND id != ${changeData.user_id}
    `;

    if (existingUsers.length > 0) {
      // Delete the token
      await sql`DELETE FROM email_verification_tokens WHERE token = ${token}`;

      return new Response(
        `
        <html>
          <head><title>Email Not Available</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #e74c3c;">Email Address Not Available</h1>
            <p>This email address is already in use by another account. Please choose a different email.</p>
            <a href="/profile" style="color: #3498db;">Go to Profile Settings</a>
          </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
          status: 400,
        },
      );
    }

    // Update the user's email
    await sql`
      UPDATE auth_users 
      SET email = ${changeData.email}, email_verified = true
      WHERE id = ${changeData.user_id}
    `;

    // Delete the used token
    await sql`DELETE FROM email_verification_tokens WHERE token = ${token}`;

    return new Response(
      `
      <html>
        <head>
          <title>Email Changed</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: linear-gradient(135deg, #1a1a1a, #000); 
              color: white; 
              min-height: 100vh; 
              margin: 0; 
              display: flex; 
              flex-direction: column; 
              justify-content: center; 
              align-items: center;
            }
            .container {
              background: #2a2a2a;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.3);
              max-width: 500px;
              width: 90%;
            }
            .success-icon {
              background: #16a085;
              width: 80px;
              height: 80px;
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 40px;
            }
            h1 { color: #16a085; margin-bottom: 20px; }
            .btn {
              display: inline-block;
              background: #3498db;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin-top: 20px;
              transition: background 0.3s;
            }
            .btn:hover { background: #2980b9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✓</div>
            <h1>Email Changed Successfully!</h1>
            <p>Your email address has been updated to <strong>${changeData.email}</strong>.</p>
            <p>You can now use this email to sign in to your Ubuntu Art Village account.</p>
            <a href="/profile" class="btn">Go to Profile</a>
          </div>
        </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  } catch (error) {
    console.error("Email change verification error:", error);
    return new Response(
      `
      <html>
        <head><title>Verification Error</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #e74c3c;">Email Change Error</h1>
          <p>Something went wrong while changing your email. Please try again later.</p>
          <a href="/" style="color: #3498db;">Return to Homepage</a>
        </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html" },
        status: 500,
      },
    );
  }
}
