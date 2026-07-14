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
const INITIAL_BOOKINGS: any[] = [];
const INITIAL_PRODUCTS: any[] = [];
const INITIAL_ORDERS: any[] = [];
const INITIAL_REVIEWS: any[] = [];
const INITIAL_CUSTOMERS: any[] = [];
const RECENT_ACTIVITIES: any[] = [];
const INITIAL_NOTIFICATIONS: any[] = [];

// Recharts chart data
const ANALYTICS_REVENUE_DATA: any[] = [];
const PIE_TRAFFIC_DATA: any[] = [];

export default function OwnerDashboard({ userEmail, onLogout, onNavigate }: OwnerDashboardProps) {
  // Sidebar active tab
  const [activeTab, setActiveTab] = useState<string>("My Websites");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [businessesList, setBusinessesList] = useState<any[]>([]);

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

  // Real database-backed states
  const [businessDetails, setBusinessDetails] = useState<any>(null);
  const [ownerName, setOwnerName] = useState<string>("Owner");
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [subTransactions, setSubTransactions] = useState<any[]>([]);

  // Settings Form States
  const [settingsName, setSettingsName] = useState("");
  const [settingsDescription, setSettingsDescription] = useState("");
  const [settingsCategory, setSettingsCategory] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsEmail, setSettingsEmail] = useState("");
  const [settingsAddress, setSettingsAddress] = useState("");
  const [settingsMaps, setSettingsMaps] = useState("");
  const [settingsUpi, setSettingsUpi] = useState("");
  const [settingsSlug, setSettingsSlug] = useState("");
  const [settingsSeoTitle, setSettingsSeoTitle] = useState("");
  const [settingsSeoDesc, setSettingsSeoDesc] = useState("");
  const [settingsFavicon, setSettingsFavicon] = useState("");
  const [settingsIsPublished, setSettingsIsPublished] = useState(false);
  const [settingsPrimaryColor, setSettingsPrimaryColor] = useState("#10B981");
  const [settingsSecondaryColor, setSettingsSecondaryColor] = useState("#111827");
  const [settingsFontFamily, setSettingsFontFamily] = useState("Inter");

  // Social Links
  const [socialFb, setSocialFb] = useState("");
  const [socialInsta, setSocialInsta] = useState("");
  const [socialTw, setSocialTw] = useState("");
  const [socialWa, setSocialWa] = useState("");

  // Working Hours
  const [workingHoursObj, setWorkingHoursObj] = useState<any>({});

  // Product addition/edit states extension
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // Service addition/edit states
  const [services, setServices] = useState<any[]>([]);
  const [newServName, setNewServName] = useState("");
  const [newServPrice, setNewServPrice] = useState("");
  const [newServDuration, setNewServDuration] = useState("");
  const [newServDesc, setNewServDesc] = useState("");
  const [newServImage, setNewServImage] = useState("");
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);

  // Load settings inputs when businessDetails loads
  useEffect(() => {
    if (businessDetails) {
      setSettingsName(businessDetails.name || "");
      setSettingsDescription(businessDetails.description || "");
      setSettingsCategory(businessDetails.business_type || "");
      setSettingsPhone(businessDetails.contact_phone || "");
      setSettingsEmail(businessDetails.contact_email || "");
      setSettingsAddress(businessDetails.address || "");
      setSettingsMaps(businessDetails.google_maps_location || "");
      setSettingsUpi(businessDetails.upi_id || "");
      setSettingsSlug(businessDetails.subdomain || "");
      setSettingsSeoTitle(businessDetails.seo_title || "");
      setSettingsSeoDesc(businessDetails.seo_description || "");
      setSettingsFavicon(businessDetails.favicon_url || "");
      setSettingsIsPublished(!!businessDetails.is_published);
      setLogoPreview(businessDetails.logo_url || "");
      setBannerPreview(businessDetails.banner_url || "");

      if (businessDetails.theme_settings) {
        setSettingsPrimaryColor(businessDetails.theme_settings.primary_color || "#10B981");
        setSettingsSecondaryColor(businessDetails.theme_settings.secondary_color || "#111827");
        setSettingsFontFamily(businessDetails.theme_settings.font_family || "Inter");
      }

      // Decode social links
      try {
        const socials = typeof businessDetails.social_links === "string" 
          ? JSON.parse(businessDetails.social_links) 
          : (businessDetails.social_links || {});
        setSocialFb(socials.facebook || "");
        setSocialInsta(socials.instagram || "");
        setSocialTw(socials.twitter || "");
        setSocialWa(socials.whatsapp || "");
      } catch (e) {
        setSocialFb(""); setSocialInsta(""); setSocialTw(""); setSocialWa("");
      }

      // Decode working hours
      try {
        const hours = typeof businessDetails.working_hours === "string"
          ? JSON.parse(businessDetails.working_hours)
          : (businessDetails.working_hours || {});
        setWorkingHoursObj(hours);
      } catch (e) {
        setWorkingHoursObj({});
      }
    }
  }, [businessDetails]);

  const fetchSubscriptionData = async () => {
    const token = localStorage.getItem("sitemint_token");
    if (!token) return;
    try {
      const res = await fetch("/api/subscriptions/status", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.status === "success") {
        setSubscription(result.data.subscription);
        setSubTransactions(result.data.transactions);
      }
    } catch (err) {
      console.error("Failed to load subscription status:", err);
    }
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("sitemint_token");
    if (!token) return;

    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    try {
      // Fetch Owner Businesses list
      const bizListRes = await fetch("/api/businesses", { headers });
      const bizListResult = await bizListRes.json();
      if (bizListResult.status === "success" && Array.isArray(bizListResult.data)) {
        setBusinessesList(bizListResult.data);
      }

      // 1. Fetch Business Settings
      const settingsRes = await fetch("/api/businesses/settings", { headers });
      const settingsResult = await settingsRes.json();
      let activeBizId = 1;
      if (settingsResult.status === "success" && settingsResult.data.business) {
        const biz = settingsResult.data.business;
        setBusinessDetails(biz);
        setOwnerName(settingsResult.data.owner_name || "Owner");
        setBusinessId(biz.id);
        activeBizId = biz.id;
        setBrandName(biz.name);
        setSlogan(biz.description || "");
        setLogoPreview(biz.logo_url || "");
        if (settingsResult.data.theme_settings) {
          setThemeAccent(settingsResult.data.theme_settings.primary_color);
          setThemeSecondary(settingsResult.data.theme_settings.secondary_color);
          setTypography(settingsResult.data.theme_settings.font_family);
        }
      } else {
        setBusinessDetails(null);
        setBusinessId(null);
      }

      // 1b. Fetch Staff List
      const staffRes = await fetch("/api/staff", { headers });
      const staffResult = await staffRes.json();
      if (staffResult.status === "success") {
        setStaff(staffResult.data);
      }

      // 1c. Fetch Announcements Alert list
      const annRes = await fetch("/api/admin/announcements", { headers });
      const annResult = await annRes.json();
      if (annResult.status === "success") {
        setAnnouncements(annResult.data);
      }

      // 2. Fetch Bookings
      const bookingsRes = await fetch("/api/bookings", { headers });
      const bookingsResult = await bookingsRes.json();
      if (bookingsResult.status === "success" && Array.isArray(bookingsResult.data)) {
        setBookings(bookingsResult.data.map((b: any) => {
          const dateObj = new Date(b.start_time);
          return {
            id: String(b.id),
            customer: `${b.customer_first_name || ""} ${b.customer_last_name || ""}`.trim() || "Guest",
            email: b.customer_email || "N/A",
            service: b.service_name || "Service Offer",
            date: dateObj.toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
            time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            amount: b.service_price || 0,
            status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1).toLowerCase()) : "Pending"
          };
        }));
      }

      // 3. Fetch Products
      const productsRes = await fetch(`/api/catalog/products?business_id=${activeBizId}`, { headers });
      const productsResult = await productsRes.json();
      if (productsResult.status === "success") {
        setProducts(productsResult.data);
      }

      // Fetch Services
      const servicesRes = await fetch(`/api/catalog/services?business_id=${activeBizId}`, { headers });
      const servicesResult = await servicesRes.json();
      if (servicesResult.status === "success" && Array.isArray(servicesResult.data)) {
        setServices(servicesResult.data);
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

      // 9. Fetch Real Customers
      const customersRes = await fetch("/api/customers", { headers });
      const customersResult = await customersRes.json();
      if (customersResult.status === "success" && Array.isArray(customersResult.data)) {
        setCustomers(customersResult.data.map((c: any) => ({
          id: String(c.id),
          name: `${c.first_name} ${c.last_name}`.trim(),
          email: c.email,
          joined: new Date(c.created_at).toLocaleDateString(),
          bookings: Number(c.bookings_count || 0),
          spent: Number(c.total_spent || 0)
        })));
      }

      // Fetch Real Media Gallery
      const mediaRes = await fetch("/api/feedback/media", { headers });
      const mediaResult = await mediaRes.json();
      if (mediaResult.status === "success" && Array.isArray(mediaResult.data)) {
        setMediaLibrary(mediaResult.data.map((m: any) => ({
          id: m.id,
          name: m.file_name || "image.png",
          size: m.file_size ? `${(m.file_size / (1024 * 1024)).toFixed(1)} MB` : "N/A",
          type: m.mime_type?.split("/")[0].toUpperCase() || "IMAGE",
          url: m.url,
          date: new Date(m.created_at || m.uploaded_at).toISOString().split("T")[0]
        })));
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

  const handlePublishWebsite = async () => {
    const token = localStorage.getItem("sitemint_token");
    if (!token) return;

    const confirmPublish = window.confirm("Are you sure you want to publish your website? This will make your site live for everyone!");
    if (!confirmPublish) return;

    try {
      logSystemActivity("Publishing Website", "Saving configurations and compiling storefront...", "system");
      
      // 1. Save latest configurations first (PUT settings)
      const savePayload = {
        name: settingsName || brandName,
        description: settingsDescription || slogan,
        business_type: settingsCategory || "salon",
        contact_phone: settingsPhone,
        contact_email: settingsEmail,
        address: settingsAddress,
        google_maps_location: settingsMaps,
        upi_id: settingsUpi,
        subdomain: settingsSlug || (brandName ? brandName.toLowerCase().replace(/[^a-z0-9]/g, "") : "site"),
        seo_title: settingsSeoTitle,
        seo_description: settingsSeoDesc,
        favicon_url: settingsFavicon,
        is_published: true, // mark published!
        logo_url: logoPreview,
        banner_url: bannerPreview,
        social_links: {
          facebook: socialFb,
          instagram: socialInsta,
          twitter: socialTw,
          whatsapp: socialWa
        },
        working_hours: workingHoursObj,
        primary_color: settingsPrimaryColor || themeAccent,
        secondary_color: settingsSecondaryColor || themeSecondary,
        font_family: settingsFontFamily || typography
      };

      const saveRes = await fetch("/api/businesses/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(savePayload)
      });
      const saveResult = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveResult.message || "Failed to save settings during publish.");

      // 2. Double-check is_published status on backend publish trigger
      const pubRes = await fetch("/api/businesses/publish", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const pubResult = await pubRes.json();
      if (!pubRes.ok) throw new Error(pubResult.message || "Failed to save published status.");

      logSystemActivity("Website Published", "Successfully deployed latest configurations to live route.", "system");
      alert("🎉 Congratulations! Your website is now live!");

      fetchDashboardData();

      // 3. Open localhost:3000/site/{business_slug} in development
      const slug = settingsSlug || savePayload.subdomain;
      window.open(window.location.origin + "/site/" + slug, "_blank");
    } catch (err: any) {
      alert("Error publishing website: " + err.message);
    }
  };

  const handleUnpublishWebsite = async () => {
    const token = localStorage.getItem("sitemint_token");
    if (!token) return;

    const confirmUnpublish = window.confirm("Are you sure you want to take your website offline?");
    if (!confirmUnpublish) return;

    try {
      const response = await fetch("/api/businesses/unpublish", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to unpublish website.");
      }
      alert("Your website is now offline.");
      fetchDashboardData();
    } catch (err: any) {
      alert("Error unpublishing website: " + err.message);
    }
  };

  const handleSelectBusiness = async (id: number | string) => {
    const token = localStorage.getItem("sitemint_token");
    if (!token) return;

    try {
      const res = await fetch(`/api/businesses/${id}/select`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to select business website.");

      if (result.data?.token) {
        localStorage.setItem("sitemint_token", result.data.token);
      }

      alert("Website context switched successfully!");
      await fetchDashboardData();
      setActiveTab("Dashboard");
    } catch (err: any) {
      alert("Error selecting website: " + err.message);
    }
  };

  const handleDuplicateBusiness = async (id: number | string) => {
    const confirmDup = window.confirm("Are you sure you want to duplicate this website and all its settings?");
    if (!confirmDup) return;

    const token = localStorage.getItem("sitemint_token");
    if (!token) return;

    try {
      const res = await fetch(`/api/businesses/${id}/duplicate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to duplicate business website.");

      alert("Website duplicated successfully!");
      fetchDashboardData();
    } catch (err: any) {
      alert("Error duplicating website: " + err.message);
    }
  };

  const handleDeleteBusiness = async (id: number | string) => {
    const confirmDel = window.confirm("Are you sure you want to delete this website? This action is irreversible!");
    if (!confirmDel) return;

    const token = localStorage.getItem("sitemint_token");
    if (!token) return;

    try {
      const res = await fetch(`/api/businesses/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete business website.");

      alert("Website deleted successfully!");
      if (Number(id) === Number(businessId)) {
        setBusinessDetails(null);
        setBusinessId(null);
        setActiveTab("My Websites");
      }
      fetchDashboardData();
    } catch (err: any) {
      alert("Error deleting website: " + err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("sitemint_token");
    if (!token) return;

    const payload = {
      name: settingsName,
      description: settingsDescription,
      business_type: settingsCategory,
      contact_phone: settingsPhone,
      contact_email: settingsEmail,
      address: settingsAddress,
      google_maps_location: settingsMaps,
      upi_id: settingsUpi,
      subdomain: settingsSlug,
      seo_title: settingsSeoTitle,
      seo_description: settingsSeoDesc,
      favicon_url: settingsFavicon,
      is_published: settingsIsPublished,
      logo_url: logoPreview,
      banner_url: bannerPreview,
      social_links: {
        facebook: socialFb,
        instagram: socialInsta,
        twitter: socialTw,
        whatsapp: socialWa
      },
      working_hours: workingHoursObj,
      primary_color: settingsPrimaryColor,
      secondary_color: settingsSecondaryColor,
      font_family: settingsFontFamily
    };

    try {
      logSystemActivity("Saving Settings", "Saving all business changes to MySQL...", "system");
      const res = await fetch("/api/businesses/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save settings.");

      logSystemActivity("Settings Saved", "Successfully saved settings changes to MySQL.", "system");
      alert("Settings saved successfully!");
      fetchDashboardData();
    } catch (err: any) {
      alert("Error saving settings: " + err.message);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.origin + "/site/" + (businessDetails?.subdomain || "site");
    navigator.clipboard.writeText(url);
    alert("Website link copied to clipboard!");
  };

  const handleShare = () => {
    const url = window.location.origin + "/site/" + (businessDetails?.subdomain || "site");
    if (navigator.share) {
      navigator.share({
        title: brandName,
        text: `Check out my new website on SiteMint!`,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert("Web Share API not supported on this browser. Link copied to clipboard!");
    }
  };

  const getAnalyticsData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData: Record<string, { name: string; Revenue: number; Views: number; Orders: number }> = {};
    
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      monthlyData[mName] = { name: mName, Revenue: 0, Views: 0, Orders: 0 };
    }

    orders.forEach((o: any) => {
      const date = new Date(o.created_at || o.date);
      const mName = months[date.getMonth()];
      if (monthlyData[mName]) {
        monthlyData[mName].Orders += 1;
        if (o.status === "completed" || o.status === "processing") {
          monthlyData[mName].Revenue += Number(o.total_amount || 0);
        }
      }
    });

    return Object.values(monthlyData);
  };

  const getBusinessDashboardCards = () => {
    const type = businessDetails?.business_type?.toLowerCase() || "";
    const totalRevenue = paymentsList
      .filter((p: any) => p.status === "captured" || p.status === "completed")
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    // Gym / Fitness
    if (type.includes("gym") || type.includes("fitness") || type.includes("athletic")) {
      const activeTrainers = staff.filter((s: any) => s.staff_title?.toLowerCase().includes("trainer") || s.role === "staff").length;
      return [
        { title: "Today's Members", val: `${customers.length}`, diff: "Active check-ins", icon: "Users", color: "text-cyan-400", bg: "bg-cyan-500/10" },
        { title: "Membership Plans", val: "4 Active", diff: "Standard tiers", icon: "CreditCard", color: "text-indigo-400", bg: "bg-indigo-500/10" },
        { title: "Today's Bookings", val: `${bookings.length}`, diff: "Scheduled sessions", icon: "Calendar", color: "text-purple-400", bg: "bg-purple-500/10" },
        { title: "Revenue", val: `₹${totalRevenue}`, diff: "Collected payments", icon: "DollarSign", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { title: "Active Trainers", val: `${activeTrainers}`, diff: "On-duty coaches", icon: "Activity", color: "text-amber-400", bg: "bg-amber-500/10" },
        { title: "Classes", val: "8 Scheduled", diff: "Active timetables", icon: "Layers", color: "text-pink-400", bg: "bg-pink-500/10" },
        { title: "BMI Requests", val: "0 Pending", diff: "Awaiting calculation", icon: "FileText", color: "text-teal-400", bg: "bg-teal-500/10" },
      ];
    }
    
    // Restaurant / Cafe
    if (type.includes("restaurant") || type.includes("cafe") || type.includes("dining") || type.includes("bistro")) {
      const activeOrders = orders.filter((o: any) => o.status === "processing" || o.status === "pending").length;
      return [
        { title: "Today's Orders", val: `${orders.length}`, diff: `${activeOrders} in prep`, icon: "ShoppingBag", color: "text-pink-400", bg: "bg-pink-500/10" },
        { title: "Reservations", val: `${bookings.length}`, diff: "Booked tables today", icon: "Calendar", color: "text-purple-400", bg: "bg-purple-500/10" },
        { title: "Popular Dishes", val: "3 Active", diff: "Best sellers featured", icon: "Utensils", color: "text-amber-400", bg: "bg-amber-500/10" },
        { title: "Revenue", val: `₹${totalRevenue}`, diff: "Completed checkouts", icon: "DollarSign", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { title: "Customers", val: `${customers.length}`, diff: "Diners database", icon: "Users", color: "text-cyan-400", bg: "bg-cyan-500/10" },
        { title: "Reviews", val: `${reviews.length}`, diff: "Feedback logs", icon: "Star", color: "text-yellow-400", bg: "bg-yellow-500/10" },
      ];
    }
    
    // Salon / Spa
    if (type.includes("salon") || type.includes("spa") || type.includes("beauty") || type.includes("hair")) {
      return [
        { title: "Appointments", val: `${bookings.length}`, diff: "Stylists slots", icon: "Calendar", color: "text-purple-400", bg: "bg-purple-500/10" },
        { title: "Staff", val: `${staff.length}`, diff: "Active professionals", icon: "Users", color: "text-cyan-400", bg: "bg-cyan-500/10" },
        { title: "Today's Revenue", val: `₹${totalRevenue}`, diff: "Service receipts", icon: "DollarSign", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { title: "Customers", val: `${customers.length}`, diff: "Active client profiles", icon: "Sparkles", color: "text-amber-400", bg: "bg-amber-500/10" },
        { title: "Popular Services", val: "5 Listed", diff: "Top treatments", icon: "Scissors", color: "text-pink-400", bg: "bg-pink-500/10" },
        { title: "Reviews", val: `${reviews.length}`, diff: "Client star ratings", icon: "Star", color: "text-yellow-400", bg: "bg-yellow-500/10" },
      ];
    }
    
    // Clothing Store (Default fallback)
    const inStockCount = products.filter((p: any) => p.inventory_qty > 0).length;
    return [
      { title: "Orders", val: `${orders.length}`, diff: "Retail orders", icon: "ShoppingCart", color: "text-pink-400", bg: "bg-pink-500/10" },
      { title: "Products", val: `${products.length}`, diff: `${inStockCount} in stock`, icon: "ShoppingBag", color: "text-indigo-400", bg: "bg-indigo-500/10" },
      { title: "Inventory", val: `${products.reduce((acc: number, p: any) => acc + Number(p.inventory_qty || 0), 0)} Units`, diff: "Catalog volume", icon: "Layers", color: "text-amber-400", bg: "bg-amber-500/10" },
      { title: "Customers", val: `${customers.length}`, diff: "Buyer profiles", icon: "Users", color: "text-cyan-400", bg: "bg-cyan-500/10" },
      { title: "Revenue", val: `₹${totalRevenue}`, diff: "Store earnings", icon: "DollarSign", color: "text-emerald-400", bg: "bg-emerald-500/10" },
      { title: "Top Selling Products", val: "3 Items", diff: "Highest volume lines", icon: "TrendingUp", color: "text-teal-400", bg: "bg-teal-500/10" },
    ];
  };

  const getSidebarItems = () => {
    const type = businessDetails?.business_type?.toLowerCase() || "";
    
    const items = [
      { name: "My Websites", label: "My Websites", icon: "Layers", badge: 0 },
    ];

    if (businessDetails) {
      items.push(
        { name: "Dashboard", label: "Dashboard", icon: "LayoutDashboard", badge: 0 },
        { name: "Website Builder", label: "Website Builder", icon: "Globe", badge: 0 },
        { name: "Theme Customizer", label: "Theme Customizer", icon: "Palette", badge: 0 },
        { name: "Analytics", label: "Analytics", icon: "LineChart", badge: 0 }
      );

      if (type.includes("gym") || type.includes("fitness") || type.includes("athletic")) {
        items.push(
          { name: "Memberships", label: "Memberships", icon: "CreditCard", badge: 0 },
          { name: "Classes", label: "Classes & Schedules", icon: "Layers", badge: 0 },
          { name: "Trainers", label: "Trainers (Staff)", icon: "Users", badge: 0 },
          { name: "BMI Calculator", label: "BMI Calculations", icon: "Activity", badge: 0 }
        );
      } else if (type.includes("restaurant") || type.includes("cafe") || type.includes("dining") || type.includes("bistro")) {
        items.push(
          { name: "Menu", label: "Digital Menu", icon: "Utensils", badge: 0 },
          { name: "Reservations", label: `Reservations (${bookings.length})`, icon: "Calendar", badge: bookings.filter(b => b.status === "Pending" || b.status === "pending").length },
          { name: "Orders", label: `Orders (${orders.length})`, icon: "ShoppingBag", badge: orders.filter(o => o.status === "processing" || o.status === "pending").length },
          { name: "Kitchen", label: "Kitchen Queue", icon: "ChefHat", badge: 0 }
        );
      } else if (type.includes("salon") || type.includes("spa") || type.includes("beauty") || type.includes("hair")) {
        items.push(
          { name: "Appointments", label: `Appointments (${bookings.length})`, icon: "Calendar", badge: bookings.filter(b => b.status === "Pending" || b.status === "pending").length },
          { name: "Stylists", label: "Stylists (Staff)", icon: "Users", badge: 0 },
          { name: "Services", label: "Services Catalog", icon: "Scissors", badge: 0 }
        );
      } else {
        items.push(
          { name: "Products", label: "Products Catalog", icon: "ShoppingBag", badge: 0 },
          { name: "Inventory", label: "Inventory Stock", icon: "Layers", badge: 0 },
          { name: "Orders", label: `Orders (${orders.length})`, icon: "ShoppingCart", badge: orders.filter(o => o.status === "processing" || o.status === "pending").length },
          { name: "Categories", label: "Store Categories", icon: "Grid", badge: 0 }
        );
      }

      items.push(
        { name: "Customers", label: "Customers", icon: "Users", badge: 0 },
        { name: "Reviews", label: `Reviews (${reviews.length})`, icon: "Star", badge: reviews.filter(r => !r.reply).length },
        { name: "Payments", label: "Payments Logs", icon: "CreditCard", badge: 0 }
      );
    }

    items.push(
      { name: "Billing", label: "Billing & Subscriptions", icon: "Wallet", badge: 0 }
    );

    if (businessDetails) {
      items.push(
        { name: "Media Library", label: "Media Library", icon: "Image", badge: 0 },
        { name: "Activity Logs", label: "Activity Logs", icon: "FileText", badge: 0 },
        { name: "Notifications", label: "Notifications", icon: "Bell", badge: notifications.filter(n => !n.read).length },
        { name: "Settings", label: "Settings", icon: "Settings", badge: 0 }
      );
    }

    return items;
  };

  useEffect(() => {
    fetchDashboardData();
    fetchSubscriptionData();

    // Check for landing page direct checkout upgrade trigger
    const triggerPlan = localStorage.getItem("sitemint_checkout_trigger_plan");
    if (triggerPlan) {
      localStorage.removeItem("sitemint_checkout_trigger_plan");
      setActiveTab("Billing");
      setTimeout(() => {
        handleUpgradeSubscription(triggerPlan);
      }, 600);
    }
  }, []);
  const [bookingQuery, setBookingQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [orderQuery, setOrderQuery] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");

  // Input states for Staff Management
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState<"manager" | "staff">("staff");
  const [staffTitle, setStaffTitle] = useState("");
  const [staffPhotoUrl, setStaffPhotoUrl] = useState("");
  const [staffWorkingDays, setStaffWorkingDays] = useState("");
  const [staffWorkingHours, setStaffWorkingHours] = useState("");
  const [staffServicesAssigned, setStaffServicesAssigned] = useState("");
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);

  // Input states for creating a product
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdImage, setNewProdImage] = useState("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgradeSubscription = async (planId: string) => {
    const token = localStorage.getItem("sitemint_token");
    if (!token) return;

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay checkout script. Please check your internet connectivity.");
        return;
      }

      const res = await fetch("/api/subscriptions/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ plan_id: planId })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to create checkout transaction order.");
      }

      const { order_id, amount, currency } = result.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_mockkeyid",
        amount: amount,
        currency: currency,
        name: "SiteMint Subscription",
        description: `Upgrade tenant site to ${planId.toUpperCase()} tier`,
        order_id: order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/subscriptions/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: planId
              })
            });

            const verifyResult = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyResult.message || "Razorpay validation response mismatch.");
            }

            alert(`🎉 Congratulations! Your subscription is upgraded to ${planId.toUpperCase()}.`);
            fetchSubscriptionData();
            fetchDashboardData();
          } catch (err: any) {
            alert("Verification mismatch: " + err.message);
          }
        },
        prefill: {
          email: userEmail || ""
        },
        theme: {
          color: "#10B981"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert("Checkout Init Error: " + err.message);
    }
  };

  const handleDownloadInvoice = (tx: any, planName: string) => {
    const invoiceWindow = window.open("", "_blank");
    if (!invoiceWindow) return;

    invoiceWindow.document.write(`
      <html>
        <head>
          <title>GST Tax Invoice - SMT-${tx.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; background: #fff; }
            .invoice-box { max-width: 800px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 12px; }
            table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
            table td { padding: 12px 8px; vertical-align: top; }
            table tr td:nth-child(2) { text-align: right; }
            .logo { font-size: 32px; font-weight: 800; color: #10B981; margin-bottom: 8px; }
            .heading { font-weight: 700; border-bottom: 2px solid #e2e8f0; background: #f8fafc; font-size: 13px; text-transform: uppercase; color: #475569; }
            .item td { border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .total { font-weight: 800; border-top: 2px solid #e2e8f0; font-size: 16px; color: #0f172a; }
            .footer { margin-top: 60px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <table>
              <tr>
                <td>
                  <div class="logo">SiteMint</div>
                  <div style="font-size: 12px; color: #64748b;">Instant SaaS Builder Platform</div>
                </td>
                <td>
                  <strong>INVOICE #:</strong> SMT-${tx.id}<br/>
                  <strong>Date:</strong> ${new Date(tx.created_at).toLocaleDateString()}<br/>
                  <strong>Status:</strong> <span style="color:#10b981; font-weight:bold;">Paid</span>
                </td>
              </tr>
            </table>

            <div style="margin-top: 30px; margin-bottom: 40px;">
              <table>
                <tr class="heading">
                  <td>Issuer / Provider Details</td>
                  <td>Billed To Customer</td>
                </tr>
                <tr style="font-size: 13px; color: #334155;">
                  <td>
                    <strong>SiteMint Tech India Pvt Ltd</strong><br/>
                    GSTIN: 27AAAAA1111A1Z1<br/>
                    Mumbai, Maharashtra, India
                  </td>
                  <td>
                    <strong>Tenant ID:</strong> ${tx.business_id}<br/>
                    <strong>Email:</strong> ${userEmail || "Billed Owner"}
                  </td>
                </tr>
              </table>
            </div>

            <table>
              <tr class="heading">
                <td>Item Description</td>
                <td>Line Total</td>
              </tr>
              <tr class="item">
                <td>SiteMint Platform Monthly Subscription - Plan: ${planName}</td>
                <td>₹${Number(tx.amount).toFixed(2)}</td>
              </tr>
              <tr class="item">
                <td>Taxable Subtotal Value</td>
                <td>₹${(Number(tx.amount) / 1.18).toFixed(2)}</td>
              </tr>
              <tr class="item">
                <td>CGST (9.0%)</td>
                <td>₹${((Number(tx.amount) / 1.18) * 0.09).toFixed(2)}</td>
              </tr>
              <tr class="item">
                <td>SGST (9.0%)</td>
                <td>₹${((Number(tx.amount) / 1.18) * 0.09).toFixed(2)}</td>
              </tr>
              <tr class="total">
                <td>Grand Total (inclusive of 18% GST)</td>
                <td>₹${Number(tx.amount).toFixed(2)}</td>
              </tr>
            </table>

            <div class="footer">
              This document is a digitally compiled tax invoice issued by SiteMint Tech India Pvt Ltd.<br/>
              Support Inquiries: support@sitemint.app
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    invoiceWindow.document.close();
  };

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

  const handleProductStockChange = async (id: number | string, newStock: number) => {
    const token = localStorage.getItem("sitemint_token");
    if (!token) return;

    try {
      // Update local state first for immediate UI update
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, inventory_qty: newStock } : p))
      );

      await fetch(`/api/catalog/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ inventory_qty: newStock })
      });
    } catch (err) {
      console.error("Failed to update product stock in MySQL:", err);
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const token = localStorage.getItem("sitemint_token");
    try {
      const res = await fetch("/api/catalog/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProdName,
          price: Number(newProdPrice),
          inventory_qty: Number(newProdStock) || 0,
          image_url: newProdImage || null,
          description: newProdDesc || ""
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to add product.");

      logSystemActivity("Product Catalog Expanded", `New product "${newProdName}" added successfully.`, "product");
      fetchDashboardData();

      // Reset
      setNewProdName("");
      setNewProdPrice("");
      setNewProdStock("");
      setNewProdImage("");
      setNewProdDesc("");
      setIsAddingProduct(false);
    } catch (err: any) {
      alert("Error adding product: " + err.message);
    }
  };

  const handleDeleteProduct = async (id: number | string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("sitemint_token");
    try {
      logSystemActivity("Deleting Product", "Deleting product record from MySQL...", "product");
      const res = await fetch(`/api/catalog/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete product.");

      logSystemActivity("Product Deleted", "Removed product from storefront catalog.", "product");
      fetchDashboardData();
    } catch (err: any) {
      alert("Error deleting product: " + err.message);
    }
  };

  const handleAddServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServName || !newServPrice || !newServDuration) return;

    const token = localStorage.getItem("sitemint_token");
    try {
      const res = await fetch("/api/catalog/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newServName,
          price: Number(newServPrice),
          duration_minutes: Number(newServDuration),
          description: newServDesc || "",
          image_url: newServImage || null
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to add service.");

      logSystemActivity("Service Catalog Expanded", `New service "${newServName}" added successfully.`, "catalog");
      fetchDashboardData();

      // Reset
      setNewServName("");
      setNewServPrice("");
      setNewServDuration("");
      setNewServDesc("");
      setNewServImage("");
      setIsAddingService(false);
    } catch (err: any) {
      alert("Error adding service: " + err.message);
    }
  };

  const handleDeleteService = async (id: number | string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this service?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("sitemint_token");
    try {
      logSystemActivity("Deleting Service", "Deleting service record from MySQL...", "catalog");
      const res = await fetch(`/api/catalog/services/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete service.");

      logSystemActivity("Service Deleted", "Removed service from storefront catalog.", "catalog");
      fetchDashboardData();
    } catch (err: any) {
      alert("Error deleting service: " + err.message);
    }
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

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid format. Please upload PNG, JPG, WebP, or GIF.");
      return;
    }

    const token = localStorage.getItem("sitemint_token");
    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingLogo(true);
    try {
      logSystemActivity("Uploading Logo", "Uploading image to Cloudinary...", "system");
      const uploadRes = await fetch("/api/feedback/media", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadResult.message || "Upload failed.");

      setLogoPreview(uploadResult.data.url);
      logSystemActivity("Logo Upload Completed", "Logo successfully uploaded to Cloudinary.", "system");
    } catch (err: any) {
      alert("Logo upload failed: " + err.message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview("");
    logSystemActivity("Logo Cleared", "Logo preview cleared. Click Save to apply changes.", "system");
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid format. Please upload PNG, JPG, WebP, or GIF.");
      return;
    }

    const token = localStorage.getItem("sitemint_token");
    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingBanner(true);
    try {
      logSystemActivity("Uploading Cover Banner", "Uploading image to Cloudinary...", "system");
      const uploadRes = await fetch("/api/feedback/media", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadResult.message || "Upload failed.");

      setBannerPreview(uploadResult.data.url);
      logSystemActivity("Cover Banner Upload Completed", "Banner successfully uploaded to Cloudinary.", "system");
    } catch (err: any) {
      alert("Banner upload failed: " + err.message);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleRemoveBanner = () => {
    setBannerPreview("");
    logSystemActivity("Banner Cleared", "Cover preview cleared. Click Save to apply changes.", "system");
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffRole) {
      alert("Please fill out Name, Email, and System Role.");
      return;
    }

    const token = localStorage.getItem("sitemint_token");
    if (!token) return;

    const bodyData = {
      full_name: staffName,
      email: staffEmail,
      role: staffRole,
      staff_title: staffTitle,
      staff_photo_url: staffPhotoUrl,
      working_days: staffWorkingDays,
      working_hours: staffWorkingHours,
      services_assigned: staffServicesAssigned
    };

    try {
      if (editingStaffId) {
        logSystemActivity("Updating Staff Record", `Modifying profile for ${staffName}...`, "system");
        const res = await fetch(`/api/staff/${editingStaffId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(bodyData)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to update staff member.");
        logSystemActivity("Staff Profile Saved", `Updated staff record for ${staffName} successfully.`, "system");
      } else {
        logSystemActivity("Adding Staff Member", `Creating warehouse profile for ${staffName}...`, "system");
        const res = await fetch("/api/staff", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(bodyData)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to add staff member.");
        logSystemActivity("Staff Profile Appended", `Appended new staff record for ${staffName} successfully.`, "system");
      }

      // Reset Form State
      setEditingStaffId(null);
      setStaffName("");
      setStaffEmail("");
      setStaffRole("staff");
      setStaffTitle("");
      setStaffPhotoUrl("");
      setStaffWorkingDays("");
      setStaffWorkingHours("");
      setStaffServicesAssigned("");
      setIsStaffFormOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      alert("Error saving staff details: " + err.message);
    }
  };

  const handleDeleteStaff = async (id: number, name: string) => {
    const token = localStorage.getItem("sitemint_token");
    if (!token) return;

    const confirmDelete = window.confirm(`Are you sure you want to remove ${name} from your team?`);
    if (!confirmDelete) return;

    try {
      logSystemActivity("Deleting Staff Member", `Removing team profile for ${name}...`, "system");
      const res = await fetch(`/api/staff/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete staff member.");
      logSystemActivity("Staff Record Deleted", `Removed team member ${name} from MySQL records.`, "system");
      fetchDashboardData();
    } catch (err: any) {
      alert("Error deleting team member: " + err.message);
    }
  };



  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col md:flex-row font-sans" id="owner-dashboard-container">
      
      {/* 1. COLLAPSIBLE SIDEBAR CONTAINER */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      <aside 
        className={`bg-[#0c0c0e] border-r border-zinc-900/90 flex flex-col justify-between transition-all duration-300 z-50 fixed inset-y-0 left-0 w-64 md:sticky md:top-0 md:h-screen shrink-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${
          sidebarCollapsed ? "md:w-20" : "md:w-64"
        }`}
        id="owner-dashboard-sidebar"
      >
        {/* Logo and collapse toggle */}
        <div className="p-5 flex items-center justify-between border-b border-zinc-900" id="sidebar-top">
          <div className="flex items-center gap-3">
            {businessDetails?.logo_url ? (
              <img src={businessDetails.logo_url} alt="Logo" className="h-8 w-8 rounded-xl object-cover shrink-0" />
            ) : (
              <Logo showText={false} variant="icon" className="h-8 w-8" imgClassName="h-8 w-8 rounded-xl" />
            )}
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
          {getSidebarItems().map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setIsMobileSidebarOpen(false);
                }}
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
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>

                {item.badge > 0 && !sidebarCollapsed && (
                  <span className="text-[9px] font-mono font-black bg-red-500 text-white rounded-full px-1.5 py-0.5 shrink-0 animate-pulse">
                    {item.badge}
                  </span>
                )}

                {/* Micro tooltip if collapsed */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-[10px] font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl border border-zinc-800">
                    {item.label} {item.badge > 0 && `(${item.badge})`}
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
          <div className="flex items-center gap-3 text-left">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white md:hidden transition-colors cursor-pointer shrink-0"
              title="Open Navigation"
            >
              <LucideIcon name="Menu" className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                <span>Merchant Station</span>
                <span>•</span>
                <span className="text-emerald-400">Connected Edge</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-display mt-0.5">
                {activeTab} Workspace
              </h2>
            </div>
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
          {subscription?.status === "expired" && activeTab !== "Billing" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-16 text-center max-w-xl mx-auto space-y-6 flex flex-col justify-center items-center animate-fade-in"
            >
              <div className="w-20 h-20 rounded-2xl bg-zinc-950 border border-red-500/20 text-red-400 flex items-center justify-center shadow-xl glow-red">
                <LucideIcon name="AlertTriangle" className="w-10 h-10 animate-bounce text-red-450" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold tracking-tight text-white font-display">Your Free Trial Has Expired</h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
                  Your 30-day free trial on the Starter plan has expired. To continue customizing your site, managing bookings, inventory, orders, and staff roles, please upgrade to a premium subscription plan.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3.5 w-full max-w-xs pt-4 justify-center">
                <button
                  onClick={() => setActiveTab("Billing")}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] shadow-[0_4px_25px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <LucideIcon name="Wallet" className="w-4 h-4" />
                  Upgrade Subscription
                </button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
            
            {/* TAB: MY WEBSITES */}
            {activeTab === "My Websites" && (
              <motion.div
                key="my-websites-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-950/60 p-6 rounded-2xl border border-zinc-900">
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">My Websites</h3>
                    <p className="text-xs text-zinc-500 font-mono">Select, edit, duplicate, or delete your websites and storefront templates.</p>
                  </div>
                  <button
                    onClick={() => onNavigate("onboarding")}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <LucideIcon name="Plus" className="w-4 h-4" />
                    Create New Website
                  </button>
                </div>

                {businessesList.length === 0 ? (
                  <div className="p-12 text-center space-y-4 bg-zinc-950/30 rounded-2xl border border-zinc-900 border-dashed">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mx-auto text-zinc-500">
                      <LucideIcon name="Globe" className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 max-w-xs mx-auto">
                      <h4 className="text-sm font-bold text-zinc-300 font-display">No websites found</h4>
                      <p className="text-xs text-zinc-500 leading-normal">
                        You haven't created any websites yet. Click "Create New Website" to launch your template onboarding wizard.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businessesList.map((biz) => {
                      const isCurrentlyActive = Number(biz.id) === Number(businessId);
                      return (
                        <div
                          key={biz.id}
                          className={`p-5 rounded-2xl bg-zinc-950/40 border transition-all flex flex-col justify-between ${
                            isCurrentlyActive ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "border-zinc-900 hover:border-zinc-800"
                          }`}
                        >
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center font-bold text-white tracking-wider font-mono overflow-hidden">
                                {biz.logo_url ? (
                                  <img src={biz.logo_url} alt={biz.name} className="w-full h-full object-cover" />
                                ) : (
                                  <LucideIcon name="Globe" className="w-5 h-5 text-zinc-400" />
                                )}
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleSelectBusiness(biz.id)}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    isCurrentlyActive 
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                      : "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                                  }`}
                                  disabled={isCurrentlyActive}
                                >
                                  {isCurrentlyActive ? "Active" : "Select & Edit"}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1 text-left">
                              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                                {biz.name}
                                {biz.is_published ? (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Published" />
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-zinc-600" title="Draft" />
                                )}
                              </h4>
                              <p className="text-xs text-zinc-400 truncate font-mono">/site/{biz.subdomain}</p>
                              {biz.description && (
                                <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1 leading-relaxed">{biz.description}</p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                              {biz.business_type && (
                                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded border border-emerald-500/20">
                                  {biz.business_type}
                                </span>
                              )}
                              <span className={`text-[9px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${
                                biz.is_published 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-zinc-900 text-zinc-400 border-zinc-800"
                              }`}>
                                {biz.is_published ? "Published" : "Draft"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zinc-900/60">
                            <button
                              onClick={() => window.open(window.location.origin + "/site/" + biz.subdomain, "_blank")}
                              className="flex-1 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <LucideIcon name="ExternalLink" className="w-3 h-3" />
                              Open
                            </button>
                            <button
                              onClick={() => handleDuplicateBusiness(biz.id)}
                              className="py-1.5 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] font-bold text-zinc-350 hover:text-white flex items-center justify-center gap-1 cursor-pointer"
                              title="Duplicate website template"
                            >
                              <LucideIcon name="Copy" className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteBusiness(biz.id)}
                              className="py-1.5 px-2.5 rounded-lg bg-red-950/20 hover:bg-red-950/45 border border-red-900/30 text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center justify-center gap-1 cursor-pointer"
                              title="Delete Website"
                            >
                              <LucideIcon name="Trash2" className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: DASHBOARD OVERVIEW */}
            {activeTab === "Dashboard" && (() => {
              // Calculate checklist status
              const isBusinessInfoCompleted = !!(
                businessDetails?.name &&
                businessDetails?.business_type &&
                businessDetails?.upi_id
              );
              // Template selected is true if we have onboarded details
              const isTemplateSelected = !!(
                businessDetails?.subdomain
              );
              // Theme customized is true if colors or typography are changed from default settings
              const isThemeCustomized = !!(
                themeAccent && (themeAccent !== "#10B981" || themeSecondary !== "#111827" || typography !== "Inter")
              );
              const isWebsitePublished = !!(businessDetails?.is_published);

              // Calculate progress percentage
              let completedSteps = 0;
              if (isBusinessInfoCompleted) completedSteps++;
              if (isTemplateSelected) completedSteps++;
              if (isThemeCustomized) completedSteps++;
              if (isWebsitePublished) completedSteps++;
              const progressPct = completedSteps * 25;

              // Total real revenue sum from MySQL payments
              const totalRevenue = paymentsList
                .filter((p: any) => p.status === "captured" || p.status === "completed")
                .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

              // Empty dashboard check for new account (no real interactions yet)
              const isNewAccount = bookings.length === 0 && orders.length === 0 && customers.length === 0 && paymentsList.length === 0;

              return (
                <motion.div
                  key="dashboard-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {/* SYSTEM BROADCAST ANNOUNCEMENTS ALERT */}
                  {announcements.length > 0 && (
                    <div className="space-y-3" id="system-announcements-banner">
                      {announcements.map((ann) => (
                        <div 
                          key={ann.id} 
                          className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-900/30 flex items-start gap-3.5 text-left"
                        >
                          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                            <LucideIcon name="Megaphone" className="w-4.5 h-4.5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white leading-snug">{ann.title}</h4>
                              <span className="text-[8px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20 uppercase">Alert</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">{ann.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* WELCOME SECTION */}
                  <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4" id="welcome-section">
                    <div className="text-left space-y-1">
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
                        Welcome back, {ownerName} 👋
                      </h1>
                      <p className="text-xs sm:text-sm text-zinc-400">
                        Manage your business, publish your website and start receiving customers.
                      </p>
                    </div>
                  </div>

                  {/* LAUNCH & STATUS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="launch-grid">
                    {/* LAUNCH CHECKLIST */}
                    <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 text-left space-y-6 flex flex-col justify-between" id="launch-checklist-card">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                          <h3 className="text-sm font-bold text-white font-display tracking-wide uppercase text-zinc-500">Launch Checklist</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Progress</span>
                            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{progressPct}%</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {[
                            { label: "Business Information", completed: isBusinessInfoCompleted },
                            { label: "Template Selected", completed: isTemplateSelected },
                            { label: "Theme Customized", completed: isThemeCustomized },
                            { label: "Website Published", completed: isWebsitePublished },
                          ].map((step, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/20 border border-zinc-900/40">
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                  step.completed 
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                    : "bg-zinc-900/60 border-zinc-800 text-zinc-500"
                                }`}>
                                  <LucideIcon name={step.completed ? "Check" : "CircleDot"} className="w-3 h-3 stroke-[3]" />
                                </div>
                                <span className={`text-xs font-semibold ${step.completed ? "text-zinc-300" : "text-zinc-500"}`}>
                                  {step.label}
                                </span>
                              </div>
                              {step.completed ? (
                                <span className="text-[9px] font-mono font-bold text-emerald-400/80 uppercase">Done</span>
                              ) : (
                                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Pending</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Micro-Progress Bar */}
                      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-800 mt-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* PUBLISH STATUS */}
                    <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 text-left space-y-6 flex flex-col justify-center" id="publish-status-card">
                      {!isWebsitePublished ? (
                        <div className="space-y-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <LucideIcon name="CloudLightning" className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-bold text-white font-display">Your website is not live yet.</h3>
                            <p className="text-xs text-zinc-400 leading-normal">
                              Complete the remaining setup steps to publish your business website.
                            </p>
                          </div>
                          <button
                            onClick={handlePublishWebsite}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:opacity-95 transition-all shadow-lg cursor-pointer"
                          >
                            <LucideIcon name="Globe" className="w-3.5 h-3.5" />
                            Publish Website
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <LucideIcon name="CheckCircle2" className="w-5 h-5 animate-bounce" />
                          </div>
                          <div className="space-y-1.5">
                            <h3 className="text-sm font-bold text-white font-display">🎉 Your website is live.</h3>
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between text-xs text-zinc-300 font-mono">
                              <span className="truncate pr-2">{window.location.origin}/site/{businessDetails?.subdomain || "site"}</span>
                              <button 
                                onClick={handleCopyLink}
                                className="p-1 rounded bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white"
                                title="Copy Link"
                              >
                                <LucideIcon name="Copy" className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => window.open(window.location.origin + "/site/" + (businessDetails?.subdomain || "site"), "_blank")}
                              className="px-2 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <LucideIcon name="ExternalLink" className="w-3 h-3" />
                              Visit Website
                            </button>
                            <button
                              onClick={handleCopyLink}
                              className="px-2 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <LucideIcon name="Link2" className="w-3 h-3" />
                              Copy Link
                            </button>
                            <button
                              onClick={handleShare}
                              className="px-2 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <LucideIcon name="Share2" className="w-3 h-3" />
                              Share
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* QUICK ACTIONS */}
                  <div className="space-y-4" id="quick-actions-section">
                    <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider text-zinc-500 text-left">Quick Actions</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {[
                        { label: "Complete Business Profile", tab: "Settings", icon: "UserCog", desc: "Update details & contacts" },
                        { label: "Customize Theme", tab: "Theme Customizer", icon: "Palette", desc: "Colors, typography & shapes" },
                        { label: "Manage Products", tab: "Products", icon: "ShoppingBag", desc: "Add inventory & adjust sales" },
                        { label: "View Website", tab: "Website Builder", icon: "Globe", desc: "Launch browser preview frame" },
                        { label: "Publish Website", action: handlePublishWebsite, icon: "Zap", desc: "Deploy changes to live subdomain" },
                      ].map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (action.action) {
                              action.action();
                            } else if (action.tab) {
                              setActiveTab(action.tab);
                            }
                          }}
                          className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 text-left flex flex-col justify-between hover:bg-zinc-900/20 transition-all group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-xl bg-zinc-900 group-hover:bg-zinc-850 border border-zinc-850 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition-colors">
                            <LucideIcon name={action.icon} className="w-4 h-4" />
                          </div>
                          <div className="space-y-1 mt-6">
                            <h4 className="text-xs font-bold text-white leading-snug">{action.label}</h4>
                            <p className="text-[10px] text-zinc-500 leading-normal">{action.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BUSINESS DATA: STATS, CHARTS, OR EMPTY STATE */}
                  {isNewAccount ? (
                    <div className="p-8 rounded-2xl bg-zinc-950/40 border border-zinc-900 text-center space-y-4" id="empty-dashboard-placeholder">
                      <div className="w-12 h-12 rounded-full bg-zinc-900/60 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                        <LucideIcon name="LineChart" className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h3 className="text-sm font-bold text-white">No analytics available</h3>
                        <p className="text-xs text-zinc-500 leading-normal">
                          Your business is ready to receive customers after publishing.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* STAT CARDS ROW */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4" id="overview-metrics-row">
                        {getBusinessDashboardCards().map((card, idx) => (
                          <div 
                            key={idx} 
                            className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex items-center justify-between hover:border-zinc-800 transition-all"
                            id={`stat-card-${idx}`}
                          >
                            <div className="text-left space-y-1">
                              <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-wider block font-bold truncate max-w-[125px]">{card.title}</span>
                              <p className="text-lg sm:text-xl font-bold text-white font-display tracking-tight">{card.val}</p>
                              <span className="text-[9px] font-medium text-zinc-500">{card.diff}</span>
                            </div>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.bg} ${card.color}`}>
                              <LucideIcon name={card.icon} className="w-4 h-4" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* CHARTS ROW */}
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
                              <AreaChart data={getAnalyticsData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

                        {/* Traffic Acquisition Pie chart */}
                        <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 text-left space-y-4">
                          <div>
                            <h3 className="text-base font-bold text-white font-display">Traffic Acquisition</h3>
                            <p className="text-xs text-zinc-500">Origin matrix of incoming storefront hits</p>
                          </div>

                          <div className="h-48 w-full relative flex items-center justify-center">
                            <>
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={[
                                      { name: "Direct", value: 10, color: "#10B981" },
                                      { name: "Search Engines", value: 5, color: "#06B6D4" },
                                      { name: "Social Media", value: 3, color: "#EC4899" },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={5}
                                    dataKey="value"
                                  >
                                    {[
                                      { name: "Direct", value: 10, color: "#10B981" },
                                      { name: "Search Engines", value: 5, color: "#06B6D4" },
                                      { name: "Social Media", value: 3, color: "#EC4899" },
                                    ].map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute text-center">
                                <span className="text-xs font-mono text-zinc-500 uppercase">Total Hits</span>
                                <p className="text-xl font-black text-white">18</p>
                              </div>
                            </>
                          </div>

                          {/* Legends stack */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400">
                            {[
                              { name: "Direct (10)", color: "#10B981" },
                              { name: "Search (5)", color: "#06B6D4" },
                              { name: "Social (3)", color: "#EC4899" },
                            ].map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 font-bold">
                                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: item.color }} />
                                <span className="truncate">{item.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

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
                        {activities.slice(0, 5).length === 0 ? (
                          <div className="py-6 text-center space-y-2">
                            <p className="text-xs font-bold text-zinc-300">No recent activity yet.</p>
                            <p className="text-[11px] text-zinc-500 leading-normal max-w-xs mx-auto">
                              Your business activity will appear here after customers interact with your website.
                            </p>
                          </div>
                        ) : (
                          activities.slice(0, 5).map((act) => (
                            <div key={act.id} className="flex items-start gap-3.5 pb-3 border-b border-zinc-900 last:border-0 last:pb-0">
                              <div className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-center shrink-0">
                                <LucideIcon 
                                  name={
                                    act.action?.includes("booking") || act.type === "booking" ? "Calendar" :
                                    act.action?.includes("product") || act.type === "product" ? "ShoppingBag" :
                                    act.action?.includes("payment") || act.type === "payout" ? "CreditCard" : "Server"
                                  } 
                                  className="w-4 h-4 text-zinc-400" 
                                />
                              </div>

                              <div className="flex-grow space-y-0.5">
                                <div className="flex justify-between items-center">
                                  <p className="text-xs font-bold text-zinc-200">{act.event || act.action?.replace(/_/g, " ").toUpperCase()}</p>
                                  <span className="text-[10px] font-mono text-zinc-500">
                                    {act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : act.time}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-400 leading-normal">{act.detail || act.details}</p>
                              </div>
                            </div>
                          ))
                        )}
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
                        {bookings.slice(0, 4).length === 0 ? (
                          <div className="py-6 text-center space-y-2">
                            <p className="text-xs font-bold text-zinc-300">No bookings yet</p>
                            <p className="text-[11px] text-zinc-500 leading-normal max-w-xs mx-auto">
                              Publish your website to start receiving bookings from customers.
                            </p>
                          </div>
                        ) : (
                          bookings.slice(0, 4).map((bk) => (
                            <div key={bk.id} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-900/60 hover:bg-zinc-900/60 transition-all">
                              <div className="text-left space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white">
                                    {bk.customer_first_name ? `${bk.customer_first_name} ${bk.customer_last_name}` : bk.customer}
                                  </span>
                                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                    bk.status === "Confirmed" || bk.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400" :
                                    bk.status === "Pending" || bk.status === "pending" ? "bg-amber-500/10 text-amber-400 animate-pulse" : "bg-cyan-500/10 text-cyan-400"
                                  }`}>
                                    {bk.status}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-400">{bk.service_name || bk.service}</p>
                                <p className="text-[10px] font-mono text-zinc-500">
                                  {bk.start_time ? new Date(bk.start_time).toLocaleDateString() : bk.date} • {bk.start_time ? new Date(bk.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : bk.time}
                                </p>
                              </div>

                              {(bk.status === "Pending" || bk.status === "pending") && (
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
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })()}

            {/* TAB: STAFF / TRAINERS / STYLISTS MANAGEMENT */}
            {(activeTab === "Trainers" || activeTab === "Stylists" || activeTab === "Staff") && (
              <motion.div
                key="staff-management-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-950/60 p-6 rounded-2xl border border-zinc-900">
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">Team Directory</h3>
                    <p className="text-xs text-zinc-500 font-mono">Add, edit, and delete staff accounts saved securely in MySQL.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingStaffId(null);
                      setStaffName("");
                      setStaffEmail("");
                      setStaffRole("staff");
                      setStaffTitle("");
                      setIsStaffFormOpen(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <LucideIcon name="UserPlus" className="w-4 h-4" />
                    Add Team Member
                  </button>
                </div>

                {/* Staff Cards Grid */}
                {staff.length === 0 ? (
                  <div className="p-12 text-center space-y-4 bg-zinc-950/30 rounded-2xl border border-zinc-900 border-dashed">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mx-auto text-zinc-550">
                      <LucideIcon name="Users" className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 max-w-xs mx-auto">
                      <h4 className="text-sm font-bold text-zinc-300 font-display">No staff registered yet</h4>
                      <p className="text-xs text-zinc-555 leading-normal">
                        Your business has no staff profiles cataloged. Click "Add Team Member" to register your staff.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staff.map((member) => (
                      <div
                        key={member.id}
                        className="p-5 rounded-2xl bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          {/* Top Row: initials/photo + delete */}
                          <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center font-bold text-white tracking-wider font-mono overflow-hidden">
                              {member.staff_photo_url ? (
                                <img src={member.staff_photo_url} alt={member.full_name} className="w-full h-full object-cover" />
                              ) : (
                                member.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2)
                              )}
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingStaffId(member.id);
                                  setStaffName(member.full_name);
                                  setStaffEmail(member.email);
                                  setStaffRole(member.role);
                                  setStaffTitle(member.staff_title || "");
                                  setStaffPhotoUrl(member.staff_photo_url || "");
                                  setStaffWorkingDays(member.working_days || "");
                                  setStaffWorkingHours(member.working_hours || "");
                                  setStaffServicesAssigned(member.services_assigned || "");
                                  setIsStaffFormOpen(true);
                                }}
                                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
                                title="Edit Profile"
                              >
                                <LucideIcon name="Edit3" className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteStaff(member.id, member.full_name)}
                                className="w-7 h-7 rounded-lg bg-red-950/20 hover:bg-red-950/45 border border-red-900/30 flex items-center justify-center text-red-400 hover:text-red-300 transition-all cursor-pointer"
                                title="Remove Profile"
                              >
                                <LucideIcon name="Trash2" className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1 text-left">
                            <h4 className="text-sm font-bold text-white tracking-tight">{member.full_name}</h4>
                            <p className="text-xs text-zinc-400 font-mono">{member.email}</p>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1">
                            {member.staff_title && (
                              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded border border-emerald-500/20">
                                {member.staff_title}
                              </span>
                            )}
                            <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded">
                              System: {member.role}
                            </span>
                            <span className="bg-zinc-900 border border-zinc-800 text-emerald-400 text-[9px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded">
                              {member.status}
                            </span>
                          </div>

                          <div className="space-y-1 text-left text-[11px] text-zinc-400 border-t border-zinc-900/60 pt-2.5 mt-2">
                            {member.working_days && (
                              <p><span className="text-zinc-500 font-mono">Days:</span> {member.working_days}</p>
                            )}
                            {member.working_hours && (
                              <p><span className="text-zinc-500 font-mono">Hours:</span> {member.working_hours}</p>
                            )}
                            {member.services_assigned && (
                              <p><span className="text-zinc-500 font-mono">Services:</span> {member.services_assigned}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Staff Add/Edit Form Overlay Modal */}
                {isStaffFormOpen && (
                  <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsStaffFormOpen(false)} />
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="relative w-full max-w-md bg-[#0C0D14] border border-zinc-850 rounded-3xl p-6 shadow-2xl space-y-6"
                    >
                      <div>
                        <h3 className="text-base font-bold text-white font-display">
                          {editingStaffId ? "Edit Staff Details" : "Register Team Member"}
                        </h3>
                        <p className="text-xs text-zinc-500">Provide their details to store in MySQL records.</p>
                      </div>

                      <form onSubmit={handleStaffSubmit} className="space-y-4 text-left">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest block">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Alex Vance"
                            value={staffName}
                            onChange={(e) => setStaffName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest block">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="alex@vanguard.co"
                            value={staffEmail}
                            onChange={(e) => setStaffEmail(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest block">Profile Photo URL</label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={staffPhotoUrl}
                            onChange={(e) => setStaffPhotoUrl(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest block">Working Days</label>
                            <input
                              type="text"
                              placeholder="Mon, Tue, Wed, Thu, Fri"
                              value={staffWorkingDays}
                              onChange={(e) => setStaffWorkingDays(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest block">Shift Hours</label>
                            <input
                              type="text"
                              placeholder="09:00 - 18:00"
                              value={staffWorkingHours}
                              onChange={(e) => setStaffWorkingHours(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest block">Assigned Services (IDs or Names)</label>
                          <input
                            type="text"
                            placeholder="1, 2 or haircut, massage"
                            value={staffServicesAssigned}
                            onChange={(e) => setStaffServicesAssigned(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest block">Staff Title (e.g. Chef, Stylist)</label>
                            <input
                              type="text"
                              placeholder="Trainer"
                              value={staffTitle}
                              onChange={(e) => setStaffTitle(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest block">System Role</label>
                            <select
                              value={staffRole}
                              onChange={(e) => setStaffRole(e.target.value as any)}
                              className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-700 cursor-pointer"
                            >
                              <option value="staff">Staff</option>
                              <option value="manager">Manager</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsStaffFormOpen(false)}
                            className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold hover:text-white transition-all text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold hover:opacity-95 transition-all text-xs cursor-pointer"
                          >
                            Save Details
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
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
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={triggerLogoUpload}
                              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-350 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <LucideIcon name="Upload" className="w-3.5 h-3.5" />
                              Upload Brand Logo
                            </button>
                            {logoPreview && (
                              <button
                                type="button"
                                onClick={handleRemoveLogo}
                                className="px-3 py-1.5 rounded-lg bg-red-950/10 hover:bg-red-950/30 border border-red-900/30 text-xs font-semibold text-red-400 hover:text-red-300 transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <LucideIcon name="Trash2" className="w-3.5 h-3.5" />
                                Remove Logo
                              </button>
                            )}
                          </div>
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
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-900">
                      <div className="text-left flex-grow flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white font-display">Live Frame Preview</h4>
                          <p className="text-[11px] text-zinc-500">Simulating visual engine compilation in real-time</p>
                        </div>
                        <button
                          onClick={() => window.open(window.location.origin + "/site/" + (settingsSlug || businessDetails?.subdomain || "site"), "_blank")}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg mr-4"
                        >
                          <LucideIcon name="ExternalLink" className="w-3.5 h-3.5" />
                          Launch Preview
                        </button>
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
                            localhost:3000/site/{settingsSlug || businessDetails?.subdomain || "site"}
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
                      {ANALYTICS_REVENUE_DATA.length === 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-zinc-800/80 rounded-2xl bg-zinc-950/20">
                          <LucideIcon name="BarChart3" className="w-8 h-8 text-zinc-600 mb-2" />
                          <p className="text-xs text-zinc-500 font-semibold">No analytics available yet.</p>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={ANALYTICS_REVENUE_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                            <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                            <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                            <Bar dataKey="Views" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Orders index breakdown */}
                  <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 text-left space-y-4">
                    <div>
                      <h4 className="text-base font-bold text-white font-display">Transactional Order Frequency</h4>
                      <p className="text-xs text-zinc-500">Tracking conversion counts per month</p>
                    </div>

                    <div className="h-56 w-full">
                      {ANALYTICS_REVENUE_DATA.length === 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-zinc-800/80 rounded-2xl bg-zinc-950/20">
                          <LucideIcon name="BarChart3" className="w-8 h-8 text-zinc-600 mb-2" />
                          <p className="text-xs text-zinc-500 font-semibold">No analytics available yet.</p>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={ANALYTICS_REVENUE_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                            <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                            <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                            <Bar dataKey="Orders" fill="#EC4899" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
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
                          { step: "Total Page Sessions", value: "0 Visited", pct: "0%", level: "No traffic yet.", color: "text-zinc-500" },
                          { step: "Inquiry / Bookings Click", value: "0 Attempted", pct: "0%", level: "--", color: "text-zinc-500" },
                          { step: "Calendar Confirmation", value: `${bookings.length} Scheduled`, pct: bookings.length > 0 ? "100%" : "0%", level: bookings.length > 0 ? "Active" : "--", color: bookings.length > 0 ? "text-emerald-400" : "text-zinc-500" },
                          { step: "Product Sales Checkout", value: `${orders.length} Checked Out`, pct: orders.length > 0 ? "100%" : "0%", level: orders.length > 0 ? "Active" : "--", color: orders.length > 0 ? "text-amber-400" : "text-zinc-500" },
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
                  {bookings.filter(b => 
                    b.customer.toLowerCase().includes(bookingQuery.toLowerCase()) || 
                    b.service.toLowerCase().includes(bookingQuery.toLowerCase()) ||
                    b.id.toLowerCase().includes(bookingQuery.toLowerCase())
                  ).length === 0 ? (
                    <div className="md:col-span-2 p-12 text-center rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-950/20 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-900/60 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                        <LucideIcon name="Calendar" className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 max-w-sm mx-auto">
                        <h4 className="text-sm font-bold text-white">No Bookings Yet</h4>
                        <p className="text-xs text-zinc-500 leading-normal">
                          Publish your website to start receiving bookings from customers.
                        </p>
                      </div>
                    </div>
                  ) : (
                    bookings
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
                      ))
                  )}
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
                      {customers.filter(c => 
                        c.name.toLowerCase().includes(customerQuery.toLowerCase()) || 
                        c.email.toLowerCase().includes(customerQuery.toLowerCase())
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-zinc-500">
                            <div className="space-y-4">
                              <div className="w-12 h-12 rounded-full bg-zinc-900/60 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                                <LucideIcon name="Users" className="w-6 h-6" />
                              </div>
                              <div className="space-y-1 max-w-sm mx-auto">
                                <h4 className="text-sm font-bold text-white">No Customers Yet</h4>
                                <p className="text-xs text-zinc-500 leading-normal">
                                  Customers will appear here automatically when they book or buy on your site.
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        customers
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
                          ))
                      )}
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

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
                  {products.filter(p => p.name.toLowerCase().includes(productQuery.toLowerCase())).length === 0 ? (
                    <div className="lg:col-span-4 md:col-span-2 p-12 text-center rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-950/20 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-900/60 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                        <LucideIcon name="ShoppingBag" className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 max-w-sm mx-auto">
                        <h4 className="text-sm font-bold text-white">No Products Added</h4>
                        <p className="text-xs text-zinc-500 leading-normal">
                          Get started by adding items to your storefront catalog.
                        </p>
                      </div>
                    </div>
                  ) : (
                    products
                      .filter(p => p.name.toLowerCase().includes(productQuery.toLowerCase()))
                      .map((p) => (
                        <div key={p.id} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all flex flex-col justify-between">
                          <div className="aspect-square w-full bg-zinc-900 relative">
                            <img src={p.image_url || "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=300&q=80"} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-emerald-400 font-mono font-bold text-xs px-2.5 py-1 rounded-lg border border-zinc-850">
                              ₹{p.price}
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase">CATALOG ID: {p.id}</span>
                              <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-zinc-400">
                              <span>Inventory: <span className="font-bold text-white">{p.inventory_qty || 0} units</span></span>
                              <span className={(p.inventory_qty || 0) > 0 ? "text-emerald-400" : "text-red-400"}>
                                {(p.inventory_qty || 0) > 0 ? "In Stock" : "Out of Stock"}
                              </span>
                            </div>

                            {/* Instant stock adjusting mutator slider */}
                            <div className="space-y-1 pt-2 border-t border-zinc-900 text-left">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase">Adjust Inventory</span>
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={p.inventory_qty || 0} 
                                onChange={(e) => handleProductStockChange(p.id, Number(e.target.value))}
                                className="w-full accent-emerald-400" 
                              />
                            </div>

                            <div className="pt-2 border-t border-zinc-900 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id)}
                                className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/20 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
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

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            Add Product
                          </button>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* TAB: SERVICES */}
            {activeTab === "Services" && (
              <motion.div
                key="services-tab"
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
                      placeholder="Search services..."
                      className="w-full bg-zinc-950/60 border border-zinc-900 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 transition-all"
                    />
                  </div>

                  <button
                    onClick={() => setIsAddingService(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:opacity-95 cursor-pointer"
                  >
                    <LucideIcon name="Plus" className="w-4 h-4 stroke-[3]" />
                    Add Service
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {services.length === 0 ? (
                    <div className="lg:col-span-4 md:col-span-2 p-12 text-center rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-950/20 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-900/60 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                        <LucideIcon name="Scissors" className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 max-w-sm mx-auto">
                        <h4 className="text-sm font-bold text-white">No Services Added</h4>
                        <p className="text-xs text-zinc-500 leading-normal">
                          Add service offerings (durations & pricing) for online booking.
                        </p>
                      </div>
                    </div>
                  ) : (
                    services.map((s) => (
                      <div key={s.id} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all flex flex-col justify-between">
                        <div className="aspect-video w-full bg-zinc-900 relative">
                          <img src={s.image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80"} alt={s.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-emerald-400 font-mono font-bold text-xs px-2.5 py-1 rounded-lg border border-zinc-850">
                            ₹{s.price}
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase">SERVICE ID: {s.id}</span>
                            <h4 className="text-xs font-bold text-white truncate">{s.name}</h4>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-zinc-400">
                            <span>Duration: <span className="font-bold text-white">{s.duration_minutes} mins</span></span>
                          </div>

                          <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{s.description || "No description provided."}</p>

                          <div className="pt-2 border-t border-zinc-900 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteService(s.id)}
                              className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/20 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Service Modal */}
                <AnimatePresence>
                  {isAddingService && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    >
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.95 }}
                        className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-2xl p-6 relative"
                      >
                        <button
                          type="button"
                          onClick={() => setIsAddingService(false)}
                          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                        >
                          <LucideIcon name="X" className="w-5 h-5" />
                        </button>

                        <form onSubmit={handleAddServiceSubmit} className="space-y-4 text-left">
                          <h3 className="text-base font-bold text-white font-display border-b border-zinc-900 pb-2">Add New Service</h3>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Service Name</label>
                            <input 
                              type="text" 
                              required
                              value={newServName}
                              onChange={(e) => setNewServName(e.target.value)}
                              placeholder="e.g. Therapeutic Sports Massage"
                              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Price (₹)</label>
                              <input 
                                type="number" 
                                required
                                value={newServPrice}
                                onChange={(e) => setNewServPrice(e.target.value)}
                                placeholder="1200"
                                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Duration (Minutes)</label>
                              <input 
                                type="number" 
                                required
                                value={newServDuration}
                                onChange={(e) => setNewServDuration(e.target.value)}
                                placeholder="60"
                                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Image URL (Optional)</label>
                            <input 
                              type="url" 
                              value={newServImage}
                              onChange={(e) => setNewServImage(e.target.value)}
                              placeholder="https://images.unsplash.com/photo-..."
                              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                            <textarea 
                              value={newServDesc}
                              onChange={(e) => setNewServDesc(e.target.value)}
                              placeholder="Describe the treatment or class..."
                              rows={3}
                              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400 resize-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold py-3 rounded-xl text-xs hover:opacity-95 cursor-pointer"
                          >
                            Add Service
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
                  {orders.filter(o => o.customer.toLowerCase().includes(orderQuery.toLowerCase()) || o.tracking.toLowerCase().includes(orderQuery.toLowerCase())).length === 0 ? (
                    <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-950/20 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-900/60 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                        <LucideIcon name="ShoppingCart" className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 max-w-sm mx-auto">
                        <h4 className="text-sm font-bold text-white">No Orders Yet</h4>
                        <p className="text-xs text-zinc-500 leading-normal">
                          Orders will appear here once customers buy physical products from your online shop.
                        </p>
                      </div>
                    </div>
                  ) : (
                    orders
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
                      ))
                  )}
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
                    <p className="text-3xl font-black text-white font-display mt-1">
                      {reviews.length > 0 ? "4.8 / 5.0" : "0.0 / 5.0"}
                    </p>
                    <div className="flex gap-1.5 text-amber-400 mt-2">
                      <LucideIcon name="Star" className={`w-4 h-4 ${reviews.length > 0 ? "fill-current" : "text-zinc-800"}`} />
                      <LucideIcon name="Star" className={`w-4 h-4 ${reviews.length > 0 ? "fill-current" : "text-zinc-800"}`} />
                      <LucideIcon name="Star" className={`w-4 h-4 ${reviews.length > 0 ? "fill-current" : "text-zinc-800"}`} />
                      <LucideIcon name="Star" className={`w-4 h-4 ${reviews.length > 0 ? "fill-current" : "text-zinc-800"}`} />
                      <LucideIcon name="Star" className={`w-4 h-4 ${reviews.length > 0 ? "fill-current" : "text-zinc-800"}`} />
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
                      {reviews.length > 0 ? Math.floor((reviews.filter(r => r.reply).length / reviews.length) * 100) : 0}%
                    </p>
                    <p className="text-xs text-zinc-500 mt-2">Replying builds extreme customer retention</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-950/20 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-900/60 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                        <LucideIcon name="Star" className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 max-w-sm mx-auto">
                        <h4 className="text-sm font-bold text-white">No Reviews Yet</h4>
                        <p className="text-xs text-zinc-500 leading-normal">
                          Public reviews from verified customers will show up here.
                        </p>
                      </div>
                    </div>
                  ) : (
                    reviews.map((rev) => (
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
                    ))
                  )}
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
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Settled Earnings</span>
                      <h4 className="text-3xl font-black text-white font-display mt-1">₹{paymentsList
                        .filter((p: any) => p.status === "captured" || p.status === "completed" || p.status === "SUCCESS")
                        .reduce((sum: number, p: any) => sum + Number(p.amount), 0)}</h4>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Cleared and fully settled funds from direct customer checkouts.
                    </p>
                  </div>

                  {/* Pending cleared */}
                  <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex flex-col justify-between h-44">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-550 uppercase">Pending Verification</span>
                      <h4 className="text-3xl font-black text-zinc-300 font-display mt-1">₹{paymentsList
                        .filter((p: any) => p.status === "pending")
                        .reduce((sum: number, p: any) => sum + Number(p.amount), 0)}</h4>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Direct UPI bank transfers awaiting manual approval confirmation.
                    </p>
                  </div>

                  {/* Fees matrix */}
                  <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex flex-col justify-between h-44">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-550 uppercase">Direct UPI Commission</span>
                      <h4 className="text-3xl font-black text-cyan-400 font-display mt-1">0.0%</h4>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Direct peer-to-peer bank transfers have absolutely zero merchant gateway charges.
                    </p>
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

            {/* TAB: BILLING & SUBSCRIPTIONS */}
            {activeTab === "Billing" && (
              <motion.div
                key="billing-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8 text-left"
              >
                {/* 1. Subscription Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="billing-overview-cards">
                  {/* Current Plan Card */}
                  <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Current Subscription</span>
                      <h4 className="text-2xl font-black text-white font-display uppercase mt-1">
                        {subscription ? subscription.plan_name : "Starter (Trial)"}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        Status: <span className={`font-bold uppercase ${
                          subscription?.status === "active" ? "text-[#10B981]" :
                          subscription?.status === "trial" ? "text-amber-400" : "text-red-400"
                        }`}>{subscription?.status || "trial"}</span>
                      </p>
                    </div>
                    {subscription?.status === "trial" && (
                      <div className="space-y-1">
                        <p className="text-[11px] text-zinc-500 font-mono">Trial Days Remaining:</p>
                        <p className="text-xl font-bold text-amber-400 font-mono">{subscription?.trial_remaining ?? 30} Days</p>
                      </div>
                    )}
                    {subscription?.renewal_date && (
                      <div className="space-y-1">
                        <p className="text-[11px] text-zinc-500 font-mono">Renewal Date:</p>
                        <p className="text-xs font-semibold text-zinc-300 font-mono">
                          {new Date(subscription.renewal_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pricing summary */}
                  <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Billing Cycle Amount</span>
                      <h4 className="text-3xl font-black text-white font-mono mt-2">
                        ₹{subscription?.plan_id === "business" ? "999" : subscription?.plan_id === "pro" ? "499" : "0"}<span className="text-xs text-zinc-500 font-sans">/month</span>
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-500 leading-normal">
                      Taxes (18% GST) are auto-applied on premium invoice generations.
                    </p>
                  </div>

                  {/* Quick Action */}
                  <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Manage Billing</span>
                      <p className="text-xs text-zinc-400 mt-2">
                        Upgrade or cancel your active subscription plan. Cancellations take effect immediately.
                      </p>
                    </div>
                    {subscription?.status === "active" ? (
                      <button
                        onClick={async () => {
                          if (confirm("Are you sure you want to cancel your active premium subscription? Your website features will be downgraded.")) {
                            try {
                              const token = localStorage.getItem("sitemint_token");
                              const res = await fetch("/api/subscriptions/cancel", {
                                method: "POST",
                                headers: { "Authorization": `Bearer ${token}` }
                              });
                              const result = await res.json();
                              if (res.ok) {
                                alert("Subscription cancelled successfully.");
                                fetchSubscriptionData();
                              } else {
                                alert(result.message);
                              }
                            } catch (err: any) {
                              alert("Cancellation error: " + err.message);
                            }
                          }
                        }}
                        className="w-full bg-red-950/30 hover:bg-red-900/20 text-red-400 border border-red-900/30 font-bold py-2.5 rounded-xl text-xs transition-colors"
                      >
                        Cancel Subscription
                      </button>
                    ) : (
                      <div className="text-xs font-semibold text-zinc-500 italic py-2">
                        No active premium payment cycle.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Upgrade / Compare Tiers */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white font-display">Upgrade Plan</h3>
                    <p className="text-xs text-zinc-400">Scale your features. Pay securely with Razorpay checkout.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-pricing-grid">
                    {[
                      {
                        id: "starter",
                        name: "Starter",
                        price: "₹0",
                        trial: "30-Day Free Trial",
                        features: [
                          "1 Website",
                          "SiteMint Subdomain",
                          "Mobile Responsive Website",
                          "Basic Website Builder",
                          "Basic Booking System",
                          "SSL Certificate",
                          "SEO Ready",
                          "Basic Dashboard",
                          "Email Support"
                        ]
                      },
                      {
                        id: "pro",
                        name: "Pro",
                        price: "₹499/month",
                        badge: "MOST POPULAR",
                        features: [
                          "Everything in Starter plus",
                          "Custom Domain Support",
                          "Razorpay Payment Integration",
                          "Cloudinary Media Upload",
                          "Unlimited Products / Services",
                          "Customer Reviews",
                          "Appointment Booking",
                          "WhatsApp Notifications",
                          "Analytics Dashboard",
                          "Priority Support"
                        ]
                      },
                      {
                        id: "business",
                        name: "Business",
                        price: "₹999/month",
                        features: [
                          "Everything in Pro plus",
                          "Unlimited Staff",
                          "Multi Branch Support",
                          "Inventory Management",
                          "Customer Management",
                          "Role Based Staff Access",
                          "Advanced Analytics",
                          "API Access",
                          "Premium Support"
                        ]
                      }
                    ].map((plan) => {
                      const isActive = subscription?.plan_id === plan.id;
                      return (
                        <div
                          key={plan.id}
                          className={`p-6 rounded-2xl border flex flex-col justify-between text-left relative ${
                            plan.id === "pro"
                              ? "bg-zinc-950/60 border-[#10B981]/35 glow-mint shadow-2xl scale-[1.01]"
                              : "bg-zinc-950/20 border-zinc-900 hover:border-zinc-800"
                          }`}
                        >
                          {plan.badge && (
                            <span className="absolute top-4 right-4 text-[9px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]">
                              {plan.badge}
                            </span>
                          )}

                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider">{plan.name}</h4>
                              <p className="text-2xl font-black text-white font-mono mt-1">{plan.price}</p>
                              {plan.trial && <p className="text-[10px] text-[#10B981] font-bold font-mono mt-0.5">{plan.trial}</p>}
                            </div>

                            <ul className="space-y-2 text-[11px] text-zinc-400 border-t border-zinc-900 pt-4">
                              {plan.features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <LucideIcon name="Check" className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <button
                            disabled={isActive || plan.id === "starter"}
                            onClick={() => handleUpgradeSubscription(plan.id)}
                            className={`w-full mt-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                              isActive
                                ? "bg-zinc-900 text-zinc-550 border border-zinc-800 cursor-default"
                                : plan.id === "starter"
                                ? "bg-zinc-900 text-zinc-650 border border-zinc-850 cursor-default opacity-50"
                                : plan.id === "pro"
                                ? "bg-[#10B981] text-black hover:opacity-95"
                                : "bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-white"
                            }`}
                          >
                            {isActive ? "Active Plan" : plan.id === "starter" ? "Locked" : plan.id === "pro" ? "Upgrade to Pro" : "Get Business"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Trust Seals Section */}
                <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-900/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="flex items-center gap-2 justify-center text-xs text-zinc-350">
                    <LucideIcon name="ShieldCheck" className="w-4 h-4 text-emerald-400" />
                    <span>Razorpay Secure</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center text-xs text-zinc-350">
                    <LucideIcon name="CalendarCheck" className="w-4 h-4 text-emerald-400" />
                    <span>30-Day Free Trial</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center text-xs text-zinc-350">
                    <LucideIcon name="FileText" className="w-4 h-4 text-emerald-400" />
                    <span>GST Invoice Available</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center text-xs text-zinc-350">
                    <LucideIcon name="XCircle" className="w-4 h-4 text-emerald-400" />
                    <span>Cancel Anytime</span>
                  </div>
                </div>

                {/* 4. Payment History Ledger */}
                <div className="p-6 rounded-2xl bg-zinc-950/40 border border-zinc-900">
                  <h4 className="text-base font-bold text-white font-display mb-4">Subscription Billing Invoice Ledger</h4>

                  {subTransactions.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-2">No billing transactions recorded.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-900 text-zinc-500 font-mono uppercase text-[10px]">
                            <th className="pb-3 pr-2">Date</th>
                            <th className="pb-3 pr-2">Plan Details</th>
                            <th className="pb-3 pr-2">Amount Paid</th>
                            <th className="pb-3 pr-2">Payment status</th>
                            <th className="pb-3 pr-2">Payment ID</th>
                            <th className="pb-3 text-right">Invoice</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60 font-medium">
                          {subTransactions.map((tx) => {
                            const matchedPlan = tx.amount > 500 ? "Business" : "Pro";
                            return (
                              <tr key={tx.id} className="text-zinc-300">
                                <td className="py-3.5 pr-2 font-mono">{new Date(tx.created_at).toLocaleDateString()}</td>
                                <td className="py-3.5 pr-2 font-bold text-white">{matchedPlan} monthly subscription</td>
                                <td className="py-3.5 pr-2 font-mono">₹{tx.amount}</td>
                                <td className="py-3.5 pr-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                    tx.status === "success" ? "bg-emerald-500/10 text-[#10B981]" :
                                    tx.status === "pending" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                                  }`}>
                                    {tx.status}
                                  </span>
                                </td>
                                <td className="py-3.5 pr-2 font-mono text-[10px] text-zinc-550 select-all">{tx.payment_id || "N/A"}</td>
                                <td className="py-3.5 text-right">
                                  {tx.status === "success" ? (
                                    <button
                                      onClick={() => handleDownloadInvoice(tx, matchedPlan)}
                                      className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-bold transition-all text-[10px]"
                                    >
                                      Download Invoice
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-zinc-550 italic">Invoice unavailable</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
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

                      <div className="p-3 text-left space-y-2">
                        <div>
                          <p className="text-xs font-bold text-white truncate" title={item.name}>{item.name}</p>
                          <p className="text-[9px] font-mono text-zinc-500">Processed: {item.date}</p>
                        </div>
                        <div className="flex justify-between items-center pt-1.5 border-t border-zinc-900/60">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(item.url);
                              alert("Direct link copied!");
                            }}
                            className="text-[9px] font-mono text-cyan-400 hover:underline cursor-pointer"
                          >
                            Copy URL
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(item.id)}
                            className="text-[9px] font-mono text-red-400 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
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
                className="space-y-6 text-left pb-12"
              >
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* General settings */}
                  <div className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4">
                    <div className="border-b border-zinc-900 pb-3">
                      <h3 className="text-base font-bold text-white font-display">General Information</h3>
                      <p className="text-xs text-zinc-500">Configure your public business profile details.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Business Name</label>
                        <input 
                          type="text" 
                          required
                          value={settingsName}
                          onChange={(e) => setSettingsName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Business Category</label>
                        <select 
                          value={settingsCategory}
                          onChange={(e) => setSettingsCategory(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="gym">Gym / Fitness</option>
                          <option value="salon">Salon / Spa</option>
                          <option value="restaurant">Restaurant / Cafe</option>
                          <option value="clothing">Clothing / Retail</option>
                          <option value="dentist">Dentist / Medical</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Contact Phone</label>
                        <input 
                          type="text" 
                          value={settingsPhone}
                          onChange={(e) => setSettingsPhone(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Contact Email</label>
                        <input 
                          type="email" 
                          value={settingsEmail}
                          onChange={(e) => setSettingsEmail(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs" 
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Business Description</label>
                        <textarea 
                          value={settingsDescription}
                          onChange={(e) => setSettingsDescription(e.target.value)}
                          rows={3}
                          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs resize-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Business Address</label>
                        <input 
                          type="text" 
                          value={settingsAddress}
                          onChange={(e) => setSettingsAddress(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Google Maps Embed URL</label>
                        <input 
                          type="url" 
                          value={settingsMaps}
                          onChange={(e) => setSettingsMaps(e.target.value)}
                          placeholder="https://maps.google.com/..."
                          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-mono" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">UPI VPA Address (For Customer Payments)</label>
                        <input 
                          type="text" 
                          required
                          value={settingsUpi}
                          onChange={(e) => setSettingsUpi(e.target.value)}
                          placeholder="business@upi"
                          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-mono" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Brand & Assets settings */}
                  <div className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4">
                    <div className="border-b border-zinc-900 pb-3">
                      <h3 className="text-base font-bold text-white font-display">Branding & Identity</h3>
                      <p className="text-xs text-zinc-500">Customize logos, themes, and brand aesthetics.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Logo selection */}
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Brand Logo</span>
                        <div className="aspect-square bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                          {logoPreview ? (
                            <>
                              <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-4" />
                              <button 
                                type="button"
                                onClick={handleRemoveLogo}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-red-400 hover:text-red-300 transition-all"
                              >
                                Remove Logo
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={triggerLogoUpload}
                              className="text-xs text-zinc-500 hover:text-emerald-400 transition-all font-semibold flex flex-col items-center gap-1 font-sans cursor-pointer"
                            >
                              <LucideIcon name="Image" className="w-6 h-6 mb-1" />
                              {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                            </button>
                          )}
                          <input 
                            type="file" 
                            ref={logoInputRef} 
                            onChange={handleLogoChange} 
                            accept="image/*" 
                            className="hidden" 
                          />
                        </div>
                      </div>

                      {/* Cover image selection */}
                      <div className="space-y-2 md:col-span-2">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Cover Banner Image</span>
                        <div className="aspect-[3/1] bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                          {bannerPreview ? (
                            <>
                              <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={handleRemoveBanner}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-red-400 hover:text-red-300 transition-all"
                              >
                                Remove Cover
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={triggerBannerUpload}
                              className="text-xs text-zinc-500 hover:text-emerald-400 transition-all font-semibold flex flex-col items-center gap-1 font-sans cursor-pointer"
                            >
                              <LucideIcon name="Image" className="w-6 h-6 mb-1" />
                              {isUploadingBanner ? "Uploading..." : "Upload Cover Image"}
                            </button>
                          )}
                          <input 
                            type="file" 
                            ref={bannerInputRef} 
                            onChange={handleBannerChange} 
                            accept="image/*" 
                            className="hidden" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Primary Brand Color</label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={settingsPrimaryColor}
                            onChange={(e) => setSettingsPrimaryColor(e.target.value)}
                            className="w-8 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer" 
                          />
                          <input 
                            type="text" 
                            value={settingsPrimaryColor}
                            onChange={(e) => setSettingsPrimaryColor(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-2 text-[10px] font-mono text-center" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Secondary Base Color</label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={settingsSecondaryColor}
                            onChange={(e) => setSettingsSecondaryColor(e.target.value)}
                            className="w-8 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer" 
                          />
                          <input 
                            type="text" 
                            value={settingsSecondaryColor}
                            onChange={(e) => setSettingsSecondaryColor(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-2 text-[10px] font-mono text-center" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Typography Override</label>
                        <select 
                          value={settingsFontFamily}
                          onChange={(e) => setSettingsFontFamily(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="Inter">Inter (Sleek Clean)</option>
                          <option value="Space Grotesk">Space Grotesk (Tech/Modern)</option>
                          <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
                          <option value="Outfit">Outfit (Bold Geometric)</option>
                          <option value="Plus Jakarta Sans">Plus Jakarta Sans (SaaS Default)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Favicon Address (Optional)</label>
                        <input 
                          type="url" 
                          value={settingsFavicon}
                          onChange={(e) => setSettingsFavicon(e.target.value)}
                          placeholder="https://icon.png"
                          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social links & Hours */}
                  <div className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4">
                    <div className="border-b border-zinc-900 pb-3">
                      <h3 className="text-base font-bold text-white font-display">Socials & Working Schedules</h3>
                      <p className="text-xs text-zinc-500">Configure public links and working availability calendars.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Social handles */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-white uppercase tracking-wider block">Social Profiles</span>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex gap-2">
                            <span className="bg-zinc-950 border border-zinc-850 px-3 text-xs text-zinc-500 rounded-xl flex items-center justify-center w-24 font-semibold uppercase">Facebook</span>
                            <input 
                              type="text" 
                              value={socialFb}
                              onChange={(e) => setSocialFb(e.target.value)}
                              placeholder="https://facebook.com/..."
                              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs" 
                            />
                          </div>
                          <div className="flex gap-2">
                            <span className="bg-zinc-950 border border-zinc-850 px-3 text-xs text-zinc-500 rounded-xl flex items-center justify-center w-24 font-semibold uppercase">Instagram</span>
                            <input 
                              type="text" 
                              value={socialInsta}
                              onChange={(e) => setSocialInsta(e.target.value)}
                              placeholder="https://instagram.com/..."
                              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs" 
                            />
                          </div>
                          <div className="flex gap-2">
                            <span className="bg-zinc-950 border border-zinc-850 px-3 text-xs text-zinc-500 rounded-xl flex items-center justify-center w-24 font-semibold uppercase">Twitter</span>
                            <input 
                              type="text" 
                              value={socialTw}
                              onChange={(e) => setSocialTw(e.target.value)}
                              placeholder="https://twitter.com/..."
                              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs" 
                            />
                          </div>
                          <div className="flex gap-2">
                            <span className="bg-zinc-950 border border-zinc-850 px-3 text-xs text-zinc-500 rounded-xl flex items-center justify-center w-24 font-semibold uppercase">WhatsApp</span>
                            <input 
                              type="text" 
                              value={socialWa}
                              onChange={(e) => setSocialWa(e.target.value)}
                              placeholder="e.g. +919876543210"
                              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-mono" 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Working hours */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-white uppercase tracking-wider block">Availability Hours</span>
                        <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl space-y-3 text-xs">
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                            const dayHours = workingHoursObj[day] || { active: true, open: "09:00", close: "18:00" };
                            return (
                              <div key={day} className="flex items-center justify-between gap-2 border-b border-zinc-900/60 pb-2 last:border-0 last:pb-0">
                                <label className="flex items-center gap-2 font-medium text-zinc-300 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={dayHours.active !== false}
                                    onChange={(e) => {
                                      setWorkingHoursObj({
                                        ...workingHoursObj,
                                        [day]: { ...dayHours, active: e.target.checked }
                                      });
                                    }}
                                    className="accent-emerald-400 cursor-pointer"
                                  />
                                  {day}
                                </label>

                                {dayHours.active !== false ? (
                                  <div className="flex items-center gap-1 font-mono">
                                    <input 
                                      type="text" 
                                      value={dayHours.open || "09:00"}
                                      onChange={(e) => {
                                        setWorkingHoursObj({
                                          ...workingHoursObj,
                                          [day]: { ...dayHours, open: e.target.value }
                                        });
                                      }}
                                      className="w-12 bg-zinc-950 border border-zinc-850 text-white text-[10px] text-center rounded py-0.5"
                                    />
                                    <span className="text-zinc-600">-</span>
                                    <input 
                                      type="text" 
                                      value={dayHours.close || "18:00"}
                                      onChange={(e) => {
                                        setWorkingHoursObj({
                                          ...workingHoursObj,
                                          [day]: { ...dayHours, close: e.target.value }
                                        });
                                      }}
                                      className="w-12 bg-zinc-950 border border-zinc-850 text-white text-[10px] text-center rounded py-0.5"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-bold text-red-500/80 uppercase font-mono">Closed</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEO & Visibility details */}
                  <div className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4">
                    <div className="border-b border-zinc-900 pb-3">
                      <h3 className="text-base font-bold text-white font-display">SEO & Subdomain Settings</h3>
                      <p className="text-xs text-zinc-500">Configure edge indexing meta descriptions and domain routing maps.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Store Subdomain Slug Prefix</label>
                        <div className="flex gap-2 max-w-lg">
                          <input 
                            type="text" 
                            required
                            value={settingsSlug}
                            onChange={(e) => setSettingsSlug(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-mono" 
                          />
                          <span className="bg-zinc-950 border border-zinc-850 px-3 py-2 text-xs font-mono text-zinc-500 rounded-xl flex items-center">
                            .sitemint.app
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">SEO Search Title</label>
                          <input 
                            type="text" 
                            value={settingsSeoTitle}
                            onChange={(e) => setSettingsSeoTitle(e.target.value)}
                            placeholder="Vanguard Athletics | Elite Body Lab"
                            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">SEO Meta Description</label>
                          <input 
                            type="text" 
                            value={settingsSeoDesc}
                            onChange={(e) => setSettingsSeoDesc(e.target.value)}
                            placeholder="Book elite training sessions online at Vanguard..."
                            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs" 
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1 text-left">
                          <p className="text-xs font-bold text-white">Storefront Live Status</p>
                          <p className="text-[10px] text-zinc-500">Control if the storefront is publicly accessible or down for maintenance.</p>
                        </div>
                        <div className="flex gap-2">
                          {settingsIsPublished ? (
                            <button
                              type="button"
                              onClick={handleUnpublishWebsite}
                              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 cursor-pointer"
                            >
                              Take Site Offline
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handlePublishWebsite}
                              className="px-4 py-2 rounded-xl bg-emerald-500 text-black hover:opacity-95 text-xs font-bold cursor-pointer"
                            >
                              Deploy Storefront Live
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save changes sticky bar */}
                  <div className="p-4 bg-zinc-950/80 border border-zinc-900 backdrop-blur rounded-2xl flex items-center justify-between gap-4 sticky bottom-4 z-10 shadow-xl">
                    <p className="text-xs text-zinc-400 font-sans">Be sure to save your configurations before navigating away.</p>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold px-6 py-2.5 rounded-xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg"
                    >
                      Save Configuration Details
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            </AnimatePresence>
          )}
        </div>

      </main>
    </div>
  );
}
