// export const runtime = "nodejs";

// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();

//     const { reference, status } = body.data;

//     if (status !== "success") {
//       return NextResponse.json({ received: true });
//     }

//     // Get payment
//     const { data: payment } = await supabase
//       .from("payments")
//       .select("*")
//       .eq("reference", reference)
//       .single();

//     if (!payment) return NextResponse.json({ received: true });

//     if (payment.status === "completed") {
//       return NextResponse.json({ received: true });
//     }

//     // ✅ Update credits
// // Get current profile credits
// const { data: profile, error: profileError } = await supabase
//   .from("profiles")
//   .select("credits_total")
//   .eq("id", payment.user_id)
//   .single();

// if (profileError || !profile) {
//   throw new Error("Profile not found");
// }


// // ✅ Update credits
// await supabase
//   .from("profiles")
//   .update({
//     credits_total: (profile.credits_total || 0) + payment.credits,
//   })
//   .eq("id", payment.user_id);
//   await supabase
//   .from("credit_transactions")
//   .insert({
//     user_id: payment.user_id,
//     type: "purchase",
//     credits: payment.credits,
//     description: "Credit purchase",
//     reference: payment.reference,
//   });

//     // mark payment complete
//     await supabase
//       .from("payments")
//       .update({ status: "completed" })
//       .eq("reference", reference);
      
      

//     return NextResponse.json({ received: true });
//   } catch (err) {
//     return NextResponse.json({ error: "Webhook error" }, { status: 500 });
//   }
// }



export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

export async function POST(req: Request) {
  try {
    // --------------------------------------------------
    // 1. Read webhook
    // --------------------------------------------------

    const body = await req.json();

    console.log(
      "BudPay webhook received:",
      JSON.stringify(body)
    );

    const reference =
      body?.data?.reference ||
      body?.reference;

    if (!reference) {
      console.error(
        "Webhook did not contain a reference"
      );

      return NextResponse.json(
        { received: true },
        { status: 200 }
      );
    }

    // --------------------------------------------------
    // 2. Find our internal payment
    // --------------------------------------------------

    const {
      data: payment,
      error: paymentError,
    } = await supabase
      .from("payments")
      .select(
        "id, user_id, amount, credits, reference, status"
      )
      .eq("reference", reference)
      .single();

    if (paymentError || !payment) {
      console.error(
        "Payment not found:",
        reference
      );

      /*
       * Return 200 so BudPay doesn't repeatedly
       * send a webhook for a reference that our
       * system doesn't recognize.
       */
      return NextResponse.json(
        { received: true },
        { status: 200 }
      );
    }

    // --------------------------------------------------
    // 3. Already processed?
    // --------------------------------------------------

    if (payment.status === "completed") {
      console.log(
        "Payment already completed:",
        reference
      );

      return NextResponse.json({
        received: true,
        alreadyProcessed: true,
      });
    }

    // --------------------------------------------------
    // 4. Verify transaction directly with BudPay
    // --------------------------------------------------

    if (!process.env.BUDPAY_SECRET_KEY) {
      throw new Error(
        "BUDPAY_SECRET_KEY is not configured"
      );
    }

    const verifyResponse = await fetch(
      `https://api.budpay.com/api/v2/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${process.env.BUDPAY_SECRET_KEY}`,

          "Content-Type": "application/json",
        },

        cache: "no-store",
      }
    );

    const verifyText =
      await verifyResponse.text();

    console.log(
      "BudPay verification status:",
      verifyResponse.status
    );

    console.log(
      "BudPay verification response:",
      verifyText
    );

    let verification;

    try {
      verification =
        JSON.parse(verifyText);
    } catch {
      throw new Error(
        "BudPay verification returned invalid JSON"
      );
    }

    // --------------------------------------------------
    // 5. Verify BudPay response
    // --------------------------------------------------

    if (
      !verifyResponse.ok ||
      verification?.status !== true
    ) {
      console.error(
        "BudPay transaction verification failed:",
        verification
      );

      return NextResponse.json(
        {
          received: true,
          verified: false,
        },
        { status: 200 }
      );
    }

    const transaction =
      verification?.data;

    if (!transaction) {
      throw new Error(
        "BudPay verification contained no transaction data"
      );
    }

    // --------------------------------------------------
    // 6. Verify reference
    // --------------------------------------------------

    if (
      transaction.reference !== payment.reference
    ) {
      console.error(
        "Reference mismatch",
        {
          expected: payment.reference,
          received: transaction.reference,
        }
      );

      return NextResponse.json(
        {
          received: true,
          verified: false,
        },
        { status: 200 }
      );
    }

    // --------------------------------------------------
    // 7. Verify payment status
    // --------------------------------------------------

    if (transaction.status !== "success") {
      console.log(
        "Transaction not successful:",
        transaction.status
      );

      return NextResponse.json({
        received: true,
        verified: false,
        status: transaction.status,
      });
    }

    // --------------------------------------------------
    // 8. Verify currency
    // --------------------------------------------------

    if (
      transaction.currency &&
      transaction.currency !== "NGN"
    ) {
      console.error(
        "Currency mismatch:",
        transaction.currency
      );

      return NextResponse.json(
        {
          received: true,
          verified: false,
        },
        { status: 200 }
      );
    }

    // --------------------------------------------------
    // 9. Verify amount
    // --------------------------------------------------

    /*
     * BudPay's verification response contains
     * requested_amount and amount.
     *
     * requested_amount is the original payment
     * amount, while amount can include fees.
     *
     * We care about the amount the customer was
     * actually asked to pay.
     */
    const verifiedAmount = Number(
      transaction.requested_amount ??
      transaction.amount
    );

    const expectedAmount =
      Number(payment.amount);

    if (
      !Number.isFinite(verifiedAmount) ||
      verifiedAmount !== expectedAmount
    ) {
      console.error(
        "Amount mismatch:",
        {
          expected: expectedAmount,
          received: verifiedAmount,
        }
      );

      return NextResponse.json(
        {
          received: true,
          verified: false,
        },
        { status: 200 }
      );
    }

    // --------------------------------------------------
    // 10. Atomically complete purchase
    // --------------------------------------------------

    const {
      data: result,
      error: rpcError,
    } = await supabase.rpc(
      "complete_ai_pack_purchase",
      {
        p_reference: payment.reference,
      }
    );

    if (rpcError) {
      console.error(
        "Atomic purchase error:",
        rpcError
      );

      throw new Error(
        "Failed to complete AI pack purchase"
      );
    }

    console.log(
      "AI pack purchase completed:",
      result
    );

    // --------------------------------------------------
    // 11. Done
    // --------------------------------------------------

    return NextResponse.json({
      received: true,
      verified: true,
      result,
    });

  } catch (error) {
    console.error(
      "BudPay webhook error:",
      error
    );

    /*
     * Return 500 so BudPay can retry the webhook
     * if something transient went wrong.
     */
    return NextResponse.json(
      {
        error: "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}