import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-[#ACBFA4] bg-white text-[#262626]",
        secondary: "border-[#ACBFA4] bg-[#E2E8CE]/55 text-[#262626]",
        destructive: "border-[#7f1d1d] bg-[#7f1d1d] text-white",
        outline: "border-[#ACBFA4] bg-transparent text-[#262626]",
        ghost: "border-transparent bg-[#E2E8CE]/45 text-[#262626]",
        link: "border-transparent bg-transparent text-[#262626] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge };
