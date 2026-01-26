import sql from "@/app/api/utils/sql";
import { auth } from "@/app/api/utils/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const rows = await sql`
      SELECT 
        id, name, email, image, email_verified, membership_tier, 
        membership_status, membership_number, joined_date, user_role,
        subscription_status
      FROM auth_users 
      WHERE id = ${userId} 
      LIMIT 1
    `;

    const user = rows?.[0] || null;
    return Response.json({ user });
  } catch (err) {
    console.error("GET /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const {
      name,
      image,
      membership_tier,
      membership_status,
      membership_number,
    } = body || {};

    const setClauses = [];
    const values = [];

    if (typeof name === "string" && name.trim().length > 0) {
      setClauses.push("name = $" + (values.length + 1));
      values.push(name.trim());
    }

    if (typeof image === "string") {
      setClauses.push("image = $" + (values.length + 1));
      values.push(image);
    }

    if (
      typeof membership_tier === "string" &&
      membership_tier.trim().length > 0
    ) {
      setClauses.push("membership_tier = $" + (values.length + 1));
      values.push(membership_tier.trim());
    }

    if (
      typeof membership_status === "string" &&
      membership_status.trim().length > 0
    ) {
      setClauses.push("membership_status = $" + (values.length + 1));
      values.push(membership_status.trim());
    }

    if (
      typeof membership_number === "string" &&
      membership_number.trim().length > 0
    ) {
      setClauses.push("membership_number = $" + (values.length + 1));
      values.push(membership_number.trim());
    }

    if (setClauses.length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const finalQuery = `
      UPDATE auth_users 
      SET ${setClauses.join(", ")} 
      WHERE id = $${values.length + 1} 
      RETURNING id, name, email, image, membership_tier, 
                membership_status, membership_number, joined_date, user_role,
                subscription_status
    `;

    const result = await sql(finalQuery, [...values, userId]);
    const updated = result?.[0] || null;

    return Response.json({ user: updated });
  } catch (err) {
    console.error("PUT /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
