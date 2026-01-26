import sql from "@/app/api/utils/sql";
import { auth } from "@/app/api/utils/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 10;

    const transactions = await sql`
      SELECT 
        id, transaction_type, reference_id, amount, 
        payment_method, status, description, created_at
      FROM transactions 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return Response.json({ transactions });
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return Response.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const {
      transaction_type,
      reference_id,
      amount,
      payment_method,
      description,
    } = body;

    if (!transaction_type || !amount || amount <= 0) {
      return Response.json(
        { error: "Missing required fields: transaction_type, amount" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO transactions (
        user_id, transaction_type, reference_id, amount,
        payment_method, description, status
      ) VALUES (
        ${userId}, ${transaction_type}, ${reference_id}, ${amount},
        ${payment_method}, ${description}, 'pending'
      ) RETURNING *
    `;

    return Response.json({ transaction: result[0] });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return Response.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}
