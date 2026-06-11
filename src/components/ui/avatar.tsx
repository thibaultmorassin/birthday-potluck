/* eslint-disable @next/next/no-img-element */
import { avatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import React from "react";

const Avatar = ({
  name,
  seedSize = 48,
  className,
  ...props
}: React.ComponentPropsWithRef<"img"> & {
  name: string;
  seedSize?: number;
}) => {
  return (
    <img
      src={avatarUrl(name, seedSize)}
      alt={`Avatar de ${name}`}
      width={24}
      height={24}
      className={cn("size-5 rounded-full", className)}
      {...props}
    />
  );
};

export { Avatar };
