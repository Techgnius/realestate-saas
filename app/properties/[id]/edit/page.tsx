"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .eq("owner_id", user.id)
        .single();

      if (error) {
        console.error("Error loading property:", error);
        setMessage("Could not load property details.");
      } else {
        setProperty(data);
        setTitle(data.title);
        setDescription(data.description);
        setPrice(data.price);
        setLocation(data.location);
        setImages(data.images || []);
      }
    };

    if (propertyId) fetchProperty();
  }, [propertyId, router]);

  // Upload property image
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file || !user) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("property-images")
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        setImages((prev) => [...prev, data.publicUrl]);
        setMessage("Image uploaded successfully!");
      }
    } catch (error: any) {
      console.error("Upload failed:", error);
      setMessage("Error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  // Delete image
  const handleRemoveImage = (url: string) => {
    if (confirm("Remove this image?")) {
      setImages((prev) => prev.filter((img) => img !== url));
    }
  };

  // Save changes
  const handleSave = async () => {
    const { error } = await supabase
      .from("properties")
      .update({
        title,
        description,
        price,
        location,
        images,
      })
      .eq("id", propertyId)
      .eq("owner_id", user.id);

    if (error) {
      console.error("Error updating property:", error);
      setMessage("Error saving changes.");
    } else {
      setMessage("Property updated successfully!");
      setTimeout(() => router.push("/properties"), 1200);
    }
  };

  if (!property) {
    return (
      <main className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading property details...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Property</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg p-2"
            rows={4}
          ></textarea>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price ($)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Images</label>

          <div className="grid grid-cols-3 gap-3 mb-3">
            {images.map((url, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={url}
                  alt={`Property image ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveImage(url)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <label className="cursor-pointer text-blue-600 text-sm hover:underline">
            {uploading ? "Uploading..." : "Add Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {message && (
          <p className="text-center text-sm text-green-600 mb-3">{message}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>

          <button
            onClick={() => router.push("/properties")}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}
