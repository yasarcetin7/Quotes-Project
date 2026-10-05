import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const userAvatarVariants = cva(
  "rounded-full border-2 border-border overflow-hidden shadow-sm",
  {
    variants: {
      variant: {
        primary: "w-10 h-10 sm:w-12 sm:h-12",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface UseravatarProps extends VariantProps<typeof userAvatarVariants> {
  name?: string | null;
  picture?: string | null;
  className?: string;
}

function Useravatar({
  name,
  picture,
  variant = "primary",
  className,
}: UseravatarProps) {
  const displayName = name || "User";

  return (
    <div className={cn(userAvatarVariants({ variant }), className)}>
      <img
        src={
          picture ||
          `https://ui-avatars.com/api/?name=${displayName}&background=random`
        }
        alt="User Avatar"
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export { Useravatar, userAvatarVariants };
