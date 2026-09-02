"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AddPropertyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateDescription = async () => {
    try {
      setGenerating(true);
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.description) {
        setFormData({ ...formData, description: data.description });
      } else {
        setMessage("Failed to generate description.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error generating description.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { error } = await supabase.from("properties").insert([
        {
          owner_id: user.id,
          ...formData,
          price: Number(formData.price),
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
        },
      ]);

      if (error) throw error;
      setMessage("Property added successfully!");
      router.push("/properties");
    } catch {
      setMessage("Error saving property.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Add Property</h1>

        {["title", "location", "price", "bedrooms", "bathrooms"].map((field) => (
          <div key={field} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {field}
            </label>
            <input
              type={field === "price" || field === "bedrooms" || field === "bathrooms" ? "number" : "text"}
              name={field}
              value={formData[field as keyof typeof formData]}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              placeholder={`Enter ${field}`}
            />
          </div>
        ))}
        

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            rows={4}
            placeholder="Enter or generate a description"
          />
        </div>

        <button
          onClick={generateDescription}
          disabled={generating}
          className="w-full mb-3 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
        >
          {generating ? "Generating..." : "✨ Generate with AI"}
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Save Property"}
        </button>

        {message && <p className="text-sm text-center text-green-600 mt-3">{message}</p>}

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full mt-4 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100"
        >
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}
