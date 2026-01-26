import sql from "@/app/api/utils/sql";
import { auth } from "@/app/api/utils/auth";

export async function POST(request) {
  try {
    const { amount, category, provider } = await request.json();

    if (!amount || amount <= 0) {
      return Response.json(
        { error: "Valid amount is required" },
        { status: 400 },
      );
    }

    if (!category) {
      return Response.json(
        { error: "Payment category is required" },
        { status: 400 },
      );
    }

    if (!provider || !["monzo", "wise"].includes(provider)) {
      return Response.json(
        { error: "Valid payment provider is required" },
        { status: 400 },
      );
    }

    // Check if user has active membership for discount
    let finalAmount = parseFloat(amount);
    let discountApplied = false;

    try {
      const session = await auth();
      if (session?.user?.id) {
        const userCheck = await sql`
          SELECT membership_status, subscription_status 
          FROM auth_users 
          WHERE id = ${session.user.id} 
          LIMIT 1
        `;

        if (userCheck.length > 0) {
          const user = userCheck[0];
          const hasActiveMembership =
            user.membership_status === "active" ||
            user.subscription_status === "active";

          if (hasActiveMembership) {
            finalAmount = finalAmount * 0.9; // Apply 10% discount
            discountApplied = true;
            console.log(
              `✅ Applied 10% member discount to payment. Original: $${amount}, Discounted: $${finalAmount.toFixed(2)}`,
            );
          }
        }
      }
    } catch (authError) {
      console.log("No session found, proceeding without discount");
    }

    let paymentUrl;

    if (provider === "monzo") {
      // Monzo format: https://monzo.me/robiabrown/AMOUNT
      paymentUrl = `https://monzo.me/robiabrown/${finalAmount.toFixed(2)}`;
    } else if (provider === "wise") {
      // Wise format: https://wise.com/pay/me/robiab
      // Note: Wise may require users to enter amount on their page
      paymentUrl = `https://wise.com/pay/me/robiab`;
    }

    return Response.json({
      success: true,
      paymentUrl,
      amount: finalAmount.toFixed(2),
      originalAmount: parseFloat(amount).toFixed(2),
      discountApplied,
      category,
      provider,
    });
  } catch (error) {
    console.error("Error generating payment link:", error);
    return Response.json(
      { error: "Failed to generate payment link" },
      { status: 500 },
    );
  }
}
