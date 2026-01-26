import sql from "@/app/api/utils/sql";
import { auth } from "@/app/api/utils/auth";
import crypto from "crypto";

// Generate a new password for a user
export async function POST(request) {
  const session = await auth();
  if (!session?.user || session.user.user_role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    // Generate a random 12-character password
    const newPassword = crypto.randomBytes(6).toString("hex");

    // Return the password without setting it yet
    // The password will be set when the admin saves the user changes
    return Response.json({ newPassword });
  } catch (error) {
    console.error("Error generating password:", error);
    return Response.json(
      { error: "Failed to generate password" },
      { status: 500 },
    );
  }
}
