import sql from "@/app/api/utils/sql";
import { auth } from "@/app/api/utils/auth";
import { createHash, randomBytes } from "crypto";

// Simple TOTP-like implementation for 2FA
const generate2FASecret = () => {
  return randomBytes(16).toString("hex");
};

const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    codes.push(randomBytes(4).toString("hex"));
  }
  return codes;
};

export const POST = async (request) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const [user] = await sql`
      SELECT user_role FROM auth_users 
      WHERE id = ${session.user.id}
    `;

    if (!user || user.user_role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { action } = await request.json();

    if (action === "enable") {
      // Generate 2FA secret and backup codes
      const secret = generate2FASecret();
      const backupCodes = generateBackupCodes();
      const hashedBackupCodes = backupCodes.map((code) =>
        createHash("sha256").update(code).digest("hex"),
      );

      // Store 2FA settings (you'd need to add a 2fa_settings table)
      // For now, we'll store in the user record
      await sql`
        UPDATE auth_users 
        SET 
          user_role = 'admin_2fa',
          stripe_id = ${JSON.stringify({
            secret,
            backup_codes: hashedBackupCodes,
            enabled: true,
            setup_date: new Date().toISOString(),
          })}
        WHERE id = ${session.user.id}
      `;

      return Response.json({
        success: true,
        secret: secret,
        backup_codes: backupCodes,
        qr_setup_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Ubuntu%20Art%20Village:${encodeURIComponent(session.user.email)}?secret=${secret}&issuer=Ubuntu%20Art%20Village`,
      });
    }

    if (action === "disable") {
      await sql`
        UPDATE auth_users 
        SET user_role = 'admin'
        WHERE id = ${session.user.id}
      `;

      return Response.json({ success: true, message: "2FA disabled" });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    return Response.json({ error: "Failed to setup 2FA" }, { status: 500 });
  }
};

export const GET = async (request) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await sql`
      SELECT user_role, stripe_id FROM auth_users 
      WHERE id = ${session.user.id}
    `;

    if (!user || !user.user_role.startsWith("admin")) {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const has2FA = user.user_role === "admin_2fa" && user.stripe_id;

    return Response.json({
      has_2fa: has2FA,
      user_role: user.user_role,
    });
  } catch (error) {
    console.error("Error checking 2FA status:", error);
    return Response.json(
      { error: "Failed to check 2FA status" },
      { status: 500 },
    );
  }
};
