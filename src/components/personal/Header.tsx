"use client";
import { useState } from "react";
import MobileMenu from "@/components/personal/MobileMenu";
import { RxHamburgerMenu } from "react-icons/rx";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      {/* ...other header content */}
      <button className="text-[30px] font-[700] ml-4  p-8 text-gray-600 px-4 py-2 rounded w-[58px] h-[58px] flex items-center justify-center hover:bg-gradient-to-r transition-all duration-300" onClick={() => setMenuOpen(true)}>
        {/* mobile menu icon */}
        <RxHamburgerMenu />
      </button>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}