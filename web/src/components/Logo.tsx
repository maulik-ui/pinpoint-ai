"use client";

import Image from "next/image";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

export default function Logo({ size = "md", className = "" }: LogoProps) {
  return (
    <div className={`${sizeClasses[size]} relative flex-shrink-0 ${className}`}>
      <Image
        src="/logo.png"
        alt="Pinpoint Logo"
        width={size === "sm" ? 24 : size === "md" ? 40 : 64}
        height={size === "sm" ? 24 : size === "md" ? 40 : 64}
        className="object-contain"
        priority
      />
    </div>
  );
}

