// "use client";

// import { useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { X } from "lucide-react";

// export default function AddPropertyModal({
//   isOpen,
//   onClose,
//   onSuccess,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
// }) {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState("");
//   const [location, setLocation] = useState("");
//   const [images, setImages] = useState<File[]>([]);
//   const [uploading, setUploading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [bedrooms, setBedrooms] = useState("");
// const [bathrooms, setBathrooms] = useState("");
// const [generating, setGenerating] = useState(false);

//   if (!isOpen) return null;


//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) setImages(Array.from(e.target.files));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setUploading(true);
//     setMessage("");

//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return;

//     try {
//       const uploadedImageUrls: string[] = [];

//       for (const file of images) {
//         const filePath = `${user.id}/${Date.now()}-${file.name}`;
//         await supabase.storage.from("property-images").upload(filePath, file);
//         const { data } = supabase.storage
//           .from("property-images")
//           .getPublicUrl(filePath);

//         if (data?.publicUrl) uploadedImageUrls.push(data.publicUrl);
//       }

//       await supabase.from("properties").insert([
//         {
//           owner_id: user.id,
//           title,
//           description,
//           price: Number(price),
//           location,
//           images: uploadedImageUrls,
//         },
//       ]);

//       setMessage("✅ Property added!");
//       onSuccess();
//       onClose();
//     } catch {
//       setMessage("Something went wrong.");
//     } finally {
//       setUploading(false);
//     }
//   };
//   const generateDescription = async () => {
//   try {
//     setGenerating(true);

//     const res = await fetch("/api/generate-description", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         title,
//         location,
//         bedrooms,
//         bathrooms,
//         price,
//       }),
//     });

//     const data = await res.json();

//     if (data.description) {
//       setDescription(data.description);
//     } else {
//       setMessage("Failed to generate description.");
//     }
//   } catch (err) {
//     setMessage("Error generating description.");
//   } finally {
//     setGenerating(false);
//   }
// };

//   const canGenerate = title && location && price;


//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
//       <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//         >
//           <X />
//         </button>

//         <h2 className="text-2xl font-bold mb-6 text-center">
//           Add New Property
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             className="w-full border rounded-lg p-2"
//             placeholder="Title"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             required
//           />
//           <div className="flex gap-4">
//   <input
//     type="number"
//     placeholder="Bedrooms"
//     value={bedrooms}
//     onChange={(e) => setBedrooms(e.target.value)}
//     className="w-full border rounded-lg p-2"
//   />
//   <input
//     type="number"
//     placeholder="Bathrooms"
//     value={bathrooms}
//     onChange={(e) => setBathrooms(e.target.value)}
//     className="w-full border rounded-lg p-2"
//   />
// </div>
// <button
//   type="button"
//   onClick={generateDescription}
//   disabled={!canGenerate || generating}
//   className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
// >
//   {generating ? "Generating magic..." : "✨ Generate Description"}
//   {generating && (
//   <p className="text-sm text-purple-600 mt-2">
//     Creating a compelling description...
//   </p>
// )}
// </button>
// {description && (
//   <button
//     type="button"
//     onClick={() => navigator.clipboard.writeText(description)}
//     className="text-sm text-blue-600 hover:underline"
//   >
//     Copy Description
//   </button>
// )}
// {description && (
//   <button
//     type="button"
//     onClick={generateDescription}
//     className="text-sm text-purple-600 hover:underline"
//   >
//     🔄 Regenerate
//   </button>
// )}

//           <textarea
//             className="w-full border rounded-lg p-2"
//             rows={3}
//             placeholder="Description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//           />

//           <input
//             type="number"
//             className="w-full border rounded-lg p-2"
//             placeholder="Price"
//             value={price}
//             onChange={(e) => setPrice(e.target.value)}
//             required
//           />

//           <input
//             className="w-full border rounded-lg p-2"
//             placeholder="Location"
//             value={location}
//             onChange={(e) => setLocation(e.target.value)}
//             required
//           />

// <div>
//   <label className="block text-sm font-medium mb-2">
//     Upload Images
//   </label>

//   <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#FF8C00] transition">
//     <input
//       type="file"
//       multiple
//       accept="image/*"
//       onChange={handleImageUpload}
//       className="hidden"
//       id="imageUpload"
//     />

//     <label htmlFor="imageUpload" className="cursor-pointer">
//       <p className="text-gray-600">
//         Click to upload or drag and drop images
//       </p>
//       <p className="text-sm text-gray-400 mt-1">
//         PNG, JPG up to 5MB
//       </p>
//     </label>
//   </div>

//   {/* Preview */}
//   {images.length > 0 && (
//     <div className="grid grid-cols-3 gap-3 mt-4">
//       {images.map((file, index) => (
//         <div key={index} className="relative">
//           <img
//             src={URL.createObjectURL(file)}
//             alt="preview"
//             className="w-full h-24 object-cover rounded-lg"
//           />
//         </div>
//       ))}
//     </div>
//   )}
// </div>

//           <button
//             type="submit"
//             disabled={uploading}
//             className="w-full bg-[#FF8C00] text-white py-2 rounded-lg hover:bg-[#e67c00]"
//           >
//             {uploading ? "Uploading..." : "Add Property"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

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
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [generating, setGenerating] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  if (!isOpen) return null;

  const canGenerate = title && location && price;

  // 📸 Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages(Array.from(e.target.files));
  };

  // 🏠 Submit Property
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const uploadedImageUrls: string[] = [];

      await Promise.all(
        images.map(async (file) => {
          const filePath = `${user.id}/${Date.now()}-${file.name}`;
          await supabase.storage.from("property-images").upload(filePath, file);

          const { data } = supabase.storage
            .from("property-images")
            .getPublicUrl(filePath);

          if (data?.publicUrl) uploadedImageUrls.push(data.publicUrl);
        })
      );

      await supabase.from("properties").insert([
        {
          user_id: user.id, // ✅ fixed
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

  // ✨ Generate AI Description
const generateDescription = async () => {
  try {
    setGenerating(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch("/api/generate-description", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        title,
        location,
        bedrooms,
        bathrooms,
        price,
      }),
    });

    const data = await res.json();

    if (data.error) {
      setMessage(data.error);
      return;
    }

    setDescription(data.description);
    setCredits(data.creditsRemaining);
    console.log("Remaining credits:", data.creditsRemaining);

  } catch {
    setMessage("Error generating description.");
  } finally {
    setGenerating(false);
  }
};

const noCredits = credits === 0;

  // const generateDescription = async () => {
  //   try {
  //     setGenerating(true);

  //     const res = await fetch("/api/generate-description", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         title,
  //         location,
  //         bedrooms,
  //         bathrooms,
  //         price,
  //       }),
  //     });

  //     const data = await res.json();

  //     if (data.description) {
  //       setDescription(data.description);

  //       // optional scroll into view
  //       setTimeout(() => {
  //         document
  //           .getElementById("ai-result")
  //           ?.scrollIntoView({ behavior: "smooth" });
  //       }, 100);
  //     } else {
  //       setMessage("Failed to generate description.");
  //     }
  //   } catch {
  //     setMessage("Error generating description.");
  //   } finally {
  //     setGenerating(false);
  //   }
  // };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative">
        {/* ❌ Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          Add New Property
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 📝 Inputs */}
          <input
            className="w-full border rounded-lg p-2"
            placeholder="Property Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Bedrooms"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
            <input
              type="number"
              placeholder="Bathrooms"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <input
            type="number"
            className="w-full border rounded-lg p-2"
            placeholder="Price (₦)"
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

          {/* ✨ AI BUTTON */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={generateDescription}
              disabled={!canGenerate || generating || noCredits}
              className={`w-full py-2 rounded-lg font-semibold transition 
                ${
                  !canGenerate || generating
                    ? "bg-purple-300 cursor-not-allowed opacity-60"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
            >
              {generating
                ? "Generating magic..."
                : "✨ Generate Description"}
            </button>

            {generating && (
              <p className="text-sm text-purple-600 text-center">
                Creating a compelling description...
              </p>
            )}
          </div>

          {/* ✨ RESULT */}
          {description && (
            <div
              id="ai-result"
              className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-purple-700">
                  ✨ AI Generated Description
                </p>

                <span className="text-xs text-gray-500">
                  ⚡ 1 credit used
                </span>
                <span className="text-xs text-gray-500">
                 {credits ?? "--"} credits left
                </span>
              </div>

              <p className="text-gray-700 text-sm whitespace-pre-line">
                {description}
              </p>

              <div className="flex justify-between items-center pt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(description);
                    setMessage("Copied!");
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  📋 Copy
                </button>

                <button
                  type="button"
                  onClick={generateDescription}
                  className="text-sm text-purple-600 hover:underline"
                >
                  🔄 Regenerate
                </button>
              </div>
            </div>
          )}

          {/* 📸 Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Images
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#FF8C00] transition">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
              />

              <label htmlFor="imageUpload" className="cursor-pointer">
                <p className="text-gray-600">
                  Click to upload or drag images
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  PNG, JPG up to 5MB
                </p>
              </label>            
              </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {images.map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>

          {/* ✅ Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-[#FF8C00] text-white py-2 rounded-lg hover:bg-[#e67c00] transition"
          >
            {uploading ? "Uploading..." : "Add Property"}
          </button>

          {/* 💬 Feedback */}
          {message && (
            <p className="text-center text-sm text-green-600">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}