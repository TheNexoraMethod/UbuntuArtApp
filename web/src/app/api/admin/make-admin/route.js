import sql from "@/app/api/utils/sql";
import { auth } from "@/app/api/utils/auth";

export const POST = async (request) => {
  try {
    const { adminKey, userEmail } = await request.json();

    // Check admin key from environment variable - this will trigger the environment variable setup
    const validAdminKey = process.env.ADMIN_SETUP_KEY;

    if (!validAdminKey) {
      return Response.json(
        {
          error:
            "ADMIN_SETUP_KEY environment variable not configured. Please set this in your project settings.",
          setup_required: true,
        },
        { status: 403 },
      );
    }

    if (!adminKey || adminKey !== validAdminKey) {
      return Response.json({ error: "Invalid admin key" }, { status: 403 });
    }

    if (!userEmail) {
      return Response.json(
        { error: "User email is required" },
        { status: 400 },
      );
    }

    // Update user role to admin
    const [user] = await sql`
      UPDATE auth_users 
      SET user_role = 'admin'
      WHERE email = ${userEmail}
      RETURNING id, email, user_role
    `;

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: `User ${userEmail} has been granted admin access`,
      user: {
        id: user.id,
        email: user.email,
        role: user.user_role,
      },
    });
  } catch (error) {
    console.error("Error making user admin:", error);
    return Response.json(
      { error: "Failed to grant admin access" },
      { status: 500 },
    );
  }
};
