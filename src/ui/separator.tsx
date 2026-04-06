import * as React from "react";
import { cn } from "@/lib/utils";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  const accessibilityProps = decorative
    ? {}
    : { role: "separator" as const, "aria-orientation": orientation };

  return (
    <div
      role={decorative ? "none" : undefined}
      {...accessibilityProps}
      className={cn(
        "shrink-0 bg-[#ACBFA4]/55",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
