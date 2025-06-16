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

type Checked = DropdownMenuCheckboxItemProps["checked"];

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

  console.log(user);

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
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={showStatusBar}
          onCheckedChange={setShowStatusBar}
        >
          Status Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showActivityBar}
          onCheckedChange={setShowActivityBar}
          disabled
        >
          Activity Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showPanel}
          onCheckedChange={setShowPanel}
        >
          Panel
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
