import mongoose from "mongoose";
import ProjectTemplateModel, { ProjectTemplateCategory, ViewType } from "../models/project-template.model";
import { config } from "../config/app.config";

const defaultTemplates = [
  {
    name: "Scrum Project",
    category: ProjectTemplateCategory.SCRUM,
    description: "Template for Scrum teams with sprint planning and backlog management",
    defaultView: ViewType.BOARD,
    taskStatuses: [
      { name: "Backlog", color: "#6B7280", order: 0 },
      { name: "To Do", color: "#3B82F6", order: 1 },
      { name: "In Progress", color: "#8B5CF6", order: 2 },
      { name: "Review", color: "#F59E0B", order: 3 },
      { name: "Done", color: "#10B981", order: 4 }
    ],
    taskPriorities: [
      { name: "Urgent", color: "#EF4444", order: 0 },
      { name: "High", color: "#F59E0B", order: 1 },
      { name: "Medium", color: "#3B82F6", order: 2 },
      { name: "Low", color: "#10B981", order: 3 }
    ],
    automationRules: [
      {
        name: "Notify on Task Assignment",
        trigger: {
          event: "task.assigned",
          conditions: []
        },
        actions: [
          {
            type: "notification",
            params: {
              template: "task_assigned"
            }
          }
        ]
      }
    ],
    isDefault: true
  },
  {
    name: "Kanban Board",
    category: ProjectTemplateCategory.KANBAN,
    description: "Simple Kanban board for visualizing work progress",
    defaultView: ViewType.BOARD,
    taskStatuses: [
      { name: "To Do", color: "#3B82F6", order: 0 },
      { name: "In Progress", color: "#8B5CF6", order: 1 },
      { name: "Done", color: "#10B981", order: 2 }
    ],
    taskPriorities: [
      { name: "High", color: "#EF4444", order: 0 },
      { name: "Medium", color: "#F59E0B", order: 1 },
      { name: "Low", color: "#10B981", order: 2 }
    ],
    automationRules: [],
    isDefault: true
  },
  {
    name: "Marketing Campaign",
    category: ProjectTemplateCategory.MARKETING,
    description: "Template for planning and tracking marketing campaigns",
    defaultView: ViewType.TIMELINE,
    taskStatuses: [
      { name: "Planning", color: "#6B7280", order: 0 },
      { name: "In Progress", color: "#8B5CF6", order: 1 },
      { name: "Review", color: "#F59E0B", order: 2 },
      { name: "Live", color: "#10B981", order: 3 }
    ],
    taskPriorities: [
      { name: "Critical", color: "#EF4444", order: 0 },
      { name: "Important", color: "#F59E0B", order: 1 },
      { name: "Normal", color: "#10B981", order: 2 }
    ],
    automationRules: [],
    isDefault: true
  },
  {
    name: "Sales Pipeline",
    category: ProjectTemplateCategory.SALES,
    description: "Template for managing sales opportunities and leads",
    defaultView: ViewType.BOARD,
    taskStatuses: [
      { name: "Lead", color: "#6B7280", order: 0 },
      { name: "Contact Made", color: "#3B82F6", order: 1 },
      { name: "Meeting Scheduled", color: "#8B5CF6", order: 2 },
      { name: "Proposal Sent", color: "#F59E0B", order: 3 },
      { name: "Negotiation", color: "#EF4444", order: 4 },
      { name: "Won", color: "#10B981", order: 5 },
      { name: "Lost", color: "#6B7280", order: 6 }
    ],
    taskPriorities: [
      { name: "Hot", color: "#EF4444", order: 0 },
      { name: "Warm", color: "#F59E0B", order: 1 },
      { name: "Cold", color: "#3B82F6", order: 2 }
    ],
    automationRules: [],
    isDefault: true
  }
];

export const seedProjectTemplates = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing templates
    await ProjectTemplateModel.deleteMany({ isDefault: true });
    console.log("Cleared existing default templates");

    // Insert new templates
    await ProjectTemplateModel.insertMany(defaultTemplates);
    console.log("Default project templates seeded successfully");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding project templates:", error);
    process.exit(1);
  }
};

// Run seeder if this file is run directly
if (require.main === module) {
  seedProjectTemplates();
}