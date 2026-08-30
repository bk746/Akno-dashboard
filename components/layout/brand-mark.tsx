import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  size?: number;
  className?: string;
};

export function BrandMark({ size = 32, className }: BrandMarkProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg bg-black",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/eclypse2-x2.png"
        alt="Eclypse2X2"
        width={size}
        height={size}
        className="h-full w-full object-cover"
        priority
      />
    </div>
  );
}
