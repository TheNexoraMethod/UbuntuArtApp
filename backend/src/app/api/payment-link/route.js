import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Discount percentage applied to active members
const MEMBER_DISCOUNT = 0.1; // 10%

// Category → human-readable note for the payment description
const CATEGORY_LABELS = {
  food: "Food & dining",
  drinks: "Drinks",
  services: "Services",
  other: "Payment",
};

/**
 * POST /api/payment-link
 * Body: { amount: number, category: string, provider: "monzo" | "wise" }
 * Auth: Bearer <supabase-jwt>  (optional — used to check membership for discount)
 *
 * Returns: { paymentUrl, amount, originalAmount, discountApplied }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, category = "other", provider = "monzo" } = body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return Response.json(
        { error: "A valid positive amount is required" },
        { status: 400 },
      );
    }

    const originalAmount = parseFloat(parseFloat(amount).toFixed(2));
    let finalAmount = originalAmount;
    let discountApplied = false;

    // --- Membership discount check ---
    // Read the Supabase JWT from the Authorization header.
    // If the user has an active membership record we apply a 10% discount.
    const authHeader = request.headers.get("authorization") ?? "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (jwt) {
      try {
        const { data: userData } = await supabaseAdmin.auth.getUser(jwt);
        const userId = userData?.user?.id;

        if (userId) {
          // Check membership table (if it exists) or user_metadata flag.
          // For now we check a `memberships` table; if it doesn't exist yet
          // the query simply returns 0 rows (no discount applied).
          const { data: membership } = await supabaseAdmin
            .from("memberships")
            .select("status")
            .eq("user_id", userId)
            .eq("status", "active")
            .maybeSingle();

          if (membership) {
            finalAmount = parseFloat(
              (originalAmount * (1 - MEMBER_DISCOUNT)).toFixed(2),
            );
            discountApplied = true;
          }
        }
      } catch {
        // Token verification failures are non-fatal; just skip the discount
      }
    }

    // --- Build payment URL ---
    const note = encodeURIComponent(
      CATEGORY_LABELS[category] ?? "Payment at Ubuntu Art Village",
    );

    let paymentUrl;

    if (provider === "wise") {
      const wiseHandle = process.env.WISE_HANDLE;
      if (!wiseHandle) {
        return Response.json(
          { error: "Wise payments are not configured on this server" },
          { status: 503 },
        );
      }
      // Wise pay link with pre-filled amount
      paymentUrl = `https://wise.com/pay/r/${wiseHandle}?amount=${finalAmount}&sourceCurrency=USD&description=${note}`;
    } else {
      // Default: Monzo
      const monzoHandle = process.env.MONZO_HANDLE;
      if (!monzoHandle) {
        return Response.json(
          { error: "Monzo payments are not configured on this server" },
          { status: 503 },
        );
      }
      paymentUrl = `https://monzo.me/${monzoHandle}`;
    }

    return Response.json({
      paymentUrl,
      amount: finalAmount,
      originalAmount,
      discountApplied,
      provider,
    });
  } catch (error) {
    console.error("Payment-link error:", error);
    return Response.json(
      { error: "Failed to generate payment link", details: error.message },
      { status: 500 },
    );
  }
}
