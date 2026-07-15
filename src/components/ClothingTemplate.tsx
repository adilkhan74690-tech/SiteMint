import { useState, useEffect } from "react";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import UpiPaymentModal from "./UpiPaymentModal";
import LucideIcon from "./LucideIcon";
import CustomerAuth from "./CustomerAuth";

interface ClothingTemplateProps {
  onBackToHub: () => void;
  initialBrandName?: string;
  initialThemeAccent?: string;
  isStandalone?: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function ClothingTemplate({ onBackToHub, initialBrandName = "Nordic Loom", initialThemeAccent = "#F59E0B", isStandalone = false }: ClothingTemplateProps) {
  // Brand configurations
  const [brandName, setBrandName] = useState(initialBrandName);
  const [accentColor, setAccentColor] = useState(initialThemeAccent);
  const [typography, setTypography] = useState("Default");

  // Client Session Auth
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [authOpen, setAuthOpen] = useState(false);

  // Business DB Integration Settings
  const [businessId, setBusinessId] = useState(1);
  const [upiId, setUpiId] = useState("nordicloom@upi");
  const [logoUrl, setLogoUrl] = useState<string>("");

  // Catalog products and categories
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Cart States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // UPI payment modal control
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [checkoutConfirmed, setCheckoutConfirmed] = useState(false);
  const [orderTicket, setOrderTicket] = useState<any>(null);

  // Customer billing details
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");

  // Reviews list
  const [reviews, setReviews] = useState<any[]>([]);
  const [currency, setCurrency] = useState("INR");

  const getCurrencySymbol = (code: string) => {
    return "₹";
  };

  useEffect(() => {
    // Determine subdomain settings
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

    const subdomain = querySubdomain || pathSubdomain || (hostnameSubdomain !== "localhost" && hostnameSubdomain !== "www" && hostnameSubdomain !== "sitemint" ? hostnameSubdomain : null) || "nordic-threads";

    fetch(`/api/businesses/settings?subdomain=${subdomain}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success" && res.data.business) {
          const biz = res.data.business;
          setBusinessId(biz.id);
          setBrandName(biz.name);
          setUpiId(biz.upi_id || "nordicloom@upi");
          setLogoUrl(biz.logo_url || "");
          setCurrency(biz.currency || "INR");

          if (res.data.theme_settings) {
            setAccentColor(res.data.theme_settings.primary_color || initialThemeAccent);
            setTypography(res.data.theme_settings.font_family || "Default");
          }

          // Fetch products for this tenant
          fetch(`/api/catalog/products?business_id=${biz.id}`)
            .then((pr) => pr.json())
            .then((pres) => {
              if (pres.status === "success") {
                setProducts(pres.data || []);
              }
            });

          // Fetch reviews for this tenant
          fetch(`/api/feedback/reviews?business_id=${biz.id}`)
            .then((rev) => rev.json())
            .then((rres) => {
              if (rres.status === "success") {
                setReviews(rres.data || []);
              }
            });
        }
      })
      .catch((err) => console.error("Error loading clothing business settings:", err));
  }, []);

  // Filtered list
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = activeCategory === "All" || prod.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Unique categories helper
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  // Cart operations
  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === String(product.id));
      if (existing) {
        return prev.map((item) =>
          item.id === String(product.id) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        id: String(product.id),
        name: product.name,
        price: Number(product.price),
        image: product.image || "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=300&q=80",
        quantity: 1
      }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, amt: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextQty = item.quantity + amt;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((wId) => wId !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    if (!custName || !custEmail || !custPhone || !custAddress) {
      alert("Please fill out your complete billing and delivery details.");
      return;
    }
    setIsUpiModalOpen(true);
  };

  const handlePaymentSuccess = (orderId: string | number) => {
    setOrderTicket({
      id: orderId,
      items: [...cart],
      total: totalCartCost,
      deliveryAddress: custAddress,
      recipient: custName
    });
    setCart([]);
    setIsUpiModalOpen(false);
    setCheckoutConfirmed(true);
  };

  const totalCartCost = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div
      className="bg-[#090A0F] text-zinc-150 min-h-screen relative flex flex-col selection:bg-amber-900 selection:text-white"
      style={{ fontFamily: typography === "Playfair Display" ? "'Playfair Display', serif" : "inherit" }}
      id="clothing-template-root"
    >
      {/* Dynamic Header Toolbar */}
      <div className="bg-[#0E1117] border-b border-zinc-900 sticky top-0 z-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md" id="clothing-toolbar">
        {!isStandalone && (
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHub}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-all cursor-pointer"
              id="btn-back-hub-clothing"
            >
              <LucideIcon name="ArrowLeft" className="w-3.5 h-3.5" />
              Back to SiteMint Hub
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          {customerEmail ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">Buyer: {customerEmail}</span>
              <button
                onClick={() => setCustomerEmail("")}
                className="text-[10px] text-red-400 hover:underline uppercase font-bold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="text-xs font-bold text-zinc-355 hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              Sign In / Account
            </button>
          )}

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
          >
            <LucideIcon name="ShoppingBag" className="w-4 h-4" />
            {cart.length > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold text-black flex items-center justify-center shadow-lg"
                style={{ backgroundColor: accentColor }}
              >
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Landing / Storefront Layout */}
      <div className="max-w-7xl mx-auto w-full px-6 py-12 flex-grow space-y-16">
        {/* Brand Banner / Hero */}
        <section className="relative rounded-3xl overflow-hidden aspect-[21/9] border border-zinc-900 bg-zinc-950 flex flex-col justify-end p-8 sm:p-12 text-left">
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-zinc-950/65 to-transparent z-10" />
          <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop')` }} />
          
          <div className="relative z-20 max-w-xl space-y-4">
            <div className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-zinc-900" style={{ color: accentColor }}>C</div>
              )}
              <h2 className="text-xl font-bold tracking-tight text-white">{brandName}</h2>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Curated Nordic Weaves & Silhouette Artistry
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Explore our premium organic fibers tailored with architectural precision. Direct billing, real-time inventory management, and fast secure payments.
            </p>
          </div>
        </section>

        {/* Catalog Section */}
        <section className="space-y-8" id="products-catalog-section">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-900 pb-6">
            <div className="text-left space-y-1">
              <h3 className="text-xl font-extrabold text-white">Collections Catalog</h3>
              <p className="text-xs text-zinc-555 font-mono">Premium apparel list synced directly to MySQL warehouse</p>
            </div>

            {/* Filter Categories and Search Input */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-550">
                  <LucideIcon name="Search" className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-750 transition-all font-mono"
                />
              </div>

              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900">
                {categories.map((cat: any) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeCategory === cat ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-350"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Catalog grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-zinc-950/20 rounded-2xl border border-zinc-900 border-dashed">
              <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mx-auto text-zinc-550">
                <LucideIcon name="ShoppingBag" className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-300">Catalog Empty</h4>
                <p className="text-xs text-zinc-500 leading-normal max-w-xs mx-auto">
                  No products have been listed in this category yet. Return to the builder dashboard to expand inventory.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => {
                const inWishlist = wishlist.includes(String(prod.id));
                const isOutOfStock = prod.inventory_qty <= 0;
                return (
                  <div
                    key={prod.id}
                    className="group rounded-2xl border border-zinc-900 bg-zinc-950/60 overflow-hidden flex flex-col justify-between hover:border-zinc-800 transition-all duration-300"
                  >
                    {/* Visual Area */}
                    <div className="relative aspect-[4/5] bg-zinc-900/50 overflow-hidden">
                      <img
                        src={prod.image || "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=300&q=80"}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-505 group-hover:scale-103"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent opacity-60" />

                      <button
                        onClick={() => toggleWishlist(String(prod.id))}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/75 backdrop-blur border border-zinc-850 flex items-center justify-center transition-all hover:bg-black/90 text-zinc-400 hover:text-red-400 cursor-pointer"
                      >
                        <LucideIcon name="Heart" className={`w-4 h-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
                      </button>

                      {isOutOfStock && (
                        <span className="absolute top-3 left-3 bg-red-500/10 text-red-400 text-[9px] font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded border border-red-500/20">
                          Sold Out
                        </span>
                      )}
                    </div>

                    {/* Content Detail */}
                    <div className="p-4 text-left space-y-3">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest font-black block">
                          {prod.category || "Apparel"}
                        </span>
                        <h4 className="text-sm font-bold text-white tracking-tight truncate">{prod.name}</h4>
                        <p className="text-[11px] text-zinc-400 leading-normal line-clamp-2 min-h-[32px]">
                          {prod.description || "Premium tailor fibers crafted to modern aesthetics."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                        <span className="text-sm font-black text-white">{getCurrencySymbol(currency)}{prod.price}</span>
                        <button
                          disabled={isOutOfStock}
                          onClick={() => addToCart(prod)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                            isOutOfStock 
                              ? "bg-zinc-900 text-zinc-650 cursor-not-allowed" 
                              : "bg-zinc-900 hover:bg-zinc-850 text-zinc-200 hover:text-white"
                          }`}
                        >
                          <LucideIcon name="ShoppingCart" className="w-3.5 h-3.5" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Customer Reviews Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-zinc-900" id="reviews-section">
          <div className="text-left space-y-3">
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Customer Testimonials</span>
            <h3 className="text-2xl font-extrabold text-white">Loved by minimalist wearers</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Read transparent feedback from our direct orders platform. Submissions are verified instantly by MySQL.
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.length === 0 ? (
              <div className="sm:col-span-2 p-6 text-center space-y-2 bg-zinc-950/20 rounded-xl border border-zinc-900 border-dashed">
                <p className="text-xs font-bold text-zinc-400">No reviews published yet</p>
                <p className="text-[11px] text-zinc-500">Order from our catalog to leave your feedback logs.</p>
              </div>
            ) : (
              reviews.map((r, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-900 text-left space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-300">{r.customer_name || r.author}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{new Date(r.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <span key={i}>
                        <LucideIcon name="Star" className="w-3 h-3 fill-current" />
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed italic">
                    "{r.comment || r.text}"
                  </p>
                  {r.reply && (
                    <div className="mt-2 pl-3 border-l border-amber-500/40 space-y-1">
                      <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider font-mono">Store Response:</p>
                      <p className="text-[11px] text-zinc-500 leading-normal italic">"{r.reply}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Cart Slider Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
              onClick={() => setIsCartOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-full max-w-md bg-[#0C0D14] border-l border-zinc-900 flex flex-col justify-between h-full shadow-2xl p-6 text-left"
            >
              {/* Cart Top */}
              <div>
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <LucideIcon name="ShoppingBag" className="w-5 h-5" style={{ color: accentColor }} />
                    <h3 className="text-base font-bold text-white font-display">Shopping Cart</h3>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 cursor-pointer"
                  >
                    <LucideIcon name="X" className="w-4 h-4" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <p className="text-sm font-bold text-zinc-350">Your cart is empty</p>
                    <p className="text-xs text-zinc-555">Pick products from our collections catalog to start checking out.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[calc(100vh-420px)] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-zinc-950 border border-zinc-900">
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg shrink-0 bg-zinc-900" />
                        <div className="flex-grow space-y-1">
                          <p className="text-xs font-bold text-white leading-normal truncate max-w-[180px]">{item.name}</p>
                          <p className="text-xs font-mono text-zinc-450 font-bold">{getCurrencySymbol(currency)}{item.price}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-5 h-5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 flex items-center justify-center text-xs font-bold text-zinc-450 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-xs font-mono font-bold text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-5 h-5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 flex items-center justify-center text-xs font-bold text-zinc-455 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checkout Form */}
              {cart.length > 0 && (
                <div className="border-t border-zinc-900 pt-6 space-y-4">
                  <div className="flex justify-between items-center text-sm font-black text-white">
                    <span>Total Amount:</span>
                    <span>{getCurrencySymbol(currency)}{totalCartCost}</span>
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        required
                        className="bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        required
                        className="bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                    <textarea
                      placeholder="Delivery Address"
                      rows={2}
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-700 resize-none"
                    />

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-black transition-all hover:scale-[1.02] cursor-pointer"
                      style={{ backgroundColor: accentColor }}
                    >
                      Checkout via UPI Order
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Success Invoice modal */}
      <AnimatePresence>
        {checkoutConfirmed && orderTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCheckoutConfirmed(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0C0D14] border border-zinc-850 rounded-3xl p-6 shadow-2xl text-left space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                  <LucideIcon name="CheckCircle" className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">Order Successful!</h3>
                <p className="text-xs text-zinc-500 font-mono">Your payments have been processed and logged in MySQL.</p>
              </div>

              {/* Dynamic Invoice Panel */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-2 text-[10px] font-mono text-zinc-500 uppercase">
                  <span>Invoice # {orderTicket.id}</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>

                {/* Optional brand logo header */}
                <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-900">
                  {logoUrl && <img src={logoUrl} alt="Logo" className="w-5 h-5 rounded object-cover" />}
                  <span className="text-xs font-bold text-white">{brandName}</span>
                </div>

                <div className="space-y-1">
                  {orderTicket.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">{item.name} x {item.quantity}</span>
                      <span className="text-white font-mono">{getCurrencySymbol(currency)}{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-900 pt-2 flex justify-between items-center text-xs font-black text-white">
                  <span>Grand Total:</span>
                  <span>{getCurrencySymbol(currency)}{orderTicket.total}</span>
                </div>

                <div className="text-[10px] text-zinc-450 leading-relaxed pt-2 border-t border-zinc-900">
                  <p className="font-bold text-zinc-350">Delivery details:</p>
                  <p>{orderTicket.recipient} • {orderTicket.deliveryAddress}</p>
                </div>
              </div>

              <button
                onClick={() => setCheckoutConfirmed(false)}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-xs font-bold text-zinc-300 rounded-xl transition-all cursor-pointer"
              >
                Close Ticket
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPI Payment Modal Integration */}
      {isUpiModalOpen && (
        <UpiPaymentModal
          isOpen={isUpiModalOpen}
          onClose={() => setIsUpiModalOpen(false)}
          businessId={businessId}
          businessName={brandName}
          upiId={upiId}
          amount={totalCartCost}
          customer={{
            email: custEmail,
            phone: custPhone,
            first_name: custName,
            last_name: ""
          }}
          bookingDetails={{
            service_id: 1,
            start_time: new Date().toISOString(),
            notes: `Direct purchase from ${brandName}`
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Account Login Drawer fallback */}
      {authOpen && (
        <CustomerAuth
          sector="salon"
          brandName={brandName}
          accentColor={accentColor}
          onClose={() => setAuthOpen(false)}
          onAuthSuccess={(email) => {
            setCustomerEmail(email);
            setAuthOpen(false);
          }}
        />
      )}
    </div>
  );
}
