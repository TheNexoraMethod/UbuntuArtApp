import sql from "@/app/api/utils/sql";
import { auth } from "@/app/api/utils/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { tier = "Artist" } = body;

    // Generate membership number
    const membershipNumber = `UAV-${new Date().getFullYear()}-${String(userId).padStart(3, "0")}`;

    // Activate membership
    const result = await sql`
      UPDATE auth_users 
      SET 
        membership_tier = ${tier},
        membership_status = 'active',
        membership_number = ${membershipNumber}
      WHERE id = ${userId}
      RETURNING id, name, email, membership_tier, membership_status, membership_number, joined_date
    `;

    if (result.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Create a membership transaction record
    await sql`
      INSERT INTO transactions (
        user_id, transaction_type, amount, 
        payment_method, description, status
      ) VALUES (
        ${userId}, 'membership', 85.00,
        'system', 'Membership activation - ${tier} tier', 'completed'
      )
    `;

    return Response.json({
      user: result[0],
      message: "Membership activated successfully",
    });
  } catch (error) {
    console.error("POST /api/membership/activate error:", error);
    return Response.json(
      { error: "Failed to activate membership" },
      { status: 500 },
    );
  }
}
