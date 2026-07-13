import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import LucideIcon from "./LucideIcon";

export interface SystemNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  category: "success" | "info" | "booking" | "billing";
  read: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "dark" | "light";
  onActionClick?: (actionId: string) => void;
}

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-1",
    title: "Website Minted Successfully",
    body: "Your restaurant portal 'Bistro Table' was successfully deployed to SiteMint edge CDN networks.",
    timestamp: "2 mins ago",
    category: "success",
    read: false,
  },
  {
    id: "notif-2",
    title: "New Appointment Booked",
    body: "John Doe booked a 'Personal Workout' session at Apex Gym. Time slot: 3:00 PM tomorrow.",
    timestamp: "15 mins ago",
    category: "booking",
    read: false,
  },
  {
    id: "notif-3",
    title: "Standard Subscription Activated",
    body: "Your credit card transaction cleared successfully. Minting credits are now fully active.",
    timestamp: "1 hour ago",
    category: "billing",
    read: true,
  },
  {
    id: "notif-4",
    title: "Compiler Upgraded to v3.5",
    body: "SiteMint compiler nodes were updated. CSS variables are now optimized automatically on build.",
    timestamp: "1 day ago",
    category: "info",
    read: true,
  },
];

export default function NotificationPanel({ isOpen, onClose, theme, onActionClick }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const removeNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const isDark = theme === "dark";
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] md:w-[380px] z-50 text-left" id="notification-panel">
          {/* Backdrop handle overlay to dismiss when clicked outside */}
          <div className="fixed inset-0 z-10" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`relative z-20 rounded-2xl border shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col ${
              isDark 
                ? "bg-zinc-950/95 border-white/[0.08] text-white" 
                : "bg-white/95 border-zinc-200 text-zinc-900"
            }`}
          >
            {/* Popover Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isDark ? "border-white/[0.06]" : "border-zinc-200"
            }`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold tracking-tight uppercase font-mono ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}>
                  Live Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="bg-emerald-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    {unreadCount} NEW
                  </span>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={markAllRead}
                    className="text-[10px] font-mono font-bold text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                  <span className="text-zinc-800">|</span>
                  <button
                    onClick={clearAll}
                    className="text-[10px] font-mono font-bold text-rose-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Notification Stream Feed */}
            <div className="max-h-[340px] overflow-y-auto divide-y divide-zinc-900/40" id="notification-scroll-body">
              {notifications.length === 0 ? (
                /* Empty state inside notification list */
                <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center mb-3 ${
                    isDark ? "bg-zinc-900 border-zinc-800 text-zinc-600" : "bg-zinc-100 border-zinc-200 text-zinc-400"
                  }`}>
                    <LucideIcon name="BellOff" className="w-5 h-5" />
                  </div>
                  <h4 className={`text-xs font-bold ${isDark ? "text-zinc-300" : "text-zinc-800"}`}>
                    Inbox fully cleared
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-1 max-w-[200px] leading-relaxed">
                    No active compiler warnings or custom booking notifications right now.
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  let catIcon = "CheckCircle2";
                  let catColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/10";
                  if (n.category === "booking") {
                    catIcon = "CalendarDays";
                    catColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/10";
                  } else if (n.category === "billing") {
                    catIcon = "CreditCard";
                    catColor = "text-violet-400 bg-violet-500/10 border-violet-500/10";
                  } else if (n.category === "info") {
                    catIcon = "Activity";
                    catColor = "text-amber-400 bg-amber-500/10 border-amber-500/10";
                  }

                  return (
                    <div
                      key={n.id}
                      className={`p-3.5 transition-all flex gap-3 relative group ${
                        !n.read 
                          ? isDark ? "bg-white/[0.02]" : "bg-zinc-50" 
                          : "bg-transparent"
                      }`}
                    >
                      {/* Category Icon Badge */}
                      <div className={`p-2 rounded-xl border shrink-0 h-9 w-9 flex items-center justify-center ${catColor}`}>
                        <LucideIcon name={catIcon} className="w-4 h-4" />
                      </div>

                      {/* Text Column */}
                      <div className="space-y-1 flex-grow pr-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-bold ${
                            !n.read 
                              ? isDark ? "text-white" : "text-zinc-950 font-extrabold" 
                              : isDark ? "text-zinc-300" : "text-zinc-700"
                          }`}>
                            {n.title}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500 whitespace-nowrap shrink-0">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                          {n.body}
                        </p>
                        
                        {/* Micro CTA links */}
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={() => toggleRead(n.id)}
                            className="text-[9px] font-bold font-mono text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer"
                          >
                            {n.read ? "Mark Unread" : "Mark Read"}
                          </button>
                        </div>
                      </div>

                      {/* Dismiss Hover Button */}
                      <button
                        onClick={() => removeNotif(n.id)}
                        className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-600 hover:text-rose-400 rounded cursor-pointer"
                        title="Dismiss notification"
                      >
                        <LucideIcon name="X" className="w-3.5 h-3.5" />
                      </button>

                      {/* Unread tiny neon indicator dot */}
                      {!n.read && (
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Notification Footer action bar */}
            {notifications.length > 0 && (
              <div className={`p-2.5 text-center border-t ${
                isDark ? "border-white/[0.06] bg-zinc-950/50" : "border-zinc-200 bg-zinc-50"
              }`}>
                <p className="text-[9px] font-mono text-zinc-500">
                  SiteMint compiler alerts synchronized with cloud servers
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
