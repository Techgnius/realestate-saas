
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import NavBar from "../../components/NavBar";
import { User } from "lucide-react";
import { CreditCard, Wallet, Home, BarChart3 } from "lucide-react";
import { Search } from "lucide-react";
import AddPropertyModal from "@/components/AddPropertyModal";





export default function DashboardPage({ userId }: { userId: string }) {
  const router = useRouter();
  const [user, setUser] = useState<{
  id: string;
  email?: string;
} | null>(null);

const [profile, setProfile] = useState<{
  full_name?: string;
  credits_total?: number;
  credits_used?: number;
  subscription_tier?: string;
  subscription_plan?: string;
} | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);


  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<
  {
    id: string;
    name: string;
    location?: string | null;
    price?: number | null;
    active?: boolean | null;
    image_url?: string | null;
    description?: string | null;
    created_at: string;
  }[]
>([]);
    const getUserData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    };
  useEffect(() => {
    getUserData();
  }, []);
      const fetchProperties = async () => {
      setLoadingProperties(true);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", userId);

      if (!error) setProperties(data || []);
      setLoadingProperties(false);
    };

  useEffect(() => {
    fetchProperties();
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading your dashboard...</p>
      </main>
    );
  }
    if (loadingProperties) {
    return (
      <section className="max-w-6xl mx-auto mt-12 px-6 flex justify-center items-center">
        <p className="text-gray-500">Loading your properties...</p>
      </section>
    );
  }
  const totalProperties = properties.length;

const activeProperties = properties.filter(
  (p) => p.active === true
).length;

const availableCredits =
  (profile?.credits_total || 0) - (profile?.credits_used || 0);

const usedCredits = profile?.credits_used || 0;

const subscriptionTier = profile?.subscription_tier || "free";
const subscriptionPlan = profile?.subscription_plan || "monthly";

const generatedProperties = properties.filter(
  (p) => p.description && p.description.length > 0
);

const totalGenerated = generatedProperties.length;

const getAveragePerMonth = () => {
  if (generatedProperties.length === 0) return 0;

  const dates = generatedProperties.map(
    (p) => new Date(p.created_at)
  );

  const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
  const now = new Date();

  const monthsDiff =
    (now.getFullYear() - earliest.getFullYear()) * 12 +
    (now.getMonth() - earliest.getMonth()) + 1;

  return Math.ceil(totalGenerated / monthsDiff);
};

const avgGeneratedPerMonth = getAveragePerMonth();



  return (
    <main className="min-h-screen bg-gray-130">
      <NavBar />

      <AddPropertyModal
      isOpen={isAddPropertyOpen}
      onClose={() => setIsAddPropertyOpen(false)}
      onSuccess={fetchProperties}
     />
      {/* 🟠 Hero Section */}
      <section
        className="relative w-full h-[320px] md:h-[400px] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-[#001F3F]/80 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            Welcome back, {profile?.full_name || user?.email}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-xl">
            Manage your properties, explore new listings, and stay on top of your real estate portfolio.
          </p>
          <button
            onClick={() => setIsAddPropertyOpen(true)}
            className="bg-[#FF8C00] hover:bg-[#e67c00] text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
          >
            + Add New Property
          </button>
        </div>
      </section>

      {/* ⚙️ Dashboard Overview Section */}
<section className="w-full flex justify-center">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-10 bg-gray-130 p-8 w-full max-w-6xl">
    {/* Left Column */}
    <div>
      <h2 className="text-3xl font-bold text-[#001537] mb-2">Dashboard Overview</h2>
      <p className="text-gray-600 mb-4">Account ID: {user?.id}</p>
      <button
        onClick={handleLogout}
        className="text-[#001537] border border-[#001537] hover:bg-[#001537] hover:text-white bg-gray-130 px-4 py-2 rounded-lg transition"
      >
        Logout
      </button>
    </div>

    {/* Right Column */}
    <div className="self-start sm:self-auto">
      <button
        onClick={() => router.push('/profile')}
        className="flex items-center justify-center gap-1 text-[#001537] border border-[#001537] hover:bg-[#001537] hover:text-white bg-gray-130 px-6 py-3 rounded-lg font-bold transition"
      >
        <User className="w-7 h-5" />
        Manage Account
      </button>
    </div>
  </div>
</section>
{/* 🧮 Dashboard Stats Section */}
<section className="max-w-6xl mx-auto mt-12 px-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* 1️⃣ Subscription Card */}
    <div className="text-[#001537] border border-[#001537] bg-gray-130 transition rounded-2xl p-6 flex items-center gap-4">
      <div className="bg-[#001F3F] p-3 rounded-full">
        <CreditCard className="w-6 h-6 text-[#FF8C00]" />
      </div>
      <div>
        <p className="text-gray-600 text-sm">Subscription Type</p>
        <h3 className="text-lg font-bold text-[#001537]">{subscriptionTier}</h3>
        <p className="text-sm text-gray-500">Plan: {subscriptionPlan}</p>
      </div>
    </div>

    {/* 2️⃣ Credit Card */}
    <div className="text-[#001537] border border-[#001537] bg-gray-130 transition rounded-2xl p-6 flex items-center gap-4">
      <div className="bg-[#001F3F] p-3 rounded-full">
        <Wallet className="w-6 h-6 text-[#FF8C00]" />
      </div>
      <div>
        <p className="text-gray-600 text-sm">Available Credit</p>
        <h3 className="text-lg font-bold text-[#001537]">{availableCredits}</h3>
        <p className="text-sm text-gray-500">Used: {usedCredits}</p>
      </div>
    </div>

    {/* 3️⃣ Properties Card */}
    <div className="text-[#001537] border border-[#001537] bg-gray-130 transition rounded-2xl p-6 flex items-center gap-4">
      <div className="bg-[#001F3F] p-3 rounded-full">
        <Home className="w-6 h-6 text-[#FF8C00]" />
      </div>
      <div>
        <p className="text-gray-600 text-sm">Total Properties</p>
        <h3 className="text-lg font-bold text-[#001537]">{totalProperties}</h3>
        <p className="text-sm text-gray-500">Active: {activeProperties}</p>
      </div>
    </div>

    {/* 4️⃣ Generated Card */}
    <div className="text-[#001537] border border-[#001537] bg-gray-130 transition rounded-2xl p-6 flex items-center gap-4">
      <div className="bg-[#001F3F] p-3 rounded-full">
        <BarChart3 className="w-6 h-6 text-[#FF8C00]" />
      </div>
      <div>
        <p className="text-gray-600 text-sm">Generated Properties</p>
        <h3 className="text-lg font-bold text-[#001537]">{totalGenerated}</h3>
        <p className="text-sm text-gray-500">Avg per month: {avgGeneratedPerMonth}</p>
      </div>
    </div>
  </div>
</section>
{/* 🏘️ Recent Properties Header Section */}
<section className="max-w-6xl mx-auto mt-12 px-6">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gray-130">
    {/* Left: Title */}
    <div>
      <h2 className="text-3xl font-bold text-[#001537]">Recent Properties</h2>
    </div>

    {/* Right: Search Bar */}
    <div className="w-full sm:w-80 relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#001537] w-5 h-5" />
      <input
        type="text"
        placeholder="Search properties..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border border-[#001537] rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition"
      />
    </div>
  </div>
</section>
<section className="max-w-6xl mx-auto mt-12 px-6 mb-70">
      {properties.length === 0 ? (
        // 🌱 Empty State
        <div className="bg-gray-130 border border-[#001537] rounded-2xl p-12 flex flex-col justify-center items-center text-center">
          <div className="bg-[#001F3F] p-6 rounded-full mb-6">
            <Home className="w-14 h-14 text-[#FF8C00]" />
          </div>
          <h2 className="text-2xl font-bold text-[#001537] mb-2">
            No Properties Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Add your first property to start generating professional descriptions.
          </p>
<button
  onClick={() => setIsAddPropertyOpen(true)}
  className="bg-[#FF8C00] hover:bg-[#e67c00] text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
>
  + Add Your First Property
</button>

        </div>
      ) : (
        // 🏘️ Properties Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white shadow-md rounded-2xl p-5 hover:shadow-lg transition cursor-pointer"
              onClick={() => router.push(`/properties/${property.id}`)}
            >
              {property.image_url ? (
                <img
                  src={property.image_url}
                  alt={property.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Home className="w-10 h-10 text-gray-400" />
                </div>
              )}

              <h3 className="text-lg font-bold text-[#001537] mb-1">
                {property.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                {property.location || "Unknown Location"}
              </p>
              <p className="text-[#FF8C00] font-semibold">
                ₦{property.price?.toLocaleString() || "N/A"}
              </p>

              <p
                className={`mt-2 text-sm font-medium ${
                  property.active ? "text-green-600" : "text-red-500"
                }`}
              >
                {property.active ? "Active" : "Inactive"}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>



    </main>
  );
}
