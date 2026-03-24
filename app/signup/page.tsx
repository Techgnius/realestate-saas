"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
//   const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
  email,
  password,
});

if (!error && data.user) {
  // Create profile record
await supabase.from("profiles").insert([
  {
    id: data.user.id,
    full_name: email.split("@")[0],

    // 🔹 Dashboard defaults
    subscription_tier: "free",
    subscription_plan: "monthly",

    credits_total: 50,
    credits_used: 0,
  },
]);
// await supabase.from("profiles").insert([
//   { id: data.user.id, full_name: email.split("@")[0] },
// ]);
}

    if (error) setError(error.message);
    else {
      setSuccess("Check your email to confirm your account!");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-2xl shadow-md w-96"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        <input
          type="email"
          placeholder="Email"
          className="border w-full p-2 rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border w-full p-2 rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Sign Up
        </button>
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 underline">
            Log in
          </a>
        </p>
      </form>
    </main>
  );
}
