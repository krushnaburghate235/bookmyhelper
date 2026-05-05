import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  getSharedNote,
} from "../controllers/notesControllers.js";

const router = express.Router();

// to create new note
router.post("/", authenticateToken, createNote);

// get all the notes created by the current user
router.get("/", authenticateToken, getNotes);

// route to update the note
router.put("/:noteId", authenticateToken, updateNote);

// to delete specific note
router.delete("/:noteId", authenticateToken, deleteNote);

// to load the shared note , no auth needed
router.get("/shared/:noteId", getSharedNote);

export default router;
