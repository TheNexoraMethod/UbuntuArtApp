export async function sendEmail({ to, from, subject, html, text }) {
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not set in environment variables");
    console.error("📝 To fix this:");
    console.error("   1. Go to https://resend.com/api-keys");
    console.error("   2. Create a new API key");
    console.error(
      "   3. Add it to your environment variables as RESEND_API_KEY",
    );
    throw new Error("Email service not configured - missing RESEND_API_KEY");
  }

  const fromEmail = from || "Ubuntu Art Village <info@ubuntuartvillage.com>";

  console.log("📧 Attempting to send email:", {
    to: Array.isArray(to) ? to : [to],
    from: fromEmail,
    subject,
    apiKeySet: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 7) + "...",
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("❌ Resend API error:", {
      status: response.status,
      statusText: response.statusText,
      error: data,
      fullErrorData: JSON.stringify(data, null, 2),
    });

    // Check for common issues
    if (response.status === 403) {
      console.error("🔐 403 Forbidden - Possible causes:");
      console.error(
        "   1. Domain not verified in Resend (but you said it is verified)",
      );
      console.error(
        "   2. API key doesn't have permission to send from this domain",
      );
      console.error(
        "   3. Check that the API key is from the SAME Resend account that has the verified domain",
      );
      console.error(
        "   4. Go to https://resend.com/api-keys to check/regenerate your API key",
      );
      console.error(
        "   5. Make sure the API key has 'Sending access' permission",
      );
      console.error(
        "   6. IMPORTANT: Verify that 'ubuntuartvillage.com' is verified in your Resend account",
      );
      console.error("   7. From email being used:", fromEmail);
    } else if (response.status === 401) {
      console.error("🔑 401 Unauthorized - API key is invalid");
      console.error(
        "   1. Check your RESEND_API_KEY is correct at https://resend.com/api-keys",
      );
      console.error("   2. The API key might have been revoked or expired");
      console.error("   3. Try generating a new API key");
    } else if (response.status === 422) {
      console.error("⚠️ 422 Validation Error - Check email format");
      console.error("   From:", fromEmail);
      console.error("   To:", to);
      console.error(
        "   1. Make sure the from email matches your verified domain",
      );
      console.error("   2. Check that recipient email is valid");
    }

    // Include the actual Resend error in the thrown message
    const errorMessage =
      data.message ||
      data.error ||
      `HTTP ${response.status}: ${response.statusText}`;
    const fullError = `Resend API Error - ${errorMessage} (Status: ${response.status}). From: ${fromEmail}. Resend says: ${JSON.stringify(data)}`;

    console.error("🔴 FULL ERROR MESSAGE:", fullError);

    throw new Error(fullError);
  }

  console.log("✅ Email sent successfully:", { id: data.id, to });
  return { id: data.id };
}
