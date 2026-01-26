import sql from "@/app/api/utils/sql";
import { auth } from "@/app/api/utils/auth";
import Stripe from "stripe";

export const POST = async (request) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({
        status: "unauthenticated",
        message: "User not logged in",
      });
    }

    const userId = session.user.id;

    const [user] = await sql`
      SELECT subscription_status, stripe_id, last_check_subscription_status_at, membership_tier
      FROM auth_users 
      WHERE id = ${userId}
    `;

    if (!user) {
      return Response.json({
        status: "not_found",
        message: "User not found",
      });
    }

    const {
      subscription_status,
      stripe_id,
      last_check_subscription_status_at,
      membership_tier,
    } = user;

    // If we have a stripe ID but no status, or status is stale (>1 hour), check with Stripe
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isStatusStale =
      !last_check_subscription_status_at ||
      new Date(last_check_subscription_status_at) < oneHourAgo;

    if (stripe_id && (!subscription_status || isStatusStale)) {
      try {
        const customer = await stripe.customers.retrieve(stripe_id, {
          expand: ["subscriptions"],
        });

        let latestStatus = "none";
        let latestTier = membership_tier;

        if (customer?.subscriptions?.data?.length > 0) {
          const subscription = customer.subscriptions.data[0];
          latestStatus = subscription.status;

          // Extract tier from subscription metadata or product name
          if (subscription.items?.data?.[0]?.price?.product) {
            const product = await stripe.products.retrieve(
              subscription.items.data[0].price.product,
            );
            if (product.name.includes("Premium")) latestTier = "Premium";
            else if (product.name.includes("Elite")) latestTier = "Elite";
            else latestTier = "Artist";
          }
        }

        // Update our database with latest status from Stripe
        await sql`
          UPDATE auth_users 
          SET 
            subscription_status = ${latestStatus}, 
            membership_status = ${latestStatus === "active" ? "active" : "inactive"},
            membership_tier = ${latestTier},
            last_check_subscription_status_at = NOW()
          WHERE id = ${userId}
        `;

        return Response.json({
          status: latestStatus,
          tier: latestTier,
          stripeId: stripe_id,
        });
      } catch (error) {
        console.error("Error fetching from Stripe:", error);
        // Fall back to database status if Stripe call fails
      }
    }

    return Response.json({
      status: subscription_status || "none",
      tier: membership_tier || "Artist",
      stripeId: stripe_id,
    });
  } catch (error) {
    console.error("POST /api/get-subscription-status error:", error);
    return Response.json(
      { error: "Failed to check subscription status" },
      { status: 500 },
    );
  }
};
