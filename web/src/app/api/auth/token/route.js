import { getToken } from "@auth/core/jwt";
import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const [token, jwt] = await Promise.all([
    getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.AUTH_URL.startsWith("https"),
      raw: true,
    }),
    getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.AUTH_URL.startsWith("https"),
    }),
  ]);

  if (!jwt) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Fetch complete user data from database to get latest verified status
  const users = await sql`
    SELECT id, name, email, email_verified, image, membership_tier, 
           membership_status, membership_number, user_role, subscription_status, 
           stripe_id
    FROM auth_users 
    WHERE id = ${parseInt(jwt.sub)}
    LIMIT 1
  `;

  const user = users[0] || {
    id: jwt.sub,
    email: jwt.email,
    name: jwt.name,
  };

  return new Response(
    JSON.stringify({
      jwt: token,
      user,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
