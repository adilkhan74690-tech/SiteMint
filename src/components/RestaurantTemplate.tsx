import { useState, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import UpiPaymentModal from "./UpiPaymentModal";
import LucideIcon from "./LucideIcon";
import CustomerAuth from "./CustomerAuth";

interface RestaurantTemplateProps {
  onBackToHub: () => void;
  initialBrandName?: string;
  initialThemeAccent?: string;
  isStandalone?: boolean;
}

// Initial Mock Datasets for Restaurant
const MENU_ITEMS = [
  { id: "fd-1", category: "Starters", name: "Seared Foie Gras de Canard", price: 29, description: "With caramelized honey-crisp apples, elderberry glaze, toasted buttery brioche.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80", tags: ["Premium"] },
  { id: "fd-2", category: "Starters", name: "Artisanal Beetroot Tartare", price: 18, description: "Whipped goat cheese emulsion, candied walnuts, micro-shaved black truffles.", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80", tags: ["Vegan", "Gluten-Free"] },
  { id: "fd-3", category: "Mains", name: "Wagyu Ribeye Fillet A5", price: 125, description: "Dry-aged 45 days. Served over butter-poached chanterelles and gold leaf jus.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=450&q=80", tags: ["Award-Winning"] },
  { id: "fd-4", category: "Mains", name: "Truffle Butter King Scallops", price: 54, description: "Pan-roasted diver scallops, saffron pea puree, shaved summer truffle shavings.", image: "https://images.unsplash.com/photo-1532636875304-0c8fe119ff91?auto=format&fit=crop&w=400&q=80", tags: ["Gluten-Free"] },
  { id: "fd-5", category: "Desserts", name: "Deconstructed Matcha Soufflé", price: 16, description: "White chocolate liquid lava heart, Madagascar vanilla-bean gelato swirl.", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80", tags: ["Sweet"] },
  { id: "fd-6", category: "Desserts", name: "Gilded Obsidian Lava Sphere", price: 22, description: "Hot dark chocolate ganache shell dissolved by salted single-malt Scotch sauce.", image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80", tags: ["Chef Special"] },
  { id: "fd-7", category: "Elixirs", name: "Obsidian Smoke Sour", price: 19, description: "Smoked Mezcal, activated charcoal, fresh lime extraction, organic agave.", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80", tags: ["Smoked", "Alcohol"] },
  { id: "fd-8", category: "Elixirs", name: "The Emerald Spritz", price: 15, description: "Sparkling Prosecco, cold-pressed mint-cucumber essence, floral tonic spray.", image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80", tags: ["Refreshed", "Mocktail"] },
];

const REVIEWS = [
  { name: "Julian C.", date: "July 2026", rating: 5, comment: "Undeniably the finest Wagyu I have had in years. The table service is meticulous, and checking out or ordering in advance is unbelievably streamlined. A masterpiece." },
  { name: "Helena S.", date: "June 2026", rating: 5, comment: "I booked our anniversary reservation using their interactive floor selector. It was confirmed instantly. True high-gastronomy hospitality." },
];

const FOOD_GALLERY = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80",
];

export default function RestaurantTemplate({ onBackToHub, initialBrandName = "L'Aura Bistro", initialThemeAccent = "#EC4899", isStandalone = false }: RestaurantTemplateProps) {
  // Live Customizer
  const [brandName, setBrandName] = useState(initialBrandName);
  const [accentColor, setAccentColor] = useState(initialThemeAccent);
  const [typography, setTypography] = useState("Playfair Display");
  const [logoUrl, setLogoUrl] = useState<string>("");

  // Client Session Auth
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [authOpen, setAuthOpen] = useState(false);

  // Categories Filter state
  const [activeCategory, setActiveCategory] = useState("Mains");

  // Business DB Integration Settings
  const [businessId, setBusinessId] = useState(1);
  const [upiId, setUpiId] = useState("bistrodeluxe@upi");

  // Dynamic CMS fields
  const [trainers, setTrainers] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [currency, setCurrency] = useState("INR");
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>(FOOD_GALLERY);
  const [faqsList, setFaqsList] = useState<any[]>([]);
  const [slogan, setSlogan] = useState("HIGH-GASTRONOMY CUISINE & COCKTAILS");
  const [contactPhone, setContactPhone] = useState("+91 98765 43210");
  const [contactEmail, setContactEmail] = useState("bistro@sitemint-network.app");
  const [address, setAddress] = useState("45 Gourmet Blvd, Culinary Suite 9");
  const [googleMaps, setGoogleMaps] = useState("");

  const getCurrencySymbol = (code: string) => {
    return "₹";
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

    const subdomain = querySubdomain || pathSubdomain || (hostnameSubdomain !== "localhost" && hostnameSubdomain !== "www" && hostnameSubdomain !== "sitemint" ? hostnameSubdomain : null) || "bistro-deluxe";

    fetch(`/api/businesses/settings?subdomain=${subdomain}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success" && res.data.business) {
          const biz = res.data.business;
          setBusinessId(biz.id);
          setBrandName(biz.name);
          setUpiId(biz.upi_id || "bistrodeluxe@upi");
          setLogoUrl(biz.logo_url || "");
          setCurrency("INR");
          if (biz.description) setSlogan(biz.description);
          if (biz.contact_phone) setContactPhone(biz.contact_phone);
          if (biz.contact_email) setContactEmail(biz.contact_email);
          if (biz.address) setAddress(biz.address);
          if (biz.google_maps_location) setGoogleMaps(biz.google_maps_location);

          if (res.data.theme_settings) {
            setAccentColor(res.data.theme_settings.primary_color || initialThemeAccent);
            setTypography(res.data.theme_settings.font_family || "Playfair Display");
            
            let customJson: any = {};
            try {
              const rawJson = res.data.theme_settings.custom_settings_json;
              customJson = typeof rawJson === "string" ? JSON.parse(rawJson) : (rawJson || {});
            } catch (e) {
              customJson = {};
            }
            if (customJson.faqs && customJson.faqs.length > 0) setFaqsList(customJson.faqs);
            if (customJson.gallery && customJson.gallery.length > 0) setGalleryPhotos(customJson.gallery);
          }

          // Fetch reviews
          fetch(`/api/feedback/reviews?business_id=${biz.id}&approved_only=true`)
            .then(r => r.json())
            .then(revRes => {
              if (revRes.status === "success" && Array.isArray(revRes.data) && revRes.data.length > 0) {
                setReviewsList(revRes.data);
              }
            });
        }
      })
      .catch((err) => console.error("Error loading business configurations:", err));

    // Fetch Staff
    fetch(`/api/staff?subdomain=${subdomain}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success" && Array.isArray(res.data)) {
          setTrainers(res.data);
        }
      })
      .catch((err) => console.error("Error loading staff:", err));

    // Fetch Services
    fetch(`/api/catalog/services?subdomain=${subdomain}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success" && Array.isArray(res.data)) {
          setServicesList(res.data);
        }
      })
      .catch((err) => console.error("Error loading services:", err));

    // Fetch Products (Menu items)
    fetch(`/api/catalog/products?subdomain=${subdomain}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success" && Array.isArray(res.data)) {
          setProductsList(res.data);
        }
      })
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  // Customer credentials inputs
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");

  // UPI payment modal control
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  const displayMenu = productsList.map(p => ({
    id: String(p.id),
    name: p.name,
    price: Number(p.price),
    category: p.category || "Mains",
    description: p.description || "Freshly curated bistro specialty.",
    image: p.image_url || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80",
    tags: p.compare_at_price ? ["Promo"] : []
  }));

  const displayGallery = galleryPhotos;

  const displayReviews = reviewsList.map(r => ({
    name: `${r.first_name} ${r.last_name || ""}`.trim(),
    rating: r.rating,
    comment: r.comment,
    date: new Date(r.created_at).toLocaleDateString()
  }));

  // Table reservation state
  const [guests, setGuests] = useState("4 Guests");
  const [reservationDate, setReservationDate] = useState("2026-07-13");
  const [reservationTime, setReservationTime] = useState("08:00 PM - Prime Dining");
  const [seatingPreference, setSeatingPreference] = useState("Indoor Velvet Booth");
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [reserveTicket, setReserveTicket] = useState<any>(null);

  // Cart/Checkout state
  const [cart, setCart] = useState<{ item: any; qty: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "billing" | "success">("cart");
  const [billingName, setBillingName] = useState("");
  const [billingPhone, setBillingPhone] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");

  const guestOptions = ["1 Guest - Solo Critic", "2 Guests - Intimate Bistro", "4 Guests - Family Banq", "6 Guests - Executive Table", "8+ Guests - Gala Dining"];
  const reservationTimes = ["05:30 PM - Sunset Seat", "07:00 PM - Candlelight Prime", "08:00 PM - Prime Dining", "09:30 PM - Late Jazz Hour", "10:30 PM - Chef Nightcap"];
  const seatOptions = ["Indoor Velvet Booth", "Outdoor Heated Terrace", "Chef Counter Stool", "Private Fireplace Alcove"];

  const filteredItems = displayMenu.filter((item) => item.category === activeCategory);

  // Add Item to Cart
  const handleAddToCart = (item: any) => {
    const existing = cart.find((i) => i.item.id === item.id);
    if (existing) {
      setCart(cart.map((i) => i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { item, qty: 1 }]);
    }
    // Show quick feedback
    setCartOpen(true);
  };

  const handleUpdateQty = (itemId: string, diff: number) => {
    const matched = cart.find((i) => i.item.id === itemId);
    if (!matched) return;
    const nextQty = matched.qty + diff;
    if (nextQty <= 0) {
      setCart(cart.filter((i) => i.item.id !== itemId));
    } else {
      setCart(cart.map((i) => i.item.id === itemId ? { ...i, qty: nextQty } : i));
    }
  };

  const handleBookTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custEmail || !custPhone) {
      alert("Please enter your name, email, and phone number first.");
      return;
    }

    setIsUpiModalOpen(true);
  };

  const handlePaymentSuccess = (bookingId: string | number) => {
    setReserveTicket({
      id: bookingId,
      guests,
      date: reservationDate,
      time: reservationTime,
      seating: seatingPreference,
    });
    setIsUpiModalOpen(false);
    setReserveSuccess(true);
  };

  const cartTotal = cart.reduce((acc, current) => acc + (current.item.price * current.qty), 0);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingName || !billingPhone) {
      alert("Please provide name and phone to finalize ordering.");
      return;
    }
    setCheckoutStep("success");
    // Clear cart in a few seconds after success view
    setTimeout(() => {
      setCart([]);
      setCheckoutStep("cart");
      setCartOpen(false);
      setBillingName("");
      setBillingPhone("");
      setDeliveryNote("");
    }, 4500);
  };

  return (
    <div 
      className="bg-[#0A050D] text-zinc-100 min-h-screen relative flex flex-col selection:bg-rose-900 selection:text-white"
      style={{ fontFamily: typography === "Playfair Display" ? "'Playfair Display', serif" : "inherit" }}
      id="restaurant-template-root"
    >
      
      {/* ----------------- CONTROLLERS & DEMO FLIGHT TOOLBAR ----------------- */}
      {!isStandalone && (
        <div className="bg-[#120B19] border-b border-zinc-900/60 sticky top-0 z-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md" id="restaurant-toolbar">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBackToHub}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-850 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
              id="btn-back-hub-rest"
            >
              <LucideIcon name="ArrowLeft" className="w-3.5 h-3.5" />
              Back to SiteMint Hub
            </button>
            <span className="text-zinc-800">|</span>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>Independent Live Template</span>
            </div>
          </div>

          {/* Brand overrides sandbox */}
          <div className="flex items-center gap-4 flex-wrap" id="rest-sandbox">
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-850">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Brand:</span>
              <input 
                type="text" 
                value={brandName} 
                onChange={(e) => setBrandName(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none w-28 placeholder-zinc-700"
                placeholder="Restaurant Name"
                id="sandbox-brand-rest-input"
              />
            </div>

            <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-850">
              <span className="text-[10px] font-mono text-zinc-500 uppercase px-1">Accent:</span>
              {["#EC4899", "#F43F5E", "#F59E0B", "#10B981"].map((col) => (
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

            <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-850">
              <span className="text-[10px] font-mono text-zinc-500 uppercase px-1">Font:</span>
              <select 
                value={typography} 
                onChange={(e) => setTypography(e.target.value)}
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value="Playfair Display">Playfair Display</option>
                <option value="Default">System Sans</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- LOCAL MOCK STOREFRONT NAVBAR ----------------- */}
      <nav className="bg-[#0A050D]/90 backdrop-blur-md border-b border-zinc-900/40 sticky top-14 z-40 px-6 py-4 flex items-center justify-between" id="rest-nav">
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-7 h-7 rounded-lg object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-serif font-bold text-sm" style={{ backgroundColor: accentColor }}>
              L
            </div>
          )}
          <span className="text-lg font-black tracking-tight text-white font-serif italic">
            {brandName}
          </span>
        </div>

        {/* Nav Anchors */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400">
          <a href="#menu" className="hover:text-white transition-colors">Digital Menu</a>
          <a href="#reserve" className="hover:text-white transition-colors">Reservations</a>
          <a href="#gallery" className="hover:text-white transition-colors">Culinary Gallery</a>
          <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
        </div>

        {/* Basket & Session controls */}
        <div className="flex items-center gap-4">
          
          {/* Customer Auth */}
          {customerEmail ? (
            <div className="hidden sm:flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 px-3 py-1 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span className="text-[10px] font-mono text-zinc-300 truncate max-w-28">{customerEmail}</span>
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

          {/* Cart Icon button with item count badge */}
          <button 
            onClick={() => setCartOpen(true)}
            className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-white relative hover:bg-zinc-850"
            id="btn-cart-toggle"
          >
            <LucideIcon name="ShoppingBag" className="w-4 h-4" />
            {cart.length > 0 && (
              <span 
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white font-mono"
                style={{ backgroundColor: accentColor }}
              >
                {cart.reduce((s, c) => s + c.qty, 0)}
              </span>
            )}
          </button>

          <a
            href="#reserve"
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 text-center"
            style={{ backgroundColor: accentColor }}
          >
            Book A Table
          </a>
        </div>
      </nav>

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative min-h-[80vh] flex items-center justify-center text-center py-16 px-4" id="rest-hero">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80" 
            alt="Restaurant Background" 
            className="w-full h-full object-cover scale-105 brightness-[0.2]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A050D] via-transparent to-[#0A050D]" />
          <div 
            className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[550px] h-[350px] rounded-full blur-[150px] pointer-events-none opacity-15"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <span className="text-[10px] font-mono tracking-widest uppercase py-1 px-3 border border-zinc-800 rounded-full bg-zinc-950/60 text-zinc-400">
            EXPERIENCE MICHELIN EXCELLENCE IN THE SANDBOX
          </span>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-none">
            SAVOUR THE <span className="italic" style={{ color: accentColor }}>ELITE</span> ART OF PLATING
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto font-sans leading-relaxed">
            Welcome to L'Aura Bistro, where ancient Parisian culinary handshakes meet modern digital ordering & reservation interfaces.
          </p>

          <div className="flex justify-center gap-4 pt-2">
            <a
              href="#menu"
              className="px-6 py-3 rounded-xl font-bold text-sm text-white hover:scale-105 transition-all shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              Explore Digital Menu
            </a>
            <a
              href="#reserve"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-all hover:bg-zinc-850"
            >
              Reserve A Lounge Table
            </a>
          </div>
        </div>
      </section>

      {/* ----------------- DIGITAL MENU SECTION & CATEGORIES ----------------- */}
      <section className="py-20 border-t border-zinc-900 bg-[#0c0611]/80" id="menu">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: accentColor }}>
              Savour and Reserve
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">
              OUR MICHELIN COMPOSITIONS
            </h2>
            <p className="text-xs text-zinc-500 mt-1.5">
              Select category and add items to your interactive checkout card drawer.
            </p>
          </div>

          {/* Interactive Category Filter tabs */}
          <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2" id="rest-menu-tabs">
            {["Starters", "Mains", "Desserts", "Elixirs"].map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold tracking-tight transition-all shrink-0 ${
                    isActive 
                      ? "bg-white text-black" 
                      : "bg-zinc-900/60 text-zinc-400 border border-zinc-850/80 hover:text-white"
                  }`}
                  id={`tab-menu-${cat.toLowerCase()}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Active Category grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="menu-items-grid">
            {filteredItems.map((dish) => (
              <div 
                key={dish.id} 
                className="rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/60 p-4 hover:border-zinc-850 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3 text-left">
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-900 relative">
                    <img 
                      src={dish.image} 
                      alt={dish.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 right-2.5 flex flex-wrap gap-1">
                      {dish.tags.map((tg, idx) => (
                        <span 
                          key={idx}
                          className="bg-zinc-950/80 text-[9px] px-2 py-0.5 rounded font-bold border border-zinc-800 text-zinc-300"
                        >
                          {tg}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-sm font-bold text-white font-serif">{dish.name}</h4>
                      <span className="text-sm font-mono font-bold" style={{ color: accentColor }}>{getCurrencySymbol(currency)}{dish.price}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-normal mt-1 min-h-[36px] font-sans">
                      {dish.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleAddToCart(dish)}
                    className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 text-[11px] font-bold text-white transition-all flex items-center justify-center gap-1.5"
                    id={`btn-add-to-cart-${dish.id}`}
                  >
                    <LucideIcon name="Plus" className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    Add To Basket
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ----------------- TABLE RESERVATION SECTION ----------------- */}
      <section className="py-20 border-t border-[#120B19] bg-[#0A050D] relative overflow-hidden" id="reserve">
        <div className="absolute bottom-[10%] left-[-10%] w-[350px] h-[350px] rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ backgroundColor: accentColor }} />

        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: accentColor }}>
              Interactive Floor Layout
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">
              RESERVE A MICHELIN LOUNGE
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Select guest capacity, seating zone, and desired timeslot instantly.
            </p>
          </div>

          <div className="bg-[#0f0a14] border border-zinc-850 rounded-2xl p-6 sm:p-8" id="reserve-box">
            <AnimatePresence mode="wait">
              {reserveSuccess && reserveTicket ? (
                <motion.div 
                  key="reserve-success-screen"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-6 space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
                    <LucideIcon name="Check" className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">RESERVATION LOGGED</h4>
                    <p className="text-xs text-zinc-400 mt-1">We have locked in your dining table in our Sandbox state.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 text-left space-y-2.5 max-w-md mx-auto">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Receipt Serial:</span>
                      <span className="font-mono text-white font-bold">{reserveTicket.id}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Guest Count:</span>
                      <span className="text-white font-semibold">{reserveTicket.guests}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Date & Time:</span>
                      <span className="text-white font-semibold font-mono">{reserveTicket.date} @ {reserveTicket.time.split(" ")[0]}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Seating Pref:</span>
                      <span className="text-rose-400 font-semibold">{reserveTicket.seating}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setReserveSuccess(false);
                        setReserveTicket(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold"
                    >
                      Book Another Table
                    </button>
                  </div>
                </motion.div>
              ) : (                <motion.form key="reserve-form" onSubmit={handleBookTable} className="space-y-6 text-left">
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
                    
                    {/* Guest Count */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Dining Party Size</label>
                      <select 
                        value={guests} 
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700 transition-colors cursor-pointer"
                      >
                        {guestOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Target Date */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Reservation Date</label>
                      <input 
                        type="date"
                        value={reservationDate}
                        onChange={(e) => setReservationDate(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700 transition-colors cursor-pointer"
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* Time option */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Dinner Timeslots</label>
                      <select 
                        value={reservationTime}
                        onChange={(e) => setReservationTime(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700 transition-colors cursor-pointer"
                      >
                        {reservationTimes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Zone preference */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Zone Preference</label>
                      <select 
                        value={seatingPreference}
                        onChange={(e) => setSeatingPreference(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700 transition-colors cursor-pointer"
                      >
                        {seatOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                  </div>

                  <div className="pt-2 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-left">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Reservation Holding Fee</span>
                      <p className="text-sm font-bold text-white">₹250.00 (Direct UPI)</p>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white transition-all hover:scale-105 active:scale-95 shrink-0"
                      style={{ backgroundColor: accentColor }}
                    >
                      Verify Reservation Lock
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
              amount={250}
              customer={{
                email: custEmail,
                phone: custPhone,
                first_name: custName.split(" ")[0] || "",
                last_name: custName.split(" ").slice(1).join(" ") || ""
              }}
              bookingDetails={{
                service_id: Number(servicesList[0]?.id) || 3, 
                staff_id: null,
                start_time: `${reservationDate}T${reservationTime.split(" ")[0] === "05:30" ? "17:30:00" : reservationTime.split(" ")[0] === "07:00" ? "19:00:00" : reservationTime.split(" ")[0] === "08:00" ? "20:00:00" : reservationTime.split(" ")[0] === "09:30" ? "21:30:00" : "22:30:00"}`,
                notes: `Guests: ${guests} | Seating: ${seatingPreference}`
              }}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      </section>

      {/* ----------------- FOOD GALLERY SECTION ----------------- */}
      <section className="py-20 border-t border-zinc-900 bg-zinc-950/20" id="gallery">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: accentColor }}>
              Aesthetic Culinary capture
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">
              THE PLATING EXHIBITION
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="food-gallery-grid">
            {displayGallery.map((imgUrl, index) => (
              <div key={index} className="aspect-square rounded-2xl overflow-hidden border border-zinc-900 relative group">
                <img 
                  src={imgUrl} 
                  alt={`Dish Plating ${index}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <LucideIcon name="Flame" className="w-5 h-5 text-rose-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- REVIEWS SECTION ----------------- */}
      <section className="py-20 border-t border-zinc-900 bg-[#0c0611]/80" id="reviews">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: accentColor }}>
              Critical Acclaim
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">
              TESTIMONIALS OF THE REFINED
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="reviews-grid">
            {displayReviews.map((rev, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white font-serif">{rev.name}</span>
                  <div className="flex gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <span key={i}><LucideIcon name="Star" className="w-3.5 h-3.5 fill-current" /></span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-normal italic font-serif">"{rev.comment}"</p>
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-600">
                  <span>Verified Guest Critic</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- CUSTOMER CHECKOUT UI SLIDE-OVER DRAWER ----------------- */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm" id="cart-drawer-overlay">
            {/* Click backdrop to close */}
            <div className="absolute inset-0" onClick={() => setCartOpen(false)} />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-[#0F0A14] border-l border-zinc-850 h-full flex flex-col justify-between relative z-10 p-6 shadow-2xl"
              id="cart-drawer-panel"
            >
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <LucideIcon name="ShoppingBag" className="w-5 h-5 text-white" />
                  <span className="text-sm font-bold text-white font-serif">Your Culinary Basket</span>
                </div>
                <button 
                  onClick={() => setCartOpen(false)}
                  className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white"
                >
                  <LucideIcon name="X" className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body state routing */}
              {checkoutStep === "success" ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 py-12" id="checkout-success-view">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 animate-bounce">
                    <LucideIcon name="Check" className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-serif text-white">ORDER VERIFIED</h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                      Your gourmet reservation has been stored. Culinary handshakes successfully fired!
                    </p>
                  </div>
                </div>
              ) : checkoutStep === "billing" ? (
                /* Billing Form */
                <form onSubmit={handleCheckoutSubmit} className="flex-grow overflow-y-auto py-6 space-y-5 text-left" id="checkout-billing-form">
                  <div className="pb-3 border-b border-zinc-900">
                    <button 
                      type="button" 
                      onClick={() => setCheckoutStep("cart")}
                      className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1.5"
                    >
                      <LucideIcon name="ChevronLeft" className="w-4 h-4" />
                      Back to Basket Tally
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Baskets Tally: {getCurrencySymbol(currency)}{cartTotal}</h4>
                    <p className="text-[11px] text-zinc-500">Provide dining check details below.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Your Full Name</label>
                    <input 
                      type="text" 
                      placeholder="E.g., Elena Rostova"
                      required
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Contact Phone</label>
                    <input 
                      type="tel" 
                      placeholder="+1 (555) 000-0000"
                      required
                      value={billingPhone}
                      onChange={(e) => setBillingPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Kitchen Dietary Instructions (Optional)</label>
                    <textarea 
                      placeholder="E.g., No walnuts in tartare, gluten-free preference..."
                      rows={3}
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700 resize-none"
                    />
                  </div>

                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-mono">Simulated Processor:</span>
                    <span className="font-bold text-emerald-400">Stripe Terminal API Ready</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-xs text-white mt-4"
                    style={{ backgroundColor: accentColor }}
                  >
                    Confirm Gourmet Purchase
                  </button>
                </form>
              ) : (
                /* Cart Itemized List */
                <div className="flex-grow overflow-y-auto py-6 flex flex-col justify-between" id="checkout-cart-list">
                  {cart.length === 0 ? (
                    <div className="text-center py-12 my-auto space-y-2">
                      <LucideIcon name="Inbox" className="w-8 h-8 text-zinc-600 mx-auto" />
                      <p className="text-xs text-zinc-400">Your culinary basket is empty.</p>
                      <button 
                        onClick={() => setCartOpen(false)}
                        className="text-xs font-bold underline"
                        style={{ color: accentColor }}
                      >
                        Add delicious items
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Selected Plates</span>
                      
                      <div className="space-y-3" id="cart-items">
                        {cart.map(({ item, qty }) => (
                          <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-900 gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg shrink-0" referrerPolicy="no-referrer" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{item.name}</p>
                                <p className="text-[10px] text-zinc-400 font-mono">{getCurrencySymbol(currency)}{item.price} each</p>
                              </div>
                            </div>

                            {/* Qty selectors */}
                            <div className="flex items-center gap-1.5 shrink-0 bg-zinc-900 border border-zinc-800 rounded-lg px-1.5 py-0.5">
                              <button onClick={() => handleUpdateQty(item.id, -1)} className="text-xs text-zinc-400 hover:text-white px-1 font-bold">-</button>
                              <span className="text-[11px] font-mono text-white px-0.5">{qty}</span>
                              <button onClick={() => handleUpdateQty(item.id, 1)} className="text-xs text-zinc-400 hover:text-white px-1 font-bold">+</button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-zinc-900 space-y-2">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-500">Subtotal:</span>
                          <span className="text-white">{getCurrencySymbol(currency)}{cartTotal}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-500">Kitchen Taxes & Service:</span>
                          <span className="text-white">Included</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold border-t border-zinc-900/60 pt-2 font-serif">
                          <span>Total:</span>
                          <span style={{ color: accentColor }}>{getCurrencySymbol(currency)}{cartTotal}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setCheckoutStep("billing")}
                        className="w-full py-3 rounded-xl font-bold text-xs text-white mt-4"
                        style={{ backgroundColor: accentColor }}
                        id="btn-cart-checkout"
                      >
                        Proceed to Diner Details
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Drawer Footer info */}
              <div className="text-center text-[10px] text-zinc-500 font-mono border-t border-zinc-900 pt-3">
                SiteMint Sandbox Checkout Gate • Secure SSL
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- AUTHENTICATION INTERACTIVE POPUP ----------------- */}
      <AnimatePresence>
        {authOpen && (
          <CustomerAuth
            sector="restaurant"
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
