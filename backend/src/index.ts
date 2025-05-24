import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "cookie-session";
import passport from "passport";
import http from "http";

import { config } from "./config/app.config";
import { connectDatabase, closeDatabase } from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { BadRequestException } from "./utils/appError";
import { ErrorCodeEnum } from "./enums/error-code.enum";

import "./config/passport.config";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";
import notificationRoutes from "./routes/notification.route";
import sprintRoutes from "./routes/sprint.route";
import dashboardRoutes from "./routes/dashboard.route";
import teamRoutes from "./routes/team.route";
import { initSocketServer } from "./config/socket.config";
import onboardingRoutes from "./routes/onboarding.route";
import { seedRoles } from "./seeders/role.seeder";

// Initialize the server
const startServer = async () => {
  try {
    // Connect to the database
    await connectDatabase();
    
    // Seed essential data
    await seedRoles();
    
    // Initialize Express app
    const app = express();
    const BASE_PATH = config.BASE_PATH;

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Session configuration
    const sessionMiddleware = session({
      name: "session",
      keys: [config.SESSION_SECRET],
      maxAge: 24 * 60 * 60 * 1000,
      secure: config.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    });

    // Add session to app
    app.use(sessionMiddleware);

    // Add compatibility methods for Passport that cookie-session doesn't have
    app.use((req: any, res: Response, next: NextFunction) => {
      if (!req.session.regenerate) {
        req.session.regenerate = (callback: () => void) => {
          callback();
        };
      }
      if (!req.session.save) {
        req.session.save = (callback: () => void) => {
          callback();
        };
      }
      next();
    });

    app.use(passport.initialize());
    app.use(passport.session());

    // Add a debug middleware to check session and user on each request
    app.use((req: Request, res: Response, next: NextFunction) => {
      console.log('Session:', req.session);
      console.log('User:', req.user);
      next();
    });

    app.use(
      cors({
        origin: config.FRONTEND_ORIGIN,
        credentials: true,
      })
    );

    app.get(
      `/`,
      asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        throw new BadRequestException(
          "This is a bad request",
          ErrorCodeEnum.AUTH_INVALID_TOKEN
        );
      })
    );

    // Routes
    app.use(`${BASE_PATH}/auth`, authRoutes);
    app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
    app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
    app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
    app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
    app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);
    app.use(`${BASE_PATH}/notifications`, isAuthenticated, notificationRoutes);
    app.use(`${BASE_PATH}/sprint`, isAuthenticated, sprintRoutes);
    app.use(`${BASE_PATH}/dashboard`, isAuthenticated, dashboardRoutes);
    app.use(`${BASE_PATH}/onboarding`, onboardingRoutes);
    app.use(`${BASE_PATH}/team`, isAuthenticated, teamRoutes);

    app.use(errorHandler);

    const server = http.createServer(app);

    // Initialize socket server
    initSocketServer(server);

    server.listen(config.PORT, () => {
      console.log(`Server is running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await closeDatabase();
  process.exit(0);
});

// Start the server
startServer();
