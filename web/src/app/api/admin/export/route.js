import sql from "@/app/api/utils/sql";
import { auth } from "@/app/api/utils/auth";

export const GET = async (request) => {
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const format = searchParams.get("format") || "json";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let data = {};
    let filename = `ubuntu-art-village-export-${new Date().toISOString().split("T")[0]}`;

    switch (type) {
      case "applications":
        data.applications = await sql`
          SELECT 
            a.*,
            u.name as user_name,
            u.email as user_email
          FROM applications a
          LEFT JOIN auth_users u ON a.user_id = u.id
          ${startDate ? sql`WHERE a.submitted_at >= ${startDate}` : sql``}
          ${endDate ? sql`AND a.submitted_at <= ${endDate}` : sql``}
          ORDER BY a.submitted_at DESC
        `;
        filename += "-applications";
        break;

      case "enquiries":
        data.enquiries = await sql`
          SELECT * FROM contact_enquiries
          ${startDate ? sql`WHERE created_at >= ${startDate}` : sql``}
          ${endDate ? sql`AND created_at <= ${endDate}` : sql``}
          ORDER BY created_at DESC
        `;
        filename += "-enquiries";
        break;

      case "bookings":
        data.bookings = await sql`
          SELECT 
            b.*,
            u.name as user_name,
            u.email as user_email,
            r.title as residency_title
          FROM bookings b
          LEFT JOIN auth_users u ON b.user_id = u.id
          LEFT JOIN residencies r ON b.residency_id = r.id
          ${startDate ? sql`WHERE b.created_at >= ${startDate}` : sql``}
          ${endDate ? sql`AND b.created_at <= ${endDate}` : sql``}
          ORDER BY b.created_at DESC
        `;
        filename += "-bookings";
        break;

      case "transactions":
        data.transactions = await sql`
          SELECT 
            t.*,
            u.name as user_name,
            u.email as user_email
          FROM transactions t
          LEFT JOIN auth_users u ON t.user_id = u.id
          ${startDate ? sql`WHERE t.created_at >= ${startDate}` : sql``}
          ${endDate ? sql`AND t.created_at <= ${endDate}` : sql``}
          ORDER BY t.created_at DESC
        `;
        filename += "-transactions";
        break;

      case "users":
        data.users = await sql`
          SELECT 
            id,
            name,
            email,
            emailVerified,
            membership_tier,
            membership_status,
            membership_number,
            joined_date,
            user_role
          FROM auth_users
          ORDER BY joined_date DESC
        `;
        filename += "-users";
        break;

      case "all":
      default:
        const [applications, enquiries, bookings, transactions, users] =
          await sql.transaction([
            sql`
            SELECT 
              a.*,
              u.name as user_name,
              u.email as user_email
            FROM applications a
            LEFT JOIN auth_users u ON a.user_id = u.id
            ORDER BY a.submitted_at DESC
          `,
            sql`
            SELECT * FROM contact_enquiries
            ORDER BY created_at DESC
          `,
            sql`
            SELECT 
              b.*,
              u.name as user_name,
              u.email as user_email,
              r.title as residency_title
            FROM bookings b
            LEFT JOIN auth_users u ON b.user_id = u.id
            LEFT JOIN residencies r ON b.residency_id = r.id
            ORDER BY b.created_at DESC
          `,
            sql`
            SELECT 
              t.*,
              u.name as user_name,
              u.email as user_email
            FROM transactions t
            LEFT JOIN auth_users u ON t.user_id = u.id
            ORDER BY t.created_at DESC
          `,
            sql`
            SELECT 
              id,
              name,
              email,
              emailVerified,
              membership_tier,
              membership_status,
              membership_number,
              joined_date,
              user_role
            FROM auth_users
            ORDER BY joined_date DESC
          `,
          ]);

        data = {
          applications,
          enquiries,
          bookings,
          transactions,
          users,
          export_metadata: {
            exported_at: new Date().toISOString(),
            exported_by: session.user.email,
            total_records:
              applications.length +
              enquiries.length +
              bookings.length +
              transactions.length +
              users.length,
          },
        };
        filename += "-complete";
        break;
    }

    // Format response based on requested format
    if (format === "csv") {
      // Convert to CSV format
      const convertToCSV = (dataArray, name) => {
        if (!dataArray || dataArray.length === 0) return "";

        const headers = Object.keys(dataArray[0]);
        const csvContent = [
          `=== ${name.toUpperCase()} ===`,
          headers.join(","),
          ...dataArray.map((row) =>
            headers
              .map((header) => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma, newline, or quote
                if (value === null || value === undefined) return "";
                const stringValue = String(value);
                if (
                  stringValue.includes(",") ||
                  stringValue.includes("\n") ||
                  stringValue.includes('"')
                ) {
                  return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
              })
              .join(","),
          ),
          "", // Empty line between sections
        ].join("\n");

        return csvContent;
      };

      let csvOutput = `Ubuntu Art Village Data Export - ${new Date().toISOString()}\n\n`;

      if (data.applications)
        csvOutput += convertToCSV(data.applications, "Applications");
      if (data.enquiries)
        csvOutput += convertToCSV(data.enquiries, "Contact Enquiries");
      if (data.bookings) csvOutput += convertToCSV(data.bookings, "Bookings");
      if (data.transactions)
        csvOutput += convertToCSV(data.transactions, "Transactions");
      if (data.users) csvOutput += convertToCSV(data.users, "Users");

      return new Response(csvOutput, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      });
    }

    // Return JSON format
    return Response.json(
      {
        success: true,
        data,
        metadata: {
          exported_at: new Date().toISOString(),
          exported_by: session.user.email,
          type,
          format,
          filters: { startDate, endDate },
          filename: `${filename}.json`,
          count: Object.values(data).flat().length,
        },
      },
      {
        headers: {
          "Content-Disposition": `attachment; filename="${filename}.json"`,
        },
      },
    );
  } catch (error) {
    console.error("Error exporting data:", error);
    return Response.json({ error: "Failed to export data" }, { status: 500 });
  }
};
