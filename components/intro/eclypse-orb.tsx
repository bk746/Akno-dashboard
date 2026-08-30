import Image from "next/image";
import { cn } from "@/lib/utils";

type EclypseOrbProps = {
  className?: string;
  opacity?: number;
  animationDelay?: string;
  variant?: "section" | "hero";
};

export function EclypseOrb({
  className = "",
  opacity = 1,
  animationDelay = "0s",
  variant = "section",
}: EclypseOrbProps) {
  const orbit = (
    <div className="eclypse-orbit relative">
      <Image
        src="/eclypse2-x2.png"
        alt=""
        width={1218}
        height={1218}
        draggable={false}
        className="eclypse-orbit__frame eclypse-orbit__frame--a"
        sizes="(max-width: 768px) 40vw, 20vw"
      />
      <Image
        src="/eclypse3X2.png"
        alt=""
        width={1218}
        height={1218}
        draggable={false}
        className="eclypse-orbit__frame eclypse-orbit__frame--b"
        sizes="(max-width: 768px) 40vw, 20vw"
      />
    </div>
  );

  return (
    <div
      className={cn("section-orb", className)}
      style={
        {
          opacity,
          "--orb-delay": animationDelay,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {variant === "hero" ? <div className="eclypse-orbit-wrap">{orbit}</div> : orbit}
    </div>
  );
}
