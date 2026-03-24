// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";
// import NavBar from "../../components/NavBar";

// export default function MyPropertiesPage() {
//   const router = useRouter();
//   const [user, setUser] = useState<any>(null);
//   const [properties, setProperties] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProperties = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) {
//         router.push("/login");
//         return;
//       }
//       setUser(user);

//       const { data, error } = await supabase
//         .from("properties")
//         .select("*")
//         .eq("owner_id", user.id)
//         .order("id", { ascending: false });

//       if (error) {
//         console.error("Error fetching properties:", error);
//       } else {
//         setProperties(data || []);
//       }

//       setLoading(false);
//     };

//     fetchProperties();
//   }, [router]);

//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this property?")) return;

//     const { error } = await supabase.from("properties").delete().eq("id", id);
//     if (error) {
//       alert("Error deleting property");
//       console.error(error);
//     } else {
//       setProperties((prev) => prev.filter((p) => p.id !== id));
//     }
//   };

//   if (loading) {
//     return (
//       <main className="flex justify-center items-center min-h-screen">
//         <p className="text-gray-600">Loading your properties...</p>
//       </main>
//     );
//   }

//   return (
//     <main className="min-h-screen bg-gray-50 p-6">
//       <NavBar />
//       <div className="max-w-5xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold">My Properties</h1>
//           <button
//             onClick={() => router.push("/properties/add")}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//           >
//             + Add New Property
//           </button>
//         </div>

//         {properties.length === 0 ? (
//           <p className="text-gray-600 text-center mt-16">
//             You haven’t added any properties yet.
//           </p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {properties.map((property) => (
//               <div
//                 key={property.id}
//                 className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4 flex flex-col"
//               >
//                 {property.images?.length ? (
//                   <img
//                     src={property.images[0]}
//                     alt={property.title}
//                     className="w-full h-48 object-cover rounded-xl mb-3"
//                   />
//                 ) : (
//                   <div className="w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
//                     No image
//                   </div>
//                 )}

//                 <h2 className="text-lg font-semibold">{property.title}</h2>
//                 <p className="text-gray-600 text-sm line-clamp-2 mb-2">
//                   {property.description}
//                 </p>
//                 <p className="text-blue-600 font-medium">
//                   ${property.price?.toLocaleString()}
//                 </p>
//                 <p className="text-gray-500 text-sm mb-3">{property.location}</p>

//                 <div className="mt-auto flex gap-2">
// <button
//   onClick={() => router.push(`/properties/${property.id}/edit`)}
//   className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
// >
//   Edit
// </button>

//                   <button
//                     onClick={() => handleDelete(property.id)}
//                     className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import AddPropertyModal from "@/components/AddPropertyModal";


interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  images?: string[];
  created_at: string;
}

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);

    const fetchProperties = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching properties:", error);
      } else {
        setProperties(data || []);
      }

      setLoading(false);
    };
  useEffect(() => {
    fetchProperties();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      console.error("Error deleting property:", error);
      setMessage("Failed to delete property");
    } else {
      setMessage("✅ Property deleted successfully!");
      setProperties(properties.filter((p) => p.id !== id));
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p>Loading your properties...</p>
      </main>
    );
  }

  //       const fetchProperties = async () => {
  //     setLoading(true);
  //     const { data, error } = await supabase
  //       .from("properties")
  //       .select("*")
  //       .eq("user_id", userId);

  //     if (!error) setProperties(data || []);
  //     setLoading(false);
  //   };

  // useEffect(() => {
  //   fetchProperties();
  // }, [userId]);


  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />
            <AddPropertyModal
            isOpen={isAddPropertyOpen}
            onClose={() => setIsAddPropertyOpen(false)}
            onSuccess={fetchProperties}
           />
      <section className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Properties</h1>
          <button
            onClick={() => router.push("/add-property")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add New Property
          </button>
        </div>

        {message && (
          <p className="text-center text-green-600 mb-4">{message}</p>
        )}

        {properties.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            You haven’t added any properties yet.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
              >
                {property.images?.[0] && (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}

                <h2 className="text-lg font-semibold">{property.title}</h2>
                <p className="text-gray-600 text-sm">{property.location}</p>
                <p className="text-gray-800 font-medium mt-1">
                  ₦{property.price.toLocaleString()}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {property.bedrooms} bed · {property.bathrooms} bath
                </p>

                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {property.description}
                </p>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={() =>
                      router.push(`/properties/edit/${property.id}`)
                    }
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
