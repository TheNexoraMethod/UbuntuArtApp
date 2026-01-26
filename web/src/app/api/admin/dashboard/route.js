import sql from "@/app/api/utils/sql";
import { auth } from "@/app/api/utils/auth";
import { getToken } from "@auth/core/jwt";

export const GET = async (request) => {
  try {
    // Try to get session from cookies (web) first
    let session = await auth();
    let userId = session?.user?.id;

    // If no session from cookies, check for JWT token in Authorization header (mobile)
    if (!userId) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        // Decode JWT to get user info
        const jwt = await getToken({
          req: request,
          secret: process.env.AUTH_SECRET,
          secureCookie: process.env.AUTH_URL.startsWith("https"),
          token,
        });
        userId = jwt?.sub ? parseInt(jwt.sub) : null;
      }
    }

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const [user] = await sql`
      SELECT user_role FROM auth_users 
      WHERE id = ${userId}
    `;

    if (!user || user.user_role !== "admin") {
      return Response.json(
        {
          error: "Admin access required",
          userRole: user?.user_role || "none",
        },
        { status: 403 },
      );
    }

    // Get applications summary
    const applicationStats = await sql`
      SELECT 
        COALESCE(status, 'pending') as status,
        CAST(COUNT(*) as INTEGER) as count
      FROM applications 
      GROUP BY status
      ORDER BY status
    `;

    // Get contact enquiries summary
    const enquiryStats = await sql`
      SELECT 
        COALESCE(status, 'new') as status,
        CAST(COUNT(*) as INTEGER) as count
      FROM contact_enquiries 
      GROUP BY status
      ORDER BY status
    `;

    // Get recent applications (last 10)
    const recentApplications = await sql`
      SELECT 
        a.id,
        a.user_name,
        a.user_email,
        a.status,
        a.submitted_at,
        SUBSTRING(COALESCE(a.artist_statement, ''), 1, 100) as preview
      FROM applications a
      ORDER BY a.submitted_at DESC
      LIMIT 10
    `;

    // Get recent enquiries (last 10)
    const recentEnquiries = await sql`
      SELECT 
        ce.id,
        ce.name,
        ce.email,
        ce.subject,
        ce.status,
        ce.created_at,
        SUBSTRING(COALESCE(ce.message, ''), 1, 100) as preview
      FROM contact_enquiries ce
      ORDER BY ce.created_at DESC
      LIMIT 10
    `;

    // Get bookings summary
    const bookingStats = await sql`
      SELECT 
        COALESCE(status, 'pending') as status,
        CAST(COUNT(*) as INTEGER) as count
      FROM bookings 
      GROUP BY status
      ORDER BY status
    `;

    // Get recent bookings (last 10)
    const recentBookings = await sql`
      SELECT 
        b.id,
        COALESCE(u.name, 'Guest') as user_name,
        COALESCE(u.email, b.guest_email, 'No email') as user_email,
        COALESCE(r.title, 'Unknown Room') as residency_title,
        b.start_date,
        b.end_date,
        b.total_price,
        b.status,
        b.created_at
      FROM bookings b
      LEFT JOIN auth_users u ON b.user_id = u.id
      LEFT JOIN residencies r ON b.residency_id = r.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `;

    // Get transactions summary
    const transactionStats = await sql`
      SELECT 
        COALESCE(status, 'pending') as status,
        CAST(COUNT(*) as INTEGER) as count,
        CAST(COALESCE(SUM(amount), 0) as DECIMAL(10,2)) as total_amount
      FROM transactions 
      GROUP BY status
      ORDER BY status
    `;

    // Build response with fallbacks
    const responseData = {
      applications: {
        stats:
          applicationStats.length > 0
            ? applicationStats
            : [
                { status: "pending", count: 0 },
                { status: "approved", count: 0 },
                { status: "rejected", count: 0 },
              ],
        recent: recentApplications || [],
      },
      enquiries: {
        stats:
          enquiryStats.length > 0
            ? enquiryStats
            : [
                { status: "new", count: 0 },
                { status: "responded", count: 0 },
              ],
        recent: recentEnquiries || [],
      },
      bookings: {
        stats:
          bookingStats.length > 0
            ? bookingStats
            : [
                { status: "pending", count: 0 },
                { status: "confirmed", count: 0 },
              ],
        recent: recentBookings || [],
      },
      transactions: {
        stats:
          transactionStats.length > 0
            ? transactionStats
            : [{ status: "pending", count: 0, total_amount: 0 }],
      },
    };

    return Response.json(responseData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return Response.json(
      {
        error: "Failed to fetch dashboard data",
        details: error.message,
      },
      { status: 500 },
    );
  }
};

// Support POST method for mobile app
export const POST = GET;
