"use client";
import Link from "next/link";
import { FaRightLong  } from "react-icons/fa6";
import { FaTimes  } from "react-icons/fa";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/", label: "Practice" },
  { href: "/", label: "Mock Test" },
  { href: "/", label: "Pricing" },
  { href: "/", label: "FAQ" },
];

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/40 lg:hidden">
      {/* Drawer */}
      <div className="w-[80vw] max-w-[350px] bg-white h-full p-6 flex flex-col relative animate-slide-in">
        {/* Close button */}
        <button
          className="absolute text-2xl text-gray-700 top-4 right-4"
          aria-label="Close menu"
          onClick={onClose}
        >
          <FaTimes />
        </button>
        {/* Nav Links */}
        <nav className="flex flex-col gap-4 mt-10">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[20px] font-normal text-gray-900 hover:text-[#D80000] transition px-4 py-2 rounded"
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Divider */}
        <div className="my-6 border-t" />
        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="text-[20px] gap-2 font-normal text-gray-900 flex items-center justify-center hover:text-[#D80000] transition"
            onClick={onClose}
          >
            <span>Login</span> <FaRightLong className="text-[20px]" />
          </Link>
          <Link
            href="/"
            className="text-[20px] font-normal bg-gradient-to-r from-[#D80000] to-[#720000] text-white px-4 py-2 rounded-full flex items-center justify-center hover:from-[#720000] hover:to-[#D80000] transition-all duration-300"
            onClick={onClose}
          >
            Sign Up
          </Link>
        </div>
      </div>
      {/* Overlay click closes modal */}
      <div className="flex-1" onClick={onClose} />
      {/* Animation style */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
            opacity: 0.5;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}