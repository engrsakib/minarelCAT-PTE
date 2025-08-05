import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { logoutAndRedirect } from "@/lib/fetchWithAuth";
import { RootUser } from "@/types/user";
import { useState } from "react";
// FIX: Use portal for dropdown content, position above navbar
export function User({
  user,
  loading,
  error,
}: {
  user: RootUser;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }
  const [dropDown, setDropDown] = useState(false)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger onClick={() => setDropDown(!dropDown)} asChild>
        <button className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 focus:outline-none">
          <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-gray-200 shadow">
            <Image
              src={user?.user?.profile || "/default-profile.png"}
              alt={user?.user?.name}
              width={70}
              height={70}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-[#7D0000] text-2xl font-[500]">
              {user?.user?.name.slice(0, 6)}
              {user?.user?.name?.length > 6 ? "..." : ""}
            </h1>
            <h1 className="text-gray-500 text-xs font-[300]">
              #Id: {user.user._id.slice(0, 4)}
              {user?.user?._id.length > 6 ? "..." : ""}
            </h1>
          </div>

        </button>
      </DropdownMenuTrigger>
      {/* Use 'forceMount' and 'portal' to ensure the dropdown is rendered in a portal above the navbar */}
      {
        dropDown && <DropdownMenuContent
          className={`w-56 z-[9999] shadow-xl`}
          sideOffset={12}
          align="end"
          forceMount
          portal
        >
          <DropdownMenuSeparator />
          <Link
            href="/dashboard"
            className="block px-4 py-2 hover:bg-gray-100 rounded text-gray-800 font-medium transition-all duration-200" onClick={() => setDropDown(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/profile"
            className="block px-4 py-2 hover:bg-gray-100 rounded text-gray-800 font-medium transition-all duration-200" onClick={() => setDropDown(false)}
          >
            Profile
          </Link>
          <button
            onClick={logoutAndRedirect}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-red-700 font-medium transition-all duration-200"
          >
            Logout
          </button>
        </DropdownMenuContent>
      }
    </DropdownMenu>
  );
}