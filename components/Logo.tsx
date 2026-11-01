"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  href?: string;
  wordmarkOnly?: boolean;
}

export function Logo({
  className = "",
  size = "md",
  withText = true,
  href = "/",
  wordmarkOnly = false,
}: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const [wordmarkError, setWordmarkError] = useState(false);

  const dimension = size === "sm" ? 22 : size === "lg" ? 36 : 28;
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {!wordmarkOnly && !imageError ? (
        <div
          className="relative flex items-center justify-center rounded-[4px] overflow-hidden bg-night border border-line/50 shrink-0"
          style={{ width: dimension, height: dimension }}
        >
          <Image
            src="/logo.png"
            alt="Vynter North Mark"
            width={dimension}
            height={dimension}
            onError={() => setImageError(true)}
            className="object-contain"
            priority
          />
        </div>
      ) : !wordmarkOnly ? (
        // Geometric SVG fallback icon if logo.png is not uploaded yet
        <div
          className="flex items-center justify-center rounded-[4px] bg-panel-raised border border-line text-glacier shrink-0"
          style={{ width: dimension, height: dimension }}
        >
          <svg
            width={dimension * 0.65}
            height={dimension * 0.65}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 7 9 13 9-13" />
            <path d="M12 3v17" />
          </svg>
        </div>
      ) : null}

      {withText && (
        <>
          {!wordmarkError ? (
            <div className="relative h-6 flex items-center">
              <Image
                src="/logo-wordmark.png"
                alt="Vynter North"
                width={130}
                height={24}
                onError={() => setWordmarkError(true)}
                className="h-5 w-auto object-contain dark:invert-0 invert"
                priority
              />
            </div>
          ) : (
            <span
              className={`font-serif tracking-tight text-text font-normal ${textSize}`}
              style={{ fontFamily: "var(--font-instrument-serif), serif" }}
            >
              Vynter North
            </span>
          )}
        </>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus-ring rounded outline-none inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
