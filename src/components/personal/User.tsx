/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { logoutAndRedirect } from "@/lib/fetchWithAuth";
import { RootUser } from "@/types/user"; // RootUser টাইপ ইম্পোর্ট করতে হবে

type Checked = DropdownMenuCheckboxItemProps["checked"];

export function User({
  user,
  loading,
  error,
}: {
  user: RootUser; // RootUser টাইপ হিসেবে ব্যবহার করা হবে
  loading: boolean;
  error: string | null;
}) {
  const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true);
  const [showActivityBar, setShowActivityBar] = React.useState<Checked>(false);
  const [showPanel, setShowPanel] = React.useState<Checked>(false);

  console.log(user, loading, error);
  
  if (loading) {
    return <div>Loading...</div>; // লোডিং স্টেট হ্যান্ডলিং
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Fixed image size */}
        <div className="flex items-center gap-2">
          <Image
            src={user.user.profile} // `user.user.profile` থেকে প্রোফাইল অ্যাক্সেস করা হচ্ছে
            alt={user.user.name} // `user.user.name` ব্যবহার করা হচ্ছে
            width={50} // Fixed width
            height={50} // Fixed height
            className="rounded-full" // Optional, to make it a circle
          />
          <div className="flex flex-col">
            <h1 className="text-[#7D0000] text-2xl font-[500]">
              {user.user.name.slice(0, 6)}{user.user.name.length > 6 ? "..." : ""}
            </h1>
            <h1 className="text-gray-500 text-xs font-[300]">
              #Id: {user.user._id.slice(0, 4)}{user.user._id.length > 6 ? "..." : ""}
            </h1>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={showStatusBar}
          onCheckedChange={setShowStatusBar}
        >
          <Link href="/personal/dashboard">Dashboard</Link>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showActivityBar}
          onCheckedChange={setShowActivityBar}
          disabled
        >
          <Link href="/personal/profile">Profile</Link>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showPanel}
          onCheckedChange={setShowPanel}
        >
          <button onClick={logoutAndRedirect}>Logout</button>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
