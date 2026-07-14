import { useState, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import LucideIcon from "./LucideIcon";
import Logo from "./Logo";

interface SuperAdminDashboardProps {
  userEmail: string;
  onLogout: () => void;
  onNavigate: (view: any) => void;
}

export default function SuperAdminDashboard({ userEmail, onLogout, onNavigate }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "Dashboard" | "Businesses" | "Announcements" | "Platform Settings" | "Platform Analytics"
  >("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data states
  const [metrics, setMetrics] = useState<any>({
    totalBusinesses: 0,
    totalUsers: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    trialAccounts: 0,
    publishedWebsites: 0,
    pendingWebsites: 0
  });

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [businessSearch, setBusinessSearch] = useState("");
  const [isNewAnnouncementOpen, setIsNewAnnouncementOpen] = useState(false);
  
  // Announcement input states
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    const token = localStorage.getItem("sitemint_token");
    if (!token) return;

    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    try {
      setIsLoading(true);
      // Fetch Metrics
      const mRes = await fetch("/api/admin/metrics", { headers });
      const mResult = await mRes.json();
      if (mResult.status === "success") {
        setMetrics(mResult.data);
      }

      // Fetch Businesses
      const bRes = await fetch(`/api/admin/businesses?search=${businessSearch}`, { headers });
      const bResult = await bRes.json();
      if (bResult.status === "success") {
        setBusinesses(bResult.data);
      }

      // Fetch Announcements
      const aRes = await fetch("/api/admin/announcements", { headers });
      const aResult = await aRes.json();
      if (aResult.status === "success") {
        setAnnouncements(aResult.data);
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading administrative datasets:", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [businessSearch]);

  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
    const confirmMsg = `Are you sure you want to ${nextStatus === "suspended" ? "suspend" : "activate"} this business?`;
    if (!window.confirm(confirmMsg)) return;

    const token = localStorage.getItem("sitemint_token");
    try {
      const res = await fetch(`/api/admin/businesses/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update business status.");
      fetchAdminData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteBusiness = async (id: number, name: string) => {
    const confirmMsg = `WARNING: This will permanently delete the business "${name}" and all associated customers, bookings, payments, and user records. This action is irreversible. Proceed?`;
    if (!window.confirm(confirmMsg)) return;

    const token = localStorage.getItem("sitemint_token");
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete business.");
      fetchAdminData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementContent) return;

    const token = localStorage.getItem("sitemint_token");
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title: announcementTitle, content: announcementContent })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to post announcement.");
      
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setIsNewAnnouncementOpen(false);
      fetchAdminData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    const token = localStorage.getItem("sitemint_token");
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete announcement.");
      fetchAdminData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const sidebarItems = [
    { name: "Dashboard", label: "Overview Hub", icon: "LayoutDashboard" },
    { name: "Businesses", label: "Tenant Directory", icon: "Building2" },
    { name: "Announcements", label: "Broadcast Logs", icon: "Megaphone" },
    { name: "Platform Analytics", label: "Metrics & Growth", icon: "LineChart" },
    { name: "Platform Settings", label: "Global Settings", icon: "Sliders" }
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-300 flex font-sans" id="super-admin-layout">
      {/* Sidebar background overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`bg-[#0c0c0e] border-r border-zinc-900 flex flex-col justify-between transition-all duration-300 z-50 fixed inset-y-0 left-0 w-64 md:sticky md:top-0 md:h-screen shrink-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${
          sidebarCollapsed ? "md:w-20" : "md:w-64"
        }`}
      >
        <div>
          {/* Logo brand */}
          <div className="p-5 flex items-center justify-between border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <Logo showText={false} variant="icon" className="h-8 w-8" imgClassName="h-8 w-8 rounded-xl" />
              {!sidebarCollapsed && (
                <span className="font-bold text-base tracking-tight font-display text-white">
                  SiteMint <span className="text-cyan-400 text-[10px] font-mono px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md">ADMIN</span>
                </span>
              )}
            </div>
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-lg bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 hidden md:block"
            >
              <LucideIcon name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-grow py-4 px-3 space-y-1.5">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name as any);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl text-left transition-all text-xs font-semibold group ${
                    isActive 
                      ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400" 
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent"
                  }`}
                >
                  <span className={`mr-3 shrink-0 ${isActive ? "text-cyan-400" : "text-zinc-500 group-hover:text-white"}`}>
                    <LucideIcon name={item.icon} className="w-4 h-4" />
                  </span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-zinc-900">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 text-xs font-semibold text-red-400 hover:text-red-300 transition-all"
          >
            <LucideIcon name="LogOut" className="w-4 h-4" />
            {!sidebarCollapsed && <span>End Session</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen relative flex flex-col">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white md:hidden"
            >
              <LucideIcon name="Menu" className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Administrative terminal</span>
              <h2 className="text-2xl font-bold tracking-tight text-white font-display mt-0.5">{activeTab}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 flex items-center gap-2.5 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Root Secure Mode</span>
            </div>
          </div>
        </div>

        {/* Content routing view blocks */}
        <div className="flex-grow">
          {isLoading ? (
            <div className="py-24 text-center space-y-4">
              <LucideIcon name="Loader2" className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-zinc-500">Querying platform database records...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* TAB: DASHBOARD OVERVIEW */}
              {activeTab === "Dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8 text-left"
                >
                  {/* Platform Quick Statistics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { title: "Total Businesses", val: metrics.totalBusinesses, desc: "Registered tenants", icon: "Building2", color: "text-cyan-400", bg: "bg-cyan-500/10" },
                      { title: "Platform Users", val: metrics.totalUsers, desc: "Owners, managers & staff", icon: "Users", color: "text-indigo-400", bg: "bg-indigo-500/10" },
                      { title: "Store Customers", val: metrics.totalCustomers, desc: "Combined buyer directory", icon: "Heart", color: "text-pink-400", bg: "bg-pink-500/10" },
                      { title: "Platform Earnings", val: `₹${metrics.totalRevenue}`, desc: "Total platform revenue", icon: "DollarSign", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                      { title: "Monthly Revenue", val: `₹${metrics.monthlyRevenue}`, desc: "Earnings this month", icon: "Calendar", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                      { title: "Active Subscriptions", val: metrics.activeSubscriptions, desc: "SaaS premium tiers", icon: "Zap", color: "text-amber-400", bg: "bg-amber-500/10" },
                      { title: "Cancelled Subscriptions", val: metrics.cancelledSubscriptions, desc: "Inactive premium tiers", icon: "ZapOff", color: "text-red-400", bg: "bg-red-500/10" },
                      { title: "Trial Accounts", val: metrics.trialAccounts, desc: "Active free trials", icon: "Clock", color: "text-purple-400", bg: "bg-purple-500/10" },
                      { title: "Expired Trials", val: metrics.expiredTrials, desc: "Trial period ended", icon: "AlertOctagon", color: "text-red-450", bg: "bg-red-500/5" },
                      { title: "Pending Payments", val: metrics.pendingPayments, desc: "Awaiting gateway capture", icon: "CreditCard", color: "text-amber-500", bg: "bg-amber-500/10" },
                      { title: "Published Sites", val: metrics.publishedWebsites, desc: "Live tenant storefronts", icon: "Globe", color: "text-teal-400", bg: "bg-teal-500/10" },
                      { title: "Pending Websites", val: metrics.pendingWebsites, desc: "Awaiting dns deployment", icon: "FileText", color: "text-zinc-400", bg: "bg-zinc-500/10" },
                    ].map((card, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">{card.title}</span>
                          <h3 className="text-xl sm:text-2xl font-black text-white font-mono">{card.val}</h3>
                          <span className="text-[9px] text-zinc-500 font-semibold">{card.desc}</span>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.bg} ${card.color}`}>
                          <LucideIcon name={card.icon} className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Announcement banner summary inside Admin panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 space-y-4">
                      <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider text-zinc-400">System Broadcast Announcement</h3>
                      <div className="space-y-3">
                        {announcements.slice(0, 3).map((ann) => (
                          <div key={ann.id} className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                            <h4 className="text-xs font-bold text-white">{ann.title}</h4>
                            <p className="text-[11px] text-zinc-550 leading-relaxed">{ann.content}</p>
                          </div>
                        ))}
                        {announcements.length === 0 && (
                          <p className="text-xs text-zinc-550 italic">No broadcast announcements sent.</p>
                        )}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 space-y-4">
                      <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider text-zinc-400">Quick Portal Control</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setActiveTab("Businesses")} className="p-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-left transition-all space-y-2">
                          <LucideIcon name="Building2" className="w-5 h-5 text-cyan-400" />
                          <h4 className="text-xs font-bold text-white">Manage Tenants</h4>
                          <p className="text-[10px] text-zinc-500 leading-normal">Verify registered business subdomains</p>
                        </button>
                        <button onClick={() => setActiveTab("Announcements")} className="p-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-left transition-all space-y-2">
                          <LucideIcon name="Megaphone" className="w-5 h-5 text-purple-400" />
                          <h4 className="text-xs font-bold text-white">Broadcast Alerts</h4>
                          <p className="text-[10px] text-zinc-500 leading-normal">Create announcements for dashboard screens</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB: TENANT BUSINESSES */}
              {activeTab === "Businesses" && (
                <motion.div
                  key="businesses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  {/* Search bar */}
                  <div className="flex flex-col sm:flex-row gap-4 bg-zinc-950/60 p-5 rounded-2xl border border-zinc-900">
                    <div className="relative flex-grow">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                        <LucideIcon name="Search" className="w-4 h-4" />
                      </span>
                      <input 
                        type="text" 
                        placeholder="Search by business name, subdomain, or owner email..." 
                        value={businessSearch}
                        onChange={(e) => setBusinessSearch(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 text-white placeholder-zinc-550 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Businesses Table Grid */}
                  <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-zinc-950/80 text-[10px] font-mono text-zinc-500 uppercase border-b border-zinc-900">
                          <tr>
                            <th className="p-4 font-bold">Business Name</th>
                            <th className="p-4 font-bold">Category</th>
                            <th className="p-4 font-bold">Subdomain URL</th>
                            <th className="p-4 font-bold">Owner Details</th>
                            <th className="p-4 font-bold">Current Plan</th>
                            <th className="p-4 font-bold">Renewal Date</th>
                            <th className="p-4 font-bold">Status</th>
                            <th className="p-4 font-bold">Published</th>
                            <th className="p-4 font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          {businesses.map((biz) => (
                            <tr key={biz.id} className="hover:bg-zinc-900/10">
                              <td className="p-4 font-bold text-white">{biz.name}</td>
                              <td className="p-4 capitalize text-zinc-400">{biz.business_type}</td>
                              <td className="p-4 font-mono text-zinc-500">
                                <a 
                                  href={`https://${biz.subdomain}.sitemint.app`} 
                                  target="_blank" 
                                  className="text-cyan-400 hover:underline"
                                >
                                  {biz.subdomain}.sitemint.app
                                </a>
                              </td>
                              <td className="p-4">
                                <p className="font-bold text-zinc-300">{biz.owner_name || "N/A"}</p>
                                <p className="text-[10px] text-zinc-500 font-mono">{biz.owner_email || "N/A"}</p>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                                  biz.current_plan === "business" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                                  biz.current_plan === "pro" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                  "bg-zinc-500/10 text-zinc-400 border border-zinc-800"
                                }`}>
                                  {biz.current_plan ? `${biz.current_plan} (${biz.subscription_status || 'trial'})` : "Starter (trial)"}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-zinc-400">
                                {biz.renewal_date ? new Date(biz.renewal_date).toLocaleDateString() : "N/A"}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wider border ${
                                  biz.status === "active" 
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                    : biz.status === "suspended" 
                                    ? "bg-red-500/10 border-red-500/20 text-red-400" 
                                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                }`}>
                                  {biz.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`text-[9px] font-mono font-bold uppercase ${biz.is_published ? "text-emerald-400" : "text-zinc-550"}`}>
                                  {biz.is_published ? "Yes" : "No"}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleUpdateStatus(biz.id, biz.status)}
                                    className={`px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer ${
                                      biz.status === "suspended"
                                        ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30 hover:bg-emerald-900/20"
                                        : "bg-red-950/20 text-red-400 border-red-900/30 hover:bg-red-900/20"
                                    }`}
                                  >
                                    {biz.status === "suspended" ? "Unsuspend" : "Suspend"}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBusiness(biz.id, biz.name)}
                                    className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-red-950 border border-zinc-800 hover:border-red-900 text-zinc-400 hover:text-white text-[10px] font-semibold transition-all cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {businesses.length === 0 && (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-zinc-550 italic">
                                No business registers found in database.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB: ANNOUNCEMENTS */}
              {activeTab === "Announcements" && (
                <motion.div
                  key="announcements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  <div className="flex justify-between items-center bg-zinc-950/60 p-6 rounded-2xl border border-zinc-900">
                    <div>
                      <h3 className="text-lg font-bold text-white font-display">System Notifications Broadcast</h3>
                      <p className="text-xs text-zinc-550 font-mono">Create news cards distributed to every business owner's cockpit.</p>
                    </div>
                    <button
                      onClick={() => setIsNewAnnouncementOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <LucideIcon name="Megaphone" className="w-4 h-4" />
                      Create Alert
                    </button>
                  </div>

                  {/* Announcements list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="p-5 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                              System Broadcast
                            </span>
                            <button
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              className="w-6 h-6 rounded-lg bg-red-950/20 border border-red-900/30 flex items-center justify-center text-red-400 hover:text-red-300 transition-all cursor-pointer"
                              title="Delete Broadcast"
                            >
                              <LucideIcon name="Trash2" className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white font-display">{ann.title}</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">{ann.content}</p>
                          </div>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono pt-4 border-t border-zinc-900 mt-4">
                          Posted: {new Date(ann.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {announcements.length === 0 && (
                      <div className="col-span-2 p-12 text-center text-zinc-550 italic bg-zinc-950/10 border border-zinc-900 border-dashed rounded-2xl">
                        No platform alerts posted.
                      </div>
                    )}
                  </div>

                  {/* Add Announcement Modal */}
                  {isNewAnnouncementOpen && (
                    <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsNewAnnouncementOpen(false)} />
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-md bg-[#0C0D14] border border-zinc-850 rounded-3xl p-6 shadow-2xl space-y-6"
                      >
                        <div>
                          <h3 className="text-base font-bold text-white font-display">New Announcement Broadcast</h3>
                          <p className="text-xs text-zinc-550">Alerts will push immediately to owner dashboards.</p>
                        </div>
                        <form onSubmit={handleAddAnnouncement} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Title</label>
                            <input
                              type="text"
                              required
                              placeholder="Platform Maintenance Scheduled"
                              value={announcementTitle}
                              onChange={(e) => setAnnouncementTitle(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Content Body</label>
                            <textarea
                              required
                              rows={4}
                              placeholder="Dear Merchants, we are updating the servers on July 14th at 2:00 AM IST. Database latency might spike briefly."
                              value={announcementContent}
                              onChange={(e) => setAnnouncementContent(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 resize-none"
                            />
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setIsNewAnnouncementOpen(false)}
                              className="flex-1 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-350 font-bold hover:text-white transition-all text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold hover:opacity-95 transition-all text-xs cursor-pointer"
                            >
                              Broadcast Alert
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB: PLATFORM ANALYTICS */}
              {activeTab === "Platform Analytics" && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 space-y-4">
                    <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider text-zinc-400">Category Breakdown</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {["Gym", "Restaurant", "Salon", "Clothing Store"].map((cat, idx) => {
                        const count = businesses.filter(b => b.business_type?.toLowerCase().includes(cat.toLowerCase().split(" ")[0])).length;
                        return (
                          <div key={idx} className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl text-left space-y-1">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">{cat} Type</span>
                            <h4 className="text-xl font-bold text-white">{count} Businesses</h4>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 space-y-2">
                    <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider text-zinc-400">Live Operational Edge Logs</h3>
                    <p className="text-xs text-zinc-550 font-mono">Platform analytics, active databases connection health 100%.</p>
                  </div>
                </motion.div>
              )}

              {/* TAB: PLATFORM SETTINGS */}
              {activeTab === "Platform Settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 space-y-4">
                    <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider text-zinc-400">Platform Settings Configuration</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white">Maintenance Lockout</h4>
                          <p className="text-[10px] text-zinc-500 font-mono">Lock business onboarding registration triggers during platform updates.</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-red-400 border border-red-500/20 bg-red-500/10 px-2 py-0.5 rounded">Disabled</span>
                      </div>
                      <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white">Global SSL Enforcement</h4>
                          <p className="text-[10px] text-zinc-500 font-mono">Enforce SSL bindings dynamically across subdomains.</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
