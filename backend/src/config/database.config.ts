import mongoose from "mongoose";
import { config } from "./app.config";
import { MongoMemoryServer } from "mongodb-memory-server";

// Variable to hold the in-memory server instance
let mongoMemoryServer: MongoMemoryServer | null = null;

const connectDatabase = async () => {
  try {
    // Check if we should use in-memory MongoDB
    if (config.USE_IN_MEMORY_DB) {
      // Create an in-memory MongoDB server
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      console.log("Using in-memory MongoDB database");
      
      await mongoose.connect(uri);
      console.log("Connected to in-memory MongoDB database");
    } else {
      // Connect to regular MongoDB instance
      await mongoose.connect(config.MONGO_URI);
      console.log("Connected to MongoDB database");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB database:", error);
    process.exit(1);
  }
};

// Function to close the database connection
const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
};

export { connectDatabase, closeDatabase };
