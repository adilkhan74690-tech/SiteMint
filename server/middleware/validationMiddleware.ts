import { Request, Response, NextFunction } from "express";

/**
 * Helper to validate email formatting via RFC-compliant RegExp
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Helper to validate subdomain formatting (alphanumeric and dashes only, no spaces or special symbols)
 */
export function isValidSubdomain(subdomain: string): boolean {
  const subdomainRegex = /^[a-zA-Z0-9-]+$/;
  return subdomainRegex.test(subdomain) && !subdomain.startsWith("-") && !subdomain.endsWith("-");
}

/**
 * Middleware validator for multi-tenant business and owner registration.
 */
export function validateRegister(req: Request, res: Response, next: NextFunction): void {
  const { name, subdomain, contact_email, contact_phone, full_name, password } = req.body;
  const errors: Record<string, string> = {};

  // 1. Validate Business Name
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.name = "Business name must be at least 2 characters long.";
  } else if (name.trim().length > 100) {
    errors.name = "Business name cannot exceed 100 characters.";
  }

  // 2. Validate Subdomain
  if (!subdomain || typeof subdomain !== "string" || subdomain.trim().length < 2) {
    errors.subdomain = "Subdomain must be at least 2 characters long.";
  } else if (subdomain.trim().length > 50) {
    errors.subdomain = "Subdomain cannot exceed 50 characters.";
  } else if (!isValidSubdomain(subdomain)) {
    errors.subdomain = "Subdomain can only contain alphanumeric characters and hyphens, and cannot start or end with a hyphen.";
  }

  // 3. Validate Contact Email
  if (!contact_email || typeof contact_email !== "string" || !isValidEmail(contact_email)) {
    errors.contact_email = "Please provide a valid, active email address.";
  } else if (contact_email.length > 100) {
    errors.contact_email = "Email address cannot exceed 100 characters.";
  }

  // 4. Validate Contact Phone (optional)
  if (contact_phone && (typeof contact_phone !== "string" || contact_phone.trim().length < 7 || contact_phone.trim().length > 20)) {
    errors.contact_phone = "Contact phone must be a valid telephone number between 7 and 20 digits.";
  }

  // 5. Validate Owner Full Name
  if (!full_name || typeof full_name !== "string" || full_name.trim().length < 2) {
    errors.full_name = "Owner full name must be at least 2 characters long.";
  } else if (full_name.trim().length > 100) {
    errors.full_name = "Owner name cannot exceed 100 characters.";
  }

  // 6. Validate Password
  if (!password || typeof password !== "string" || password.length < 8) {
    errors.password = "Password must be at least 8 characters long for secure authentication.";
  }

  if (Object.keys(errors).length > 0) {
    if (process.env.NODE_ENV !== "production") {
      console.error("DEBUG: validateRegister failed. Errors:", errors);
      console.error("DEBUG: Received request body:", req.body);
    }
    res.status(400).json({
      status: "error",
      message: "Registration validation failed.",
      errors
    });
    return;
  }

  next();
}

/**
 * Middleware validator for user login.
 */
export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const { email, password, subdomain } = req.body;
  const errors: Record<string, string> = {};

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    errors.email = "Please provide a valid email address.";
  }

  if (!password || typeof password !== "string" || password.length === 0) {
    errors.password = "Password field is required.";
  }

  if (subdomain && (typeof subdomain !== "string" || !isValidSubdomain(subdomain))) {
    errors.subdomain = "Invalid subdomain formatting.";
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({
      status: "error",
      message: "Login credentials validation failed.",
      errors
    });
    return;
  }

  next();
}

/**
 * Middleware validator for theme settings update.
 */
export function validateThemeSettings(req: Request, res: Response, next: NextFunction): void {
  const { primary_color, secondary_color, font_family, custom_css } = req.body;
  const errors: Record<string, string> = {};
  const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

  if (primary_color && !hexColorRegex.test(primary_color)) {
    errors.primary_color = "Primary color must be a valid hex code (e.g. #10B981).";
  }

  if (secondary_color && !hexColorRegex.test(secondary_color)) {
    errors.secondary_color = "Secondary color must be a valid hex code (e.g. #111827).";
  }

  if (font_family && (typeof font_family !== "string" || font_family.trim().length < 2 || font_family.length > 50)) {
    errors.font_family = "Font family must be a valid font identifier string.";
  }

  if (custom_css && typeof custom_css !== "string") {
    errors.custom_css = "Custom CSS must be a valid string code block.";
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({
      status: "error",
      message: "Branding settings validation failed.",
      errors
    });
    return;
  }

  next();
}
