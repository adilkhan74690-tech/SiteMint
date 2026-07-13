export interface Category {
  id: string;
  name: string;
  iconName: string;
  description: string;
  tagline: string;
  accentColor: string;
}

export interface Template {
  id: string;
  categoryId: string;
  name: string;
  tagline: string;
  heroImage: string;
  accentColor: string;
  features: string[];
  colors: string[];
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
  isPopular: boolean;
  ctaText: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}
