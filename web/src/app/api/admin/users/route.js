import sql from "@/app/api/utils/sql";
import argon2 from "argon2";

// Get all users with their stats
export async function GET(request) {
  try {
    const users = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.image,
        u.user_role,
        u.membership_tier,
        u.membership_status,
        u.membership_number,
        u.joined_date,
        u.subscription_status,
        u.email_verified,
        u."emailVerified",
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT a.id) as total_applications,
        COUNT(DISTINCT er.id) as total_event_registrations
      FROM auth_users u
      LEFT JOIN bookings b ON u.id = b.user_id
      LEFT JOIN applications a ON u.id = a.user_id
      LEFT JOIN event_registrations er ON u.id = er.user_id
      GROUP BY u.id
      ORDER BY u.joined_date DESC
    `;

    return Response.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// Update user
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      email,
      userRole,
      membershipTier,
      membershipStatus,
      emailVerified,
      newPassword,
    } = body;

    // Update user details
    const result = await sql`
      UPDATE auth_users
      SET 
        name = ${name},
        email = ${email},
        user_role = ${userRole},
        membership_tier = ${membershipTier || null},
        membership_status = ${membershipStatus || "inactive"},
        email_verified = ${emailVerified || false}
      WHERE id = ${userId}
      RETURNING *
    `;

    // If a new password was provided, update it in auth_accounts
    if (newPassword) {
      const hashedPassword = await argon2.hash(newPassword);

      await sql`
        UPDATE auth_accounts
        SET password = ${hashedPassword}
        WHERE "userId" = ${userId} AND type = 'credentials'
      `;
    }

    return Response.json({ user: result[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// Delete user
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    await sql`DELETE FROM auth_users WHERE id = ${userId}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
