"use client";

import Image from "next/image";

type ToolLogoProps = {
  logoUrl: string | null | undefined;
  toolName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

export default function ToolLogo({
  logoUrl,
  toolName,
  size = "md",
  className = "",
}: ToolLogoProps) {
  if (!logoUrl) {
    // Fallback: show first letter of tool name in a circle
    const initial = toolName.charAt(0).toUpperCase();
    return (
      <div
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-semibold text-xs ${className}`}
      >
        {initial}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative flex-shrink-0 ${className}`}>
      <Image
        src={logoUrl}
        alt={`${toolName} logo`}
        fill
        className="object-contain rounded"
        onError={(e) => {
          // If image fails to load, hide it and show fallback
          e.currentTarget.style.display = "none";
        }}
        unoptimized // Clearbit logos are external, so we don't optimize them
      />
    </div>
  );
}

