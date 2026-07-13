import { useState, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import UpiPaymentModal from "./UpiPaymentModal";
import LucideIcon from "./LucideIcon";
import CustomerAuth from "./CustomerAuth";

interface SalonTemplateProps {
  onBackToHub: () => void;
  initialBrandName?: string;
  initialThemeAccent?: string;
}

// Initial Mock Datasets for Salon
const SALON_SERVICES = [
  { id: "sv-1", category: "Cut & Style", name: "Couture Haircut & Blowout", price: 95, duration: "60 mins", description: "Precision trim tailored to bone structure. Includes signature botanical rinse and bounce blowout." },
  { id: "sv-2", category: "Cut & Style", name: "Restructuring Keratin Trim", price: 145, duration: "90 mins", description: "Infused liquid keratin binding to heal split cuticles, followed by styled razor layering." },
  { id: "sv-3", category: "Color & Highlights", name: "Balayage Artisan Painting", price: 210, duration: "180 mins", description: "Individually hand-painted sun-kissed gradients using low-chemical botanical developer." },
  { id: "sv-4", category: "Color & Highlights", name: "Obsidian Gloss & Tone Treatment", price: 80, duration: "45 mins", description: "High-contrast shine glosser to rich-tone faded highlights. Excellent lock-in." },
  { id: "sv-5", category: "Nails Artistry", name: "Siberian Gel-Sculpt & Chrome", price: 110, duration: "75 mins", description: "Custom extension building with hand-painted futuristic chrome pigments and cuticle therapy." },
  { id: "sv-6", category: "Therapy", name: "Dead Sea Mud Scalp Rebirth", price: 75, duration: "40 mins", description: "Mineral-rich thermal mud pack massage to stimulate hair follicles & soothe dry scalps." },
];

const STYLISTS = [
  { id: "st-1", name: "Madeline Thorne", role: "Creative Director / Color Alchemist", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80", rating: 5, bio: "15+ years in high-fashion editorial hair design. Specialized in natural hand-painted balayage techniques." },
  { id: "st-2", name: "Julian Sterling", role: "Master Barber & Razor Sculptor", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80", rating: 5, bio: "Expert in avant-garde razor sculpting, sleek layers, and classic French bobs." },
  { id: "st-3", name: "Sofia Reyes", role: "Nails & Aesthetic Artistry Lead", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80", rating: 5, bio: "Celebrity nail technician specializing in structural gels, multi-layered chromes, and custom geometry." },
];

const LOOKBOOK_PHOTOS = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=500&q=80",
];

const REVIEWS = [
  { name: "Seraphina G.", date: "July 2026", rating: 5, comment: "Madeline is a true wizard with color. She took my faded brassy hair and painted the most exquisite, dimensional honey blonde. Worth every penny!" },
  { name: "Victoria K.", date: "June 2026", rating: 5, comment: "The booking calendar lets you bundle multiple treatments and selects the stylist in one slick workflow. My gel nails and blowout look flawless." },
];

export default function SalonTemplate({ onBackToHub, initialBrandName = "Luna Studio", initialThemeAccent = "#06B6D4" }: SalonTemplateProps) {
  // Live Customizer
  const [brandName, setBrandName] = useState(initialBrandName);
  const [accentColor, setAccentColor] = useState(initialThemeAccent);
  const [typography, setTypography] = useState("Default");

  // Client Session Auth
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [authOpen, setAuthOpen] = useState(false);

  // Business DB Integration Settings
  const [businessId, setBusinessId] = useState(1);
  const [upiId, setUpiId] = useState("sveltehair@upi");

  useEffect(() => {
    // Dynamic fetch matching template category code
    fetch("/api/businesses/settings?subdomain=svelte-hair-co")
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success" && res.data.business) {
          setBusinessId(res.data.business.id);
          setBrandName(res.data.business.name);
          setUpiId(res.data.business.upi_id || "sveltehair@upi");
        }
      })
      .catch((err) => console.error("Error loading business configurations:", err));
  }, []);

  // Customer credentials inputs
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");

  // UPI payment modal control
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  // Appointment Booking States
  const [selectedStylist, setSelectedStylist] = useState(STYLISTS[0].name);
  const [selectedDate, setSelectedDate] = useState("2026-07-13");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingTicket, setBookingTicket] = useState<any>(null);

  const timeslots = ["09:00 AM", "10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:00 PM", "05:30 PM", "07:00 PM"];

  // Toggle service checked
  const handleToggleService = (svcId: string) => {
    if (selectedServices.includes(svcId)) {
      setSelectedServices(selectedServices.filter((id) => id !== svcId));
    } else {
      setSelectedServices([...selectedServices, svcId]);
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      alert("Please check at least one salon treatment service.");
      return;
    }
    if (!custName || !custEmail || !custPhone) {
      alert("Please enter your name, email, and phone number first.");
      return;
    }

    setIsUpiModalOpen(true);
  };

  const handlePaymentSuccess = (bookingId: string | number) => {
    const compiledItems = SALON_SERVICES.filter((s) => selectedServices.includes(s.id));
    const totalPrice = compiledItems.reduce((acc, current) => acc + current.price, 0);

    setBookingTicket({
      id: bookingId,
      stylist: selectedStylist,
      date: selectedDate,
      time: selectedTime,
      services: compiledItems.map((s) => s.name),
      price: totalPrice,
    });
    setIsUpiModalOpen(false);
    setBookingConfirmed(true);
  };

  const totalCalculated = SALON_SERVICES
    .filter((s) => selectedServices.includes(s.id))
    .reduce((acc, current) => acc + current.price, 0);

  return (
    <div 
      className="bg-[#090B0F] text-zinc-100 min-h-screen relative flex flex-col selection:bg-cyan-900 selection:text-white"
      style={{ fontFamily: typography === "Playfair Display" ? "'Playfair Display', serif" : "inherit" }}
      id="salon-template-root"
    >
      
      {/* ----------------- CONTROLLERS & DEMO FLIGHT TOOLBAR ----------------- */}
      <div className="bg-[#0E1219] border-b border-zinc-900 sticky top-0 z-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md" id="salon-toolbar">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToHub}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
            id="btn-back-hub-salon"
          >
            <LucideIcon name="ArrowLeft" className="w-3.5 h-3.5" />
            Back to SiteMint Hub
          </button>
          <span className="text-zinc-800">|</span>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Independent Live Template</span>
          </div>
        </div>

        {/* Brand overrides sandbox */}
        <div className="flex items-center gap-4 flex-wrap" id="salon-sandbox">
          <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Brand:</span>
            <input 
              type="text" 
              value={brandName} 
              onChange={(e) => setBrandName(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none w-28 placeholder-zinc-700"
              placeholder="Salon Name"
              id="sandbox-brand-salon-input"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase px-1">Accent:</span>
            {["#06B6D4", "#EC4899", "#8B5CF6", "#10B981"].map((col) => (
              <button
                key={col}
                onClick={() => setAccentColor(col)}
                className={`w-4 h-4 rounded-full border transition-all ${accentColor === col ? "border-white scale-110" : "border-transparent"}`}
                style={{ backgroundColor: col }}
              />
            ))}
            <input 
              type="color" 
              value={accentColor} 
              onChange={(e) => setAccentColor(e.target.value)} 
              className="w-4 h-4 bg-transparent border-0 cursor-pointer ml-1 p-0"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase px-1">Font:</span>
            <select 
              value={typography} 
              onChange={(e) => setTypography(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="Default">System Sans</option>
              <option value="Playfair Display">Playfair Display</option>
            </select>
          </div>
        </div>
      </div>

      {/* ----------------- LOCAL MOCK STOREFRONT NAVBAR ----------------- */}
      <nav className="bg-[#090B0F]/90 backdrop-blur-md border-b border-zinc-900 sticky top-14 z-40 px-6 py-4 flex items-center justify-between" id="salon-nav">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-extrabold text-sm" style={{ backgroundColor: accentColor }}>
            S
          </div>
          <span className="text-lg font-black tracking-tight text-white font-serif italic">
            {brandName}
          </span>
        </div>

        {/* Nav Anchors */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400">
          <a href="#services" className="hover:text-white transition-colors">Services Desk</a>
          <a href="#stylists" className="hover:text-white transition-colors">Stylists Directory</a>
          <a href="#gallery" className="hover:text-white transition-colors">Lookbook</a>
          <a href="#reviews" className="hover:text-white transition-colors">Testimonials</a>
          <a href="#booking" className="hover:text-white transition-colors">Schedule Appt</a>
        </div>

        {/* Auth status & join */}
        <div className="flex items-center gap-4">
          {customerEmail ? (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-xs font-mono text-zinc-300 truncate max-w-24">{customerEmail}</span>
              <button 
                onClick={() => setCustomerEmail("")} 
                className="text-zinc-500 hover:text-red-400 font-mono text-[9px] pl-1.5 border-l border-zinc-800"
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-all hidden sm:block"
            >
              Sign In
            </button>
          )}

          <a
            href="#booking"
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-black transition-all hover:scale-105 active:scale-95 text-center"
            style={{ backgroundColor: accentColor }}
          >
            Book Appointment
          </a>
        </div>
      </nav>

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative min-h-[80vh] flex items-center justify-center text-center py-16 px-4" id="salon-hero">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80" 
            alt="Salon Background" 
            className="w-full h-full object-cover scale-105 brightness-[0.2]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090B0F] via-transparent to-[#090B0F]" />
          <div 
            className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[550px] h-[350px] rounded-full blur-[150px] pointer-events-none opacity-20"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <span className="text-[10px] font-mono uppercase tracking-widest bg-zinc-950/80 px-3 py-1 border border-zinc-850 rounded-full text-zinc-400">
            HIGH-FASHION AESTHETICS • SANDBOX INTERACTIVE MODEL
          </span>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-none">
            RE-INVENTING <span className="italic font-serif" style={{ color: accentColor }}>STYLE</span> WITH HIGH PRECISION
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto font-sans leading-relaxed">
            Welcome to Luna Studio. We unite elite color alchemists and hair sculptors with flawless Stripe-backed digital appointments scheduling.
          </p>

          <div className="flex justify-center gap-4 pt-2">
            <a
              href="#booking"
              className="px-6 py-3 rounded-xl font-bold text-sm text-black hover:scale-105 transition-all shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              Secure An Appointment Slot
            </a>
            <a
              href="#services"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-all hover:bg-zinc-850"
            >
              Browse Services Pricing
            </a>
          </div>
        </div>
      </section>

      {/* ----------------- SERVICES & PRICING DESK ----------------- */}
      <section className="py-20 border-t border-zinc-900 bg-[#0e1219]/60" id="services">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: accentColor }}>
              Artisanal Service Catalog
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">
              THE TREATMENT REGISTER
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              All services include luxury scalp therapies, botanical washes, and custom sensory consults.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="services-grid">
            {SALON_SERVICES.map((svc) => (
              <div 
                key={svc.id} 
                className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-900 hover:border-zinc-850 transition-colors flex flex-col justify-between text-left relative"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500">{svc.category}</span>
                    <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-850">{svc.duration}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-serif">{svc.name}</h4>
                    <p className="text-xs text-zinc-400 leading-normal mt-1">{svc.description}</p>
                  </div>
                </div>

                <div className="pt-5 border-t border-zinc-900/60 mt-4 flex items-center justify-between">
                  <span className="text-base font-mono font-black" style={{ color: accentColor }}>${svc.price}</span>
                  
                  <button
                    onClick={() => {
                      handleToggleService(svc.id);
                      const bookingSection = document.getElementById("booking");
                      bookingSection?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                      selectedServices.includes(svc.id)
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                    }`}
                  >
                    {selectedServices.includes(svc.id) ? "Selected in Scheduler" : "Select Treatment"}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ----------------- STYLISTS SECTION ----------------- */}
      <section className="py-20 border-t border-zinc-900 bg-[#090B0F]" id="stylists">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: accentColor }}>
              Aesthetic Consultants
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">
              THE ARTISTS RESIDENCY
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="stylists-grid">
            {STYLISTS.map((sty) => (
              <div 
                key={sty.id} 
                className="group rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/60 text-left hover:border-zinc-850 transition-all flex flex-col justify-between"
              >
                <div className="aspect-square relative overflow-hidden bg-zinc-900">
                  <img 
                    src={sty.image} 
                    alt={sty.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent" />
                  
                  <span 
                    className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wide font-mono px-2 py-0.5 rounded text-white border border-zinc-850/80"
                    style={{ backgroundColor: `${accentColor}25`, borderColor: accentColor }}
                  >
                    Residencies 
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-white font-serif">{sty.name}</h4>
                    <div className="flex gap-0.5 text-amber-400">
                      {[...Array(sty.rating)].map((_, i) => (
                        <span key={i}><LucideIcon name="Star" className="w-3 h-3 fill-current" /></span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-zinc-400">{sty.role}</p>
                  <p className="text-xs text-zinc-400 leading-normal">{sty.bio}</p>
                </div>

                <div className="p-5 pt-0">
                  <button 
                    onClick={() => {
                      setSelectedStylist(sty.name);
                      const bookingSection = document.getElementById("booking");
                      bookingSection?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white rounded-xl border border-zinc-800 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <LucideIcon name="CalendarDays" className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    Schedule with {sty.name.split(" ")[0]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- LOOKBOOK GALLERY SECTION ----------------- */}
      <section className="py-20 border-t border-zinc-900 bg-[#0e1219]/60" id="gallery">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: accentColor }}>
              The Lookbook Portfolio
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">
              THE DESIGN REGISTRY
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="lookbook-grid">
            {LOOKBOOK_PHOTOS.map((url, idx) => (
              <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-zinc-900 relative group">
                <img 
                  src={url} 
                  alt={`Lookbook model ${idx}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <LucideIcon name="Maximize" className="w-5 h-5 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- REVIEWS SECTION ----------------- */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950/20" id="reviews">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: accentColor }}>
              Customer Critiques
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">
              LUNA LOYALISTS WRITES
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="reviews-grid">
            {REVIEWS.map((rev, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#090B0F] border border-zinc-900 space-y-4 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white font-serif">{rev.name}</span>
                  <div className="flex gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <span key={i}><LucideIcon name="Star" className="w-3 h-3 fill-current" /></span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-normal italic">"{rev.comment}"</p>
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-600">
                  <span>Verified Aesthetic Guest</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- APPOINTMENT BOOKING SECTION ----------------- */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950/40 relative overflow-hidden" id="booking">
        <div className="absolute top-[20%] right-[-10%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ backgroundColor: accentColor }} />

        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: accentColor }}>
              Integrated Calendar Handshake
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">
              TREATMENT SCHEDULER DESK
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Select stylist, bundle treatments, and preview the live price updates instantly.
            </p>
          </div>

          <div className="bg-[#0e1219] border border-zinc-850 rounded-2xl p-6 sm:p-8" id="salon-booking-board">
            <AnimatePresence mode="wait">
              {bookingConfirmed && bookingTicket ? (
                <motion.div 
                  key="booking-success"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-6 space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
                    <LucideIcon name="Check" className="w-6 h-6 stroke-[3]" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-lg font-bold font-serif text-white">APPOINTMENT SECURED</h4>
                    <p className="text-xs text-zinc-400">
                      Your luxurious therapy is successfully booked inside Sandbox memory state.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 text-left space-y-2.5 max-w-md mx-auto">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Ticket ID:</span>
                      <span className="font-mono text-white font-bold">{bookingTicket.id}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Assigned Stylist:</span>
                      <span className="font-semibold text-white">{bookingTicket.stylist}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Target Date:</span>
                      <span className="font-mono text-white">{bookingTicket.date} @ {bookingTicket.time}</span>
                    </div>
                    <div className="flex justify-between items-start text-xs">
                      <span className="text-zinc-500">Treatments:</span>
                      <span className="font-semibold text-white text-right max-w-[220px] truncate">{bookingTicket.services.join(", ")}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-zinc-900/60">
                      <span className="text-zinc-500">Total Price:</span>
                      <span className="font-bold text-emerald-400">${bookingTicket.price}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        setBookingConfirmed(false);
                        setBookingTicket(null);
                        setSelectedServices([]);
                      }}
                      className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold"
                    >
                      Book Another Treatment
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="booking-form" onSubmit={handleBookAppointment} className="space-y-6 text-left">
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
                    
                    {/* Stylist */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Assigned Stylist</label>
                      <select 
                        value={selectedStylist}
                        onChange={(e) => setSelectedStylist(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700 cursor-pointer"
                      >
                        {STYLISTS.map((sty) => (
                          <option key={sty.id} value={sty.name}>{sty.name} ({sty.role.split(" ")[0]})</option>
                        ))}
                      </select>
                    </div>

                    {/* Date */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Appointment Date</label>
                      <input 
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700 cursor-pointer"
                      />
                    </div>

                  </div>

                  {/* Treatments checkboxes */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Luna Treatment Services</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SALON_SERVICES.map((s) => {
                        const checked = selectedServices.includes(s.id);
                        return (
                          <div
                            key={s.id}
                            onClick={() => handleToggleService(s.id)}
                            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                              checked
                                ? "bg-zinc-900 border-zinc-700 text-white"
                                : "bg-zinc-950/60 border-zinc-900/60 text-zinc-400 hover:text-zinc-350 hover:bg-zinc-950"
                            }`}
                          >
                            <div className="space-y-0.5 max-w-[80%]">
                              <p className="font-bold text-xs text-white truncate">{s.name}</p>
                              <p className="text-[10px] text-zinc-500 font-mono">{s.duration} • {s.category}</p>
                            </div>
                            <span className="text-sm font-black text-mint font-mono">₹{s.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Timeslots */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Luna Available Slots</label>
                    <div className="flex flex-wrap gap-2">
                      {timeslots.map((t) => {
                        const isSel = selectedTime === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTime(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              isSel
                                ? "bg-white text-black border-white"
                                : "bg-zinc-950/60 border-zinc-900 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-left">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Estimated Total Cost</span>
                      <p className="text-base font-black text-white" style={{ color: accentColor }}>
                        ₹{totalCalculated} <span className="text-xs text-zinc-500 font-normal">Direct UPI Payment</span>
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-black transition-all hover:scale-105 active:scale-95 shrink-0"
                      style={{ backgroundColor: accentColor }}
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
              amount={totalCalculated}
              customer={{
                email: custEmail,
                phone: custPhone,
                first_name: custName.split(" ")[0] || "",
                last_name: custName.split(" ").slice(1).join(" ") || ""
              }}
              bookingDetails={{
                service_id: 2, // Seeded Salon service template ID
                staff_id: null,
                start_time: `${selectedDate}T${selectedTime.split(" ")[0] === "09:00" ? "09:00:00" : selectedTime.split(" ")[0] === "10:00" ? "10:00:00" : selectedTime.split(" ")[0] === "11:30" ? "11:30:00" : selectedTime.split(" ")[0] === "01:00" ? "13:00:00" : selectedTime.split(" ")[0] === "02:30" ? "14:30:00" : selectedTime.split(" ")[0] === "04:00" ? "16:00:00" : selectedTime.split(" ")[0] === "05:30" ? "17:30:00" : "19:00:00"}`,
                notes: `Treatments: ${SALON_SERVICES.filter((s) => selectedServices.includes(s.id)).map(s => s.name).join(", ")} | Stylist: ${selectedStylist}`
              }}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      </section>

      {/* ----------------- LOCAL MOCK STOREFRONT FOOTER ----------------- */}
      <footer className="bg-[#05060A] border-t border-zinc-950 text-zinc-500 py-12 px-6 text-center text-xs space-y-4" id="salon-footer">
        <div className="flex justify-between items-center max-w-7xl mx-auto flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
            <span className="font-bold text-white font-serif text-sm uppercase">{brandName}</span>
          </div>

          <p className="text-[11px] font-mono">
            © 2026 {brandName} Sandbox. Engineered on SiteMint SaaS framework.
          </p>
        </div>
      </footer>

      {/* ----------------- AUTHENTICATION INTERACTIVE POPUP ----------------- */}
      <AnimatePresence>
        {authOpen && (
          <CustomerAuth
            sector="salon"
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
