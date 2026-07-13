import { useState } from "react";

interface LogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  theme?: "dark" | "light";
  variant?: "full" | "icon";
}

export default function Logo({
  className = "h-8",
  imgClassName = "h-full object-contain",
  showText = true,
  theme = "dark",
  variant = "icon",
}: LogoProps) {
  const [hasError, setHasError] = useState(false);
  const isDark = theme === "dark";

  // Select the correct image source based on variant/showText
  // If variant is "full", we use the Full Logo (Icon + Text)
  // Otherwise we use the Icon Only version
  const logoSrc = variant === "full" ? "/assets/SiteMint.svg" : "/assets/SiteMint_icon.svg";

  return (
    <div className={`flex items-center gap-2.5 ${className}`} id="sitemint-logo-wrapper">
      {!hasError ? (
        <div className="flex items-center gap-2.5 h-full">
          <img
            src={logoSrc}
            alt="SiteMint"
            className={`${imgClassName} transition-transform duration-300 hover:scale-[1.03]`}
            onError={() => setHasError(true)}
            id="sitemint-logo-image"
            referrerPolicy="no-referrer"
          />
          {/* Only show the HTML text if showText is true and we are using the icon variant (to avoid double text from the full logo image) */}
          {showText && variant === "icon" && (
            <span className={`text-xl font-bold tracking-tight font-display transition-colors duration-200 ${isDark ? "text-white" : "text-zinc-900"}`}>
              Site<span className="text-emerald-400">Mint</span>
            </span>
          )}
        </div>
      ) : (
        // Premium fallback SVG representing a minted coin with a mint leaf design
        <div className="flex items-center gap-2 h-full" id="sitemint-logo-fallback">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-mint p-[1.5px] shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <div className={`flex items-center justify-center w-full h-full rounded-[10px] ${isDark ? "bg-[#09090B]" : "bg-white"}`}>
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-emerald-400 fill-none stroke-current"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          {showText && (
            <span className={`text-xl font-bold tracking-tight font-display ${isDark ? "text-white" : "text-zinc-950"}`}>
              Site<span className="text-emerald-400">Mint</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
