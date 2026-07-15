import { Router } from "express";
import {
  registerBusiness,
  loginUser,
  refreshSessionToken,
  logoutUser,
  getProfile
} from "../controllers/authController.js";
import {
  getBusinessSettings,
  updateThemeSettings,
  getTemplates,
  onboardBusiness,
  publishBusiness,
  listCustomers,
  listStaff,
  addStaff,
  updateStaff,
  deleteStaff,
  updateBusinessSettings,
  unpublishBusiness,
  getOwnerBusinesses,
  selectBusiness,
  duplicateBusiness,
  deleteBusinessByOwner
} from "../controllers/businessController.js";
import {
  listProducts,
  createProduct,
  updateProduct,
  listServices,
  createService,
  updateService,
  deleteProduct,
  deleteService
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
  getSubscriptionStatus,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  cancelActiveSubscription
} from "../controllers/subscriptionController.js";
import {
  uploadMedia,
  getMediaGallery,
  listReviews,
  createReview,
  listActivityLogs,
  listNotifications,
  markNotificationAsRead,
  deleteMedia,
  updateReviewStatus,
  updateReviewReply,
  deleteReview,
  updateReview
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
import {
  getAdminMetrics,
  getBusinesses,
  updateBusinessStatus,
  deleteBusiness,
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getAdminPayments,
  getAdminSubscriptions
} from "../controllers/adminController.js";

const router = Router();

// ==========================================
// 1. Authentication Routes
// ==========================================
router.post("/auth/register", validateRegister, registerBusiness);
router.post("/auth/login", validateLogin, loginUser);
router.post("/auth/refresh", refreshSessionToken);
router.post("/auth/logout", logoutUser);
router.get("/auth/me", authenticateUser, getProfile);

// ==========================================
// 1a. SaaS Subscription Routes
// ==========================================
router.get("/subscriptions/status", authenticateUser, getSubscriptionStatus);
router.post("/subscriptions/razorpay/order", authenticateUser, createSubscriptionOrder);
router.post("/subscriptions/razorpay/verify", authenticateUser, verifySubscriptionPayment);
router.post("/subscriptions/cancel", authenticateUser, cancelActiveSubscription);

// ==========================================
// 1b. Super Admin Control Routes
// ==========================================
router.get("/admin/metrics", authenticateUser, requireRole(["SUPER_ADMIN"]), getAdminMetrics);
router.get("/admin/businesses", authenticateUser, requireRole(["SUPER_ADMIN"]), getBusinesses);
router.put("/admin/businesses/:id/status", authenticateUser, requireRole(["SUPER_ADMIN"]), updateBusinessStatus);
router.delete("/admin/businesses/:id", authenticateUser, requireRole(["SUPER_ADMIN"]), deleteBusiness);
router.get("/admin/announcements", authenticateUser, listAnnouncements);
router.post("/admin/announcements", authenticateUser, requireRole(["SUPER_ADMIN"]), createAnnouncement);
router.delete("/admin/announcements/:id", authenticateUser, requireRole(["SUPER_ADMIN"]), deleteAnnouncement);
router.get("/admin/payments", authenticateUser, requireRole(["SUPER_ADMIN"]), getAdminPayments);
router.get("/admin/subscriptions", authenticateUser, requireRole(["SUPER_ADMIN"]), getAdminSubscriptions);

// ==========================================
// 2. Business & Tenant Branding Routes
// ==========================================
router.get("/businesses", authenticateUser, getOwnerBusinesses);
router.post("/businesses/:id/select", authenticateUser, selectBusiness);
router.post("/businesses/:id/duplicate", authenticateUser, duplicateBusiness);
router.delete("/businesses/:id", authenticateUser, requireRole(["owner"]), deleteBusinessByOwner);
router.get("/businesses/settings", getBusinessSettings);
router.get("/businesses/templates", getTemplates);
router.put("/businesses/onboard", authenticateUser, onboardBusiness);
router.put("/businesses/settings", authenticateUser, requireRole(["owner", "manager"]), updateBusinessSettings);
router.put(
  "/businesses/theme",
  authenticateUser,
  requireRole(["owner", "manager"]),
  validateThemeSettings,
  updateThemeSettings
);
router.put(
  "/businesses/publish",
  authenticateUser,
  requireRole(["owner", "manager"]),
  publishBusiness
);
router.put(
  "/businesses/unpublish",
  authenticateUser,
  requireRole(["owner", "manager"]),
  unpublishBusiness
);
router.get(
  "/customers",
  authenticateUser,
  enforceTenantIsolation,
  listCustomers
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
router.delete(
  "/catalog/products/:id",
  authenticateUser,
  requireRole(["owner", "manager"]),
  deleteProduct
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
router.delete(
  "/catalog/services/:id",
  authenticateUser,
  requireRole(["owner", "manager", "staff"]),
  deleteService
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
router.get("/feedback/media", authenticateUser, getMediaGallery);
router.delete("/feedback/media/:id", authenticateUser, deleteMedia);

// Testimonials / Reviews
router.get("/feedback/reviews", listReviews);
router.post("/feedback/reviews", createReview); // Public submission
router.patch("/feedback/reviews/:id/approve", authenticateUser, requireRole(["owner", "manager"]), updateReviewStatus);
router.patch("/feedback/reviews/:id/reply", authenticateUser, requireRole(["owner", "manager"]), updateReviewReply);
router.delete("/feedback/reviews/:id", authenticateUser, requireRole(["owner", "manager"]), deleteReview);
router.put("/feedback/reviews/:id", authenticateUser, requireRole(["owner", "manager"]), updateReview);

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

// ==========================================
// 7. Staff Management Routes
// ==========================================
router.get("/staff", listStaff);
router.post("/staff", authenticateUser, requireRole(["owner", "manager"]), addStaff);
router.put("/staff/:id", authenticateUser, requireRole(["owner", "manager"]), updateStaff);
router.delete("/staff/:id", authenticateUser, requireRole(["owner", "manager"]), deleteStaff);

export default router;
