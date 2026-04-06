import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#262626]/20 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#262626] text-[#E2E8CE] hover:bg-[#1c1c1c] border border-[#262626] shadow-[0_2px_8px_rgba(38,38,38,0.2)]",
        outline:
          "bg-white text-[#262626] border border-[#ACBFA4] hover:bg-[#E2E8CE]/40",
        secondary:
          "bg-[#E2E8CE] text-[#262626] border border-[#ACBFA4] hover:bg-[#d9e1be]",
        ghost:
          "bg-transparent text-[#262626] border border-transparent hover:bg-[#ACBFA4]/25",
        destructive:
          "bg-[#7f1d1d] text-white border border-[#7f1d1d] hover:bg-[#6b1717]",
        link: "bg-transparent border border-transparent text-[#262626] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-sm",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-xs": "h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button };
