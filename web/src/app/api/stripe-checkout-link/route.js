import sql from "@/app/api/utils/sql";
import Stripe from "stripe";

export const POST = async (request) => {
  try {
    const body = await request.json();
    const {
      bookingData,
      userId,
      userEmail,
      successUrl,
      cancelUrl,
      subscriptionMode = false,
    } = body;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Handle existing membership subscription functionality
    if (subscriptionMode) {
      const { redirectURL } = body;
      const email = userEmail;

      // Ubuntu Art Village membership pricing - 50,000 TZS per month
      const priceData = {
        currency: "tzs",
        product_data: {
          name: "Ubuntu Art Village Membership",
          description:
            "10% discount on drinks, food & rooms, Free special events, Free Wi-Fi, Artist residency deals",
        },
        recurring: { interval: "month" },
        unit_amount: 5000000, // 50,000 TZS (in smallest currency unit - cents)
      };

      // Get or create Stripe customer
      const [user] = await sql`
        SELECT stripe_id FROM auth_users 
        WHERE id = ${userId}
      `;

      let stripeCustomerId = user?.stripe_id;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email,
          metadata: {
            user_id: userId.toString(),
            membership_type: "Ubuntu Art Village",
          },
        });
        stripeCustomerId = customer.id;

        await sql`
          UPDATE auth_users 
          SET stripe_id = ${stripeCustomerId}
          WHERE id = ${userId}
        `;
      }

      // Create checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: priceData,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${redirectURL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: redirectURL,
        metadata: {
          user_id: userId.toString(),
          membership_type: "Ubuntu Art Village",
        },
      });

      return Response.json({ url: checkoutSession.url });
    }

    // New booking functionality
    if (!bookingData || !userId || !userEmail) {
      return Response.json(
        { error: "Missing required booking information" },
        { status: 400 },
      );
    }

    // Get residency information for accurate pricing
    const residencies = await sql`
      SELECT * FROM residencies 
      WHERE id = ${bookingData.residencyId} 
      LIMIT 1
    `;

    if (residencies.length === 0) {
      return Response.json({ error: "Residency not found" }, { status: 404 });
    }

    const residency = residencies[0];
    const pricingConfig = residency.pricing_config || {};

    // Updated monthly pricing for 1-6 months based on room type
    const basePricing = {
      "1_month": pricingConfig["1_month"] || 150,
      "2_months": pricingConfig["2_months"] || 300,
      "3_months": pricingConfig["3_months"] || 450,
      "4_months": pricingConfig["4_months"] || 600,
      "5_months": pricingConfig["5_months"] || 750,
      "6_months": pricingConfig["6_months"] || 900,
    };

    const extraGuestPerNight = pricingConfig["extra_guest_per_night"] || 20;
    let basePrice = basePricing[bookingData.stayDuration] || 0;

    // Calculate extra guest cost
    let extraGuestCost = 0;
    let extraGuestNights = 0;

    if (bookingData.hasExtraGuest) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      extraGuestNights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      extraGuestCost = extraGuestNights * extraGuestPerNight;
    }

    const totalPrice = basePrice + extraGuestCost;

    // Create line items
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${residency.title} - ${bookingData.stayDuration.replace("_", " ")}`,
            description: `Artist Residency Booking from ${bookingData.startDate} to ${bookingData.endDate}`,
            images: residency.image_url ? [residency.image_url] : [],
          },
          unit_amount: Math.round(basePrice * 100),
        },
        quantity: 1,
      },
    ];

    // Add extra guest as separate line item if applicable
    if (bookingData.hasExtraGuest && extraGuestCost > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `Extra Guest (${extraGuestNights} nights)`,
            description:
              "Additional guest sharing the same room - includes breakfast",
          },
          unit_amount: Math.round(extraGuestPerNight * 100),
        },
        quantity: extraGuestNights,
      });
    }

    // Get cancellation policy
    const cancellationPolicy = await sql`
      SELECT setting_value FROM admin_settings 
      WHERE setting_key = 'cancellation_policy'
      LIMIT 1
    `;

    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      line_items: lineItems,
      mode: "payment",
      success_url:
        successUrl ||
        `${process.env.APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.APP_URL}/booking`,
      metadata: {
        userId,
        residencyId: bookingData.residencyId,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        stayDuration: bookingData.stayDuration,
        hasExtraGuest: bookingData.hasExtraGuest.toString(),
        bookingType: bookingData.bookingType || "guest",
        applicationId: bookingData.applicationId || "",
        totalPrice: totalPrice.toString(),
        extraGuestNights: extraGuestNights.toString(),
        extraGuestCost: extraGuestCost.toString(),
      },
      payment_intent_data: {
        description: `Ubuntu Art Village - ${residency.title} Residency`,
        metadata: {
          bookingType: bookingData.bookingType || "guest",
          residencyTitle: residency.title,
          roomType: residency.room_type,
        },
      },
      invoice_creation: {
        enabled: true,
      },
      automatic_tax: {
        enabled: false,
      },
      custom_text: {
        submit: {
          message:
            cancellationPolicy[0]?.setting_value ||
            "By completing this purchase, you agree to our cancellation policy.",
        },
      },
    });

    console.log("Stripe checkout session created:", session.id);

    return Response.json({
      sessionId: session.id,
      url: session.url,
      totalPrice,
      basePrice,
      extraGuestCost,
      extraGuestNights,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    // Check if it's a Stripe API key issue
    if (error.message && error.message.includes("No API key provided")) {
      return Response.json(
        {
          error:
            "Payment system not configured. Please add your Stripe API keys.",
          details: "STRIPE_SECRET_KEY environment variable is missing",
        },
        { status: 500 },
      );
    }

    return Response.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
};
