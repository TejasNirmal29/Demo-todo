import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import Todo from "./models/Todo.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

app.post("/api/todos", async (req, res) => {
  const { title, description, dueDate } = req.body;
  const now = new Date();

  if (!dueDate || new Date(dueDate) <= now) {
    return res.status(400).json({ message: "Due date must be in the future" });
  }

  const todo = new Todo({ title, description, dueDate });
  await todo.save();
  res.json(todo);
});

app.get("/api/todos", async (req, res) => {
  const now = new Date();

  // Auto-update overdue tasks
  await Todo.updateMany(
    { dueDate: { $lt: now }, status: "pending" },
    { status: "rejected" }
  );

  const todos = await Todo.find().sort({ createdAt: -1 });
  res.json(todos);
});

app.put("/api/todos/:id", async (req, res) => {
  const { title, description, dueDate, status } = req.body;

  if (dueDate && new Date(dueDate) <= new Date()) {
    return res.status(400).json({ message: "Due date must be in the future" });
  }

  const todo = await Todo.findByIdAndUpdate(
    req.params.id,
    { title, description, dueDate, status },
    { new: true }
  );

  res.json(todo);
});

app.delete("/api/todos/:id", async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: "Todo deleted" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
