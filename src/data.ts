import { Category, Template, Feature, Testimonial, PricingPlan, FAQItem } from "./types";

export const categories: Category[] = [
  {
    id: "gym",
    name: "Gym",
    iconName: "Dumbbell",
    description: "High-octane booking systems, personal trainer schedules, and member portal integrations.",
    tagline: "Iron meets digital precision.",
    accentColor: "#10B981" // Emerald / Mint
  },
  {
    id: "restaurant",
    name: "Restaurant",
    iconName: "Utensils",
    description: "Slick, gorgeous digital menus, real-time reservations, and seamless online ordering.",
    tagline: "A digital table always waiting.",
    accentColor: "#EF4444" // Red
  },
  {
    id: "salon",
    name: "Salon",
    iconName: "Scissors",
    description: "Effortless stylist matching, calendar synchronization, and automated SMS reminders.",
    tagline: "Style booked in a click.",
    accentColor: "#EC4899" // Pink
  },
  {
    id: "pharmacy",
    name: "Pharmacy",
    iconName: "Pill",
    description: "Secure prescription uploads, automated drug refill reminders, and local delivery routing.",
    tagline: "Wellness delivered instantly.",
    accentColor: "#3B82F6" // Blue
  },
  {
    id: "clothing",
    name: "Clothing",
    iconName: "Shirt",
    description: "Immersive lookbooks, visual filters, size calculators, and cart optimization modules.",
    tagline: "Couture, curated for you.",
    accentColor: "#8B5CF6" // Violet
  },
  {
    id: "grocery",
    name: "Grocery",
    iconName: "ShoppingBasket",
    description: "Instant barcode searches, subscription pantry items, and dynamic recipe-to-cart checkouts.",
    tagline: "Freshness on a subscription.",
    accentColor: "#10B981" // Green
  },
  {
    id: "bakery",
    name: "Bakery",
    iconName: "Cookie",
    description: "Custom celebratory cake builders, next-day preorder calendars, and allergy indicators.",
    tagline: "Warm, fresh, and fully online.",
    accentColor: "#F59E0B" // Amber
  },
  {
    id: "cafe",
    name: "Cafe",
    iconName: "Coffee",
    description: "Mobile order-ahead queues, digital stamp cards, and localized ambient menu designs.",
    tagline: "Skip the line, sip the blend.",
    accentColor: "#D97706" // Bronze / Brown
  },
  {
    id: "electronics",
    name: "Electronics",
    iconName: "Cpu",
    description: "Interactive spec sheets, side-by-side product comparisons, and serial number registries.",
    tagline: "Premium hardware, sold seamlessly.",
    accentColor: "#06B6D4" // Cyan
  },
  {
    id: "petstore",
    name: "PawPrint",
    iconName: "PawPrint",
    description: "Pet profile builders, smart subscription-based kibble deliveries, and vet booking links.",
    tagline: "For our furry internet citizens.",
    accentColor: "#F97316" // Orange
  },
  {
    id: "bookstore",
    name: "BookOpen",
    iconName: "BookOpen",
    description: "Curated staff recommendations, dynamic reading club forums, and audiobook previewers.",
    tagline: "Your next story, beautifully bound.",
    accentColor: "#14B8A6" // Teal
  },
  {
    id: "jewellery",
    name: "Gem",
    iconName: "Gem",
    description: "High-resolution 3D visualizers, private virtual viewing slots, and certificate of authenticity vaults.",
    tagline: "Luxury, designed to last.",
    accentColor: "#F43F5E" // Rose / Luxury Gold
  }
];

export const templates: Template[] = [
  {
    id: "pulse-gym",
    categoryId: "gym",
    name: "Pulse Athletics",
    tagline: "Define Your Limits. Smash Them.",
    heroImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#00F5A0",
    features: ["Class Scheduling", "Coach Directory", "Membership Tier Engine", "Live Workout Tracker"],
    colors: ["#00F5A0", "#09090B", "#18181B"]
  },
  {
    id: "forge-fitness",
    categoryId: "gym",
    name: "Forge Elite",
    tagline: "Heavy Metal. Pure Results.",
    heroImage: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#F59E0B",
    features: ["Personal Training Hooks", "Macro Calculators", "Industrial Aesthetic", "1-on-1 Chats"],
    colors: ["#F59E0B", "#0D0D0D", "#1A1A1A"]
  },
  {
    id: "michelin-bistro",
    categoryId: "restaurant",
    name: "L'Aura Bistro",
    tagline: "Cuisine as Art. Plates with Soul.",
    heroImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#EC4899",
    features: ["Interactive Dynamic Menu", "Real-time Resy Integration", "Catering & Events Builder", "Vignette Galleries"],
    colors: ["#EC4899", "#0A050D", "#1A0F26"]
  },
  {
    id: "luna-salon",
    categoryId: "salon",
    name: "Luna Studio",
    tagline: "Radiate Elegance. Discover Your Style.",
    heroImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#06B6D4",
    features: ["Stylist Selection Wheel", "Before/After Carousel", "Product eCommerce Shelf", "Automated Rebooking"],
    colors: ["#06B6D4", "#090B0F", "#111622"]
  },
  {
    id: "nordic-threads",
    categoryId: "clothing",
    name: "Nordic Loom",
    tagline: "Premium Minimalism. Tailored for Comfort.",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#8B5CF6",
    features: ["High-Res Lookbook Loops", "Instant Dynamic Sizer", "Pre-order Drop Waitlist", "360 Spin Previews"],
    colors: ["#8B5CF6", "#0B0914", "#161226"]
  },
  {
    id: "roastery-hub",
    categoryId: "cafe",
    name: "Origin Roast",
    tagline: "Locally Sourced. Expertly Brewed.",
    heroImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#F97316",
    features: ["Bean Subscription Engine", "Cart Mobile Pre-ordering", "Barista Blog Feed", "Flavor Profile Quizzes"],
    colors: ["#F97316", "#0F0B08", "#1E1510"]
  }
];

export const features: Feature[] = [
  {
    id: "instant-mint",
    title: "Fast Setup Engine",
    description: "Input your business details and watch as our system designs, compiles, and deploys a clean, responsive website in seconds.",
    badge: "Built-In",
    iconName: "Zap"
  },
  {
    id: "smart-booking",
    title: "Integrated Bookings",
    description: "Manage appointments, classes, schedules, or events with our native calendar component. Works on any desktop or mobile screen.",
    badge: "Included",
    iconName: "CalendarRange"
  },
  {
    id: "stripe-mint",
    title: "Direct Checkout & Payments",
    description: "Accept subscriptions, upfront deposits, card payments, and digital wallets natively with direct Stripe billing under your own business name.",
    iconName: "CreditCard"
  },
  {
    id: "seo-mint",
    title: "Optimized Performance",
    description: "Fast loading speeds and built-in search compliance help customers find your business on Google without manual setup or slow plugins.",
    badge: "SEO Ready",
    iconName: "LineChart"
  },
  {
    id: "custom-domains",
    title: "Secure Custom Domains",
    description: "Connect your custom domain in one click. We handle automated SSL certificates, global hosting, and standard DDoS protection.",
    iconName: "Globe"
  },
  {
    id: "brand-override",
    title: "Simple Style Controls",
    description: "Adjust colors, typography, and content using our visual dashboard. Design for your specific audience with realistic presets.",
    iconName: "SlidersHorizontal"
  }
];

export const testimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    name: "Marcus Vance",
    role: "Founding Owner",
    company: "IronWorks Gym",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    content: "We launched IronWorks Online with SiteMint in less than five minutes. Members routinely comment on how clean our calendar booking system is. It increased our online membership conversions by 38% inside the first month.",
    rating: 5
  },
  {
    id: "testimonial-2",
    name: "Elena Rostova",
    role: "Head Chef & Founder",
    company: "Saffron Bistro",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
    content: "Our old website looked like a standard template. With SiteMint, we got an interface that feels like a luxury Michelin experience. Online reservations are seamless, and our catering pipeline is now completely automated.",
    rating: 5
  },
  {
    id: "testimonial-3",
    name: "Devon Carter",
    role: "E-Commerce Director",
    company: "Mono Threads",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80",
    content: "I've launched shops on every major platform, but nothing comes close to SiteMint's lightning-fast page speeds. Our performance score is a straight 99, and our mobile bounce rate dropped dramatically. Highly recommended.",
    rating: 5
  }
];

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter Plan",
    priceMonthly: 24,
    priceYearly: 19,
    description: "Perfect for single-location shops looking to establish a professional online home.",
    features: [
      "1 Fully Custom Website",
      "SSL-Protected Custom Domain",
      "Built-in Booking & Schedules",
      "Standard Payment Integrations",
      "Excellent SEO & Performance Score",
      "Standard Chat Support"
    ],
    isPopular: false,
    ctaText: "Get Started"
  },
  {
    id: "pro",
    name: "Pro Scale",
    priceMonthly: 49,
    priceYearly: 39,
    description: "Ideal for growing businesses requiring high-end automation, lookbooks, and advanced tools.",
    features: [
      "Up to 3 Custom Websites",
      "Unlimited Bookings & Tables",
      "Multi-stylist / Trainer Portals",
      "Advanced Custom Forms & CRM",
      "Priority API Access & Webhooks",
      "Zero Transaction Fees",
      "24/7 Dedicated Concierge Support"
    ],
    isPopular: true,
    ctaText: "Scale Now"
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    priceMonthly: 129,
    priceYearly: 99,
    description: "Unparalleled scale for multi-franchise operations requiring fully custom workflows.",
    features: [
      "Unlimited Custom Sites",
      "White-labeled Customer Dashboards",
      "Custom React Component Uploads",
      "Dedicated Database & Server Slices",
      "Franchise Role-based Permissions",
      "Enterprise Service Level Agreements",
      "Dedicated Success Engineer"
    ],
    isPopular: false,
    ctaText: "Contact Sales"
  }
];

export const faqs: FAQItem[] = [
  {
    id: "faq-1",
    question: "How does the instant setup engine actually work?",
    answer: "You simply enter your business name, sector, colors, and core offerings. Our system instantly selects the optimal layout framework, loads high-performance page sections, and prepares your custom site. Your site is secure, responsive, and fully interactive in minutes."
  },
  {
    id: "faq-2",
    question: "Can I connect my own custom domain?",
    answer: "Absolutely. During checkout or anytime from your dashboard, you can connect your own domain (e.g., yourbusiness.com). We auto-generate and manage premium Let's Encrypt SSL certificates to ensure your connections are secure and load with absolute confidence."
  },
  {
    id: "faq-3",
    question: "Do you charge any transaction fees on bookings or sales?",
    answer: "No, we do not. Unlike other platforms that extract 1% to 5% of your revenue, SiteMint believes your earnings belong to you. You only pay standard payment processing fees directly to Stripe, with zero platform markups."
  },
  {
    id: "faq-4",
    question: "Can I migrate my existing restaurant menu or gym schedules?",
    answer: "Yes, our onboarding dashboard features import adapters. You can upload standard menus, link your existing business listings, and our importer will help map your data into your dashboard instantly."
  },
  {
    id: "faq-5",
    question: "Is there an option to export the generated code?",
    answer: "Yes! On our Pro and Enterprise tiers, you can export a clean, modularized React & Tailwind CSS project build at any time. This gives you complete independence."
  }
];
