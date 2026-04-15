const express = require("express");
const cors = require("cors");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();

// MongoDB Atlas connection string will be stored in Railway variables
const PORT = process.env.PORT || 7777;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

// Database + collection
const DB_NAME = "biz";
const COLLECTION = "chores";

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Mongo client
const client = new MongoClient(MONGO_URI);

async function getCollection() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not set. Add it in Railway Variables.");
  }

  await client.connect();
  return client.db(DB_NAME).collection(COLLECTION);
}

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Retrieve all chores
app.get("/retrieve", async (req, res) => {
  try {
    const table = await getCollection();
    const rows = await table.find({}).sort({ id: 1 }).toArray();
    res.json(rows);
  } catch (error) {
    console.error("Retrieve error:", error);
    res.status(500).json({ error: "Retrieve failed" });
  }
});

// Retrieve one chore by id
app.get("/retrieve-one/:id", async (req, res) => {
  try {
    const table = await getCollection();
    const row = await table.findOne({ id: parseInt(req.params.id) });
    res.json(row || {});
  } catch (error) {
    console.error("Retrieve one error:", error);
    res.status(500).json({ error: "Retrieve one failed" });
  }
});

// Create chore
app.post("/create", async (req, res) => {
  try {
    const table = await getCollection();

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

    const result = await table.insertOne(record);
    res.json({ ok: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ error: "Create failed" });
  }
});

// Update chore
app.put("/update", async (req, res) => {
  try {
    const table = await getCollection();

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

    const result = await table.updateOne(where, changes);
    res.json({ ok: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Update failed" });
  }
});

// Delete chore
app.delete("/delete/:id", async (req, res) => {
  try {
    const table = await getCollection();
    const result = await table.deleteOne({ id: parseInt(req.params.id) });
    res.json({ ok: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Delete failed" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});