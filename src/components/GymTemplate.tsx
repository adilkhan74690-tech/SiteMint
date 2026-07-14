import { useState, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import UpiPaymentModal from "./UpiPaymentModal";
import LucideIcon from "./LucideIcon";
import CustomerAuth from "./CustomerAuth";

interface GymTemplateProps {
  onBackToHub: () => void;
  // Allows optional linking with our interactive builder state
  initialBrandName?: string;
  initialThemeAccent?: string;
  isStandalone?: boolean;
}

// Initial Mock Datasets for Gym
const MEMBERSHIP_TIERS = [
  { id: "tier-1", name: "Standard Arena", price: 49, interval: "mo", features: ["24/7 Vault access", "Standard trainer-led bootcamp sessions", "Locker room & private shower keys", "1 free body audit session"] },
  { id: "tier-2", name: "Vanguard Access", price: 89, interval: "mo", features: ["Unlimited core bootcamps", "All premium strength labs", "2 private 1-on-1 coach slots/mo", "Smart locker plus custom meal guides", "Full digital biometric tracking"], popular: true },
  { id: "tier-3", name: "VIP Olympian", price: 149, interval: "mo", features: ["Unlimited standard & premium vaults", "Daily 1-on-1 private elite coaching", "Personal physical therapist link", "Custom macronutrient meal prep delivered", "SiteMint digital membership card"] },
];

const TRAINERS = [
  { id: "tr-1", name: "Coach Alexei Vance", role: "Master Strength & Biomechanics", bio: "Former national lifter with 12+ years optimizing muscle mechanics & kinetic chains.", image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=300&q=80", rating: 5, specialty: "Hypertrophy & Rehab" },
  { id: "tr-2", name: "Coach Sarah Jenkins", role: "Director of Conditioning & HIIT", bio: "Expert in high-intensity conditioning and progressive overload protocols.", image: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=300&q=80", rating: 5, specialty: "HIIT & Weight Loss" },
  { id: "tr-3", name: "Coach David Miller", role: "Athletic Performance Auditor", bio: "Optimizes athletic output and neuromuscular speed dynamics for elite competitors.", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80", rating: 5, specialty: "Power & Plyometrics" },
];

const GALLERY_PHOTOS = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=600&q=80",
];

export default function GymTemplate({ onBackToHub, initialBrandName = "Pulse Athletics", initialThemeAccent = "#00F5A0", isStandalone = false }: GymTemplateProps) {
  // Live dynamic theme values
  const [brandName, setBrandName] = useState(initialBrandName);
  const [accentColor, setAccentColor] = useState(initialThemeAccent);
  const [typography, setTypography] = useState("Space Grotesk");
  const [logoUrl, setLogoUrl] = useState<string>("");

  // Client Session Auth
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [authOpen, setAuthOpen] = useState(false);

  // Business DB Integration Settings
  const [businessId, setBusinessId] = useState(1);
  const [upiId, setUpiId] = useState("vanguard@upi");

  // Dynamic CMS fields
  const [trainers, setTrainers] = useState<any[]>(TRAINERS);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [currency, setCurrency] = useState("INR");

  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "INR": return "₹";
      default: return "₹";
    }
  };

  useEffect(() => {
    // Dynamic fetch matching template category code
    const queryParams = new URLSearchParams(window.location.search);
    const querySubdomain = queryParams.get("subdomain");
    const hostnameSubdomain = window.location.hostname.split(".")[0];

    const pathname = window.location.pathname;
    let pathSubdomain = "";
    if (pathname.startsWith("/site/")) {
      pathSubdomain = pathname.split("/")[2];
    } else {
      const cleanPath = pathname.replace(/^\/|\/$/g, "");
      const segments = cleanPath.split("/");
      const firstSegment = segments[0]?.toLowerCase();
      const systemRoutes = ["login", "register", "forgot-password", "reset-password", "onboarding", "dashboard", "super-admin", "api"];
      if (firstSegment && !systemRoutes.includes(firstSegment)) {
        pathSubdomain = segments[0];
      }
    }

    const subdomain = querySubdomain || pathSubdomain || (hostnameSubdomain !== "localhost" && hostnameSubdomain !== "www" && hostnameSubdomain !== "sitemint" ? hostnameSubdomain : null) || "vanguard-athletic-lab";

    fetch(`/api/businesses/settings?subdomain=${subdomain}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success" && res.data.business) {
          const biz = res.data.business;
          setBusinessId(biz.id);
          setBrandName(biz.name);
          setUpiId(biz.upi_id || "vanguard@upi");
          setLogoUrl(biz.logo_url || "");
          setCurrency(biz.currency || "INR");
          if (res.data.theme_settings) {
            setAccentColor(res.data.theme_settings.primary_color || initialThemeAccent);
            setTypography(res.data.theme_settings.font_family || "Space Grotesk");
          }
        }
      })
      .catch((err) => console.error("Error loading business configurations:", err));

    // Fetch Staff
    fetch(`/api/staff?subdomain=${subdomain}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success" && Array.isArray(res.data) && res.data.length > 0) {
          setTrainers(res.data);
        }
      })
      .catch((err) => console.error("Error loading staff:", err));

    // Fetch Services
    fetch(`/api/catalog/services?subdomain=${subdomain}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success" && Array.isArray(res.data) && res.data.length > 0) {
          setServicesList(res.data);
        }
      })
      .catch((err) => console.error("Error loading services:", err));
  }, []);

  // Customer credentials inputs
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");

  // UPI payment modal control
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  // Gym Booking Engine States
  const [selectedDate, setSelectedDate] = useState("2026-07-13");
  const [selectedTrainer, setSelectedTrainer] = useState(TRAINERS[0].name);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Contact Form
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);

  // Selected membership modal
  const [selectedTier, setSelectedTier] = useState<any>(null);

  const timeSlots = ["07:00 AM - Early Riser", "09:30 AM - Heavy Lift", "11:00 AM - Strength Lab", "02:00 PM - Cardio Blast", "04:30 PM - Power & Speed", "06:00 PM - Prime Time Conditioning"];

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert("Please select a session time slot.");
      return;
    }
    if (!custName || !custEmail || !custPhone) {
      alert("Please enter your name, email, and phone number first.");
      return;
    }

    setIsUpiModalOpen(true);
  };

  const handlePaymentSuccess = (bookingId: string | number) => {
    setBookingDetails({
      trainer: selectedTrainer,
      date: selectedDate,
      time: selectedSlot,
      id: bookingId,
    });
    setIsUpiModalOpen(false);
    setBookingConfirmed(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactName("");
      setContactEmail("");
      setContactMsg("");
    }, 4000);
  };

  return (
    <div 
      className="bg-[#09090B] text-white min-h-screen relative flex flex-col selection:bg-white selection:text-black"
      style={{ fontFamily: typography === "Space Grotesk" ? "'Space Grotesk', sans-serif" : "inherit" }}
      id="gym-template-root"
    >
      
      {/* ----------------- CONTROLLERS & DEMO FLIGHT TOOLBAR ----------------- */}
      {!isStandalone && (
        <div className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md" id="demo-toolbar">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackToHub}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
              id="btn-back-hub"
            >
              <LucideIcon name="ArrowLeft" className="w-3.5 h-3.5" />
              Back to SiteMint Hub
            </button>
            <span className="text-zinc-700">|</span>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Independent Live Template</span>
            </div>
          </div>

          {/* Dynamic color & naming sandbox widget built into the frame */}
          <div className="flex items-center gap-4 flex-wrap" id="sandbox-controls">
            {/* Custom Brand Naming input */}
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Brand:</span>
              <input 
                type="text" 
                value={brandName} 
                onChange={(e) => setBrandName(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none w-28 placeholder-zinc-600"
                placeholder="Brand Name"
                id="sandbox-brand-name-input"
              />
            </div>

            {/* Color Selector */}
            <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase px-1">Accent:</span>
              {["#00F5A0", "#EC4899", "#06B6D4", "#F59E0B"].map((col) => (
                <button
                  key={col}
                  onClick={() => setAccentColor(col)}
                  className={`w-4 h-4 rounded-full border transition-all ${accentColor === col ? "border-white scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: col }}
                  title={`Change theme to ${col}`}
                />
              ))}
              <input 
                type="color" 
                value={accentColor} 
                onChange={(e) => setAccentColor(e.target.value)} 
                className="w-4 h-4 bg-transparent border-0 cursor-pointer ml-1 p-0"
                title="Custom Picker"
              />
            </div>

            {/* Typography Selector */}
            <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-550 uppercase px-1">Font:</span>
              <select 
                value={typography} 
                onChange={(e) => setTypography(e.target.value)}
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value="Space Grotesk">Space Grotesk</option>
                <option value="Default">System Sans</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- LOCAL MOCK STOREFRONT NAVBAR ----------------- */}
      <nav className="bg-[#09090B]/90 backdrop-blur-md border-b border-zinc-900/60 sticky top-14 z-40 px-6 py-4 flex items-center justify-between" id="gym-nav">
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-7 h-7 rounded-lg object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-black text-sm" style={{ backgroundColor: accentColor }}>
              P
            </div>
          )}
          <span className="text-lg font-black tracking-tight text-white font-display">
            {brandName}
          </span>
        </div>

        {/* Nav Anchors */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400">
          <a href="#about" className="hover:text-white transition-colors">About Us</a>
          <a href="#memberships" className="hover:text-white transition-colors">Memberships</a>
          <a href="#trainers" className="hover:text-white transition-colors">Elite Trainers</a>
          <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
          <a href="#booking" className="hover:text-white transition-colors">Book Session</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>

        {/* Session Auth state */}
        <div className="flex items-center gap-3">
          {customerEmail ? (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-zinc-300 truncate max-w-28">{customerEmail}</span>
              <button 
                onClick={() => setCustomerEmail("")} 
                className="text-zinc-500 hover:text-red-400 font-mono text-[10px] pl-1.5 border-l border-zinc-850"
                title="Log Out"
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="px-4 py-1.5 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all"
              id="gym-btn-login"
            >
              Sign In
            </button>
          )}

          <a
            href="#booking"
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-black transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: accentColor }}
          >
            Join Now
          </a>
        </div>
      </nav>

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative min-h-[85vh] flex items-center justify-center text-center overflow-hidden py-16 px-4" id="gym-hero">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1600&q=80" 
            alt="Gym Hero Background" 
            className="w-full h-full object-cover scale-105 brightness-[0.2]"
            referrerPolicy="no-referrer"
          />
          {/* Neon radial glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-[#09090B]" />
          <div 
            className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full blur-[160px] pointer-events-none opacity-20"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-widest font-mono"
            style={{ color: accentColor, borderColor: `${accentColor}30`, backgroundColor: `${accentColor}08` }}
          >
            <LucideIcon name="ShieldAlert" className="w-3.5 h-3.5" />
            SiteMint Live Sandbox Instance
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-display uppercase leading-none">
            SMASH YOUR <span style={{ color: accentColor }}>LIMITS.</span>
            <br />
            RE-MINT YOUR BODY.
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Welcome to the future of high-performance physique training. Pulse Athletics couples biomechanical auditing with instant digital booking interfaces.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap pt-4">
            <a
              href="#booking"
              className="px-6 py-3 rounded-xl font-bold text-sm text-black hover:scale-105 transition-all shadow-lg"
              style={{ backgroundColor: accentColor, boxShadow: `0 8px 30px ${accentColor}15` }}
            >
              Book An Evaluation Slot
            </a>
            <a
              href="#memberships"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-all hover:bg-zinc-850"
            >
              Explore Memberships
            </a>
          </div>
        </div>
      </section>

      {/* ----------------- MEMBERSHIP SECTION ----------------- */}
      <section className="py-20 border-t border-zinc-900 bg-[#0c0c0e]" id="memberships">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: accentColor }}>
              Schedules & Vault Access
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1.5 font-display uppercase">
              RESERVE YOUR ARENA LOCK
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              Instant activation. Zero-hassle Stripe handshakes. No transaction fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch" id="membership-grid">
            {MEMBERSHIP_TIERS.map((tier) => (
              <div 
                key={tier.id}
                className={`p-6 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                  tier.popular 
                    ? "bg-[#111115] border-zinc-700/80 shadow-2xl" 
                    : "bg-zinc-950/40 border-zinc-900"
                }`}
              >
                {tier.popular && (
                  <span 
                    className="absolute -top-3.5 right-6 text-[10px] font-black uppercase font-mono px-3 py-1 rounded-full text-black shadow-md"
                    style={{ backgroundColor: accentColor }}
                  >
                    Recommended Pass
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-white font-display">{tier.name}</h4>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-3xl font-black text-white font-display">{getCurrencySymbol(currency)}{tier.price}</span>
                      <span className="text-xs text-zinc-500 font-mono">/{tier.interval}</span>
                    </div>
                  </div>

                  <hr className="border-zinc-900" />

                  <ul className="space-y-2.5">
                    {tier.features.map((feat, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-zinc-400">
                        <LucideIcon name="Check" className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentColor }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => setSelectedTier(tier)}
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-center border transition-all"
                    style={{ 
                      backgroundColor: tier.popular ? accentColor : "transparent",
                      color: tier.popular ? "black" : "white",
                      borderColor: tier.popular ? accentColor : "#27272a"
                    }}
                  >
                    Secure This Lock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- TRAINERS SECTION ----------------- */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950/20" id="trainers">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: accentColor }}>
              Pulsar Biomechanics Experts
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1.5 font-display uppercase">
              ELITE TRAINER CADRE
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              Our biomechanists have optimized hundreds of athletic pipelines globally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="trainers-grid">
            {TRAINERS.map((coach) => (
              <div 
                key={coach.id} 
                className="group rounded-2xl overflow-hidden border border-zinc-900 bg-[#0c0c0e]/80 text-left hover:border-zinc-800 transition-all flex flex-col justify-between"
              >
                <div className="aspect-square relative overflow-hidden bg-zinc-900">
                  <img 
                    src={coach.image} 
                    alt={coach.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/10 to-transparent opacity-60" />
                  
                  <span className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-zinc-300 font-mono border border-zinc-800">
                    {coach.specialty}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-bold text-white font-display">{coach.name}</h4>
                    <div className="flex gap-0.5 text-amber-400">
                      {[...Array(coach.rating)].map((_, i) => (
                        <span key={i}><LucideIcon name="Star" className="w-3 h-3 fill-current" /></span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs font-semibold" style={{ color: accentColor }}>{coach.role}</p>
                  <p className="text-xs text-zinc-400 leading-normal">{coach.bio}</p>
                </div>

                <div className="p-5 pt-0">
                  <button 
                    onClick={() => {
                      setSelectedTrainer(coach.name);
                      const bookingSection = document.getElementById("booking");
                      bookingSection?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white rounded-xl border border-zinc-800/80 text-[11px] font-bold tracking-tight transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LucideIcon name="Calendar" className="w-3.5 h-3.5" />
                    Reserve with {coach.name.split(" ")[1]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- GALLERY SECTION ----------------- */}
      <section className="py-20 border-t border-zinc-900 bg-[#0c0c0e]" id="gallery">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: accentColor }}>
              Aesthetic Space Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1.5 font-display uppercase">
              THE WORKOUT SANCTUARY
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              High-end hardware, Olympic-grade platforms, and professional kinetic capture sensors.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" id="gallery-grid">
            {GALLERY_PHOTOS.map((photo, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-zinc-900 relative group">
                <img 
                  src={photo} 
                  alt={`Sanctuary Grid ${idx}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <LucideIcon name="Maximize2" className="w-5 h-5 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- BOOKING UI SECTION ----------------- */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950/40 relative overflow-hidden" id="booking">
        <div className="absolute top-[20%] right-[-10%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ backgroundColor: accentColor }} />

        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: accentColor }}>
              Interactive Sandbox Scheduling
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1 font-display uppercase">
              APPOINTMENT DESK
            </h2>
            <p className="text-xs text-zinc-400 mt-1.5">
              Choose your personal biomechanics session. Updates instantly using client state.
            </p>
          </div>

          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-2xl overflow-hidden p-6 sm:p-8 shadow-xl" id="gym-booking-board">
            <AnimatePresence mode="wait">
              {bookingConfirmed && bookingDetails ? (
                <motion.div 
                  key="booking-success"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 space-y-5"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
                    <LucideIcon name="Check" className="w-6 h-6 stroke-[3]" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xl font-bold font-display text-white">RESERVATION APPROVED!</h4>
                    <p className="text-xs text-zinc-400">
                      Your diagnostic workout appointment is logged inside our Sandbox memory.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 text-left space-y-3 border border-zinc-900 max-w-md mx-auto">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Ticket Serial:</span>
                      <span className="font-mono font-bold text-white">{bookingDetails.id}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Assigned Coach:</span>
                      <span className="font-semibold text-white">{bookingDetails.trainer}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Schedule Date:</span>
                      <span className="font-mono text-white">{bookingDetails.date}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Time Interval:</span>
                      <span className="font-semibold text-white">{bookingDetails.time}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        setBookingConfirmed(false);
                        setBookingDetails(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold border border-zinc-800"
                    >
                      Book Another Session
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form 
                  key="booking-form"
                  onSubmit={handleBookSession} 
                  className="space-y-6 text-left"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Your Email</label>
                      <input 
                        type="email" 
                        required
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        placeholder="johndoe@gmail.com"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Your Phone</label>
                      <input 
                        type="text" 
                        required
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* Coach Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Assigned Coach</label>
                      <select 
                        value={selectedTrainer}
                        onChange={(e) => setSelectedTrainer(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700 transition-colors cursor-pointer"
                      >
                        {TRAINERS.map((tr) => (
                          <option key={tr.id} value={tr.name}>{tr.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Target Date</label>
                      <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700 transition-colors cursor-pointer"
                      />
                    </div>

                  </div>

                  {/* Slot selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Available Session Timeslots</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="timeslots-grid">
                      {timeSlots.map((slot) => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                              isSelected 
                                ? "bg-zinc-900 border-zinc-700 text-white" 
                                : "bg-zinc-950/60 border-zinc-900/60 text-zinc-400 hover:text-zinc-250 hover:bg-zinc-950"
                            }`}
                            id={`timeslot-${slot.split(" ")[0].replace(":", "")}`}
                          >
                            <span>{slot}</span>
                            <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-emerald-400" : "bg-zinc-800"}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-left">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Assessment Cost</span>
                      <p className="text-sm font-bold text-white">₹500.00 (Direct UPI)</p>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl font-black text-xs text-black transition-all hover:scale-105 active:scale-95"
                      style={{ backgroundColor: accentColor }}
                      id="gym-btn-submit-booking"
                    >
                      Verify Appointment Lock
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <UpiPaymentModal
              isOpen={isUpiModalOpen}
              onClose={() => setIsUpiModalOpen(false)}
              businessId={businessId}
              businessName={brandName}
              upiId={upiId}
              amount={500}
              customer={{
                email: custEmail,
                phone: custPhone,
                first_name: custName.split(" ")[0] || "",
                last_name: custName.split(" ").slice(1).join(" ") || ""
              }}
              bookingDetails={{
                service_id: 1, // Seeded Gym template ID
                staff_id: null,
                start_time: `${selectedDate}T${selectedSlot.split(" ")[0] === "07:00" ? "07:00:00" : selectedSlot.split(" ")[0] === "09:30" ? "09:30:00" : selectedSlot.split(" ")[0] === "11:00" ? "11:00:00" : selectedSlot.split(" ")[0] === "02:00" ? "14:00:00" : selectedSlot.split(" ")[0] === "04:30" ? "16:30:00" : "18:00:00"}`,
                notes: `Trainer: ${selectedTrainer}`
              }}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      </section>

      {/* ----------------- PRICING DETAIL LIST ----------------- */}
      <section className="py-20 border-t border-zinc-900 bg-[#0c0c0e]" id="pricing">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: accentColor }}>
              Transparent Pricing Matrix
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1.5 font-display uppercase">
              NO CONTRACTS. CHOOSE VALUE.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="pricing-matrix">
            {[
              { title: "Weekly Core Pass", price: "18", desc: "Single week access to standard gym layout, perfect for athletic travelers." },
              { title: "Monthly Prime", price: "49", desc: "Our standard full pass. 24/7 access to physical lockers, biometric scaling desks, and all free weight arrays." },
              { title: "12-Month Committed", price: "390", desc: "Unlock optimized long-term physical training. One-time annual fee. Includes 4 personal coaching audits." },
            ].map((pCard, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 text-left space-y-4 hover:border-zinc-800 transition-colors">
                <h4 className="text-base font-bold text-white font-display uppercase">{pCard.title}</h4>
                <p className="text-3xl font-black text-white font-mono">{getCurrencySymbol(currency)}{pCard.price}</p>
                <p className="text-xs text-zinc-400 leading-normal">{pCard.desc}</p>
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">✓ Instantly deployable on SiteMint store shelf</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- CONTACT & FEEDBACK FORM ----------------- */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950/20" id="contact">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* LEFT side: details and custom map block */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8 text-left" id="gym-contact-info">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: accentColor }}>
                  Touchpoints & HQ Location
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1 font-display uppercase">
                  GET IN TOUCH
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Connect with our front desk managers or directly request a coaching assessment. We operate around the clock to assist you.
              </p>
            </div>

            {/* Custom map block */}
            <div className="aspect-video w-full rounded-2xl bg-zinc-900/60 border border-zinc-850 p-4 relative overflow-hidden flex flex-col justify-between" id="mock-map">
              <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                  Global HQ Sandbox
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="relative z-10 text-left space-y-1 bg-zinc-950/80 backdrop-blur-md p-3 rounded-xl border border-zinc-800">
                <p className="text-xs font-bold text-white font-display">84 Mint Avenue, Suite 100</p>
                <p className="text-[10px] font-mono text-zinc-500">San Francisco, CA 94103</p>
              </div>
            </div>

            {/* Contacts details */}
            <div className="space-y-2 text-xs font-semibold text-zinc-400">
              <div className="flex items-center gap-2">
                <LucideIcon name="Phone" className="w-4 h-4 text-zinc-500" />
                <span>+1 (800) 555-MINT (Front Desk)</span>
              </div>
              <div className="flex items-center gap-2">
                <LucideIcon name="Mail" className="w-4 h-4 text-zinc-500" />
                <span>ironworks@sitemint-network.app</span>
              </div>
            </div>
          </div>

          {/* RIGHT side: touchpoint messaging form */}
          <div className="lg:col-span-7 bg-[#0c0c0e] border border-zinc-900 p-6 sm:p-8 rounded-2xl relative" id="gym-contact-form-block">
            <h3 className="text-base font-bold text-white font-display uppercase text-left mb-6">Dispatch Message Desk</h3>
            
            <AnimatePresence mode="wait">
              {contactSuccess ? (
                <motion.div 
                  key="contact-success-screen"
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#0c0c0e] z-10 flex flex-col items-center justify-center p-6 text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <LucideIcon name="Send" className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">MESSAGE FLIGHT VERIFIED</h4>
                    <p className="text-xs text-zinc-400 mt-1">We've stored your contact memo within Sandbox memory.</p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g., Marcus Vance"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="marcus@vanguard.co"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Message Memo</label>
                <textarea 
                  placeholder="How can we help optimize your kinetic strength training?"
                  rows={4}
                  required
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs text-black transition-all hover:brightness-110 active:scale-98"
                style={{ backgroundColor: accentColor }}
              >
                Dispatch Message Memo
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* ----------------- LOCAL MOCK STOREFRONT FOOTER ----------------- */}
      <footer className="bg-[#050507] border-t border-zinc-950 text-zinc-500 py-12 px-6 text-center text-xs space-y-4" id="gym-footer">
        <div className="flex justify-between items-center max-w-7xl mx-auto flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
            <span className="font-bold text-white font-display text-sm uppercase">{brandName}</span>
          </div>

          <p className="text-[11px] font-mono">
            © 2026 {brandName} Sandbox. Engineered on SiteMint SaaS framework.
          </p>
        </div>
      </footer>

      {/* ----------------- INTERACTIVE MEMBERSHIP DIALOG MODAL ----------------- */}
      <AnimatePresence>
        {selectedTier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" id="checkout-tier-overlay">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md bg-[#0c0c0e] border border-zinc-800 rounded-2xl overflow-hidden p-6 text-left relative"
            >
              <button 
                onClick={() => setSelectedTier(null)}
                className="absolute top-4 right-4 p-1 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <LucideIcon name="X" className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="text-center pb-2 border-b border-zinc-900">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Store Checkout Simulator</span>
                  <h4 className="text-lg font-bold text-white font-display uppercase tracking-tight mt-1">LOCK IN ACCESS PASS</h4>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-1">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">Selected Plan</p>
                  <p className="text-base font-bold text-white font-display">{selectedTier.name}</p>
                  <p className="text-lg font-black" style={{ color: accentColor }}>{getCurrencySymbol(currency)}{selectedTier.price} <span className="text-xs text-zinc-500 font-normal">/{selectedTier.interval}</span></p>
                </div>

                <div className="space-y-1 text-xs text-zinc-400 leading-normal">
                  <p className="font-bold text-zinc-200">Includes:</p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    {selectedTier.features.slice(0, 3).map((f: string, i: number) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                {customerEmail ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                    <LucideIcon name="CheckCircle" className="w-4 h-4 shrink-0" />
                    <span>Logged in as <strong className="font-mono">{customerEmail}</strong></span>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-500 italic">
                    Note: To complete a real booking or pass activation in the demo, we recommend signing in first.
                  </p>
                )}

                <button
                  onClick={() => {
                    alert(`Mock activation successful! Welcome to the premium ${selectedTier.name} cadre.`);
                    setSelectedTier(null);
                  }}
                  className="w-full py-3 rounded-xl font-bold text-xs text-black tracking-wide transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ backgroundColor: accentColor }}
                >
                  Confirm Subscription Refinement
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- AUTHENTICATION INTERACTIVE POPUP ----------------- */}
      <AnimatePresence>
        {authOpen && (
          <CustomerAuth
            sector="gym"
            brandName={brandName}
            accentColor={accentColor}
            onClose={() => setAuthOpen(false)}
            onAuthSuccess={(email) => setCustomerEmail(email)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
