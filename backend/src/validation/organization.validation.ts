import { z } from "zod";

export const organizationNameSchema = z
  .string()
  .trim()
  .min(1, "Organization name is required")
  .max(100, "Organization name cannot exceed 100 characters");

export const subdomainSchema = z
  .string()
  .trim()
  .min(3, "Subdomain must be at least 3 characters")
  .max(63, "Subdomain cannot exceed 63 characters")
  .regex(
    /^[a-zA-Z0-9-.]+$/,
    "Subdomain can only contain letters, numbers, hyphens, and periods"
  );

export const industrySchema = z
  .string()
  .trim()
  .min(1, "Industry is required")
  .optional();

export const logoSchema = z.string().trim().url().optional();

export const themeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const featuresSchema = z.object({
  enableTimeTracking: z.boolean(),
  enableSprintPlanning: z.boolean(),
  enableGitIntegration: z.boolean(),
});

export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
  subdomain: subdomainSchema,
  industry: industrySchema,
  logo: logoSchema,
  theme: themeSchema.optional(),
  features: featuresSchema.optional(),
});