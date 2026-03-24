"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X } from "lucide-react";

export default function AddPropertyModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const uploadedImageUrls: string[] = [];

      for (const file of images) {
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        await supabase.storage.from("property-images").upload(filePath, file);
        const { data } = supabase.storage
          .from("property-images")
          .getPublicUrl(filePath);

        if (data?.publicUrl) uploadedImageUrls.push(data.publicUrl);
      }

      await supabase.from("properties").insert([
        {
          owner_id: user.id,
          title,
          description,
          price: Number(price),
          location,
          images: uploadedImageUrls,
        },
      ]);

      setMessage("✅ Property added!");
      onSuccess();
      onClose();
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          Add New Property
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="w-full border rounded-lg p-2"
            rows={3}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="number"
            className="w-full border rounded-lg p-2"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <input
            className="w-full border rounded-lg p-2"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
          />

          {message && (
            <p className="text-sm text-green-600 text-center">{message}</p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-[#FF8C00] text-white py-2 rounded-lg hover:bg-[#e67c00]"
          >
            {uploading ? "Uploading..." : "Add Property"}
          </button>
        </form>
      </div>
    </div>
  );
}
