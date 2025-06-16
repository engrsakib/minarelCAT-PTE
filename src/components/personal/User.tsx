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


type Checked = DropdownMenuCheckboxItemProps["checked"];
// throw new Error("Please do not use this file directly. It is meant to be used as a component in the application.");
export function User({
  user,
  loading,
  error,
}: {
  user: any;
  loading: boolean;
  error: string | null;
}) {
  const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true);
  const [showActivityBar, setShowActivityBar] = React.useState<Checked>(false);
  const [showPanel, setShowPanel] = React.useState<Checked>(false);

  console.log(user, loading, error);
  if (loading) {
    return ;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Fixed image size */}
        <div className="flex items-center gap-2">
          <Image
            src={user?.user?.profile}
            alt={user?.user?.name}
            width={50} // Fixed width
            height={50} // Fixed height
            className="rounded-full" // Optional, to make it a circle
          />
          <div className="flex flex-col">
            <h1 className="text-[#7D0000] text-2xl font-[500]">
              {user?.user?.name?.slice(0, 6)}
              {user?.user?.name?.length > 6 ? "..." : ""}
            </h1>
            <h1 className="text-gray-500 text-xs font-[300]">
              #Id: {user?.user?._id?.slice(0, 4)}
              {user?.user?._id?.length > 6 ? "..." : ""}
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
          <Link href="/personal/dashboard">dashboard</Link>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showActivityBar}
          onCheckedChange={setShowActivityBar}
          disabled
        >
          <Link href="/personal/profile">Profle</Link>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showPanel}
          onCheckedChange={setShowPanel}
        >
         <button onClick={logoutAndRedirect}>logout</button>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
