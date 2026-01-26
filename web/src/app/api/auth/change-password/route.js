import sql from "@/app/api/utils/sql";
import { auth } from "@/app/api/utils/auth";
import { hash, verify } from "argon2";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return Response.json(
        { error: "New passwords do not match" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return Response.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    // Get current user's password hash
    const accounts = await sql`
      SELECT password FROM auth_accounts 
      WHERE "userId" = ${session.user.id} AND type = 'credentials'
      LIMIT 1
    `;

    if (accounts.length === 0) {
      return Response.json(
        { error: "Password authentication not set up for this account" },
        { status: 400 },
      );
    }

    const account = accounts[0];

    // Verify current password
    const isCurrentPasswordValid = await verify(
      account.password,
      currentPassword,
    );
    if (!isCurrentPasswordValid) {
      return Response.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword);

    // Update password
    await sql`
      UPDATE auth_accounts 
      SET password = ${hashedNewPassword}
      WHERE "userId" = ${session.user.id} AND type = 'credentials'
    `;

    return Response.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return Response.json(
      { error: "Failed to change password" },
      { status: 500 },
    );
  }
}
