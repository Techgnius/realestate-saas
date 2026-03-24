"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import NavBar from "../../components/NavBar";


export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, company_name, bio, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setCompanyName(profile.company_name || "");
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url || "");
      }

      if (error) console.error("Error loading profile:", error);
    };

    getUserProfile();
  }, [router]);

  // Upload Avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file || !user) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      if (data?.publicUrl) {
        setAvatarUrl(data.publicUrl);
        setMessage("Avatar uploaded successfully!");
      }
    } catch (error: any) {
      console.error("Avatar upload failed:", error);
      setMessage("Error uploading avatar.");
    } finally {
      setUploading(false);
    }
  };

  // Save Profile
  const handleSave = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        company_name: companyName,
        bio,
        avatar_url: avatarUrl,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      setMessage("Error updating profile.");
    } else {
      setMessage("Profile updated successfully!");
      setIsEditing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
        <NavBar />
       <div className="flex items-center justify-center mt-8">
         <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">My Profile</h1>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover mb-3"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-3 text-gray-500">
              No Photo
            </div>
          )}

          {isEditing && (
            <label className="cursor-pointer text-blue-600 text-sm hover:underline">
              {uploading ? "Uploading..." : "Change Avatar"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>

        {/* Profile Info */}
        {!isEditing ? (
          <div className="space-y-4 text-center">
            <div>
              <p className="text-lg font-semibold">
                {fullName || "No name set"}
              </p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              {companyName && (
                <p className="text-gray-600 font-medium">{companyName}</p>
              )}
            </div>

            {bio && (
              <p className="text-gray-600 text-sm italic">{bio}</p>
            )}

            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder="Enter your full name"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder="Enter your company name"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full border rounded-lg p-2"
                rows={3}
                placeholder="Write a short bio..."
              />
            </div>

            {message && (
              <p className="text-sm text-center text-green-600">{message}</p>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSave}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full mt-6 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100"
        >
          Back to Dashboard
        </button>
      </div>
        </div> 
    </main>
  );
}
