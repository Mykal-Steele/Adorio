import * as React from "react";
import { cn } from "@/lib/utils";

type AvatarSize = "default" | "sm" | "lg";

const avatarSizes: Record<AvatarSize, string> = {
  default: "h-9 w-9",
  sm: "h-8 w-8",
  lg: "h-11 w-11",
};

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: AvatarSize;
}

function Avatar({ className, size = "default", ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border border-social-avatar-border bg-social-surface",
        avatarSizes[size],
        className,
      )}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center bg-social-avatar-bg text-xs font-semibold text-social-ink",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback };
