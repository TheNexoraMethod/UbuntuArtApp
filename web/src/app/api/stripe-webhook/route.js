import sql from "@/app/api/utils/sql";
import { sendEmail } from "@/app/api/utils/send-email";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    // Verify webhook signature
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    if (endpointSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return Response.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else {
      // For development without webhook secret
      event = JSON.parse(body);
    }

    console.log("Stripe webhook event:", event.type);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session) {
  try {
    console.log("Processing completed checkout session:", session.id);

    const metadata = session.metadata;

    // Handle membership subscription
    if (metadata.membership_type) {
      await handleMembershipSubscription(session);
      return;
    }

    // Handle booking payment
    if (metadata.userId && metadata.residencyId) {
      await handleBookingPayment(session);
    }
  } catch (error) {
    console.error("Error handling checkout session completed:", error);
  }
}

async function handleBookingPayment(session) {
  try {
    const metadata = session.metadata;
    const userId = metadata.userId;
    const residencyId = metadata.residencyId;
    const startDate = metadata.startDate;
    const endDate = metadata.endDate;
    const stayDuration = metadata.stayDuration;
    const hasExtraGuest = metadata.hasExtraGuest === "true";
    const bookingType = metadata.bookingType;
    const applicationId = metadata.applicationId || null;
    const totalPrice = parseFloat(metadata.totalPrice);
    const extraGuestNights = parseInt(metadata.extraGuestNights || "0");
    const extraGuestCost = parseFloat(metadata.extraGuestCost || "0");

    // Create the booking record
    const [booking] = await sql`
      INSERT INTO bookings (
        user_id, residency_id, start_date, end_date, total_price,
        stay_duration, has_extra_guest, extra_guest_nights, extra_guest_cost,
        booking_type, application_id, status, payment_status, stripe_payment_intent_id
      )
      VALUES (
        ${userId}, ${residencyId}, ${startDate}, ${endDate}, ${totalPrice},
        ${stayDuration}, ${hasExtraGuest}, ${extraGuestNights}, ${extraGuestCost},
        ${bookingType}, ${applicationId}, 'confirmed', 'completed', ${session.payment_intent}
      )
      RETURNING *
    `;

    // Block calendar dates with buffer
    const bufferSettings = await sql`
      SELECT setting_key, setting_value 
      FROM admin_settings 
      WHERE setting_key IN ('buffer_days_before', 'buffer_days_after')
    `;

    const bufferBefore = parseInt(
      bufferSettings.find((s) => s.setting_key === "buffer_days_before")
        ?.setting_value || "1",
    );
    const bufferAfter = parseInt(
      bufferSettings.find((s) => s.setting_key === "buffer_days_after")
        ?.setting_value || "1",
    );

    // Block calendar dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const calendarEntries = [];

    // Add buffer days before
    for (let i = bufferBefore; i > 0; i--) {
      const bufferDate = new Date(start);
      bufferDate.setDate(start.getDate() - i);
      calendarEntries.push({
        residency_id: residencyId,
        booking_id: booking.id,
        occupied_date: bufferDate.toISOString().split("T")[0],
        is_buffer: true,
      });
    }

    // Add actual booking dates
    const current = new Date(start);
    while (current <= end) {
      calendarEntries.push({
        residency_id: residencyId,
        booking_id: booking.id,
        occupied_date: current.toISOString().split("T")[0],
        is_buffer: false,
      });
      current.setDate(current.getDate() + 1);
    }

    // Add buffer days after
    for (let i = 1; i <= bufferAfter; i++) {
      const bufferDate = new Date(end);
      bufferDate.setDate(end.getDate() + i);
      calendarEntries.push({
        residency_id: residencyId,
        booking_id: booking.id,
        occupied_date: bufferDate.toISOString().split("T")[0],
        is_buffer: true,
      });
    }

    // Insert all calendar entries
    for (const entry of calendarEntries) {
      await sql`
        INSERT INTO booking_calendar (residency_id, booking_id, occupied_date, is_buffer)
        VALUES (${entry.residency_id}, ${entry.booking_id}, ${entry.occupied_date}, ${entry.is_buffer})
        ON CONFLICT (residency_id, occupied_date) DO NOTHING
      `;
    }

    // Create transaction record
    await sql`
      INSERT INTO transactions (
        user_id, transaction_type, reference_id, amount,
        payment_method, description, status
      ) VALUES (
        ${userId}, 'booking', ${booking.id}, ${totalPrice},
        'stripe', 'Residency booking payment', 'completed'
      )
    `;

    // Send confirmation email
    await sendBookingConfirmationEmail(booking, session);

    console.log(`Booking created successfully: ${booking.id}`);
  } catch (error) {
    console.error("Error creating booking from payment:", error);
  }
}

async function sendBookingConfirmationEmail(booking, session) {
  try {
    // Get user and residency details
    const [userDetails] = await sql`
      SELECT u.name, u.email, r.title as residency_title, r.room_type
      FROM auth_users u
      LEFT JOIN residencies r ON r.id = ${booking.residency_id}
      WHERE u.id = ${booking.user_id}
    `;

    if (!userDetails) return;

    // Get cancellation policy
    const cancellationPolicy = await sql`
      SELECT setting_value FROM admin_settings 
      WHERE setting_key = 'cancellation_policy'
      LIMIT 1
    `;

    const extraGuestText = booking.has_extra_guest
      ? `Extra Guest: Yes (${booking.extra_guest_nights} nights - $${booking.extra_guest_cost})`
      : "Extra Guest: No";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Confirmed - Ubuntu Art Village</title>
        </head>
        <body style="font-family: Inter, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #F0F9F4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 600;">Ubuntu Art Village</h1>
              <p style="color: #E5F7EC; margin: 8px 0 0 0; font-size: 16px;">Booking Confirmation</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #166534; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Your Booking is Confirmed! 🎉</h2>
              
              <p style="margin: 0 0 20px 0; font-size: 16px;">
                Hello ${userDetails.name},
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px;">
                Thank you for booking with Ubuntu Art Village! Your payment has been processed and your residency is confirmed.
              </p>

              <!-- Booking Details -->
              <div style="background-color: #F0F9F4; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="color: #166534; margin: 0 0 16px 0; font-size: 18px;">Booking Details</h3>
                <div style="display: grid; gap: 8px;">
                  <p style="margin: 0;"><strong>Booking ID:</strong> #${booking.id}</p>
                  <p style="margin: 0;"><strong>Room:</strong> ${userDetails.residency_title}</p>
                  <p style="margin: 0;"><strong>Room Type:</strong> ${userDetails.room_type}</p>
                  <p style="margin: 0;"><strong>Check-in:</strong> ${booking.start_date}</p>
                  <p style="margin: 0;"><strong>Check-out:</strong> ${booking.end_date}</p>
                  <p style="margin: 0;"><strong>Stay Duration:</strong> ${booking.stay_duration.replace("_", " ")}</p>
                  <p style="margin: 0;"><strong>${extraGuestText}</strong></p>
                  <p style="margin: 0;"><strong>Total Amount:</strong> $${booking.total_price}</p>
                  <p style="margin: 0;"><strong>Payment Status:</strong> ✅ Paid</p>
                </div>
              </div>

              <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <h4 style="color: #92400E; margin: 0 0 8px 0;">What's Next?</h4>
                <ul style="margin: 0; color: #92400E; padding-left: 20px;">
                  <li>We'll send you a check-in guide 24 hours before your arrival</li>
                  <li>For artist residencies, your application will be reviewed by our team</li>
                  <li>Contact us if you have any questions: support@ubuntuartvillage.com</li>
                </ul>
              </div>

              <div style="border-left: 4px solid #F59E0B; background-color: #FEF3C7; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #92400E;">
                  <strong>Cancellation Policy:</strong><br>
                  ${cancellationPolicy[0]?.setting_value || "Please contact us for cancellation policies."}
                </p>
              </div>

              <p style="margin: 20px 0 0 0; font-size: 14px; color: #6B7280;">
                We're excited to welcome you to Ubuntu Art Village!<br>
                For questions, contact us at support@ubuntuartvillage.com
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #F9FAFB; padding: 20px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                © 2024 Ubuntu Art Village. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: userDetails.email,
      from: "bookings@ubuntuartvillage.com",
      subject: `Booking Confirmed - Ubuntu Art Village (#${booking.id})`,
      html: emailHtml,
      text: `Your Ubuntu Art Village booking is confirmed! Booking ID: #${booking.id}. Check-in: ${booking.start_date}, Check-out: ${booking.end_date}. Total: $${booking.total_price}.`,
    });

    console.log(`Confirmation email sent to ${userDetails.email}`);
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
  }
}

async function handleMembershipSubscription(session) {
  try {
    const userId = session.metadata.user_id;

    // Update user membership status
    await sql`
      UPDATE auth_users 
      SET membership_status = 'active',
          subscription_status = 'active',
          last_check_subscription_status_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;

    console.log(`Membership activated for user ${userId}`);
  } catch (error) {
    console.error("Error handling membership subscription:", error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log("Payment succeeded:", paymentIntent.id);
}

async function handlePaymentIntentFailed(paymentIntent) {
  console.log("Payment failed:", paymentIntent.id);

  // Here you could send an email to the customer about the failed payment
  // or update any relevant booking status
}
