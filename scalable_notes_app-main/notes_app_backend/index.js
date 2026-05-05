import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import notesRoutes from "./routes/notesRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/notes", notesRoutes);

// Health check endpoint for ECS
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
