// export const runtime = "nodejs";

// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// export async function POST(req: Request) {
//   try {
//     const token = req.headers
//       .get("Authorization")
//       ?.replace("Bearer ", "");

//     const { data: userData } = await supabase.auth.getUser(token);

//     if (!userData?.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const user = userData.user;

//     const { amount, credits } = await req.json();

//     const reference = `txn_${Date.now()}`;

//     // Save payment (pending)
//     await supabase.from("payments").insert({
//       user_id: user.id,
//       amount,
//       credits,
//       reference,
//       status: "pending",
//     });

//     // Call BudPay
//     const budpayRes = await fetch(
//       "https://api.budpay.com/api/v2/transaction/initialize",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${process.env.BUDPAY_SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           amount: amount * 100, // kobo
//           email: user.email,
//           reference,
//           callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
//         }),
//       }
//     );

//     const data = await budpayRes.json();

//     return NextResponse.json({
//       checkoutUrl: data.data.authorization_url,
//     });
//   } catch (err) {
//     return NextResponse.json({ error: "Payment failed" }, { status: 500 });
//   }
// }

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAIPack } from "@/lib/aiPacks";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // ------------------------------------------
    // 1. Get authentication token
    // ------------------------------------------

    const authHeader = req.headers.get("Authorization");

    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: no token provided" },
        { status: 401 }
      );
    }

    // ------------------------------------------
    // 2. Get authenticated user
    // ------------------------------------------

    const {
      data: userData,
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      console.error("Supabase auth error:", authError);

      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    if (!userData?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = userData.user;

    // ------------------------------------------
    // 3. Get pack ID
    // ------------------------------------------

    const body = await req.json();

    const packId = body?.packId;

    console.log("Requested pack:", packId);

    if (!packId || typeof packId !== "string") {
      return NextResponse.json(
        { error: "Invalid AI pack" },
        { status: 400 }
      );
    }

    // ------------------------------------------
    // 4. Get pack from server configuration
    // ------------------------------------------

    const pack = getAIPack(packId);

    console.log("Selected pack:", pack);

    if (!pack) {
      return NextResponse.json(
        { error: "AI pack not found" },
        { status: 404 }
      );
    }

    // ------------------------------------------
    // 5. Create payment reference
    // ------------------------------------------

    const reference = `txn_${Date.now()}_${crypto
      .randomUUID()
      .slice(0, 8)}`;

    // ------------------------------------------
    // 6. Save pending payment
    // ------------------------------------------

    const { error: paymentError } =
      await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          amount: pack.price,
          credits: pack.credits,
          reference,
          status: "pending",
        });

    if (paymentError) {
      console.error(
        "Payment database error:",
        paymentError
      );

      return NextResponse.json(
        {
          error:
            "Unable to create payment record.",
        },
        { status: 500 }
      );
    }

    // ------------------------------------------
    // 7. Check BudPay key
    // ------------------------------------------

    if (!process.env.BUDPAY_SECRET_KEY) {
      console.error(
        "BUDPAY_SECRET_KEY is missing"
      );

      return NextResponse.json(
        {
          error:
            "Payment provider is not configured.",
        },
        { status: 500 }
      );
    }

    // ------------------------------------------
    // 8. Initialize BudPay
    // ------------------------------------------

    const budpayResponse = await fetch(
      "https://api.budpay.com/api/v2/transaction/initialize",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${process.env.BUDPAY_SECRET_KEY}`,

          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: user.email,

          // BudPay's current Standard docs
          // show the amount directly in NGN.
          amount: String(pack.price),

          reference,

          callback:
            `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
        }),
      }
    );

    const budpayText =
      await budpayResponse.text();

    console.log(
      "BudPay status:",
      budpayResponse.status
    );

    console.log(
      "BudPay response:",
      budpayText
    );

    // ------------------------------------------
    // 9. Parse BudPay response
    // ------------------------------------------

    let budpayData;

    try {
      budpayData = JSON.parse(budpayText);
    } catch {
      console.error(
        "BudPay returned non-JSON response"
      );

      await supabase
        .from("payments")
        .update({
          status: "failed",
        })
        .eq("reference", reference);

      return NextResponse.json(
        {
          error:
            "BudPay returned an invalid response.",
        },
        { status: 502 }
      );
    }

    // ------------------------------------------
    // 10. Handle BudPay failure
    // ------------------------------------------

    if (
      !budpayResponse.ok ||
      !budpayData?.status
    ) {
      console.error(
        "BudPay initialization failed:",
        budpayData
      );

      await supabase
        .from("payments")
        .update({
          status: "failed",
        })
        .eq("reference", reference);

      return NextResponse.json(
        {
          error:
            budpayData?.message ||
            "Unable to initialize BudPay payment.",
        },
        { status: 502 }
      );
    }

    // ------------------------------------------
    // 11. Get checkout URL
    // ------------------------------------------

    const checkoutUrl =
      budpayData?.data?.authorization_url;

    if (!checkoutUrl) {
      console.error(
        "No authorization URL:",
        budpayData
      );

      await supabase
        .from("payments")
        .update({
          status: "failed",
        })
        .eq("reference", reference);

      return NextResponse.json(
        {
          error:
            "BudPay did not return a checkout URL.",
        },
        { status: 502 }
      );
    }

    // ------------------------------------------
    // 12. Return checkout URL
    // ------------------------------------------

    return NextResponse.json({
      success: true,
      checkoutUrl,
      reference,
    });

  } catch (error) {
    console.error(
      "CREATE PAYMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Payment failed.",
      },
      { status: 500 }
    );
  }
}