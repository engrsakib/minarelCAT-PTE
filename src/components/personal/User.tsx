import * as React from "react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { logoutAndRedirect } from "@/lib/fetchWithAuth";
import { RootUser } from "@/types/user";

type Checked = DropdownMenuCheckboxItemProps["checked"];

export function User({
  user,
  loading,
  error,
}: {
  user: RootUser;
  loading: boolean;
  error: string | null;
}) {
  const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true);
  const [showActivityBar, setShowActivityBar] = React.useState<Checked>(false);
  const [showPanel, setShowPanel] = React.useState<Checked>(false);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <Image
            src={user?.user?.profile || "/default-profile.png"}
            alt={user?.user?.name}
            width={50}
            height={50}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <h1 className="text-[#7D0000] text-2xl font-[500]">
              {user?.user?.name.slice(0, 6)}
              {user?.user?.name?.length > 6 ? "..." : ""}
            </h1>
            <h1 className="text-gray-500 text-xs font-[300]">
              #Id: {user.user._id.slice(0, 4)}
              {user?.user?._id.length > 6 ? "..." : ""}
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
          <Link href="/dashboard/progress">Dashboard</Link>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showActivityBar}
          onCheckedChange={setShowActivityBar}
          
        >
          <Link href="/profile/my-profile">Profile</Link>
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