import sql from "@/app/api/utils/sql";

// Get availability for a residency
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const residencyId = searchParams.get("residencyId");
    const year = searchParams.get("year") || new Date().getFullYear();
    const month = searchParams.get("month") || new Date().getMonth() + 1;

    if (!residencyId) {
      return Response.json(
        { error: "Residency ID is required" },
        { status: 400 },
      );
    }

    // Get booked dates for the month
    const bookedDates = await sql`
      SELECT occupied_date, is_buffer, booking_id
      FROM booking_calendar
      WHERE residency_id = ${residencyId}
      AND EXTRACT(YEAR FROM occupied_date) = ${year}
      AND EXTRACT(MONTH FROM occupied_date) = ${month}
    `;

    // Get admin blocked dates for the month
    const blockedDates = await sql`
      SELECT blocked_date, reason
      FROM blocked_dates
      WHERE residency_id = ${residencyId}
      AND EXTRACT(YEAR FROM blocked_date) = ${year}
      AND EXTRACT(MONTH FROM blocked_date) = ${month}
    `;

    // Get residency details
    const residencies = await sql`
      SELECT id, title, room_type, pricing_config
      FROM residencies
      WHERE id = ${residencyId}
      LIMIT 1
    `;

    return Response.json({
      residency: residencies[0] || null,
      bookedDates: bookedDates.map((d) => ({
        date: d.occupied_date,
        isBuffer: d.is_buffer,
        bookingId: d.booking_id,
      })),
      blockedDates: blockedDates.map((d) => ({
        date: d.blocked_date,
        reason: d.reason,
      })),
      year: parseInt(year),
      month: parseInt(month),
    });
  } catch (error) {
    console.error("Calendar GET error:", error);
    return Response.json(
      { error: "Failed to fetch calendar data" },
      { status: 500 },
    );
  }
}

// Block dates (admin only)
export async function POST(request) {
  try {
    const body = await request.json();
    const { residencyId, dates, reason, action = "block" } = body;

    if (!residencyId || !dates || !Array.isArray(dates)) {
      return Response.json(
        { error: "Residency ID and dates array are required" },
        { status: 400 },
      );
    }

    if (action === "block") {
      // Block dates
      for (const date of dates) {
        await sql`
          INSERT INTO blocked_dates (residency_id, blocked_date, reason)
          VALUES (${residencyId}, ${date}, ${reason || "Blocked by admin"})
          ON CONFLICT (residency_id, blocked_date) 
          DO UPDATE SET reason = EXCLUDED.reason
        `;
      }

      return Response.json({
        message: `Successfully blocked ${dates.length} dates`,
        dates,
      });
    } else if (action === "unblock") {
      // Unblock dates
      for (const date of dates) {
        await sql`
          DELETE FROM blocked_dates
          WHERE residency_id = ${residencyId} 
          AND blocked_date = ${date}
        `;
      }

      return Response.json({
        message: `Successfully unblocked ${dates.length} dates`,
        dates,
      });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Calendar POST error:", error);
    return Response.json(
      { error: "Failed to update blocked dates" },
      { status: 500 },
    );
  }
}
