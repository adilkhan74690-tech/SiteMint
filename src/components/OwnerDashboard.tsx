import { useState, useRef, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Cell,
  Pie,
} from "recharts";
import LucideIcon from "./LucideIcon";
import Logo from "./Logo";

interface OwnerDashboardProps {
  userEmail: string;
  onLogout: () => void;
  onNavigate: (view: "landing" | "login" | "register" | "forgot-password" | "reset-password" | "onboarding" | "dashboard") => void;
}

// Mock initial databases
const INITIAL_BOOKINGS = [
  { id: "B-8391", customer: "Sarah Jenkins", service: "Balayage Artistry & Styling", date: "2026-07-14", time: "10:30 AM", amount: 180, status: "Confirmed", email: "sarah.j@gmail.com" },
  { id: "B-2901", customer: "Michael Chang", service: "Custom Body Diagnostic Evaluation", date: "2026-07-15", time: "01:15 PM", amount: 120, status: "Pending", email: "m.chang@vanguard.co" },
  { id: "B-4920", customer: "Emma Watson", service: "Hot Stone Restorative Ritual", date: "2026-07-16", time: "03:00 PM", amount: 240, status: "Confirmed", email: "emma.w@watsoncorp.org" },
  { id: "B-5712", customer: "David Miller", service: "Elite Strength & Mechanics Audit", date: "2026-07-17", time: "09:00 AM", amount: 150, status: "Rescheduled", email: "david.miller@millerfit.io" },
  { id: "B-1049", customer: "Jessica Laurent", service: "Advanced Keratin Styling Ritual", date: "2026-07-18", time: "11:00 AM", amount: 195, status: "Pending", email: "jess.laurent@yahoo.fr" },
];

const INITIAL_PRODUCTS = [
  { id: "P-01", name: "Supreme Volumizing Elixir", price: 48, stock: 34, status: "Active", sales: 112, image: "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=300&q=80" },
  { id: "P-02", name: "Premium Restorative Silt Mask", price: 64, stock: 18, status: "Active", sales: 84, image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=300&q=80" },
  { id: "P-03", name: "Dual-Core Athletic Grip Band", price: 29, stock: 85, status: "Active", sales: 240, image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80" },
  { id: "P-04", name: "Aromatherapy Organic Balm", price: 38, stock: 0, status: "Out of Stock", sales: 98, image: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=300&q=80" },
];

const INITIAL_ORDERS = [
  { id: "ORD-9402", customer: "Lucas Thorne", date: "2026-07-12", amount: 96, status: "Processing", items: "2x Supreme Volumizing Elixir", tracking: "USPS-MINT-9402" },
  { id: "ORD-9104", customer: "Sophia Patel", date: "2026-07-11", amount: 64, status: "Shipped", items: "1x Premium Restorative Silt Mask", tracking: "UPS-SMT-1094" },
  { id: "ORD-8823", customer: "John Vance", date: "2026-07-09", amount: 145, status: "Delivered", items: "5x Dual-Core Athletic Grip Band", tracking: "FEDEX-SMT-2091" },
];

const INITIAL_REVIEWS = [
  { id: "R-1", author: "Clara Bennett", rating: 5, comment: "The booking calendar compiled on SiteMint operates so smoothly. My clients love the intuitive reservation structure!", date: "2026-07-10", reply: "", service: "Hair & Nail Salons" },
  { id: "R-2", author: "Gregory Ross", rating: 4, comment: "Beautiful styling presets. I changed my main color scheme in seconds and the desktop version looks fantastic.", date: "2026-07-08", reply: "Thank you for the kind feedback!", service: "Fitness & Athletics" },
  { id: "R-3", author: "Victoria Song", rating: 5, comment: "Incredible load speeds and zero setup hassle. Minting was quite literally an instantaneous process.", date: "2026-07-05", reply: "", service: "Boutique Restaurants" },
];

const INITIAL_CUSTOMERS = [
  { id: "C-1", name: "Sarah Jenkins", email: "sarah.j@gmail.com", spent: 540, joined: "2026-05-12", bookings: 3 },
  { id: "C-2", name: "Michael Chang", email: "m.chang@vanguard.co", spent: 360, joined: "2026-06-01", bookings: 2 },
  { id: "C-3", name: "Emma Watson", email: "emma.w@watsoncorp.org", spent: 780, joined: "2026-03-24", bookings: 4 },
  { id: "C-4", name: "David Miller", email: "david.miller@millerfit.io", spent: 150, joined: "2026-07-02", bookings: 1 },
];

const RECENT_ACTIVITIES = [
  { id: "act-1", event: "Theme Customizer updated", detail: "Primary accent set to #00F5A0 (Mint Obsidian)", time: "12 mins ago", type: "system" },
  { id: "act-2", event: "New reservation received", detail: "B-1049 requested by Jessica Laurent", time: "1 hour ago", type: "booking" },
  { id: "act-3", event: "Inventory threshold alert", detail: "Aromatherapy Organic Balm marked Out of Stock", time: "3 hours ago", type: "product" },
  { id: "act-4", event: "Payout Dispatched", detail: "$4,250 transferred to Merchant Account", time: "1 day ago", type: "payout" },
  { id: "act-5", event: "SSL Handshake verified", detail: "Subdomain certificate successfully auto-renewed", time: "2 days ago", type: "system" },
];

const INITIAL_NOTIFICATIONS = [
  { id: "not-1", title: "New Booking Request", desc: "Jessica Laurent scheduled Advanced Styling for Jul 18.", read: false, type: "booking" },
  { id: "not-2", title: "Review Submitted", desc: "Clara Bennett rated your website with 5 stars.", read: false, type: "review" },
  { id: "not-3", title: "System Ready", desc: "Your custom subdomain sitemint.app SSL certificate is active.", read: true, type: "system" },
];

// Recharts chart data
const ANALYTICS_REVENUE_DATA = [
  { name: "Jan", Revenue: 3400, Views: 4100, Orders: 42 },
  { name: "Feb", Revenue: 4100, Views: 5300, Orders: 51 },
  { name: "Mar", Revenue: 4900, Views: 6700, Orders: 59 },
  { name: "Apr", Revenue: 6200, Views: 8900, Orders: 74 },
  { name: "May", Revenue: 7100, Views: 10400, Orders: 81 },
  { name: "Jun", Revenue: 8429, Views: 12481, Orders: 94 },
];

const PIE_TRAFFIC_DATA = [
  { name: "Direct Search", value: 4500, color: "#10B981" },
  { name: "Instagram Referral", value: 3800, color: "#EC4899" },
  { name: "Google Local Maps", value: 2481, color: "#06B6D4" },
  { name: "Email Pipelines", value: 1700, color: "#F59E0B" },
];

export default function OwnerDashboard({ userEmail, onLogout, onNavigate }: OwnerDashboardProps) {
  // Sidebar active tab
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Core mutable lists powered by dummy states
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activities, setActivities] = useState(RECENT_ACTIVITIES);

  // Live Builder / Theme settings updated instantly!
  const [brandName, setBrandName] = useState("Vanguard Athletic Lab");
  const [slogan, setSlogan] = useState("Elite body mechanics & diagnostic audits");
  const [themeAccent, setThemeAccent] = useState("#00F5A0");
  const [themeSecondary, setThemeSecondary] = useState("#10B981");
  const [themeBg, setThemeBg] = useState("#09090B");
  const [typography, setTypography] = useState("Space Grotesk");
  const [buttonStyle, setButtonStyle] = useState("rounded-xl");
  const [borderRadiusVal, setBorderRadiusVal] = useState("12px");
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");

    // Search queries
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("sitemint_token");
    if (!token) return;

    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    try {
      // 1. Fetch Business Settings
      const settingsRes = await fetch("/api/businesses/settings?subdomain=vanguard-athletic-lab", { headers });
      const settingsResult = await settingsRes.json();
      let activeBizId = 1;
      if (settingsResult.status === "success" && settingsResult.data.business) {
        const biz = settingsResult.data.business;
        setBusinessId(biz.id);
        activeBizId = biz.id;
        setBrandName(biz.name);
        setSlogan(biz.description || "");
        if (settingsResult.data.theme_settings) {
          setThemeAccent(settingsResult.data.theme_settings.primary_color);
          setThemeSecondary(settingsResult.data.theme_settings.secondary_color);
          setTypography(settingsResult.data.theme_settings.font_family);
        }
      }

      // 2. Fetch Bookings
      const bookingsRes = await fetch("/api/bookings", { headers });
      const bookingsResult = await bookingsRes.json();
      if (bookingsResult.status === "success") {
        setBookings(bookingsResult.data);
      }

      // 3. Fetch Products
      const productsRes = await fetch(`/api/catalog/products?business_id=${activeBizId}`, { headers });
      const productsResult = await productsRes.json();
      if (productsResult.status === "success") {
        setProducts(productsResult.data);
      }

      // 4. Fetch Orders
      const ordersRes = await fetch("/api/checkout/orders", { headers });
      const ordersResult = await ordersRes.json();
      if (ordersResult.status === "success") {
        setOrders(ordersResult.data);
      }

      // 5. Fetch Payments
      const paymentsRes = await fetch("/api/checkout/payments", { headers });
      const paymentsResult = await paymentsRes.json();
      if (paymentsResult.status === "success") {
        setPaymentsList(paymentsResult.data);
      }

      // 6. Fetch Reviews
      const reviewsRes = await fetch(`/api/feedback/reviews?business_id=${activeBizId}`, { headers });
      const reviewsResult = await reviewsRes.json();
      if (reviewsResult.status === "success") {
        setReviews(reviewsResult.data);
      }

      // 7. Fetch Activity Logs
      const logsRes = await fetch("/api/feedback/logs", { headers });
      const logsResult = await logsRes.json();
      if (logsResult.status === "success") {
        setActivities(logsResult.data);
      }

      // 8. Fetch Notifications
      const notificationsRes = await fetch("/api/feedback/notifications", { headers });
      const notificationsResult = await notificationsRes.json();
      if (notificationsResult.status === "success") {
        setNotifications(notificationsResult.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const handleApprovePayment = async (paymentId: number, approve: boolean) => {
    const token = localStorage.getItem("sitemint_token");
    if (!token) return;

    try {
      const response = await fetch(`/api/checkout/payments/${paymentId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: approve ? "captured" : "failed" })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update payment status.");
      }

      alert(`UPI payment has been successfully ${approve ? "Approved" : "Rejected"}.`);
      fetchDashboardData(); // Reload list
    } catch (err: any) {
      alert("Error approving payment: " + err.message);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);
  const [bookingQuery, setBookingQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [orderQuery, setOrderQuery] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");

  // Input states for creating a product
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdImage, setNewProdImage] = useState("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Review reply state
  const [activeReviewReplyId, setActiveReviewReplyId] = useState<string | null>(null);
  const [tempReplyText, setTempReplyText] = useState("");

  // Customer detail modal selection
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<typeof INITIAL_CUSTOMERS[0] | null>(null);

  // Logo upload simulator ref
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Media library database
  const [mediaLibrary, setMediaLibrary] = useState([
    { id: "med-1", name: "vanguard_banner.png", size: "1.2 MB", type: "Image", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80", date: "2026-07-12" },
    { id: "med-2", name: "product_elixir.jpg", size: "640 KB", type: "Image", url: "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=400&q=80", date: "2026-07-11" },
    { id: "med-3", name: "salon_interior.png", size: "2.4 MB", type: "Image", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80", date: "2026-07-09" },
  ]);
  const [dragActive, setDragActive] = useState(false);

  // Activity logger trigger helper
  const logSystemActivity = (event: string, detail: string, type: string = "system") => {
    const newAct = {
      id: `act-${Date.now()}`,
      event,
      detail,
      time: "Just now",
      type,
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Instantly reflect state changes
  const handleBookingAction = (id: string, action: "Confirm" | "Reject") => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updatedStatus = action === "Confirm" ? "Confirmed" : "Cancelled";
          logSystemActivity(`Booking ${b.id} ${updatedStatus}`, `${b.customer}'s reservation has been updated to ${updatedStatus}.`, "booking");
          return { ...b, status: updatedStatus };
        }
        return b;
      })
    );
  };

  const handleOrderAction = (id: string, action: "Shipped" | "Delivered") => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          logSystemActivity(`Order ${o.id} marked ${action}`, `Tracking status updated for ${o.customer}.`, "product");
          return { ...o, status: action };
        }
        return o;
      })
    );
  };

  const handleProductStockChange = (id: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updatedStatus = newStock > 0 ? "Active" : "Out of Stock";
          logSystemActivity(`Stock Level Adjusted`, `Set ${p.name} stock to ${newStock}.`, "product");
          return { ...p, stock: newStock, status: updatedStatus };
        }
        return p;
      })
    );
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const newProd = {
      id: `P-0${products.length + 1}`,
      name: newProdName,
      price: Number(newProdPrice),
      stock: Number(newProdStock) || 10,
      status: Number(newProdStock) > 0 ? "Active" : "Out of Stock",
      sales: 0,
      image: newProdImage || "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=300&q=80",
    };

    setProducts((prev) => [...prev, newProd]);
    logSystemActivity(`Product Catalog Expanded`, `New item "${newProdName}" added to SiteMint storefront.`, "product");
    
    // Reset form
    setNewProdName("");
    setNewProdPrice("");
    setNewProdStock("");
    setNewProdImage("");
    setIsAddingProduct(false);
  };

  const handleAddReviewReply = (id: string) => {
    if (!tempReplyText) return;
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          logSystemActivity(`Review Response Published`, `Replied to buyer feedback from ${r.author}.`, "review");
          return { ...r, reply: tempReplyText };
        }
        return r;
      })
    );
    setTempReplyText("");
    setActiveReviewReplyId(null);
  };

  // Upload simulation logic
  const triggerLogoUpload = () => {
    logoInputRef.current?.click();
  };

  const triggerBannerUpload = () => {
    bannerInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setLogoPreview(url);
      logSystemActivity("Logo Re-Minted", "Custom brand logo loaded into builder workspace.", "system");
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setBannerPreview(url);
      logSystemActivity("Banner Asset Updated", "Storefront banner updated under active workspace.", "system");
    }
  };

  // Drag and Drop Simulator for Media Library
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const url = URL.createObjectURL(file);
      const newMedia = {
        id: `med-${mediaLibrary.length + 1}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type.split("/")[0].toUpperCase() || "File",
        url: url,
        date: new Date().toISOString().split("T")[0],
      };
      setMediaLibrary((prev) => [newMedia, ...prev]);
      logSystemActivity("Media Library Asset Appended", `Successfully processed and mounted file: ${file.name}`, "system");
    }
  };

  const handleManualMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const newMedia = {
        id: `med-${mediaLibrary.length + 1}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type.split("/")[0].toUpperCase() || "File",
        url: url,
        date: new Date().toISOString().split("T")[0],
      };
      setMediaLibrary((prev) => [newMedia, ...prev]);
      logSystemActivity("Media Library Asset Appended", `Successfully processed and mounted file: ${file.name}`, "system");
    }
  };

  // Quick Preset Themes Application
  const applyPresetTheme = (primary: string, secondary: string, bg: string) => {
    setThemeAccent(primary);
    setThemeSecondary(secondary);
    setThemeBg(bg);
    logSystemActivity("Color Palette Reset", `Interactive workspace changed colors.`, "system");
  };

  // Navigation Sidebar Elements
  const sidebarItems = [
    { name: "Dashboard", icon: "LayoutDashboard", badge: 0 },
    { name: "Website Builder", icon: "Globe", badge: 0 },
    { name: "Theme Customizer", icon: "Palette", badge: 0 },
    { name: "Analytics", icon: "LineChart", badge: 0 },
    { name: "Bookings", icon: "Calendar", badge: bookings.filter(b => b.status === "Pending").length },
    { name: "Customers", icon: "Users", badge: 0 },
    { name: "Products", icon: "ShoppingBag", badge: 0 },
    { name: "Orders", icon: "ShoppingCart", badge: orders.filter(o => o.status === "Processing").length },
    { name: "Reviews", icon: "Star", badge: reviews.filter(r => !r.reply).length },
    { name: "Payments", icon: "CreditCard", badge: 0 },
    { name: "Media Library", icon: "Image", badge: 0 },
    { name: "Activity Logs", icon: "FileText", badge: 0 },
    { name: "Notifications", icon: "Bell", badge: notifications.filter(n => !n.read).length },
    { name: "Settings", icon: "Settings", badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col md:flex-row font-sans" id="owner-dashboard-container">
      
      {/* 1. COLLAPSIBLE SIDEBAR CONTAINER */}
      <aside 
        className={`bg-[#0c0c0e] border-r border-zinc-900/90 flex flex-col justify-between transition-all duration-300 z-40 relative md:sticky md:top-0 md:h-screen shrink-0 ${
          sidebarCollapsed ? "w-full md:w-20" : "w-full md:w-64"
        }`}
        id="owner-dashboard-sidebar"
      >
        {/* Logo and collapse toggle */}
        <div className="p-5 flex items-center justify-between border-b border-zinc-900" id="sidebar-top">
          <div className="flex items-center gap-3">
            <Logo showText={false} variant="icon" className="h-8 w-8" imgClassName="h-8 w-8 rounded-xl" />
            {!sidebarCollapsed && (
              <span className="font-bold text-base tracking-tight font-display text-white">
                SiteMint <span className="text-emerald-400 text-xs font-mono px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">PRO</span>
              </span>
            )}
          </div>

          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-lg bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 hidden md:block"
            id="btn-collapse-sidebar"
          >
            <LucideIcon name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Nav Items List */}
        <div className="flex-grow py-4 px-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]" id="sidebar-middle-scroll">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all text-xs font-semibold group relative ${
                  isActive 
                    ? "bg-gradient-to-r from-zinc-900 to-zinc-900/40 text-emerald-400 border-l-[3px] border-emerald-400 pl-2.5" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
                id={`sidebar-tab-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-center gap-3">
                  <LucideIcon 
                    name={item.icon} 
                    className={`w-4 h-4 transition-colors ${isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"}`} 
                  />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </div>

                {item.badge > 0 && !sidebarCollapsed && (
                  <span className="text-[9px] font-mono font-black bg-red-500 text-white rounded-full px-1.5 py-0.5 shrink-0 animate-pulse">
                    {item.badge}
                  </span>
                )}

                {/* Micro tooltip if collapsed */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-[10px] font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl border border-zinc-800">
                    {item.name} {item.badge > 0 && `(${item.badge})`}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* User context footer */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/40 flex items-center justify-between" id="sidebar-bottom">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-zinc-700">
              {userEmail.substring(0, 1).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="text-left overflow-hidden">
                <p className="text-[11px] font-bold text-white truncate leading-none">{userEmail.split("@")[0]}</p>
                <p className="text-[9px] font-mono text-zinc-500 truncate mt-0.5">{userEmail}</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button 
              onClick={onLogout}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Log Out"
              id="btn-sidebar-logout"
            >
              <LucideIcon name="LogOut" className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* 2. MAIN HUB WORKSPACE CONTENT */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen relative flex flex-col" id="owner-workspace-main">
        
        {/* Top Operational Status Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900/80 mb-8" id="workspace-top-bar">
          <div className="text-left">
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              <span>Merchant Station</span>
              <span>•</span>
              <span className="text-emerald-400">Connected Edge</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-display mt-0.5">
              {activeTab} Workspace
            </h2>
          </div>

          <div className="flex items-center gap-3.5 self-stretch sm:self-auto" id="top-bar-controls">
            <button 
              onClick={() => onNavigate("landing")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-800 transition-all"
              id="btn-view-live-home"
            >
              <LucideIcon name="ExternalLink" className="w-3.5 h-3.5" />
              View Site
            </button>

            <button 
              onClick={() => setActiveTab("Notifications")}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white relative transition-colors"
              id="btn-top-notif"
            >
              <LucideIcon name="Bell" className="w-4 h-4" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-zinc-900" />
              )}
            </button>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 flex items-center gap-2.5 text-xs font-mono text-zinc-400 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Sandbox Live</span>
            </div>
          </div>
        </div>

        {/* TAB WORKSPACE ROUTER ROUTING MODULES */}
        <div className="flex-grow" id="workspace-tab-rendered-container">
          <AnimatePresence mode="wait">
            
            {/* TAB: DASHBOARD OVERVIEW */}
            {activeTab === "Dashboard" && (
              <motion.div
                key="dashboard-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* 5 MAIN CORE DASHBOARD STATS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="overview-metrics-row">
                  {[
                    { title: "Website Views", val: "12,481", diff: "+14.2% MoM", icon: "Eye", color: "text-cyan-400", bg: "bg-cyan-500/10" },
                    { title: "Total Revenue", val: "$8,429.50", diff: "+18.4% MoM", icon: "DollarSign", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { title: "Store Bookings", val: `${bookings.length}`, diff: "+8.1% MoM", icon: "Calendar", color: "text-purple-400", bg: "bg-purple-500/10" },
                    { title: "Total Customers", val: `${customers.length}`, diff: "+12.5% MoM", icon: "Users", color: "text-amber-400", bg: "bg-amber-500/10" },
                    { title: "Active Orders", val: `${orders.length}`, diff: "+22.1% MoM", icon: "ShoppingBag", color: "text-pink-400", bg: "bg-pink-500/10" },
                  ].map((card, idx) => (
                    <div 
                      key={idx} 
                      className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex items-center justify-between hover:border-zinc-800 transition-all"
                      id={`stat-card-${idx}`}
                    >
                      <div className="text-left space-y-1">
                        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">{card.title}</span>
                        <p className="text-xl sm:text-2xl font-bold text-white font-display tracking-tight">{card.val}</p>
                        <span className="text-[10px] font-semibold text-emerald-400">{card.diff}</span>
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.bg} ${card.color}`}>
                        <LucideIcon name={card.icon} className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* CHARTS ROW (recharts integration) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="charts-overview-row">
                  
                  {/* Revenue Growth chart */}
                  <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 text-left space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white font-display">Revenue & Session Funnel</h3>
                        <p className="text-xs text-zinc-500">Comparing website views against overall business transactions</p>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 border border-zinc-800 bg-zinc-950 px-2 py-1 rounded">
                        6-Month Series
                      </span>
                    </div>

                    <div className="h-64 w-full" id="recharts-revenue-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ANALYTICS_REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorView" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                          <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                          <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", color: "#fff" }} />
                          <Area type="monotone" dataKey="Revenue" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                          <Area type="monotone" dataKey="Views" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorView)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Traffic Distribution Pie chart */}
                  <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 text-left space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white font-display">Traffic Acquisition</h3>
                      <p className="text-xs text-zinc-500">Origin matrix of incoming storefront hits</p>
                    </div>

                    <div className="h-48 w-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={PIE_TRAFFIC_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {PIE_TRAFFIC_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute text-center">
                        <span className="text-xs font-mono text-zinc-500 uppercase">Total Hits</span>
                        <p className="text-xl font-black text-white">12,481</p>
                      </div>
                    </div>

                    {/* Legends stack */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400">
                      {PIE_TRAFFIC_DATA.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: item.color }} />
                          <span className="truncate">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* BOTTOM GRID: RECENT BOOKINGS & ACTIVITIES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-bottom-grid">
                  
                  {/* Recent Activity feed */}
                  <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 text-left space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white font-display">Recent Activity Logs</h3>
                      <button onClick={() => setActiveTab("Activity Logs")} className="text-xs text-emerald-400 hover:underline">
                        View All
                      </button>
                    </div>

                    <div className="space-y-4">
                      {activities.slice(0, 5).map((act) => (
                        <div key={act.id} className="flex items-start gap-3.5 pb-3 border-b border-zinc-900 last:border-0 last:pb-0">
                          <div className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center shrink-0">
                            <LucideIcon 
                              name={
                                act.type === "booking" ? "Calendar" :
                                act.type === "product" ? "ShoppingBag" :
                                act.type === "payout" ? "CreditCard" : "Server"
                              } 
                              className="w-4 h-4 text-zinc-400" 
                            />
                          </div>

                          <div className="flex-grow space-y-0.5">
                            <div className="flex justify-between items-center">
                              <p className="text-xs font-bold text-zinc-200">{act.event}</p>
                              <span className="text-[10px] font-mono text-zinc-500">{act.time}</span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-normal">{act.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Immediate bookings panel */}
                  <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 text-left space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white font-display">Incoming Customer Bookings</h3>
                      <button onClick={() => setActiveTab("Bookings")} className="text-xs text-emerald-400 hover:underline">
                        Manage Bookings
                      </button>
                    </div>

                    <div className="space-y-4">
                      {bookings.slice(0, 4).map((bk) => (
                        <div key={bk.id} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-900/60 hover:bg-zinc-900/60 transition-all">
                          <div className="text-left space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{bk.customer}</span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                bk.status === "Confirmed" ? "bg-emerald-500/10 text-emerald-400" :
                                bk.status === "Pending" ? "bg-amber-500/10 text-amber-400 animate-pulse" : "bg-cyan-500/10 text-cyan-400"
                              }`}>
                                {bk.status}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400">{bk.service}</p>
                            <p className="text-[10px] font-mono text-zinc-500">{bk.date} • {bk.time}</p>
                          </div>

                          {bk.status === "Pending" && (
                            <div className="flex gap-1.5 shrink-0">
                              <button 
                                onClick={() => handleBookingAction(bk.id, "Confirm")}
                                className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-colors"
                                title="Approve Reservation"
                              >
                                <LucideIcon name="Check" className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                              <button 
                                onClick={() => handleBookingAction(bk.id, "Reject")}
                                className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                title="Cancel/Decline"
                              >
                                <LucideIcon name="X" className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: WEBSITE BUILDER */}
            {activeTab === "Website Builder" && (
              <motion.div
                key="builder-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* LEFT: Builder Controls Panel */}
                  <div className="xl:col-span-1 p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 text-left space-y-6">
                    <div className="border-b border-zinc-900 pb-3">
                      <h3 className="text-base font-bold text-white font-display">Live Website Designer</h3>
                      <p className="text-xs text-zinc-500">Edit business info and layout variables instantly.</p>
                    </div>

                    {/* Logo upload block */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Logo Upload UI</label>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <LucideIcon name="Globe" className="w-5 h-5 text-zinc-500" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <input 
                            type="file" 
                            ref={logoInputRef} 
                            onChange={handleLogoChange} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          <button
                            type="button"
                            onClick={triggerLogoUpload}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
                          >
                            <LucideIcon name="Upload" className="w-3.5 h-3.5" />
                            Upload Logo Brand
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Banner upload block */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Banner Upload UI</label>
                      <div className="space-y-2">
                        {bannerPreview && (
                          <div className="aspect-video w-full rounded-xl overflow-hidden border border-zinc-850">
                            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <input 
                          type="file" 
                          ref={bannerInputRef} 
                          onChange={handleBannerChange} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        <button
                          type="button"
                          onClick={triggerBannerUpload}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
                        >
                          <LucideIcon name="Image" className="w-3.5 h-3.5" />
                          Choose Custom Banner Block
                        </button>
                      </div>
                    </div>

                    {/* Text fields */}
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest font-mono">Brand Name</label>
                        <input 
                          type="text" 
                          value={brandName} 
                          onChange={(e) => setBrandName(e.target.value)}
                          className="w-full bg-zinc-900/60 border border-zinc-850 text-white placeholder-zinc-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest font-mono">High-Impact Slogan</label>
                        <input 
                          type="text" 
                          value={slogan} 
                          onChange={(e) => setSlogan(e.target.value)}
                          className="w-full bg-zinc-900/60 border border-zinc-850 text-white placeholder-zinc-500 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                        />
                      </div>
                    </div>

                    {/* Theme Accent selection */}
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Palette Theme Selector</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: "Obsidian Mint", primary: "#00F5A0", secondary: "#10B981", bg: "#09090B" },
                          { name: "Neon Cyan", primary: "#06B6D4", secondary: "#3B82F6", bg: "#020617" },
                          { name: "Purple Nebula", primary: "#A855F7", secondary: "#EC4899", bg: "#090514" },
                          { name: "Sunset Ember", primary: "#F59E0B", secondary: "#EF4444", bg: "#0C0A09" },
                        ].map((pal, idx) => (
                          <button
                            key={idx}
                            onClick={() => applyPresetTheme(pal.primary, pal.secondary, pal.bg)}
                            className="p-2 rounded-xl bg-zinc-900/70 border border-zinc-850 hover:border-zinc-700 flex flex-col items-start gap-1.5 text-left transition-all text-[11px]"
                          >
                            <span className="font-bold text-white tracking-tight">{pal.name}</span>
                            <div className="flex gap-1">
                              <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: pal.primary }} />
                              <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: pal.secondary }} />
                              <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: pal.bg }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Picker direct value */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest font-mono block">Color Picker Accents</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={themeAccent} 
                          onChange={(e) => setThemeAccent(e.target.value)}
                          className="w-10 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer shrink-0" 
                        />
                        <input 
                          type="text" 
                          value={themeAccent} 
                          onChange={(e) => setThemeAccent(e.target.value)}
                          className="w-full bg-zinc-900 text-white font-mono text-xs rounded border border-zinc-850 px-2 py-1.5 focus:outline-none focus:border-emerald-400" 
                        />
                      </div>
                    </div>

                  </div>

                  {/* RIGHT: Live Preview (Desktop, Tablet, Mobile) */}
                  <div className="xl:col-span-2 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-900">
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-white font-display">Live Frame Preview</h4>
                        <p className="text-[11px] text-zinc-500">Simulating visual engine compilation in real-time</p>
                      </div>

                      {/* Viewport Modes selector */}
                      <div className="flex bg-zinc-900 p-1 rounded-xl self-start" id="viewport-picker">
                        {[
                          { mode: "desktop", icon: "Monitor", label: "Desktop" },
                          { mode: "tablet", icon: "Tablet", label: "Tablet" },
                          { mode: "mobile", icon: "Smartphone", label: "Mobile" },
                        ].map((vp) => (
                          <button
                            key={vp.mode}
                            onClick={() => setViewportMode(vp.mode as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              viewportMode === vp.mode ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            <LucideIcon name={vp.icon} className="w-3.5 h-3.5" />
                            {vp.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Web Content Render Frame */}
                    <div className="flex justify-center items-start w-full">
                      <div 
                        className={`w-full bg-zinc-950 rounded-2xl border border-zinc-900 shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ${
                          viewportMode === "mobile" ? "max-w-xs" : viewportMode === "tablet" ? "max-w-md" : "max-w-full"
                        }`}
                        style={{ minHeight: "480px" }}
                      >
                        {/* Browser navigation mockup */}
                        <div className="bg-zinc-900/60 border-b border-zinc-850 px-4 py-2.5 flex items-center justify-between text-xs">
                          <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                          </div>
                          <div className="bg-zinc-950 border border-zinc-850 text-[10px] font-mono text-zinc-500 px-4 py-0.5 rounded-md flex items-center gap-1">
                            <LucideIcon name="Shield" className="w-3 h-3 text-emerald-400" />
                            {brandName.toLowerCase().replace(/[^a-z0-9]/g, "") || "custom"}.sitemint.app
                          </div>
                          <div className="w-8" />
                        </div>

                        {/* Storefront rendered viewport mockup */}
                        <div 
                          className="flex-grow p-6 text-left flex flex-col justify-between" 
                          style={{ backgroundColor: themeBg, fontFamily: typography === "Space Grotesk" ? "sans-serif" : "monospace" }}
                        >
                          {/* Navbar mockup */}
                          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                            <div className="flex items-center gap-2">
                              {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-6 h-6 object-cover rounded" />
                              ) : (
                                <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center font-black text-[10px]" style={{ color: themeAccent }}>
                                  V
                                </div>
                              )}
                              <span className="font-bold text-sm tracking-tight text-white">{brandName || "Your Company"}</span>
                            </div>

                            <span className="text-[9px] font-mono border border-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 uppercase">
                              Active Preset
                            </span>
                          </div>

                          {/* Hero content area */}
                          <div className="my-8 space-y-4">
                            {bannerPreview && (
                              <div className="aspect-video w-full rounded-xl overflow-hidden border border-zinc-800">
                                <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                              </div>
                            )}

                            <h4 className="text-xl sm:text-2xl font-black text-white leading-tight" style={{ letterSpacing: "-0.03em" }}>
                              {slogan || "Elite body mechanics & diagnostic audits"}
                            </h4>
                            
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              Welcome to our premium compiled storefront. SiteMint builds real direct pipelines, booking matrices, and checkout networks instantly without writing a single line of backend database code.
                            </p>

                            <div className="flex flex-wrap gap-2.5 pt-2">
                              <button
                                type="button"
                                className={`px-4 py-2 text-xs font-bold text-black cursor-pointer transition-all ${buttonStyle}`}
                                style={{ 
                                  background: `linear-gradient(135deg, ${themeAccent}, ${themeSecondary})`,
                                  borderRadius: borderRadiusVal
                                }}
                              >
                                Reserve Seat Now
                              </button>
                              <button
                                type="button"
                                className={`px-4 py-2 text-xs font-bold text-zinc-300 bg-zinc-900 border border-zinc-850 cursor-pointer ${buttonStyle}`}
                                style={{ borderRadius: borderRadiusVal }}
                              >
                                Contact Workspace
                              </button>
                            </div>
                          </div>

                          {/* Footer information */}
                          <div className="border-t border-zinc-800/60 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-zinc-500 font-mono">
                            <span>© 2026 {brandName}. All rights reserved.</span>
                            <span>Powered by SiteMint v4.2 CDN</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: THEME CUSTOMIZER (Special Preset) */}
            {activeTab === "Theme Customizer" && (
              <motion.div
                key="theme-customizer-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 text-left space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white font-display">Storefront Micro-Variables</h3>
                    <p className="text-xs text-zinc-500">Bespoke configuration values directly compiled inside Vite styles.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                      
                      {/* Typography selector */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Typography Pairing</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { name: "Space Grotesk", desc: "Modern, Tech-Forward" },
                            { name: "Inter (Default)", desc: "Clean, Corporate" },
                            { name: "JetBrains Mono", desc: "Brutalist, Industrial" },
                            { name: "Playfair Serif", desc: "Editorial, Luxury" },
                          ].map((t) => (
                            <button
                              key={t.name}
                              onClick={() => setTypography(t.name)}
                              className={`p-3.5 rounded-xl border text-left transition-all ${
                                typography === t.name 
                                  ? "bg-zinc-900 border-emerald-400 text-emerald-400" 
                                  : "bg-zinc-950 border-zinc-850 hover:bg-zinc-900/40 hover:border-zinc-800"
                              }`}
                            >
                              <span className="text-xs font-bold block">{t.name}</span>
                              <span className="text-[10px] text-zinc-500 block mt-0.5">{t.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Button style selector */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Button Shape Preset</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Sharp Square", val: "rounded-none" },
                            { label: "Soft Rounded", val: "rounded-xl" },
                            { label: "Full Capsule", val: "rounded-full" },
                          ].map((shape) => (
                            <button
                              key={shape.val}
                              onClick={() => {
                                setButtonStyle(shape.val);
                                setBorderRadiusVal(shape.val === "rounded-none" ? "0px" : shape.val === "rounded-xl" ? "12px" : "999px");
                              }}
                              className={`p-3.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                                buttonStyle === shape.val 
                                  ? "bg-zinc-900 border-emerald-400 text-emerald-400" 
                                  : "bg-zinc-950 border-zinc-850 hover:border-zinc-800"
                              }`}
                            >
                              {shape.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Slider for border radius */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-zinc-400">
                          <span>Custom Border Radius Variable</span>
                          <span className="font-mono text-white font-bold">{borderRadiusVal}</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="24" 
                          value={parseInt(borderRadiusVal) || 0} 
                          onChange={(e) => {
                            setBorderRadiusVal(`${e.target.value}px`);
                            setButtonStyle("custom");
                          }}
                          className="w-full accent-emerald-400" 
                        />
                      </div>

                      {/* Secondary hex custom selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Secondary Color Variable</label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={themeSecondary} 
                            onChange={(e) => setThemeSecondary(e.target.value)}
                            className="w-10 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer shrink-0" 
                          />
                          <input 
                            type="text" 
                            value={themeSecondary} 
                            onChange={(e) => setThemeSecondary(e.target.value)}
                            className="w-full bg-zinc-900 text-white font-mono text-xs rounded border border-zinc-850 px-2 py-1.5 focus:outline-none focus:border-emerald-400" 
                          />
                        </div>
                      </div>

                    </div>

                    {/* Preview box inside customizer */}
                    <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-center space-y-6">
                      <div className="p-4 rounded-2xl border border-zinc-850 text-left space-y-4" style={{ fontFamily: typography === "Playfair Serif" ? "serif" : "sans-serif" }}>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">Live Style Sandbox</p>
                        <h4 className="text-lg font-bold text-white">How the typography looks like in headings</h4>
                        <p className="text-xs text-zinc-400">This demonstrates active font weight scales and subtext styles.</p>
                        
                        <div className="flex gap-3">
                          <button 
                            className={`px-4 py-2.5 text-xs font-bold text-black ${buttonStyle}`}
                            style={{ 
                              background: `linear-gradient(135deg, ${themeAccent}, ${themeSecondary})`,
                              borderRadius: borderRadiusVal
                            }}
                          >
                            Sample Accent Button
                          </button>
                          <button 
                            className={`px-4 py-2.5 text-xs font-bold text-zinc-300 bg-zinc-900 border border-zinc-850 ${buttonStyle}`}
                            style={{ borderRadius: borderRadiusVal }}
                          >
                            Ghost Button
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          logSystemActivity("Storefront Styles Saved", "Committed all CSS typography & custom shapes globally.", "system");
                          alert("Styles successfully pushed to production live build!");
                        }}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:opacity-95"
                      >
                        <LucideIcon name="CheckCircle" className="w-4 h-4" />
                        Save & Deploy Variables Global
                      </button>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: ANALYTICS */}
            {activeTab === "Analytics" && (
              <motion.div
                key="analytics-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Secondary chart widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Views breakdown */}
                  <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 text-left space-y-4">
                    <div>
                      <h4 className="text-base font-bold text-white font-display">Web Site Views Matrix</h4>
                      <p className="text-xs text-zinc-500">Breakdown of daily visits in active billing cycle</p>
                    </div>

                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ANALYTICS_REVENUE_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                          <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                          <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                          <Bar dataKey="Views" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Orders index breakdown */}
                  <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 text-left space-y-4">
                    <div>
                      <h4 className="text-base font-bold text-white font-display">Transactional Order Frequency</h4>
                      <p className="text-xs text-zinc-500">Tracking conversion counts per month</p>
                    </div>

                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ANALYTICS_REVENUE_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                          <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                          <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                          <Bar dataKey="Orders" fill="#EC4899" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* Conversion metrics table */}
                <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 text-left space-y-4">
                  <h4 className="text-base font-bold text-white font-display">Storefront Conversion Funnels</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-900 text-zinc-500 font-mono font-bold uppercase">
                          <th className="py-3 px-4">Funnel Step</th>
                          <th className="py-3 px-4">Visitor Target</th>
                          <th className="py-3 px-4">Conversion Rate</th>
                          <th className="py-3 px-4">Performance Indicator</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900 text-zinc-300">
                        {[
                          { step: "Total Page Sessions", value: "12,481 Visited", pct: "100%", level: "Stable", color: "text-zinc-400" },
                          { step: "Inquiry / Bookings Click", value: "1,840 Attempted", pct: "14.7%", level: "Strong", color: "text-cyan-400" },
                          { step: "Calendar Confirmation", value: "184 Scheduled", pct: "10.0% of Clicks", level: "Optimal", color: "text-emerald-400" },
                          { step: "Product Sales Checkout", value: "94 Checked Out", pct: "5.1% of Clicks", level: "Growing", color: "text-amber-400" },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-zinc-900/30">
                            <td className="py-3.5 px-4 font-semibold text-white">{row.step}</td>
                            <td className="py-3.5 px-4">{row.value}</td>
                            <td className="py-3.5 px-4 font-mono font-bold">{row.pct}</td>
                            <td className="py-3.5 px-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 ${row.color}`}>{row.level}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: BOOKINGS */}
            {activeTab === "Bookings" && (
              <motion.div
                key="bookings-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                {/* Search & filtering */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                      <LucideIcon name="Search" className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search bookings by client, service or transaction code..."
                      value={bookingQuery}
                      onChange={(e) => setBookingQuery(e.target.value)}
                      className="w-full bg-zinc-950/60 border border-zinc-900 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 transition-all"
                    />
                  </div>
                </div>

                {/* Grid bookings list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="bookings-management-grid">
                  {bookings
                    .filter(b => 
                      b.customer.toLowerCase().includes(bookingQuery.toLowerCase()) || 
                      b.service.toLowerCase().includes(bookingQuery.toLowerCase()) ||
                      b.id.toLowerCase().includes(bookingQuery.toLowerCase())
                    )
                    .map((bk) => (
                      <div 
                        key={bk.id} 
                        className="p-5 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex flex-col justify-between gap-4 hover:border-zinc-800 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase font-black">{bk.id}</span>
                            <h4 className="text-sm font-bold text-white font-display">{bk.customer}</h4>
                            <p className="text-xs text-zinc-400 font-mono">{bk.email}</p>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            bk.status === "Confirmed" ? "bg-emerald-500/10 text-emerald-400" :
                            bk.status === "Pending" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {bk.status}
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl flex items-center justify-between text-xs text-zinc-300">
                          <div>
                            <p className="text-zinc-500 text-[10px] font-mono">SERVICE REQUEST</p>
                            <p className="font-bold text-white">{bk.service}</p>
                            <p className="text-zinc-400 mt-0.5">{bk.date} at {bk.time}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-zinc-500 text-[10px] font-mono">FEES</p>
                            <p className="text-sm font-black text-emerald-400">${bk.amount}</p>
                          </div>
                        </div>

                        {/* Interactive trigger actions inside table */}
                        <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
                          {bk.status === "Pending" ? (
                            <>
                              <button
                                onClick={() => handleBookingAction(bk.id, "Reject")}
                                className="px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 text-xs font-semibold"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleBookingAction(bk.id, "Confirm")}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black hover:opacity-90 text-xs font-bold"
                              >
                                Approve
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                // Simulate messaging client
                                alert(`Simulating mail communication dispatch to ${bk.email}`);
                              }}
                              className="px-3 py-1.5 rounded-lg border border-zinc-850 text-zinc-400 hover:text-white text-xs font-semibold"
                            >
                              Email Client
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* TAB: CUSTOMERS */}
            {activeTab === "Customers" && (
              <motion.div
                key="customers-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <LucideIcon name="Search" className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search premium buyers database by name or email..."
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    className="w-full bg-zinc-950/60 border border-zinc-900 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 transition-all"
                  />
                </div>

                <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 font-mono uppercase">
                        <th className="py-3 px-4">Client Identification</th>
                        <th className="py-3 px-4">Operational Email</th>
                        <th className="py-3 px-4">Registry Date</th>
                        <th className="py-3 px-4">Reservations Count</th>
                        <th className="py-3 px-4">Aggregate Spent</th>
                        <th className="py-3 px-4 text-right">Interactive Sheets</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 text-zinc-300">
                      {customers
                        .filter(c => 
                          c.name.toLowerCase().includes(customerQuery.toLowerCase()) || 
                          c.email.toLowerCase().includes(customerQuery.toLowerCase())
                        )
                        .map((cust) => (
                          <tr key={cust.id} className="hover:bg-zinc-900/30">
                            <td className="py-4 px-4 font-bold text-white">{cust.name}</td>
                            <td className="py-4 px-4 font-mono">{cust.email}</td>
                            <td className="py-4 px-4">{cust.joined}</td>
                            <td className="py-4 px-4 font-mono">{cust.bookings} sessions</td>
                            <td className="py-4 px-4 font-mono font-bold text-emerald-400">${cust.spent}</td>
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => setSelectedCustomerDetail(cust)}
                                className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-[11px]"
                              >
                                View File
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Customer detailed popup panel */}
                <AnimatePresence>
                  {selectedCustomerDetail && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                      id="customer-detail-modal"
                    >
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.95 }}
                        className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-2xl p-6 relative text-left"
                      >
                        <button
                          onClick={() => setSelectedCustomerDetail(null)}
                          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                        >
                          <LucideIcon name="X" className="w-5 h-5" />
                        </button>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3.5 border-b border-zinc-900 pb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-black flex items-center justify-center font-black text-lg">
                              {selectedCustomerDetail.name.substring(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-white font-display">{selectedCustomerDetail.name}</h4>
                              <p className="text-xs text-zinc-500 font-mono">{selectedCustomerDetail.email}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="bg-zinc-900 p-3 rounded-xl">
                              <p className="text-zinc-500 font-mono text-[9px] uppercase">Registered Since</p>
                              <p className="font-bold text-white mt-0.5">{selectedCustomerDetail.joined}</p>
                            </div>
                            <div className="bg-zinc-900 p-3 rounded-xl">
                              <p className="text-zinc-500 font-mono text-[9px] uppercase">Aggregate Spent</p>
                              <p className="font-bold text-emerald-400 mt-0.5">${selectedCustomerDetail.spent}</p>
                            </div>
                          </div>

                          <div className="bg-zinc-900 p-4 rounded-xl space-y-2">
                            <p className="text-[10px] font-mono text-zinc-500 uppercase">Operational Security File Note</p>
                            <p className="text-xs text-zinc-400 leading-normal">
                              Client listed in good standing. This entity represents premium bookings mapping directly inside our microservices. All payment blocks verified valid.
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              alert(`Dispatching cryptographic transaction sheet directly to: ${selectedCustomerDetail.email}`);
                            }}
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all"
                          >
                            Generate Full Audit PDF
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* TAB: PRODUCTS */}
            {activeTab === "Products" && (
              <motion.div
                key="products-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="relative flex-grow max-w-lg">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                      <LucideIcon name="Search" className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search active catalog..."
                      value={productQuery}
                      onChange={(e) => setProductQuery(e.target.value)}
                      className="w-full bg-zinc-950/60 border border-zinc-900 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 transition-all"
                    />
                  </div>

                  <button
                    onClick={() => setIsAddingProduct(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:opacity-95"
                  >
                    <LucideIcon name="Plus" className="w-4 h-4 stroke-[3]" />
                    Add Product Catalog
                  </button>
                </div>

                {/* Products Grid list with Mutator controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="products-catalog-grid">
                  {products
                    .filter(p => p.name.toLowerCase().includes(productQuery.toLowerCase()))
                    .map((p) => (
                      <div key={p.id} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all flex flex-col justify-between">
                        <div className="aspect-square w-full bg-zinc-900 relative">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-emerald-400 font-mono font-bold text-xs px-2.5 py-1 rounded-lg border border-zinc-850">
                            ${p.price}
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase">CATALOG ID: {p.id}</span>
                            <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-zinc-400">
                            <span>Sales: <span className="font-bold text-white">{p.sales} units</span></span>
                            <span className={p.stock > 0 ? "text-emerald-400" : "text-red-400"}>
                              {p.stock > 0 ? `${p.stock} units left` : "Out of Stock"}
                            </span>
                          </div>

                          {/* Instant stock adjusting mutator slider */}
                          <div className="space-y-1 pt-2 border-t border-zinc-900 text-left">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase">Adjust Inventory</span>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={p.stock} 
                              onChange={(e) => handleProductStockChange(p.id, Number(e.target.value))}
                              className="w-full accent-emerald-400" 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Create product drawer overlay */}
                <AnimatePresence>
                  {isAddingProduct && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                      id="add-product-drawer-overlay"
                    >
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.95 }}
                        className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-2xl p-6 relative"
                      >
                        <button
                          onClick={() => setIsAddingProduct(false)}
                          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                        >
                          <LucideIcon name="X" className="w-5 h-5" />
                        </button>

                        <form onSubmit={handleAddProductSubmit} className="space-y-4 text-left">
                          <h3 className="text-base font-bold text-white font-display border-b border-zinc-900 pb-2">Add New Product Catalog</h3>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Product Name</label>
                            <input 
                              type="text" 
                              required
                              value={newProdName}
                              onChange={(e) => setNewProdName(e.target.value)}
                              placeholder="e.g. Organic Volumizing Serum"
                              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Retail Price ($)</label>
                              <input 
                                type="number" 
                                required
                                value={newProdPrice}
                                onChange={(e) => setNewProdPrice(e.target.value)}
                                placeholder="45"
                                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Initial Stock Units</label>
                              <input 
                                type="number" 
                                value={newProdStock}
                                onChange={(e) => setNewProdStock(e.target.value)}
                                placeholder="20"
                                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Image Address Link (Optional)</label>
                            <input 
                              type="url" 
                              value={newProdImage}
                              onChange={(e) => setNewProdImage(e.target.value)}
                              placeholder="https://images.unsplash.com/photo-..."
                              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold py-3 rounded-xl text-xs hover:opacity-95"
                          >
                            Mouth New Catalog Block
                          </button>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === "Orders" && (
              <motion.div
                key="orders-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <LucideIcon name="Search" className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search incoming orders by tracking or buyer name..."
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                    className="w-full bg-zinc-950/60 border border-zinc-900 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 transition-all"
                  />
                </div>

                <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 space-y-4">
                  {orders
                    .filter(o => o.customer.toLowerCase().includes(orderQuery.toLowerCase()) || o.tracking.toLowerCase().includes(orderQuery.toLowerCase()))
                    .map((ord) => (
                      <div key={ord.id} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-500 font-bold">{ord.id}</span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                              ord.status === "Delivered" ? "bg-emerald-500/10 text-emerald-400" :
                              ord.status === "Shipped" ? "bg-cyan-500/10 text-cyan-400" : "bg-amber-500/10 text-amber-400 animate-pulse"
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{ord.customer}</h4>
                          <p className="text-xs text-zinc-400 leading-normal">{ord.items}</p>
                          <p className="text-[10px] font-mono text-zinc-500">Placed: {ord.date} • Tracking: {ord.tracking}</p>
                        </div>

                        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                          <p className="text-sm font-black text-emerald-400">${ord.amount}</p>
                          
                          <div className="flex gap-1.5">
                            {ord.status === "Processing" && (
                              <button 
                                onClick={() => handleOrderAction(ord.id, "Shipped")}
                                className="px-2.5 py-1 rounded bg-cyan-500 text-black font-bold text-[10px]"
                              >
                                Mark Shipped
                              </button>
                            )}
                            {ord.status === "Shipped" && (
                              <button 
                                onClick={() => handleOrderAction(ord.id, "Delivered")}
                                className="px-2.5 py-1 rounded bg-emerald-500 text-black font-bold text-[10px]"
                              >
                                Mark Delivered
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* TAB: REVIEWS */}
            {activeTab === "Reviews" && (
              <motion.div
                key="reviews-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-850">
                    <p className="text-zinc-500 text-[10px] font-mono font-bold uppercase">Aggregate Rating</p>
                    <p className="text-3xl font-black text-white font-display mt-1">4.8 / 5.0</p>
                    <div className="flex gap-1.5 text-amber-400 mt-2">
                      <LucideIcon name="Star" className="w-4 h-4 fill-current" />
                      <LucideIcon name="Star" className="w-4 h-4 fill-current" />
                      <LucideIcon name="Star" className="w-4 h-4 fill-current" />
                      <LucideIcon name="Star" className="w-4 h-4 fill-current" />
                      <LucideIcon name="Star" className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-850">
                    <p className="text-zinc-500 text-[10px] font-mono font-bold uppercase">Buyers Counted</p>
                    <p className="text-3xl font-black text-white font-display mt-1">{reviews.length} Feedbacks</p>
                    <p className="text-xs text-zinc-500 mt-2">100% verified transactional submissions</p>
                  </div>
                  <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-850">
                    <p className="text-zinc-500 text-[10px] font-mono font-bold uppercase">Response Matrix</p>
                    <p className="text-3xl font-black text-emerald-400 font-display mt-1">
                      {Math.floor((reviews.filter(r => r.reply).length / reviews.length) * 100)}%
                    </p>
                    <p className="text-xs text-zinc-500 mt-2">Replying builds extreme customer retention</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-5 rounded-2xl bg-zinc-950/40 border border-zinc-900 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">{rev.author}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5 text-amber-400">
                              {[...Array(5)].map((_, idx) => (
                                <span key={idx}>
                                  <LucideIcon name="Star" className={`w-3 h-3 ${idx < rev.rating ? "fill-current" : "text-zinc-700"}`} />
                                </span>
                              ))}
                            </div>
                            <span className="text-[10px] text-zinc-500">• {rev.date}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono uppercase bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded">
                          {rev.service}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-normal italic">
                        "{rev.comment}"
                      </p>

                      {/* Display Reply if existing */}
                      {rev.reply ? (
                        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 pl-4 border-l-2 border-l-emerald-400">
                          <p className="text-[10px] font-mono text-zinc-500 uppercase font-black">Your Reply</p>
                          <p className="text-xs text-zinc-300 mt-1 leading-normal">
                            {rev.reply}
                          </p>
                        </div>
                      ) : (
                        <div>
                          {activeReviewReplyId === rev.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={tempReplyText}
                                onChange={(e) => setTempReplyText(e.target.value)}
                                rows={2}
                                placeholder="Type custom client response..."
                                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setActiveReviewReplyId(null)}
                                  className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-[10px]"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleAddReviewReply(rev.id)}
                                  className="px-3 py-1 bg-emerald-500 text-black font-bold rounded text-[10px]"
                                >
                                  Submit Reply
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveReviewReplyId(rev.id);
                                setTempReplyText("");
                              }}
                              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <LucideIcon name="MessageSquare" className="w-3.5 h-3.5" />
                              Respond to feedback
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB: PAYMENTS */}
            {activeTab === "Payments" && (
              <motion.div
                key="payments-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Balance details */}
                  <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex flex-col justify-between h-44">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Available Balance</span>
                      <h4 className="text-3xl font-black text-white font-display mt-1">$4,180.20</h4>
                    </div>

                    <button
                      onClick={() => {
                        logSystemActivity("Payout Dispatched", "Withdrew $4,180.20 from reserve account.", "payout");
                        alert("Payout request successfully submitted to bank routing. Processing completes within 30 minutes.");
                      }}
                      className="w-full bg-emerald-500 text-black font-bold py-2.5 rounded-xl text-xs hover:opacity-95"
                    >
                      Instant Withdrawal Payout
                    </button>
                  </div>

                  {/* Pending cleared */}
                  <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex flex-col justify-between h-44">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Processing Queue</span>
                      <h4 className="text-3xl font-black text-zinc-300 font-display mt-1">$1,249.30</h4>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Funds auto-clear directly inside 48-hour cycles.
                    </p>
                  </div>

                  {/* Fees matrix */}
                  <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex flex-col justify-between h-44">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Total Life Earnings</span>
                      <h4 className="text-3xl font-black text-cyan-400 font-display mt-1">$18,429.00</h4>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono text-zinc-500">
                      <span>Gateway Commission:</span>
                      <span className="text-emerald-400">0.0% SiteMint</span>
                    </div>
                  </div>

                </div>

                {/* Pending UPI Settlements */}
                <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 mb-6">
                  <h4 className="text-base font-bold text-white font-display mb-4">Pending UPI Settlements Verification</h4>
                  
                  {paymentsList.filter(p => p.gateway === "upi" && p.status === "pending").length === 0 ? (
                    <p className="text-xs text-zinc-500 py-2">No pending settlements awaiting verification.</p>
                  ) : (
                    <div className="space-y-3">
                      {paymentsList.filter(p => p.gateway === "upi" && p.status === "pending").map((tx) => (
                        <div key={tx.id} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
                          <div className="text-left space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base text-amber-400 font-mono">₹{tx.amount}</span>
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold text-[9px] uppercase">
                                Pending Verification
                              </span>
                            </div>
                            <p className="text-zinc-300 font-semibold">{tx.first_name} {tx.last_name} ({tx.email})</p>
                            <p className="text-zinc-500 text-[10px] font-mono">UPI Ref ID: <span className="text-white font-bold select-all">{tx.gateway_payment_id}</span></p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleApprovePayment(tx.id, false)}
                              className="px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-red-400 hover:text-red-300 font-bold transition-all text-xs"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprovePayment(tx.id, true)}
                              className="px-4 py-2 rounded-xl bg-emerald-500 text-black hover:opacity-90 font-bold transition-all text-xs"
                            >
                              Approve Settlement
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ledger lists */}
                <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900">
                  <h4 className="text-base font-bold text-white font-display mb-4">Settled Transaction Ledger</h4>
                  
                  {paymentsList.filter(p => p.status === "captured").length === 0 ? (
                    <p className="text-xs text-zinc-500 py-2">No settled transactions in ledger history.</p>
                  ) : (
                    <div className="space-y-3">
                      {paymentsList.filter(p => p.status === "captured").map((tx) => (
                        <div key={tx.id} className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-900 flex items-center justify-between text-xs">
                          <div className="text-left space-y-0.5">
                            <p className="font-bold text-white font-mono">₹{tx.amount}</p>
                            <p className="text-zinc-400">{tx.first_name} {tx.last_name} ({tx.gateway === "upi" ? "UPI direct" : "Razorpay"})</p>
                            <p className="text-zinc-500 text-[10px] font-mono">Ref ID: {tx.gateway_payment_id || tx.gateway_order_id}</p>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[10px]">
                              Settled
                            </span>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{new Date(tx.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: MEDIA LIBRARY */}
            {activeTab === "Media Library" && (
              <motion.div
                key="media-library-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                {/* Drag and Drop area simulator */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative ${
                    dragActive 
                      ? "border-emerald-400 bg-emerald-500/5" 
                      : "border-zinc-800 bg-zinc-950/20 hover:border-zinc-700"
                  }`}
                  id="media-drag-zone"
                >
                  <input 
                    type="file" 
                    ref={mediaInputRef} 
                    onChange={handleManualMediaUpload} 
                    multiple 
                    className="hidden" 
                  />
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                      <LucideIcon name="UploadCloud" className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Drag & drop your files here</p>
                      <p className="text-[11px] text-zinc-500 mt-1">Accepts PNG, JPG, WebP formats up to 10MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => mediaInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold"
                    >
                      Browse Files
                    </button>
                  </div>
                </div>

                {/* Media Gallery items */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="media-gallery-grid">
                  {mediaLibrary.map((item) => (
                    <div key={item.id} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all flex flex-col justify-between">
                      <div className="aspect-video w-full bg-zinc-900 relative">
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-mono text-zinc-400">
                          {item.size}
                        </span>
                      </div>

                      <div className="p-3 text-left space-y-1">
                        <p className="text-xs font-bold text-white truncate" title={item.name}>{item.name}</p>
                        <p className="text-[9px] font-mono text-zinc-500">Processed: {item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB: ACTIVITY LOGS */}
            {activeTab === "Activity Logs" && (
              <motion.div
                key="activity-logs-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4 text-left"
              >
                <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 space-y-4">
                  <div className="border-b border-zinc-900 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-white font-display">System Execution Telemetry</h3>
                      <p className="text-xs text-zinc-500">Operational traces generated by the compiled site engine.</p>
                    </div>

                    <button 
                      onClick={() => {
                        setActivities(RECENT_ACTIVITIES);
                        alert("Cleared sandbox customized logs.");
                      }}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Clear Log Sessions
                    </button>
                  </div>

                  <div className="font-mono text-[11px] bg-[#020204] border border-zinc-850 p-4 rounded-xl text-zinc-400 h-[380px] overflow-y-auto space-y-3">
                    {activities.map((act) => (
                      <div key={act.id} className="flex items-start gap-2 border-b border-zinc-900/60 pb-2 last:border-0">
                        <span className="text-zinc-600 shrink-0">[{act.time}]</span>
                        <div>
                          <span className="text-emerald-400 font-bold">{act.event}:</span>
                          <span className="text-zinc-300 ml-1.5">{act.detail}</span>
                        </div>
                      </div>
                    ))}
                    <div className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse ml-1" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === "Notifications" && (
              <motion.div
                key="notifications-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4 text-left"
              >
                <div className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <h4 className="text-base font-bold text-white font-display">Workspace Alerts</h4>
                    <button 
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        logSystemActivity("Alerts marked read", "Cleaned up client notification trays.", "system");
                      }}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                          notif.read 
                            ? "bg-zinc-900/20 border-zinc-900/60 text-zinc-400" 
                            : "bg-zinc-900/60 border-zinc-850 text-white shadow-md pl-4 border-l-2 border-l-emerald-400"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 flex items-center justify-center shrink-0">
                          <LucideIcon 
                            name={
                              notif.type === "booking" ? "Calendar" : 
                              notif.type === "review" ? "Star" : "Shield"
                            } 
                            className={`w-4 h-4 ${notif.read ? "text-zinc-500" : "text-emerald-400"}`} 
                          />
                        </div>

                        <div className="flex-grow space-y-1">
                          <p className="text-xs font-bold">{notif.title}</p>
                          <p className="text-xs text-zinc-400 leading-normal">{notif.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === "Settings" && (
              <motion.div
                key="settings-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-6">
                  <div className="border-b border-zinc-900 pb-3">
                    <h3 className="text-base font-bold text-white font-display">Domain Security & Mapping</h3>
                    <p className="text-xs text-zinc-500">Configure global metadata bindings and secure subdomain redirects.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Bound Subdomain Prefix</label>
                      <div className="flex gap-2 max-w-lg">
                        <input 
                          type="text" 
                          defaultValue="vanguardathletic" 
                          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-xs font-mono" 
                        />
                        <span className="bg-zinc-950 border border-zinc-850 px-3 py-2 text-xs font-mono text-zinc-500 rounded-xl flex items-center">
                          .sitemint.app
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Active SSL Handshake</label>
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
                        <LucideIcon name="ShieldCheck" className="w-6 h-6 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-white">Let's Encrypt Certificate Verified</p>
                          <p className="text-[10px] text-zinc-500">Auto-renews dynamically on Sep 12, 2026. Encryption is active for all transactions.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => {
                          logSystemActivity("Domain mappings updated", "Changed active edge redirects.", "system");
                          alert("System variables successfully compiled to edge CDN routing tables.");
                        }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold px-4 py-2.5 rounded-xl text-xs hover:opacity-95"
                      >
                        Re-compile Routing Maps
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
