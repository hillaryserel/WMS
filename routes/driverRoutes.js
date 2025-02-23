const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const driverAuthMiddleware = require("../middleware/driverAuthMiddleware");

// Driver login and dashboard routes
router.get("/", driverController.getDriverLogin);
router.post("/login_process", driverController.loginDriver);
router.get("/dashboard", driverAuthMiddleware.isDriverLoggedIn, driverController.getDriverDashboard);

// Password reset routes

router.post("/forgot-password", driverController.forgotPassword); // Request password reset

// Driver request routes
router.get("/pending-requests", driverAuthMiddleware.isDriverLoggedIn, driverController.getPendingRequests);
router.get("/resolve-request", driverAuthMiddleware.isDriverLoggedIn, driverController.resolveRequest);
router.get("/reject-request", driverAuthMiddleware.isDriverLoggedIn, driverController.rejectRequest);
router.get("/history", driverAuthMiddleware.isDriverLoggedIn, driverController.getRequestHistory);
router.get("/logout", driverController.logoutDriver);

module.exports = router;