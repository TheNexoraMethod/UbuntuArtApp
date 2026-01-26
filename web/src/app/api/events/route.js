import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const membersOnly = searchParams.get("membersOnly");

    // Build query dynamically
    let eventsQuery = `
      SELECT 
        e.id, e.title, e.description, e.event_date, e.event_time,
        e.location, e.members_only, e.max_participants, e.current_participants,
        CASE WHEN er.user_id IS NOT NULL THEN true ELSE false END as is_registered
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id AND er.user_id = $1
      WHERE e.event_date >= CURRENT_DATE
    `;

    const params = [userId || null];

    if (membersOnly === "true") {
      eventsQuery += ` AND e.members_only = true`;
    } else if (membersOnly === "false") {
      eventsQuery += ` AND e.members_only = false`;
    }

    eventsQuery += ` ORDER BY e.event_date ASC, e.event_time ASC`;

    const events = await sql(eventsQuery, params);

    return Response.json({ events });
  } catch (error) {
    console.error("GET /api/events error:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    return Response.json(
      { error: "Failed to fetch events", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, userId } = body;

    // Handle event registration
    if (action === "register") {
      if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { eventId } = body;

      if (!eventId) {
        return Response.json({ error: "Missing eventId" }, { status: 400 });
      }

      // Get event details
      const eventResult = await sql`
        SELECT * FROM events WHERE id = ${eventId}
      `;

      if (eventResult.length === 0) {
        return Response.json({ error: "Event not found" }, { status: 404 });
      }

      const event = eventResult[0];

      // Check if event is full
      if (
        event.max_participants &&
        event.current_participants >= event.max_participants
      ) {
        return Response.json({ error: "Event is full" }, { status: 400 });
      }

      // If event is members-only, check membership status
      if (event.members_only) {
        const userResult = await sql`
          SELECT membership_status FROM auth_users WHERE id = ${userId}
        `;

        if (
          userResult.length === 0 ||
          userResult[0].membership_status !== "active"
        ) {
          return Response.json(
            {
              error:
                "This event is for members only. Please activate your membership to register.",
            },
            { status: 403 },
          );
        }
      }

      // Check if already registered
      const existingRegistration = await sql`
        SELECT * FROM event_registrations
        WHERE user_id = ${userId} AND event_id = ${eventId}
      `;

      if (existingRegistration.length > 0) {
        return Response.json(
          { error: "Already registered for this event" },
          { status: 400 },
        );
      }

      // Register user for event
      await sql`
        INSERT INTO event_registrations (user_id, event_id)
        VALUES (${userId}, ${eventId})
      `;

      // Update participant count
      await sql`
        UPDATE events
        SET current_participants = current_participants + 1
        WHERE id = ${eventId}
      `;

      return Response.json({
        success: true,
        message: "Successfully registered for event",
      });
    }

    // Handle event creation (existing logic)
    const {
      title,
      description,
      event_date,
      event_time,
      location,
      members_only = false,
      max_participants,
    } = body;

    if (!title || !event_date || !event_time || !location) {
      return Response.json(
        {
          error:
            "Missing required fields: title, event_date, event_time, location",
        },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO events (
        title, description, event_date, event_time,
        location, members_only, max_participants
      ) VALUES (
        ${title}, ${description}, ${event_date}, ${event_time},
        ${location}, ${members_only}, ${max_participants}
      ) RETURNING *
    `;

    return Response.json({ event: result[0] });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return Response.json({ error: "Failed to create event" }, { status: 500 });
  }
}
