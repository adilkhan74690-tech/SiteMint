import { Router } from "express";
import {
  registerBusiness,
  loginUser,
  refreshSessionToken,
  logoutUser
} from "../controllers/authController.js";
import {
  getBusinessSettings,
  updateThemeSettings,
  getTemplates,
  onboardBusiness
} from "../controllers/businessController.js";
import {
  listProducts,
  createProduct,
  updateProduct,
  listServices,
  createService,
  updateService
} from "../controllers/catalogController.js";
import {
  listBookings,
  createBooking,
  updateBookingStatus
} from "../controllers/bookingController.js";
import {
  createCheckoutOrder,
  verifyAndCapturePayment,
  listOrders,
  listPayments,
  createUpiPayment,
  approvePayment
} from "../controllers/checkoutController.js";
import {
  uploadMedia,
  getMediaGallery,
  listReviews,
  createReview,
  listActivityLogs,
  listNotifications,
  markNotificationAsRead
} from "../controllers/feedbackController.js";
import {
  authenticateUser,
  requireRole,
  enforceTenantIsolation
} from "../middleware/authMiddleware.js";
import {
  validateRegister,
  validateLogin,
  validateThemeSettings
} from "../middleware/validationMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

// ==========================================
// 1. Authentication Routes
// ==========================================
router.post("/auth/register", validateRegister, registerBusiness);
router.post("/auth/login", validateLogin, loginUser);
router.post("/auth/refresh", refreshSessionToken);
router.post("/auth/logout", logoutUser);

// ==========================================
// 2. Business & Tenant Branding Routes
// ==========================================
router.get("/businesses/settings", getBusinessSettings);
router.get("/businesses/templates", getTemplates);
router.put("/businesses/onboard", authenticateUser, onboardBusiness);
router.put(
  "/businesses/theme",
  authenticateUser,
  requireRole(["owner", "manager"]),
  validateThemeSettings,
  updateThemeSettings
);

// ==========================================
// 3. Catalog (Products & Services) Routes
// ==========================================
// Products
router.get("/catalog/products", listProducts);
router.post(
  "/catalog/products",
  authenticateUser,
  requireRole(["owner", "manager"]),
  createProduct
);
router.put(
  "/catalog/products/:id",
  authenticateUser,
  requireRole(["owner", "manager"]),
  updateProduct
);

// Services
router.get("/catalog/services", listServices);
router.post(
  "/catalog/services",
  authenticateUser,
  requireRole(["owner", "manager", "staff"]),
  createService
);
router.put(
  "/catalog/services/:id",
  authenticateUser,
  requireRole(["owner", "manager", "staff"]),
  updateService
);

// ==========================================
// 4. Booking Scheduler Routes
// ==========================================
router.get(
  "/bookings",
  authenticateUser,
  enforceTenantIsolation,
  listBookings
);
router.post("/bookings", createBooking); // Public booking endpoint
router.patch(
  "/bookings/:id/status",
  authenticateUser,
  requireRole(["owner", "manager", "staff"]),
  updateBookingStatus
);

// ==========================================
// 5. Checkout, Payments & Orders Routes
// ==========================================
router.post("/checkout/order", createCheckoutOrder); // Public checkout placement
router.post("/checkout/verify", verifyAndCapturePayment); // Public verification endpoint
router.post("/checkout/upi-payment", createUpiPayment); // Public UPI payment placement
router.get(
  "/checkout/orders",
  authenticateUser,
  enforceTenantIsolation,
  listOrders
);
router.get(
  "/checkout/payments",
  authenticateUser,
  enforceTenantIsolation,
  listPayments
);
router.patch(
  "/checkout/payments/:id/approve",
  authenticateUser,
  requireRole(["owner", "manager"]),
  approvePayment
);

// ==========================================
// 6. Media, Reviews, Auditing & Alerts Routes
// ==========================================
// Media Asset Uploads
router.post(
  "/feedback/media",
  authenticateUser,
  upload.single("file"),
  uploadMedia
);
router.get("/feedback/media", getMediaGallery);

// Testimonials / Reviews
router.get("/feedback/reviews", listReviews);
router.post("/feedback/reviews", createReview); // Public submission

// Security Logs
router.get(
  "/feedback/logs",
  authenticateUser,
  enforceTenantIsolation,
  listActivityLogs
);

// Alerts Notification Feed
router.get("/feedback/notifications", authenticateUser, listNotifications);
router.patch(
  "/feedback/notifications/:id/read",
  authenticateUser,
  markNotificationAsRead
);

export default router;
