import dotenv from "dotenv";
import path from "path";

// Load environment variables FIRST before any other imports
dotenv.config({ path: path.join(__dirname, "../../.env") });
