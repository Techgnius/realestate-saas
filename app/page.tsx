"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-800">
        Welcome to RealEstate SaaS
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Manage, list, and analyze properties effortlessly — powered by AI.
      </p>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Log In
        </Link>
        <Link
          href="/signup"
          className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
