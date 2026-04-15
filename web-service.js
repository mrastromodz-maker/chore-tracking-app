const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

const DB_NAME = "biz";
const COLLECTION = "chores";

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const client = new MongoClient(MONGO_URI);

let table;

async function connectToDatabase() {
  if (!table) {
    await client.connect();
    table = client.db(DB_NAME).collection(COLLECTION);
    console.log("Connected to MongoDB");
  }
  return table;
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/retrieve", async (req, res) => {
  try {
    const chores = await connectToDatabase();
    const rows = await chores.find({}).sort({ id: 1 }).toArray();
    res.json(rows);
  } catch (error) {
    console.error("Retrieve error:", error);
    res.status(500).json({ error: "Retrieve failed" });
  }
});

app.get("/retrieve-one/:id", async (req, res) => {
  try {
    const chores = await connectToDatabase();
    const row = await chores.findOne({ id: parseInt(req.params.id) });
    res.json(row || {});
  } catch (error) {
    console.error("Retrieve one error:", error);
    res.status(500).json({ error: "Retrieve one failed" });
  }
});

app.post("/create", async (req, res) => {
  try {
    const chores = await connectToDatabase();

    const record = {
      id: parseInt(req.body.id),
      title: req.body.title,
      assignee: req.body.assignee,
      dueDate: req.body.dueDate,
      priority: req.body.priority,
      status: req.body.status,
      room: req.body.room,
      notes: req.body.notes,
      createdAt: new Date()
    };

    const result = await chores.insertOne(record);
    res.json({ ok: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ error: "Create failed" });
  }
});

app.put("/update", async (req, res) => {
  try {
    const chores = await connectToDatabase();

    const where = { id: parseInt(req.body.id) };
    const changes = {
      $set: {
        title: req.body.title,
        assignee: req.body.assignee,
        dueDate: req.body.dueDate,
        priority: req.body.priority,
        status: req.body.status,
        room: req.body.room,
        notes: req.body.notes
      }
    };

    const result = await chores.updateOne(where, changes);
    res.json({ ok: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    const chores = await connectToDatabase();
    const result = await chores.deleteOne({ id: parseInt(req.params.id) });
    res.json({ ok: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Delete failed" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});