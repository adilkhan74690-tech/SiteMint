import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import LucideIcon from "./LucideIcon";

interface CommandItem {
  id: string;
  category: "Navigation" | "Sectors & Templates" | "Error Screens" | "Simulations" | "Preferences";
  title: string;
  subtitle: string;
  icon: string;
  shortcut?: string;
  action: () => void;
}

interface SearchAndCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "dark" | "light";
  onNavigate: (view: any) => void;
  onToggleTheme: () => void;
  onSimulateLoader: () => void;
  onTriggerError: (code: 404 | 403 | 500) => void;
}

export default function SearchAndCommandPalette({
  isOpen,
  onClose,
  theme,
  onNavigate,
  onToggleTheme,
  onSimulateLoader,
  onTriggerError,
}: SearchAndCommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const items: CommandItem[] = [
    // Navigation
    {
      id: "nav-landing",
      category: "Navigation",
      title: "Go to Hub Homepage",
      subtitle: "Return to SiteMint main landing portal",
      icon: "Home",
      shortcut: "G + H",
      action: () => {
        onNavigate("landing");
        onClose();
      },
    },
    {
      id: "nav-dashboard",
      category: "Navigation",
      title: "Open Owner Dashboard",
      subtitle: "Review minted analytics, reservations and sites",
      icon: "LayoutDashboard",
      shortcut: "G + D",
      action: () => {
        onNavigate("dashboard");
        onClose();
      },
    },
    {
      id: "nav-onboarding",
      category: "Navigation",
      title: "Launch Onboarding Flow",
      subtitle: "Step-by-step interactive business wizard",
      icon: "Layers",
      shortcut: "G + O",
      action: () => {
        onNavigate("onboarding");
        onClose();
      },
    },
    {
      id: "nav-login",
      category: "Navigation",
      title: "Sign In Page",
      subtitle: "Access your dashboard credentials",
      icon: "LogIn",
      action: () => {
        onNavigate("login");
        onClose();
      },
    },
    {
      id: "nav-register",
      category: "Navigation",
      title: "Mint New Account",
      subtitle: "Sign up for premium SiteMint subscriptions",
      icon: "UserPlus",
      action: () => {
        onNavigate("register");
        onClose();
      },
    },

    // Sectors & Templates
    {
      id: "tpl-gym",
      category: "Sectors & Templates",
      title: "Preview Apex Gym Template",
      subtitle: "Review fitness booking hub template",
      icon: "Dumbbell",
      action: () => {
        onNavigate("preview-gym");
        onClose();
      },
    },
    {
      id: "tpl-restaurant",
      category: "Sectors & Templates",
      title: "Preview Bistro Table Template",
      subtitle: "Review hospitality dining hub template",
      icon: "UtensilsCrossed",
      action: () => {
        onNavigate("preview-restaurant");
        onClose();
      },
    },
    {
      id: "tpl-salon",
      category: "Sectors & Templates",
      title: "Preview Luminous Salon Template",
      subtitle: "Review boutique beauty appointment template",
      icon: "Sparkles",
      action: () => {
        onNavigate("preview-salon");
        onClose();
      },
    },

    // Error Screens
    {
      id: "err-404",
      category: "Error Screens",
      title: "Trigger 404 Error Screen",
      subtitle: "Preview custom 'Page Not Found' template",
      icon: "SearchX",
      shortcut: "E + 4",
      action: () => {
        onTriggerError(404);
        onClose();
      },
    },
    {
      id: "err-403",
      category: "Error Screens",
      title: "Trigger 403 Forbidden Screen",
      subtitle: "Preview custom 'Access Restricted' template",
      icon: "ShieldAlert",
      shortcut: "E + 3",
      action: () => {
        onTriggerError(403);
        onClose();
      },
    },
    {
      id: "err-500",
      category: "Error Screens",
      title: "Trigger 500 Internal Server Screen",
      subtitle: "Preview custom 'SaaS Node Crashed' template",
      icon: "FileX2",
      shortcut: "E + 5",
      action: () => {
        onTriggerError(500);
        onClose();
      },
    },

    // Simulations
    {
      id: "sim-loading",
      category: "Simulations",
      title: "Simulate Full loading Screen",
      subtitle: "Experience the high-fidelity branding load animation",
      icon: "RefreshCw",
      shortcut: "L",
      action: () => {
        onSimulateLoader();
        onClose();
      },
    },

    // Preferences
    {
      id: "pref-theme",
      category: "Preferences",
      title: `Toggle Theme (${theme === "dark" ? "Light Mode" : "Dark Mode"})`,
      subtitle: "Switch colors dynamically between dark & light",
      icon: theme === "dark" ? "Sun" : "Moon",
      shortcut: "T",
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
  ];

  // Filter items based on search query
  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation inside palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  // Sync scroll on keyboard arrow navigate
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedElement = scrollContainerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        const container = scrollContainerRef.current;
        const elemTop = selectedElement.offsetTop;
        const elemBottom = elemTop + selectedElement.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.offsetHeight;

        if (elemTop < containerTop) {
          container.scrollTop = elemTop;
        } else if (elemBottom > containerBottom) {
          container.scrollTop = elemBottom - container.offsetHeight;
        }
      }
    }
  }, [selectedIndex]);

  const isDark = theme === "dark";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center pt-[10vh] px-4" id="command-palette-modal">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ type: "spring", duration: 0.35 }}
            className={`w-full max-w-2xl rounded-2xl border overflow-hidden shadow-2xl relative z-10 ${
              isDark 
                ? "bg-zinc-950/95 border-white/[0.08] text-white" 
                : "bg-white/95 border-zinc-200 text-zinc-900"
            }`}
          >
            {/* Search Input Box */}
            <div className={`flex items-center px-4.5 py-4 border-b ${isDark ? "border-white/[0.06]" : "border-zinc-200"}`}>
              <LucideIcon name="Search" className={`w-5 h-5 shrink-0 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search tools, templates, simulations, or error pages (e.g. '404')..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                className={`w-full bg-transparent border-none outline-none focus:ring-0 text-sm ml-3.5 placeholder-zinc-500 ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}
                aria-label="Search and command palette"
              />
              <span className={`text-[10px] font-mono px-2 py-1 rounded border uppercase ${
                isDark ? "text-zinc-500 border-zinc-800 bg-zinc-900/60" : "text-zinc-400 border-zinc-200 bg-zinc-100"
              }`}>
                ESC
              </span>
            </div>

            {/* Main Command Feed List */}
            <div 
              ref={scrollContainerRef}
              className="max-h-[380px] overflow-y-auto p-2 space-y-1"
              id="command-list-container"
            >
              {filtered.length === 0 ? (
                /* Elegant Empty State inside Search palette */
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <div className={`p-3 rounded-full border mb-3 ${isDark ? "bg-zinc-900 border-zinc-800 text-zinc-500" : "bg-zinc-100 border-zinc-200 text-zinc-400"}`}>
                    <LucideIcon name="PackageOpen" className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className={`text-sm font-bold ${isDark ? "text-zinc-300" : "text-zinc-800"}`}>
                    No matching actions found
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                    Try searching for different keywords like <span className="text-emerald-400 font-mono">dashboard</span>, <span className="text-emerald-400 font-mono">404</span> or <span className="text-emerald-400 font-mono">theme</span>.
                  </p>
                </div>
              ) : (
                // Grouping elements visually by categories is super professional
                (() => {
                  let lastCategory = "";
                  return filtered.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    const showCategoryHeader = item.category !== lastCategory;
                    lastCategory = item.category;

                    return (
                      <React.Fragment key={item.id}>
                        {showCategoryHeader && (
                          <div className={`text-[10px] uppercase font-bold tracking-wider px-3.5 pt-3.5 pb-1.5 font-mono ${
                            isDark ? "text-zinc-500" : "text-zinc-400"
                          }`}>
                            {item.category}
                          </div>
                        )}
                        <button
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center justify-between text-left p-3 rounded-xl transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? isDark 
                                ? "bg-white/[0.06] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                                : "bg-zinc-100 text-zinc-950 font-medium"
                              : "bg-transparent text-zinc-400 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg border transition-colors ${
                              isSelected
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : isDark
                                  ? "bg-zinc-900/40 border-zinc-850 text-zinc-500"
                                  : "bg-zinc-100 border-zinc-200 text-zinc-400"
                            }`}>
                              <LucideIcon name={item.icon} className="w-4 h-4 shrink-0" />
                            </div>
                            <div className="space-y-0.5">
                              <p className={`text-xs font-bold ${
                                isSelected 
                                  ? isDark ? "text-white" : "text-zinc-950" 
                                  : isDark ? "text-zinc-200" : "text-zinc-700"
                              }`}>
                                {item.title}
                              </p>
                              <p className="text-[10px] text-zinc-500 font-medium truncate max-w-sm">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>

                          {/* Action hotkey badge */}
                          {item.shortcut && (
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                              isSelected
                                ? isDark ? "text-white border-white/20 bg-white/10" : "text-zinc-900 border-zinc-300 bg-zinc-200"
                                : isDark ? "text-zinc-600 border-zinc-900" : "text-zinc-400 border-zinc-200"
                            }`}>
                              {item.shortcut}
                            </span>
                          )}
                        </button>
                      </React.Fragment>
                    );
                  });
                })()
              )}
            </div>

            {/* Command Palette Footer instructions */}
            <div className={`px-4.5 py-3 border-t text-[10px] font-mono flex items-center justify-between ${
              isDark ? "border-white/[0.06] text-zinc-500 bg-zinc-950/50" : "border-zinc-200 text-zinc-400 bg-zinc-50"
            }`}>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <LucideIcon name="CornerDownLeft" className="w-3 h-3" /> Select
                </span>
                <span className="flex items-center gap-1">
                  <LucideIcon name="ChevronDown" className="w-3 h-3" />
                  <LucideIcon name="ChevronUp" className="w-3 h-3" /> Navigate
                </span>
              </div>
              <div>Press ESC to close</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
