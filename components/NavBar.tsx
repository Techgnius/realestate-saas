"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // icon library (included in shadcn/ui)

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Properties", href: "/properties" },
  { label: "Pricing", href: "/pricing" },
  { label: "Profile", href: "/profile" },
];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#001F3F] shadow-md py-4 px-8">
      <div className="flex justify-between items-center">
        {/* Brand */}
        <h1
          onClick={() => router.push("/dashboard")}
          className="text-xl font-bold text-[#FF8C00] cursor-pointer hover:opacity-90 transition"
        >
          🏠 PropertyHub
        </h1>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`relative text-white font-medium hover:text-[#FFB347] transition ${
                  isActive
                    ? "after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-[#FF8C00]"
                    : ""
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white hover:text-[#FFB347] transition"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-4 mt-4 bg-[#001A33] rounded-lg p-4 shadow-lg">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <button
                key={link.href}
                onClick={() => {
                  router.push(link.href);
                  setMenuOpen(false);
                }}
                className={`relative text-white text-left font-medium hover:text-[#FFB347] transition ${
                  isActive
                    ? "after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-[#FF8C00]"
                    : ""
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
