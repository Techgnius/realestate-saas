"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import NavBar from "@/components/NavBar";
import { AI_PACKS } from "@/lib/aiPacks";

export default function PricingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
  credits_total?: number | null;
  credits_used?: number | null;
} | null>(null);
  const [purchasingPack, setPurchasingPack] =
  useState<string | null>(null);

  useEffect(() => {
    getUserData();
  }, []);

  async function getUserData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(data);
    setLoading(false);
  }

  const handlePurchase = async (packId: string) => {
   try {
    setPurchasingPack(packId);

    // Get current Supabase session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      router.push("/login");
      return;
    }

    // const response = await fetch(
    //   "/api/create-payment",
    //   {
    //     method: "POST",

    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${session.access_token}`,
    //     },

    //     body: JSON.stringify({
    //       packId,
    //     }),
    //   }
    // );

    // const data = await response.json();

    const response = await fetch("/api/create-payment", {
   method: "POST",
   headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({
    packId,
  }),
});

const responseText = await response.text();

console.log("Payment API status:", response.status);
console.log("Payment API response:", responseText);

let data;

try {
  data = JSON.parse(responseText);
} catch {
  throw new Error(
    `Payment server returned an invalid response (${response.status}).`
  );
}

if (!response.ok) {
  throw new Error(
    data?.error || "Unable to start payment."
  );
}

if (!data.checkoutUrl) {
  throw new Error(
    "Payment checkout URL was not returned."
  );
}

window.location.href = data.checkoutUrl;

  } catch (error) {
    console.error("Purchase error:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Unable to start payment."
    );

    setPurchasingPack(null);
  }
};

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  const availableCredits =
    (profile?.credits_total || 0) - (profile?.credits_used || 0);

  const usedCredits = profile?.credits_used || 0;

  return (
    <>
      <NavBar />

      <main className="relative min-h-screen bg-gradient-to-b from-white via-[#F8FAFC] to-white overflow-hidden">

        {/* Background Glow */}
        <div className="absolute left-1/2 top-12 -translate-x-1/2 h-72 w-72 rounded-full bg-[#FF8C00]/10 blur-[120px]" />

        {/* Hero */}
        <section className="relative max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">

          <span className="inline-flex items-center rounded-full bg-[#FF8C00]/10 px-4 py-2 text-sm font-semibold text-[#FF8C00]">
            AI Packs
          </span>

          <h1 className="mt-6 text-5xl font-bold text-[#001537] leading-tight">
            Power your real estate business with
            <span className="block text-[#FF8C00]">
              professional AI-generated property listings.
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Generate listings in seconds.
            <br />
            Never run out of AI generations.
          </p>

        </section>

        {/* Credit Balance */}
        <section className="relative px-6">

          <div className="mx-auto max-w-md">

            <div className="rounded-3xl border border-[#001537]/10 bg-white p-8 shadow-xl">

              <div className="flex items-center gap-5">

                <div className="rounded-2xl bg-[#001537] p-4">
                  <Sparkles className="h-7 w-7 text-[#FF8C00]" />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Current Balance
                  </p>

                  <h2 className="text-3xl font-bold text-[#001537]">
                    {availableCredits} AI Generations
                  </h2>
                </div>

              </div>

              <div className="my-6 h-px bg-gray-200" />

              <p className="text-gray-500">
                You&apos;ve used{" "}
                <span className="font-semibold text-[#001537]">
                  {usedCredits}
                </span>{" "}
                {usedCredits === 1 ? "generation" : "generations"}.
              </p>

            </div>

          </div>

        </section>

        {/* Pricing Placeholder */}
<section className="mt-24 pb-24">

  <div className="text-center">

    <h2 className="text-4xl font-bold text-[#001537]">
      Choose an AI Pack
    </h2>

    <p className="mt-4 text-gray-500">
      Purchase AI generations anytime.
      <br />
      No subscriptions. No hidden fees.
    </p>

  </div>

  <div className="mt-16 grid gap-8 md:grid-cols-3">

    {AI_PACKS.map((pack) => (

      <div
        key={pack.id}
        className={`relative rounded-3xl border bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
          pack.popular
            ? "border-[#FF8C00] shadow-xl scale-105"
            : "border-gray-200"
        }`}
      >

        {pack.popular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#FF8C00] px-4 py-2 text-sm font-semibold text-white">
            MOST POPULAR
          </div>
        )}

        <h3 className="mt-4 text-2xl font-bold text-[#001537]">
          {pack.name}
        </h3>

        <p className="mt-2 text-gray-500">
          {pack.description}
        </p>

        <div className="mt-8">

          <p className="text-5xl font-bold text-[#001537]">
            {pack.credits}
          </p>

          <p className="text-lg text-gray-500">
            AI Generations
          </p>

        </div>

        <div className="mt-8">

          <h4 className="text-3xl font-bold text-[#001537]">
            {pack.price}
          </h4>

          {pack.badge && (
            <span className="mt-3 inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              {pack.badge}
            </span>
          )}

        </div>

<button
  onClick={() => handlePurchase(pack.id)}
  disabled={purchasingPack === pack.id}
  className={`mt-10 w-full rounded-xl py-4 font-semibold transition ${
    pack.popular
      ? "bg-[#FF8C00] text-white hover:bg-[#e67d00]"
      : "border border-[#001537] text-[#001537] hover:bg-[#001537] hover:text-white"
  } ${
    purchasingPack === pack.id
      ? "cursor-not-allowed opacity-60"
      : ""
  }`}
>
  {purchasingPack === pack.id
    ? "Redirecting..."
    : "Buy AI Pack"}
</button>

      </div>

    ))}

  </div>

</section>

      </main>
    </>
  );
}