import { Router } from "express";
import isAuthenticated  from "../middlewares/isAuthenticated.middleware";
import {
  initiateOnboardingController,
  setupWorkspaceController,
  setupProjectController,
  getProjectTemplatesController,
  getOnboardingStatusController,
} from "../controllers/onboarding.controller";

const onboardingRoutes = Router();

// Get current onboarding status
onboardingRoutes.get("/status", isAuthenticated, getOnboardingStatusController);

// Step 1: Organization and User Setup
// When useExistingUser is true, authentication is required
onboardingRoutes.post("/setup/organization", isAuthenticated, initiateOnboardingController);

// Step 2: Workspace Setup (requires authentication)
onboardingRoutes.post(
  "/setup/workspace",
  isAuthenticated,
  setupWorkspaceController
);

// Step 3: Project Setup (requires authentication)
onboardingRoutes.post(
  "/setup/project",
  isAuthenticated,
  setupProjectController
);

// Get available project templates
onboardingRoutes.get(
  "/templates",
  isAuthenticated,
  getProjectTemplatesController
);

export default onboardingRoutes;