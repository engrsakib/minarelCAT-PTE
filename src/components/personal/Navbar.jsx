"use client";
import React from "react";
import SkillsButton from "./SkillsButton";
import { FaRightLong } from "react-icons/fa6";
import Header from "./Header";
import Logo from "./Logo";
import Link from "next/link";
import LanguageSkills from "./LanguageSkills";
import useLoggedInUser from "@/lib/useGetLoggedInUser";
import { User } from "./User";
import { IoNotificationsOutline } from "react-icons/io5";


export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, loading, error } = useLoggedInUser();
  const [notifications, setNotifications] = React.useState({count: 10, messages: []});
  if (loading) {
    return <></>;
  }

  // console.log("User:", typeof user);

  return (
    <>
      <header className="flex items-center gap-x-7 justify-between lg:h-[110px]  border border-red-700 p-10 rounded-full mt-7 lg:w-[80%] w-[95%] mx-auto sticky top-14 z-50 bg-white shadow-lg">
        {/* logo */}
        <div>
          <Logo />
        </div>
        {/* menu */}
        <nav className="items-center hidden gap-4 lg:flex">
          <Link
            href="/"
            className="text-[20px] font-[400] text-gray-900 hover:text-black"
          >
            Home
          </Link>
          <SkillsButton isOpen={isOpen} setIsOpen={setIsOpen} />
          <Link
            href="/questions/test"
            className="text-[20px] font-[400] text-gray-900 hover:text-black"
          >
            Mock Test
          </Link>
          <Link
            href="/subscription/pricing"
            className="text-[20px] font-[400] text-gray-900 hover:text-black"
          >
            Pricing
          </Link>
          <Link
            href="/company/about"
            className="text-[20px] font-[400] text-gray-900 hover:text-black"
          >
            About US
          </Link>
        </nav>
        {/* right */}

        {user ? (
          <div className="hidden lg:flex items-center gap-4">
            {/* notifications */}
            <div className="relative text-[#7D0000] text-[36px] cursor-pointer">
              <span className={`absolute -top-2 -right-2 bg-[#7D0000] text-white text-xs font-bold rounded-full p-1 w-5 h-5 ${notifications?.count == 0 && "hidden"}`}>{notifications?.count}</span>
              <IoNotificationsOutline />
            </div>
            <User user={user} loading={loading} error={error} />
          </div>
        ) : (
          <div className="items-center hidden gap-4 lg:flex">
            <Link
              href="/auth/login"
              className="text-[20px] gap-2 font-[400] text-gray-900 flex items-center"
            >
              <span>Login</span>{" "}
              <FaRightLong className="text-[20px] font-[400] text-gray-900" />
            </Link>
            <Link
              href="/"
              className="text-[20px] font-[400] ml-4 bg-gradient-to-r from-[#D80000] to-[#720000] p-8 text-white px-4 py-2 rounded-full w-[289px] h-[60px] flex items-center justify-center hover:bg-gradient-to-r hover:from-[#720000] transition-all duration-300"
            >
              Sign Up
            </Link>
          </div>
        )}
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <Header isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      </header>
      <div className="w-[95%] relative mx-auto mt-4">
        {/* Language Skills Modal */}
        {isOpen && <LanguageSkills isOpen={isOpen} setIsOpen={setIsOpen} />}
      </div>
    </>
  );
}
