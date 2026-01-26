import sql from "@/app/api/utils/sql";
import { sendEmail } from "@/app/api/utils/send-email";
import {
  createBookingConfirmationEmail,
  createAdminBookingNotificationEmail,
} from "@/app/api/utils/email-templates";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get("userRole");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    let bookingsQuery = `
      SELECT 
        b.*,
        r.title as residency_title,
        r.room_type,
        r.location,
        r.image_url,
        u.name as user_name,
        u.email as user_email,
        a.artist_statement,
        a.art_style,
        a.focus_work_goals,
        a.why_ubuntu,
        a.status as application_status
      FROM bookings b
      LEFT JOIN residencies r ON b.residency_id = r.id
      LEFT JOIN auth_users u ON b.user_id = u.id
      LEFT JOIN applications a ON b.application_id = a.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // If not admin, filter by user ID
    if (userRole !== "admin" && userId) {
      bookingsQuery += ` AND b.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (status) {
      bookingsQuery += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    bookingsQuery += ` ORDER BY b.created_at DESC`;

    const bookings = await sql(bookingsQuery, params);

    return Response.json({ bookings });
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return Response.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      residencyId,
      startDate,
      endDate,
      arrivalTime,
      bookingType = "guest",
      fullName,
      email,
      phone,
      numberOfGuests,
      artistType,
      totalPrice,
      stripePaymentIntentId,
      applicationId,
    } = body;

    console.log("Creating booking with data:", body);

    // Validate required fields
    if (!residencyId || !startDate || !endDate) {
      return Response.json(
        { error: "Missing required fields: residencyId, startDate, endDate" },
        { status: 400 },
      );
    }

    if (!fullName || !email || !phone) {
      return Response.json(
        { error: "Missing required fields: fullName, email, phone" },
        { status: 400 },
      );
    }

    // Check email verification if user is logged in
    if (userId) {
      const userCheckResult = await sql`
        SELECT email_verified FROM auth_users WHERE id = ${userId} LIMIT 1
      `;

      if (
        userCheckResult.length > 0 &&
        userCheckResult[0].email_verified === false
      ) {
        return Response.json(
          {
            error:
              "Email verification required. Please verify your email address before making a booking.",
          },
          { status: 403 },
        );
      }
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return Response.json(
        { error: "Start date cannot be in the past" },
        { status: 400 },
      );
    }

    if (end <= start) {
      return Response.json(
        { error: "End date must be after start date" },
        { status: 400 },
      );
    }

    // Calculate duration in days and months
    const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const durationInMonths = durationInDays / 30; // Approximate months

    // Validate artist residency duration (1-6 months)
    if (bookingType === "artist") {
      if (durationInDays < 30) {
        return Response.json(
          {
            error:
              "Artist residency bookings must be at least 1 month (30 days). Your selected duration is " +
              durationInDays +
              " days.",
          },
          { status: 400 },
        );
      }
      if (durationInDays > 180) {
        return Response.json(
          {
            error:
              "Artist residency bookings cannot exceed 6 months (180 days). Your selected duration is " +
              durationInDays +
              " days.",
          },
          { status: 400 },
        );
      }
    }

    // Get residency details
    const residencies = await sql`
      SELECT * FROM residencies WHERE id = ${residencyId} AND available = true LIMIT 1
    `;

    if (residencies.length === 0) {
      return Response.json(
        { error: "Residency not found or not available" },
        { status: 404 },
      );
    }

    const residency = residencies[0];

    // Calculate nights and pricing
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const pricePerNight = residency.pricing_config?.price_per_night || 100;
    let calculatedPrice = nights * pricePerNight;

    // Apply 10% member discount if user has active membership
    let discountApplied = false;
    if (userId) {
      const userCheck = await sql`
        SELECT membership_status, subscription_status 
        FROM auth_users 
        WHERE id = ${userId} 
        LIMIT 1
      `;

      if (userCheck.length > 0) {
        const user = userCheck[0];
        const hasActiveMembership =
          user.membership_status === "active" ||
          user.subscription_status === "active";

        if (hasActiveMembership) {
          calculatedPrice = calculatedPrice * 0.9; // Apply 10% discount
          discountApplied = true;
          console.log(
            `✅ Applied 10% member discount to booking. Original: $${nights * pricePerNight}, Discounted: $${calculatedPrice}`,
          );
        }
      }
    }

    // Use provided totalPrice or calculated price
    const finalPrice = totalPrice || calculatedPrice;

    // Check for booking conflicts
    const conflicts = await sql`
      SELECT COUNT(*) as count
      FROM booking_calendar bc
      WHERE bc.residency_id = ${residencyId}
      AND bc.occupied_date >= ${startDate}
      AND bc.occupied_date < ${endDate}
    `;

    if (conflicts[0].count > 0) {
      return Response.json(
        { error: "Selected dates are not available" },
        { status: 400 },
      );
    }

    // Check for admin blocked dates
    const blockedDates = await sql`
      SELECT COUNT(*) as count
      FROM blocked_dates bd
      WHERE bd.residency_id = ${residencyId}
      AND bd.blocked_date >= ${startDate}
      AND bd.blocked_date < ${endDate}
    `;

    if (blockedDates[0].count > 0) {
      return Response.json(
        { error: "Selected dates contain blocked periods" },
        { status: 400 },
      );
    }

    // Store booking metadata including all new fields
    const bookingMetadata = {
      fullName,
      email,
      phone,
      numberOfGuests: parseInt(numberOfGuests) || 1,
      arrivalTime: arrivalTime || "14:00",
      artistType: bookingType === "artist" ? artistType : null,
    };

    // Create booking with all metadata fields
    const [booking] = await sql`
      INSERT INTO bookings (
        user_id, residency_id, start_date, end_date, total_price,
        booking_type, application_id, status, payment_status, 
        stripe_payment_intent_id,
        guest_full_name, guest_email, guest_phone, 
        number_of_guests, arrival_time, artist_type
      )
      VALUES (
        ${userId || null}, ${residencyId}, ${startDate}, ${endDate}, ${finalPrice},
        ${bookingType}, ${applicationId || null}, 'pending', 'pending',
        ${stripePaymentIntentId || null},
        ${fullName}, ${email}, ${phone},
        ${parseInt(numberOfGuests) || 1}, ${arrivalTime || "14:00"}, ${bookingType === "artist" ? artistType : null}
      )
      RETURNING *
    `;

    // Store metadata description for transaction
    const metadataDescription = `Booking for ${fullName} (${email}, ${phone}) - ${numberOfGuests} guest(s)${artistType ? ` - Artist: ${artistType}` : ""}`;

    // Block calendar dates
    const calendarEntries = [];
    const current = new Date(start);
    while (current < end) {
      calendarEntries.push({
        residency_id: residencyId,
        booking_id: booking.id,
        occupied_date: current.toISOString().split("T")[0],
        is_buffer: false,
      });
      current.setDate(current.getDate() + 1);
    }

    // Insert all calendar entries
    for (const entry of calendarEntries) {
      await sql`
        INSERT INTO booking_calendar (residency_id, booking_id, occupied_date, is_buffer)
        VALUES (${entry.residency_id}, ${entry.booking_id}, ${entry.occupied_date}, ${entry.is_buffer})
        ON CONFLICT (residency_id, occupied_date) DO NOTHING
      `;
    }

    // Create transaction record with metadata
    await sql`
      INSERT INTO transactions (
        user_id, transaction_type, reference_id, amount,
        description, status
      ) VALUES (
        ${userId || null}, 'booking', ${booking.id}, ${finalPrice},
        ${metadataDescription}, 'pending'
      )
    `;

    console.log("Booking created successfully:", booking);

    // Send email notifications
    try {
      // Get residency details for email
      const residencyForEmail = residencies[0]; // We already fetched this earlier

      // Send confirmation email to guest
      const confirmationEmail = createBookingConfirmationEmail(
        booking,
        residencyForEmail,
      );

      await sendEmail({
        to: email,
        from: "bookings@ubuntuartvillage.com",
        subject: "Booking Confirmed - Ubuntu Art Village",
        html: confirmationEmail.html,
        text: confirmationEmail.text,
      });
      console.log(`Booking confirmation email sent to ${email}`);

      // Send notification email to admin
      const adminEmail =
        process.env.ADMIN_EMAIL || "admin@ubuntuartvillage.com";
      const adminNotification = createAdminBookingNotificationEmail(
        booking,
        residencyForEmail,
        email,
      );

      await sendEmail({
        to: adminEmail,
        from: "notifications@ubuntuartvillage.com",
        subject: `New ${bookingType === "artist" ? "Artist Residency" : "Guest"} Booking - #${booking.id}`,
        html: adminNotification.html,
        text: adminNotification.text,
      });
      console.log(`Admin notification email sent for booking #${booking.id}`);
    } catch (emailError) {
      // Log email error but don't fail the booking
      console.error("Failed to send booking emails:", emailError);
      // Booking is still created successfully even if emails fail
    }

    return Response.json({
      booking: {
        ...booking,
        metadata: bookingMetadata,
      },
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("POST /api/bookings error:", error);
    return Response.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status, adminApproved, reviewerNotes } = body;

    if (!id) {
      return Response.json(
        { error: "Booking ID is required" },
        { status: 400 },
      );
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (adminApproved !== undefined) updateData.admin_approved = adminApproved;

    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");

    const values = [id, ...Object.values(updateData)];

    const [updatedBooking] = await sql(
      `UPDATE bookings SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      values,
    );

    // If updating application related to this booking
    if (reviewerNotes && updatedBooking.application_id) {
      await sql`
        UPDATE applications 
        SET reviewer_notes = ${reviewerNotes}, reviewed_at = CURRENT_TIMESTAMP
        WHERE id = ${updatedBooking.application_id}
      `;
    }

    return Response.json({
      booking: updatedBooking,
      message: "Booking updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/bookings error:", error);
    return Response.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}
